from __future__ import annotations

import json
from threading import Lock

from psycopg.rows import dict_row

from ..db import db1_conn
from .cache_service import delete as cache_delete
from .audit_service import write_audit
from .db3_service import write_event
from .sms_service import send_parent_sms


MESSAGE_SCHEMA_SQL = """
alter table messages add column if not exists student_id uuid references students(id) on delete set null;
alter table messages add column if not exists message_kind text not null default 'chat';
create index if not exists idx_messages_student_created on messages(student_id, created_at desc);
create index if not exists idx_messages_kind_created on messages(message_kind, created_at desc);
"""
BOOTSTRAP_CACHE_KEY = "safereach:bootstrap:v2"
_schema_lock = Lock()
_schema_prepared = False


def list_student_messages(student_id: str, limit: int = 100) -> list[dict]:
    with db1_conn() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            _ensure_schema(cur)
            cur.execute(
                """
                select m.id, m.student_id, m.conversation_type, m.message_kind, m.body, m.created_at,
                       coalesce(sender.full_name, case when m.message_kind = 'absence_request' then 'SafeReach School' else 'School' end) sender_name,
                       recipient.full_name recipient_name
                from messages m
                left join users sender on sender.id = m.sender_id
                left join users recipient on recipient.id = m.recipient_id
                where m.student_id=%s
                order by m.created_at asc
                limit %s
                """,
                (student_id, max(1, min(limit, 200))),
            )
            rows = [dict(row) for row in cur.fetchall()]
    return _serialize(rows)


def ensure_schema() -> None:
    """Make deployed DB-1 instances compatible before messaging-aware reads."""
    with db1_conn() as conn:
        with conn.cursor() as cur:
            _ensure_schema(cur)
        conn.commit()


def send_parent_message(student_id: str, body: str, actor_user_id: str | None = None) -> dict:
    return _create_message(
        student_id=student_id,
        body=body,
        sender_role="parent",
        actor_user_id=actor_user_id,
        message_kind="chat",
    )


def submit_absence_reason(student_id: str, reason: str, actor_user_id: str | None = None) -> dict:
    message = _create_message(
        student_id=student_id,
        body=reason,
        sender_role="parent",
        actor_user_id=actor_user_id,
        message_kind="absence_reason",
    )
    with db1_conn() as conn:
        with conn.cursor() as cur:
            _ensure_schema(cur)
            cur.execute(
                """
                update attendance_records
                set reason=%s, updated_at=now()
                where student_id=%s and attendance_date=current_date and session='morning' and status='absent'
                """,
                (message["body"], student_id),
            )
        conn.commit()
    write_event("parent_events", {"event": "absence_reason_submitted", "student_id": student_id, "reason": message["body"]})
    write_audit("message.absence_reason_submitted", "student", student_id, message, actor_user_id, message["school_id"])
    cache_delete(BOOTSTRAP_CACHE_KEY)
    return message


def notify_absent_parents(student_ids: list[str], actor_user_id: str | None = None) -> list[dict]:
    if not student_ids:
        return []
    results: list[dict] = []
    for student_id in dict.fromkeys(student_ids):
        created = _create_absence_request(student_id, actor_user_id)
        if created is None:
            continue
        message, context = created
        sms = {"status": "skipped", "reason": "parent_sms_disabled", "to": context.get("parent_phone")}
        if context.get("sms_enabled") and context.get("parent_phone"):
            try:
                sms = send_parent_sms(context["parent_phone"], message["body"])
            except Exception as exc:  # Provider failure must not undo the recorded absence request.
                sms = {"status": "failed", "reason": exc.__class__.__name__, "to": context["parent_phone"]}
            _record_sms(message, context, sms)
        result = {"student_id": student_id, "message": message, "sms": sms}
        results.append(result)
        write_event("sms_events", {"event": "absence_request", **result})
        write_audit("attendance.absence_parent_notified", "student", student_id, result, actor_user_id, message["school_id"])
    return _serialize(results)


def _create_absence_request(student_id: str, actor_user_id: str | None) -> tuple[dict, dict] | None:
    with db1_conn() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            _ensure_schema(cur)
            context = _student_context(cur, student_id)
            cur.execute(
                """
                select status, attendance_status
                from student_travel_status
                where student_id=%s
                """,
                (student_id,),
            )
            travel = cur.fetchone()
            if not travel or travel["attendance_status"] != "absent":
                return None
            cur.execute(
                """
                select id from messages
                where student_id=%s and message_kind='absence_request' and created_at::date=current_date
                limit 1
                """,
                (student_id,),
            )
            if cur.fetchone():
                return None
            body = (
                f"SafeReach: {context['student_name']} was marked absent today. "
                "Please reply in Parent Messages with the absence reason."
            )
            row = _insert_message(cur, context, body, "system", actor_user_id, "absence_request")
        conn.commit()
    message = _serialize(row)
    write_event("message_events", {"event": "absence_request_created", **message})
    cache_delete(BOOTSTRAP_CACHE_KEY)
    return message, context


