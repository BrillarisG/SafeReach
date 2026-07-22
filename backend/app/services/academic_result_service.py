from __future__ import annotations

import json

from psycopg.rows import dict_row

from ..db import db1_conn
from .audit_service import write_audit
from .cache_service import delete as cache_delete
from .db3_service import write_event

BOOTSTRAP_CACHE_KEY = "safereach:bootstrap:v4"
DEFAULT_EXAM_NAME = "Quarterly"
DEFAULT_COMPONENTS = (("Internal 1", 25), ("Internal 2", 25), ("Exam", 50))
FALLBACK_SUBJECTS = ("English", "Maths", "Science", "Social", "Computer")


def list_results() -> dict:
    """Return configured exams, component limits, and stored student marks."""
    with db1_conn() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            ensure_schema(cur)
            _ensure_default_result_config(cur)
            conn.commit()
            cur.execute(
                """
                select re.id, re.school_id, re.class_id, re.section_id, re.name, re.active,
                       c.name class_name, sec.name section_name
                from result_exams re
                join classes c on c.id=re.class_id
                join sections sec on sec.id=re.section_id
                order by c.sort_order, sec.name, re.name
                """
            )
            exams = [dict(row) for row in cur.fetchall()]
            cur.execute(
                """
                select rc.id, rc.exam_id, rc.subject, rc.label, rc.maximum_marks, rc.sort_order
                from result_components rc
                join result_exams re on re.id=rc.exam_id
                order by re.name, rc.subject, rc.sort_order, rc.label
                """
            )
            components = [dict(row) for row in cur.fetchall()]
            cur.execute(
                """
                select srm.student_id, srm.result_component_id, srm.marks_obtained, srm.updated_at
                from student_result_marks srm
                order by srm.updated_at desc
                """
            )
            marks = [dict(row) for row in cur.fetchall()]
    return _serialize({"exams": exams, "components": components, "marks": marks})


def save_exam(payload: dict, actor_user_id: str | None = None) -> dict:
    """School-admin configuration of exam title and subject component maxima."""
    name = str(payload.get("name", "")).strip()
    class_id = str(payload.get("classId", "")).strip()
    section_id = str(payload.get("sectionId", "")).strip()
    components = payload.get("components")
    if not name or not class_id or not section_id:
        raise ValueError("Exam name, class, and section are required")
    if not isinstance(components, list) or not components:
        raise ValueError("Add at least one subject mark component")
    normalized = []
    for index, item in enumerate(components, start=1):
        subject = str(item.get("subject", "")).strip()
        label = str(item.get("label", "")).strip()
        try:
            maximum = float(item.get("maximumMarks"))
        except (TypeError, ValueError):
            maximum = 0
        if not subject or not label or maximum <= 0:
            raise ValueError("Each result component needs a subject, label, and positive maximum mark")
        normalized.append((subject, label, maximum, index))

    with db1_conn() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            ensure_schema(cur)
            if actor_user_id:
                cur.execute(
                    """
                    select 1 from users u join roles r on r.id=u.role_id
                    where u.id=%s and r.role_key in ('school_admin', 'main_admin') and u.status='active'
                    """,
                    (actor_user_id,),
                )
                if cur.fetchone() is None:
                    raise PermissionError("Only a school administrator may configure result formats")
            cur.execute("select school_id from sections where id=%s and class_id=%s", (section_id, class_id))
            section = cur.fetchone()
            if not section:
                raise LookupError("Class section was not found")
            exam_id = payload.get("examId")
            if exam_id:
                cur.execute(
                    """
                    update result_exams set name=%s, updated_by=%s, updated_at=now()
                    where id=%s and class_id=%s and section_id=%s
                    returning id, school_id, class_id, section_id, name, active
                    """,
                    (name, actor_user_id, exam_id, class_id, section_id),
                )
            else:
                cur.execute(
                    """
                    insert into result_exams(school_id, class_id, section_id, name, created_by, updated_by)
                    values(%s,%s,%s,%s,%s,%s)
                    on conflict(section_id, name) do update set updated_by=excluded.updated_by, updated_at=now()
                    returning id, school_id, class_id, section_id, name, active
                    """,
                    (section["school_id"], class_id, section_id, name, actor_user_id, actor_user_id),
                )
            exam = cur.fetchone()
            if not exam:
                raise LookupError("Result exam was not found")
            for subject, label, maximum, order in normalized:
                cur.execute(
                    """
                    insert into result_components(exam_id, subject, label, maximum_marks, sort_order)
                    values(%s,%s,%s,%s,%s)
                    on conflict(exam_id, subject, label)
                    do update set maximum_marks=excluded.maximum_marks, sort_order=excluded.sort_order, updated_at=now()
                    """,
                    (exam["id"], subject, label, maximum, order),
                )
        conn.commit()
    result = _serialize(dict(exam))
    _after_change("results.exam_configured", "result_exam", str(result["id"]), result, actor_user_id, result["school_id"])
    return result


