from __future__ import annotations

from datetime import date
import json

from psycopg.rows import dict_row
from flask import current_app

from ..db import db1_conn
from ..security import create_token, verify_password
from .audit_service import write_audit
from .cache_service import delete as cache_delete, get_json as cache_get_json, set_json as cache_set_json
from .db3_service import write_event
from .sms_service import send_parent_sms

BOOTSTRAP_CACHE_KEY = "safereach:bootstrap:v1"


def login(email: str, password: str) -> dict:
    with db1_conn() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                select u.*, r.role_key
                from users u
                join roles r on r.id = u.role_id
                where lower(u.email) = lower(%s) and u.status = 'active'
                """,
                (email,),
            )
            user = cur.fetchone()
    if not user or not verify_password(password, user["password_hash"]):
        raise PermissionError("Invalid email or password")
    safe_user = _serialize({k: v for k, v in user.items() if k != "password_hash"})
    return {
        "user": safe_user,
        "accessToken": create_token(user, "access"),
        "refreshToken": create_token(user, "refresh"),
    }


def bootstrap(role: str | None = None, school_id: str | None = None) -> dict:
    with db1_conn() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                select s.id, s.student_code, s.full_name, s.roll_no, c.name class_name, sec.name section_name,
                       p.guardian_name, p.phone parent_phone, p.sms_enabled,
                       coalesce(sts.status, 'at_home') travel_status,
                       coalesce(sts.attendance_status, 'pending') attendance_status
                from students s
                join classes c on c.id = s.class_id
                join sections sec on sec.id = s.section_id
                left join parents p on p.id = s.parent_id
                left join student_travel_status sts on sts.student_id = s.id
                order by c.sort_order, sec.name, s.roll_no
                """
            )
            students = [dict(row) for row in cur.fetchall()]

            cur.execute(
                """
                select tb.break_key id, tb.label, tb.after_period "afterPeriod", tb.tone
                from timetable_breaks tb
                order by tb.after_period
                """
            )
            breaks = [dict(row) for row in cur.fetchall()]

            cur.execute(
                """
                select day_name, period_no, subject
                from timetable_periods
                order by case day_name
                  when 'Monday' then 1 when 'Tuesday' then 2 when 'Wednesday' then 3
                  when 'Thursday' then 4 when 'Friday' then 5 when 'Saturday' then 6 else 7 end,
                  period_no
                """
            )
            periods = [dict(row) for row in cur.fetchall()]

            cur.execute("select id, name, code, status from schools order by created_at")
            schools = [dict(row) for row in cur.fetchall()]

            cur.execute(
                """
                select c.id, c.name class_name, c.sort_order,
                       coalesce(json_agg(json_build_object('id', sec.id, 'name', sec.name, 'room', sec.room) order by sec.name)
                         filter (where sec.id is not null), '[]') sections
                from classes c
                left join sections sec on sec.class_id = c.id
                group by c.id
                order by c.sort_order, c.name
                """
            )
            classes = [dict(row) for row in cur.fetchall()]

            cur.execute(
                """
                select t.id, u.full_name, u.email, u.phone, t.employee_code, t.subject, t.qualification, t.status,
                       coalesce(json_agg(json_build_object(
                         'className', c.name,
                         'sectionName', sec.name,
                         'assignmentType', ta.assignment_type,
                         'subject', ta.subject
                       ) order by c.sort_order, sec.name) filter (where ta.id is not null), '[]') assignments
                from teachers t
                left join users u on u.id = t.user_id
                left join teacher_assignments ta on ta.teacher_id = t.id and ta.active = true
                left join classes c on c.id = ta.class_id
                left join sections sec on sec.id = ta.section_id
                group by t.id, u.full_name, u.email, u.phone
                order by u.full_name
                """
            )
            teachers = [dict(row) for row in cur.fetchall()]

            cur.execute(
                """
                select ar.id, ar.student_id, s.full_name student_name, ar.attendance_date, ar.session, ar.status, ar.reason, ar.locked, ar.created_at
                from attendance_records ar
                join students s on s.id = ar.student_id
                order by ar.attendance_date desc, s.roll_no
                """
            )
            attendance = [dict(row) for row in cur.fetchall()]

            cur.execute(
                """
                select sr.id, sr.report_title, sr.safety_score, sr.alert_count, sr.attendance_percent, sr.report_text,
                       c.name class_name, sec.name section_name, sr.created_at
                from safety_reports sr
                left join classes c on c.id = sr.class_id
                left join sections sec on sec.id = sr.section_id
                order by sr.created_at desc
                """
            )
            reports = [dict(row) for row in cur.fetchall()]

            cur.execute(
                """
                select il.id, il.incident_code, il.incident_type, il.level, il.priority, il.status, il.handler_name, il.incident_time, il.detail,
                       s.full_name student_name, c.name class_name, sec.name section_name
                from incident_logs il
                left join students s on s.id = il.student_id
                left join classes c on c.id = s.class_id
                left join sections sec on sec.id = s.section_id
                order by il.incident_time desc
                """
            )
            incidents = [dict(row) for row in cur.fetchall()]

            cur.execute(
                """
                select id, test_name, service_name, status, detail, created_at
                from api_test_results
                order by created_at desc
                limit 50
                """
            )
            api_tests = [dict(row) for row in cur.fetchall()]

    return {
        "schools": _serialize(schools),
        "classes": _serialize(classes),
        "teachers": _serialize(teachers),
        "students": _serialize(students),
        "attendance": _serialize(attendance),
        "reports": _serialize(reports),
        "incidents": _serialize(incidents),
        "apiTests": _serialize(api_tests),
        "timetable": _build_timetable(periods, breaks),
        "role": role,
        "schoolId": school_id,
    }