def _create_message(student_id: str, body: str, sender_role: str, actor_user_id: str | None, message_kind: str) -> dict:
    clean_body = _clean_body(body)
    with db1_conn() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            _ensure_schema(cur)
            context = _student_context(cur, student_id)
            row = _insert_message(cur, context, clean_body, sender_role, actor_user_id, message_kind)
        conn.commit()
    message = _serialize(row)
    write_event("message_events", {"event": "message_created", **message})
    write_audit("message.created", "message", str(message["id"]), message, actor_user_id, message["school_id"])
    return message


def _insert_message(cur, context: dict, body: str, sender_role: str, actor_user_id: str | None, message_kind: str) -> dict:
    if sender_role == "parent":
        sender_id = actor_user_id or context.get("parent_user_id")
        recipient_id = context.get("teacher_user_id")
    elif sender_role == "teacher":
        sender_id = actor_user_id or context.get("teacher_user_id")
        recipient_id = context.get("parent_user_id")
    else:
        sender_id = actor_user_id
        recipient_id = context.get("parent_user_id")
    cur.execute(
        """
        insert into messages(school_id, conversation_type, message_kind, sender_id, recipient_id, class_id, section_id, student_id, body)
        values(%s, 'parent_teacher', %s, %s, %s, %s, %s, %s, %s)
        returning id, school_id, student_id, conversation_type, message_kind, sender_id, recipient_id, body, created_at
        """,
        (
            context["school_id"], message_kind, sender_id, recipient_id,
            context["class_id"], context["section_id"], context["student_id"], body,
        ),
    )
    row = dict(cur.fetchone())
    row["sender_name"] = context["parent_name"] if sender_role == "parent" else context["teacher_name"] if sender_role == "teacher" else "SafeReach School"
    row["recipient_name"] = context["teacher_name"] if sender_role == "parent" else context["parent_name"]
    return row


def _student_context(cur, student_id: str) -> dict:
    cur.execute(
        """
        select s.id student_id, s.school_id, s.class_id, s.section_id, s.full_name student_name,
               p.user_id parent_user_id, p.guardian_name parent_name, p.phone parent_phone, p.sms_enabled,
               teacher.user_id teacher_user_id, coalesce(teacher_user.full_name, 'Class Teacher') teacher_name
        from students s
        left join parents p on p.id=s.parent_id
        left join lateral (
          select t.user_id
          from teacher_assignments ta
          join teachers t on t.id=ta.teacher_id
          where ta.class_id=s.class_id and ta.section_id=s.section_id and ta.active=true
          order by case ta.assignment_type when 'primary_incharge' then 1 when 'assistant_incharge' then 2 else 3 end
          limit 1
        ) teacher on true
        left join users teacher_user on teacher_user.id=teacher.user_id
        where s.id=%s
        """,
        (student_id,),
    )
    context = cur.fetchone()
    if not context:
        raise LookupError("Student not found")
    return dict(context)


def _record_sms(message: dict, context: dict, sms: dict) -> None:
    with db1_conn() as conn:
        with conn.cursor() as cur:
            _ensure_schema(cur)
            cur.execute(
                """
                insert into sms_delivery_logs(school_id, student_id, to_phone, body, provider_message_id, status, error_message)
                values(%s,%s,%s,%s,%s,%s,%s)
                """,
                (
                    context["school_id"], context["student_id"], sms.get("to") or context.get("parent_phone"),
                    message["body"], sms.get("sid"), sms.get("status", "unknown"), sms.get("reason"),
                ),
            )
        conn.commit()


def _ensure_schema(cur) -> None:
    global _schema_prepared
    if _schema_prepared:
        return
    with _schema_lock:
        if _schema_prepared:
            return
        cur.execute(MESSAGE_SCHEMA_SQL)
        _schema_prepared = True


def _clean_body(value: object) -> str:
    body = str(value or "").strip()
    if not body:
        raise ValueError("Message cannot be empty")
    if len(body) > 2000:
        raise ValueError("Message cannot exceed 2000 characters")
    return body


def _serialize(value):
    return json.loads(json.dumps(value, default=str))
