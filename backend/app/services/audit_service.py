from __future__ import annotations

import json

from flask import current_app
from psycopg.errors import UndefinedTable

from ..db import db2_conn


def write_audit(event_type: str, entity_type: str, entity_id: str | None, after_data: dict, actor_user_id: str | None = None, school_id: str | None = None, metadata: dict | None = None) -> None:
    if not current_app.config.get("DB2_URL"):
        current_app.logger.warning("DB2_URL not configured; audit event skipped: %s", event_type)
        return
    try:
        with db2_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    insert into immutable_events(source_db, school_id, actor_user_id, event_type, entity_type, entity_id, after_data, metadata)
                    values('backend', %s, %s, %s, %s, %s, %s::jsonb, %s::jsonb)
                    """,
                    (school_id, actor_user_id, event_type, entity_type, entity_id, json.dumps(after_data), json.dumps(metadata or {})),
                )
            conn.commit()
    except UndefinedTable:
        current_app.logger.info("DB-2 is configured as a protected DB-1 mirror; legacy immutable_events audit insert skipped: %s", event_type)