def submit_marks(payload: dict, actor_user_id: str | None = None) -> dict:
    student_id = str(payload.get("studentId", "")).strip()
    exam_id = str(payload.get("examId", "")).strip()
    marks = payload.get("marks")
    if not student_id or not exam_id or not isinstance(marks, list):
        raise ValueError("Student, exam, and marks are required")

    with db1_conn() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            ensure_schema(cur)
            cur.execute(
                """
                select re.school_id, re.class_id, re.section_id, re.name,
                       s.class_id student_class_id, s.section_id student_section_id, s.full_name
                from result_exams re join students s on s.id=%s where re.id=%s
                """,
                (student_id, exam_id),
            )
            context = cur.fetchone()
            if not context:
                raise LookupError("Student or result exam was not found")
            if context["class_id"] != context["student_class_id"] or context["section_id"] != context["student_section_id"]:
                raise ValueError("This student is not in the selected exam class section")
            if actor_user_id:
                cur.execute(
                    """
                    select 1 from teacher_assignments ta
                    join teachers t on t.id=ta.teacher_id
                    where t.user_id=%s and ta.class_id=%s and ta.section_id=%s and ta.active=true
                      and ta.assignment_type in ('primary_incharge', 'assistant_incharge')
                    """,
                    (actor_user_id, context["class_id"], context["section_id"]),
                )
                if cur.fetchone() is None:
                    raise PermissionError("Only the class incharge or assistant incharge may enter these results")
            cur.execute("select id, maximum_marks from result_components where exam_id=%s", (exam_id,))
            limits = {str(row["id"]): float(row["maximum_marks"]) for row in cur.fetchall()}
            stored = []
            for item in marks:
                component_id = str(item.get("componentId", ""))
                if component_id not in limits:
                    raise ValueError("A result component does not belong to this exam")
                try:
                    value = float(item.get("marksObtained"))
                except (TypeError, ValueError):
                    raise ValueError("Marks must be numeric")
                if value < 0 or value > limits[component_id]:
                    raise ValueError(f"Marks must be between 0 and {limits[component_id]:g}")
                cur.execute(
                    """
                    insert into student_result_marks(student_id, result_component_id, marks_obtained, entered_by)
                    values(%s,%s,%s,%s)
                    on conflict(student_id, result_component_id)
                    do update set marks_obtained=excluded.marks_obtained, entered_by=excluded.entered_by, updated_at=now()
                    returning id, result_component_id, marks_obtained, updated_at
                    """,
                    (student_id, component_id, value, actor_user_id),
                )
                stored.append(dict(cur.fetchone()))
        conn.commit()
    result = _serialize({"studentId": student_id, "examId": exam_id, "studentName": context["full_name"], "marks": stored})
    _after_change("results.marks_saved", "student", student_id, result, actor_user_id, context["school_id"])
    return result


