from __future__ import annotations

from datetime import datetime, timezone

from psycopg.rows import dict_row

from ..db import db1_conn, db2_conn
from .audit_service import write_audit
from .db3_service import write_event


DEFAULT_MENUS = {
    "table": False,
    "messages": False,
    "attendance": True,
    "timetable": True,
    "reports": True,
}


def list_access() -> dict:
    _ensure_tables()
    with db1_conn() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                select s.id school_id, s.name school_name, menu.menu_key, coalesce(ima.enabled, true) enabled,
                       coalesce(ima.updated_at, s.created_at) updated_at
                from schools s
                cross join (select unnest(%s::text[]) menu_key) menu
                left join industry_menu_access ima on ima.school_id = s.id::text and ima.menu_key = menu.menu_key
                order by s.name, menu.menu_key
                """,
                (list(DEFAULT_MENUS.keys()),),
            )
            rows = [dict(row) for row in cur.fetchall()]
    return {"access": _group_rows(rows)}


def set_access(school_id: str, menu_key: str, enabled: bool, actor_user_id: str | None = None, school_name: str | None = None) -> dict:
    if menu_key not in DEFAULT_MENUS:
        raise ValueError("Invalid menu key")
    _ensure_tables()
    with db1_conn() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                insert into industry_menu_access(school_id, menu_key, enabled, updated_by, updated_at)
                values (%s, %s, %s, %s, now())
                on conflict(school_id, menu_key)
                do update set enabled=excluded.enabled, updated_by=excluded.updated_by, updated_at=now()
                returning school_id, menu_key, enabled, updated_at
                """,
                (school_id, menu_key, enabled, actor_user_id),
            )
            row = dict(cur.fetchone())
        conn.commit()

    _mirror_db2(row, actor_user_id)
    try:
        write_audit("industry.menu_access_changed", "industry_menu_access", f"{school_id}:{menu_key}", row, actor_user_id, school_id)
    except Exception:
        pass
    write_event(
        "industry_menu_events",
        {
            "event": "industry.menu.updated",
            "school_id": school_id,
            "school_name": school_name,
            "menu_key": menu_key,
            "enabled": enabled,
            "actor_user_id": actor_user_id,
        },
    )
    return {
        "schoolId": school_id,
        "schoolName": school_name or school_id,
        "menuKey": menu_key,
        "enabled": enabled,
        "updatedAt": _iso(row.get("updated_at")),
    }


def _ensure_tables() -> None:
    ddl = """
    create table if not exists industry_menu_access (
      school_id text not null,
      menu_key text not null,
      enabled boolean not null default true,
      updated_by text null,
      updated_at timestamptz not null default now(),
      primary key (school_id, menu_key)
    )
    """
    with db1_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(ddl)
        conn.commit()
    try:
        with db2_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(ddl)
            conn.commit()
    except Exception:
        # DB-2 can be protected/read-only in some environments. DB-1 remains authoritative.
        pass


def _mirror_db2(row: dict, actor_user_id: str | None) -> None:
    try:
        with db2_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    insert into industry_menu_access(school_id, menu_key, enabled, updated_by, updated_at)
                    values (%s, %s, %s, %s, %s)
                    on conflict(school_id, menu_key)
                    do update set enabled=excluded.enabled, updated_by=excluded.updated_by, updated_at=excluded.updated_at
                    """,
                    (row["school_id"], row["menu_key"], row["enabled"], actor_user_id, row["updated_at"]),
                )
            conn.commit()
    except Exception:
        pass


def _group_rows(rows: list[dict]) -> list[dict]:
    grouped: dict[str, dict] = {}
    for row in rows:
        school_id = str(row["school_id"])
        record = grouped.setdefault(
            school_id,
            {
                "schoolId": school_id,
                "schoolName": row["school_name"],
                "menus": dict(DEFAULT_MENUS),
                "lastUpdatedAt": "Demo start",
            },
        )
        record["menus"][row["menu_key"]] = bool(row["enabled"]) if row["enabled"] is not None else DEFAULT_MENUS[row["menu_key"]]
        record["lastUpdatedAt"] = _iso(row.get("updated_at"))
    return list(grouped.values())


def _iso(value) -> str:
    if isinstance(value, datetime):
        return value.astimezone(timezone.utc).isoformat()
    return str(value) if value else datetime.now(timezone.utc).isoformat()