def bootstrap_cached(role: str | None = None, school_id: str | None = None) -> tuple[dict, str]:
    # The current bootstrap response is school-wide. When role filtering is added,
    # role and school ID must become part of the cache key.
    if role is None and school_id is None:
        cached = cache_get_json(BOOTSTRAP_CACHE_KEY)
        if isinstance(cached, dict):
            return cached, "HIT"

    payload = bootstrap(role, school_id)
    if role is None and school_id is None:
        cache_set_json(BOOTSTRAP_CACHE_KEY, payload, current_app.config["BOOTSTRAP_CACHE_SECONDS"])
    return payload, "MISS"


def mark_ready_to_school(student_id: str, actor_user_id: str | None) -> dict:
    return _update_travel_status(student_id, "to_school", "ready_to_school", actor_user_id, sms=False)


def mark_reached_home(student_id: str, actor_user_id: str | None) -> dict:
    return _update_travel_status(student_id, "reached_home", "reached_home", actor_user_id, sms=False)


def submit_attendance(student_id: str, status: str, actor_user_id: str | None) -> dict:
    if status not in {"present", "absent", "late"}:
        raise ValueError("Invalid attendance status")
    travel_status = "present" if status == "present" else "absent" if status == "absent" else "reached_school"
    payload = _update_travel_status(student_id, travel_status, f"attendance_{status}", actor_user_id, attendance_status=status, sms=True)
    with db1_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                insert into attendance_records(school_id, student_id, class_id, section_id, attendance_date, session, status, marked_by, locked)
                select school_id, id, class_id, section_id, %s, 'morning', %s, %s, %s
                from students where id=%s
                on conflict(student_id, attendance_date, session)
                do update set status=excluded.status, marked_by=excluded.marked_by, updated_at=now(), locked=excluded.locked
                """,
                (date.today(), status, actor_user_id, status in {"present", "absent"}, student_id),
            )
        conn.commit()
    _invalidate_bootstrap_cache()
    return payload


def submit_go_out(student_id: str, actor_user_id: str | None) -> dict:
    payload = _update_travel_status(student_id, "going_home", "go_out", actor_user_id, sms=True)
    with db1_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                insert into attendance_records(school_id, student_id, class_id, section_id, attendance_date, session, status, marked_by, locked)
                select school_id, id, class_id, section_id, %s, 'go_out', 'going_home', %s, true
                from students where id=%s
                on conflict(student_id, attendance_date, session)
                do update set status='going_home', marked_by=excluded.marked_by, updated_at=now(), locked=true
                """,
                (date.today(), actor_user_id, student_id),
            )
        conn.commit()
    _invalidate_bootstrap_cache()
    return payload