def ensure_schema(cur) -> None:
    # Additive guard for a rolling deployment where the migration may still be
    # running while a worker receives a result request.
    cur.execute(
        """
        create table if not exists result_exams (
          id uuid primary key default gen_random_uuid(), school_id uuid not null references schools(id) on delete cascade,
          class_id uuid not null references classes(id) on delete cascade, section_id uuid not null references sections(id) on delete cascade,
          name text not null, active boolean not null default true, created_by uuid references users(id), updated_by uuid references users(id),
          created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(section_id, name)
        );
        create table if not exists result_components (
          id uuid primary key default gen_random_uuid(), exam_id uuid not null references result_exams(id) on delete cascade,
          subject text not null, label text not null, maximum_marks numeric(7,2) not null check(maximum_marks > 0),
          sort_order int not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
          unique(exam_id, subject, label)
        );
        create table if not exists student_result_marks (
          id uuid primary key default gen_random_uuid(), student_id uuid not null references students(id) on delete cascade,
          result_component_id uuid not null references result_components(id) on delete cascade,
          marks_obtained numeric(7,2) not null check(marks_obtained >= 0), entered_by uuid references users(id),
          created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(student_id, result_component_id)
        );
        """
    )


def _ensure_default_result_config(cur) -> None:
    """Create a usable result format for stored class sections when DB-1 has none.

    The frontend must display stored data only, so this keeps the initial
    Result screen DB-backed by deriving a default exam from saved classes and
    timetable subjects. It is idempotent and safe to run on every read.
    """
    cur.execute(
        """
        select sec.school_id, c.id class_id, sec.id section_id, c.name class_name, sec.name section_name
        from sections sec
        join classes c on c.id=sec.class_id
        where exists (
          select 1 from students s
          where s.class_id=c.id and s.section_id=sec.id and s.status='active'
        )
        order by c.sort_order, sec.name
        """
    )
    class_sections = [dict(row) for row in cur.fetchall()]
    for row in class_sections:
        cur.execute(
            """
            select distinct trim(tp.subject) subject
            from timetable_periods tp
            where tp.class_id=%s and tp.section_id=%s
              and nullif(trim(tp.subject), '') is not null
              and trim(tp.subject) <> '-'
            order by trim(tp.subject)
            """,
            (row["class_id"], row["section_id"]),
        )
        subjects = [item["subject"] for item in cur.fetchall()]
        if not subjects:
            cur.execute(
                """
                select distinct trim(coalesce(ta.subject, '')) subject
                from teacher_assignments ta
                where ta.class_id=%s and ta.section_id=%s and ta.active=true
                  and nullif(trim(coalesce(ta.subject, '')), '') is not null
                order by trim(coalesce(ta.subject, ''))
                """,
                (row["class_id"], row["section_id"]),
            )
            subjects = [item["subject"] for item in cur.fetchall()]
        if not subjects:
            subjects = list(FALLBACK_SUBJECTS)

        cur.execute(
            """
            insert into result_exams(school_id, class_id, section_id, name)
            values(%s,%s,%s,%s)
            on conflict(section_id, name)
            do update set active=true, updated_at=now()
            returning id
            """,
            (row["school_id"], row["class_id"], row["section_id"], DEFAULT_EXAM_NAME),
        )
        exam_id = cur.fetchone()["id"]
        sort_order = 1
        for subject in subjects:
            for label, maximum_marks in DEFAULT_COMPONENTS:
                cur.execute(
                    """
                    insert into result_components(exam_id, subject, label, maximum_marks, sort_order)
                    values(%s,%s,%s,%s,%s)
                    on conflict(exam_id, subject, label)
                    do update set maximum_marks=excluded.maximum_marks,
                                  sort_order=excluded.sort_order,
                                  updated_at=now()
                    """,
                    (exam_id, subject, label, maximum_marks, sort_order),
                )
                sort_order += 1


def _after_change(event: str, entity: str, entity_id: str, payload: dict, actor_user_id: str | None, school_id: str) -> None:
    cache_delete(BOOTSTRAP_CACHE_KEY)
    write_event("academic_result_events", {"event": event, **payload})
    write_audit(event, entity, entity_id, payload, actor_user_id, school_id)


def _serialize(value):
    return json.loads(json.dumps(value, default=str))
