from __future__ import annotations

import json

from psycopg.rows import dict_row

from ..db import db1_conn
from .audit_service import write_audit
from .cache_service import delete as cache_delete
from .db3_service import write_event
from .safereach_service import BOOTSTRAP_CACHE_KEY

DEFAULT_PROTOCOLS = {
    "parent": [
        "Verify pickup person before handover",
        "Keep emergency contact number updated",
        "Confirm absence reason before 9:30 AM",
    ],
    "teacher": [
        "Morning roll-call synchronized",
        "Dismissal badges prepared",
        "Emergency contact logs synced",
    ],
}

SAFETY_PROTOCOL_SCHEMA_SQL = """
create extension if not exists pgcrypto;

create table if not exists safety_protocols (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  role_key text not null check (role_key in ('parent', 'teacher')),
  label text not null,
  checked boolean not null default false,
  submitted boolean not null default false,
  active boolean not null default true,
  created_by uuid references users(id),
  updated_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_safety_protocols_role on safety_protocols(school_id, role_key, active);
"""


def list_protocols(role_key: str, school_id: str | None = None) -> list[dict]:
    role = _clean_role(role_key)
    with db1_conn() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            _ensure_schema(cur)
            selected_school_id = _school_id(cur, school_id)
            _ensure_defaults(cur, selected_school_id, role)
            cur.execute(
                """
                select id, school_id, role_key, label, checked, submitted, active, created_at, updated_at
                from safety_protocols
                where school_id=%s and role_key=%s and active=true
                order by created_at, label
                """,
                (selected_school_id, role),
            )
            rows = [dict(row) for row in cur.fetchall()]
        conn.commit()
    return _serialize(rows)


def create_protocol(role_key: str, label: str, actor_user_id: str | None = None, school_id: str | None = None) -> dict:
    role = _clean_role(role_key)
    clean_label = _clean_label(label)
    with db1_conn() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            _ensure_schema(cur)
            selected_school_id = _school_id(cur, school_id)
            cur.execute(
                """
                insert into safety_protocols(school_id, role_key, label, created_by, updated_by)
                values(%s,%s,%s,%s,%s)
                returning id, school_id, role_key, label, checked, submitted, active, created_at, updated_at
                """,
                (selected_school_id, role, clean_label, actor_user_id, actor_user_id),
            )
            row = dict(cur.fetchone())
        conn.commit()
    _after_change("safety_protocol.created", row, actor_user_id)
    return _serialize(row)


def update_protocol(protocol_id: str, payload: dict, actor_user_id: str | None = None) -> dict:
    allowed_fields = []
    values = []
    if "label" in payload:
        allowed_fields.append("label=%s")
        values.append(_clean_label(str(payload["label"])))
    if "checked" in payload:
        allowed_fields.append("checked=%s")
        values.append(bool(payload["checked"]))
    if "submitted" in payload:
        allowed_fields.append("submitted=%s")
        values.append(bool(payload["submitted"]))
    if not allowed_fields:
        raise ValueError("No protocol fields supplied")

    values.extend([actor_user_id, protocol_id])
    with db1_conn() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            _ensure_schema(cur)
            cur.execute(
                f"""
                update safety_protocols
                set {", ".join(allowed_fields)}, updated_by=%s, updated_at=now()
                where id=%s and active=true
                returning id, school_id, role_key, label, checked, submitted, active, created_at, updated_at
                """,
                values,
            )
            row = cur.fetchone()
        conn.commit()
    if not row:
        raise LookupError("Safety protocol not found")
    result = dict(row)
    _after_change("safety_protocol.updated", result, actor_user_id)
    return _serialize(result)


def submit_protocols(role_key: str, protocol_ids: list[str], actor_user_id: str | None = None, school_id: str | None = None) -> list[dict]:
    role = _clean_role(role_key)
    if not protocol_ids:
        return list_protocols(role, school_id)
    with db1_conn() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            _ensure_schema(cur)
            selected_school_id = _school_id(cur, school_id)
            cur.execute(
                """
                update safety_protocols
                set submitted = id::text = any(%s), updated_by=%s, updated_at=now()
                where school_id=%s and role_key=%s and active=true
                returning id, school_id, role_key, label, checked, submitted, active, created_at, updated_at
                """,
                (protocol_ids, actor_user_id, selected_school_id, role),
            )
            rows = [dict(row) for row in cur.fetchall()]
        conn.commit()
    write_event("safety_protocol_events", {"role_key": role, "submitted_ids": protocol_ids, "school_id": school_id})
    cache_delete(BOOTSTRAP_CACHE_KEY)
    return _serialize(rows)


def delete_protocol(protocol_id: str, actor_user_id: str | None = None) -> dict:
    with db1_conn() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            _ensure_schema(cur)
            cur.execute(
                """
                update safety_protocols
                set active=false, updated_by=%s, updated_at=now()
                where id=%s and active=true
                returning id, school_id, role_key, label, checked, submitted, active, created_at, updated_at
                """,
                (actor_user_id, protocol_id),
            )
            row = cur.fetchone()
        conn.commit()
    if not row:
        raise LookupError("Safety protocol not found")
    result = dict(row)
    _after_change("safety_protocol.deleted", result, actor_user_id)
    return _serialize(result)


def _school_id(cur, school_id: str | None) -> str:
    if school_id:
        return school_id
    cur.execute("select id from schools order by created_at limit 1")
    row = cur.fetchone()
    if not row:
        raise LookupError("No school is available for safety protocols")
    return str(row["id"])


def _ensure_defaults(cur, school_id: str, role_key: str) -> None:
    cur.execute(
        "select count(*) protocol_count from safety_protocols where school_id=%s and role_key=%s and active=true",
        (school_id, role_key),
    )
    if cur.fetchone()["protocol_count"]:
        return
    for label in DEFAULT_PROTOCOLS[role_key]:
        cur.execute(
            """
            insert into safety_protocols(school_id, role_key, label)
            values(%s,%s,%s)
            on conflict do nothing
            """,
            (school_id, role_key, label),
        )


def _ensure_schema(cur) -> None:
    cur.execute(SAFETY_PROTOCOL_SCHEMA_SQL)


def _clean_role(role_key: str) -> str:
    role = (role_key or "").strip().lower()
    if role not in DEFAULT_PROTOCOLS:
        raise ValueError("Invalid safety protocol role")
    return role


def _clean_label(label: str) -> str:
    clean = label.strip()
    if not clean:
        raise ValueError("Safety protocol label is required")
    if len(clean) > 240:
        raise ValueError("Safety protocol label is too long")
    return clean


def _after_change(event_type: str, payload: dict, actor_user_id: str | None) -> None:
    safe_payload = _serialize(payload)
    write_event("safety_protocol_events", safe_payload)
    write_audit(event_type, "safety_protocol", str(safe_payload["id"]), safe_payload, actor_user_id, safe_payload.get("school_id"))
    cache_delete(BOOTSTRAP_CACHE_KEY)


def _serialize(value):
    return json.loads(json.dumps(value, default=str))