def move_timetable_break(section_id: str, break_key: str, after_period: int, actor_user_id: str | None) -> dict:
    with db1_conn() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                update timetable_breaks
                set after_period=%s, updated_by=%s, updated_at=now()
                where section_id=%s and break_key=%s
                returning school_id, class_id, section_id, break_key, label, after_period, tone
                """,
                (after_period, actor_user_id, section_id, break_key),
            )
            row = cur.fetchone()
        conn.commit()
    if not row:
        raise LookupError("Break not found")
    payload = _serialize(dict(row))
    write_event("timetable_events", payload)
    write_audit("timetable.break_moved", "timetable_break", break_key, payload, actor_user_id, payload.get("school_id"))
    _invalidate_bootstrap_cache()
    return payload


def _update_travel_status(student_id: str, status: str, event: str, actor_user_id: str | None, attendance_status: str | None = None, sms: bool = False) -> dict:
    with db1_conn() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                update student_travel_status
                set status=%s, attendance_status=coalesce(%s, attendance_status), last_event=%s, last_event_at=now(), updated_by=%s
                where student_id=%s
                returning school_id, student_id, status, attendance_status, last_event, last_event_at
                """,
                (status, attendance_status, event, actor_user_id, student_id),
            )
            row = cur.fetchone()
            if not row:
                raise LookupError("Student travel status not found")
            cur.execute(
                """
                select s.full_name, p.phone parent_phone, p.sms_enabled
                from students s left join parents p on p.id=s.parent_id
                where s.id=%s
                """,
                (student_id,),
            )
            student = cur.fetchone()
        conn.commit()

    _invalidate_bootstrap_cache()

    payload = _serialize({**dict(row), **dict(student), "event": event})
    write_event("student_status", payload)
    write_event("travel_events", payload)
    write_audit(f"travel.{event}", "student", student_id, payload, actor_user_id, payload.get("school_id"))

    if sms and payload.get("sms_enabled") and payload.get("parent_phone"):
        body = f"SafeReach: {payload['full_name']} status updated to {status.replace('_', ' ')}."
        sms_result = send_parent_sms(payload["parent_phone"], body)
        _record_sms(payload, body, sms_result)
    return payload


def _record_sms(payload: dict, body: str, sms_result: dict) -> None:
    with db1_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                insert into sms_delivery_logs(school_id, student_id, to_phone, body, provider_message_id, status, error_message)
                values(%s,%s,%s,%s,%s,%s,%s)
                """,
                (
                    payload.get("school_id"),
                    payload.get("student_id"),
                    sms_result.get("to") or payload.get("parent_phone"),
                    body,
                    sms_result.get("sid"),
                    sms_result.get("status", "unknown"),
                    sms_result.get("reason"),
                ),
            )
        conn.commit()
    write_event("sms_events", {**payload, "body": body, "sms": sms_result})


def _invalidate_bootstrap_cache() -> None:
    cache_delete(BOOTSTRAP_CACHE_KEY)


def _build_timetable(periods: list[dict], breaks: list[dict]) -> dict:
    days: dict[str, list[str]] = {}
    for row in periods:
        days.setdefault(row["day_name"], [])
        days[row["day_name"]].append(row["subject"])
    return {
        "className": "Class 4",
        "section": "B",
        "breaks": breaks,
        "days": [{"id": day.lower(), "label": day, "periods": values} for day, values in days.items()],
    }


def _serialize(value):
    return json.loads(json.dumps(value, default=str))
