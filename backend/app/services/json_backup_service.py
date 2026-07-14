from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from flask import current_app
from psycopg.rows import dict_row
from werkzeug.security import generate_password_hash

from ..db import db1_conn, db2_conn

SENSITIVE_KEYS = ("password", "password_hash", "token", "secret", "auth_token", "api_key")


def create_backup() -> dict:
    backup_root = Path(current_app.config.get("JSON_BACKUP_DIR") or Path(current_app.root_path).parents[0] / "json_backups")
    backup_dir = backup_root / datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    backup_dir.mkdir(parents=True, exist_ok=True)

    result = {
        "backupDir": str(backup_dir),
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "databases": {},
    }
    result["databases"]["db1"] = _export_postgres("db1", db1_conn, backup_dir / "db1")
    result["databases"]["db2"] = _export_postgres("db2", db2_conn, backup_dir / "db2")
    result["databases"]["db3"] = _export_mongodb(backup_dir / "db3")

    _write_json(backup_dir / "manifest.json", result)
    return result


def _export_postgres(label: str, conn_factory, target_dir: Path) -> dict:
    target_dir.mkdir(parents=True, exist_ok=True)
    exported: list[str] = []
    try:
        with conn_factory() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute(
                    """
                    select table_name
                    from information_schema.tables
                    where table_schema = 'public' and table_type = 'BASE TABLE'
                    order by table_name
                    """
                )
                tables = [row["table_name"] for row in cur.fetchall()]
                for table in tables:
                    cur.execute(f'select * from "{table}"')
                    rows = [_protect_row(dict(row)) for row in cur.fetchall()]
                    _write_json(
                        target_dir / f"{table}.json",
                        {
                            "database": label,
                            "table": table,
                            "rowCount": len(rows),
                            "rows": rows,
                        },
                    )
                    exported.append(table)
        return {"ok": True, "tables": exported, "folder": str(target_dir)}
    except Exception as exc:
        _write_json(target_dir / "_error.json", {"ok": False, "message": str(exc).splitlines()[0]})
        return {"ok": False, "tables": exported, "folder": str(target_dir), "message": str(exc).splitlines()[0]}


def _export_mongodb(target_dir: Path) -> dict:
    target_dir.mkdir(parents=True, exist_ok=True)
    try:
        from pymongo import MongoClient
    except Exception as exc:
        _write_json(target_dir / "_error.json", {"ok": False, "message": f"pymongo unavailable: {exc}"})
        return {"ok": False, "collections": [], "folder": str(target_dir), "message": "pymongo unavailable"}

    uri = current_app.config.get("MONGODB_URI")
    db_name = current_app.config.get("MONGODB_DB")
    if not uri or not db_name:
        _write_json(target_dir / "_skipped.json", {"ok": False, "message": "MongoDB is not configured"})
        return {"ok": False, "collections": [], "folder": str(target_dir), "message": "MongoDB is not configured"}

    exported: list[str] = []
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=10000)
        db = client[db_name]
        for name in db.list_collection_names():
            rows = [_json_ready(_protect_row(doc)) for doc in db[name].find({})]
            _write_json(
                target_dir / f"{name}.json",
                {
                    "database": "db3",
                    "collection": name,
                    "rowCount": len(rows),
                    "rows": rows,
                },
            )
            exported.append(name)
        client.close()
        return {"ok": True, "collections": exported, "folder": str(target_dir)}
    except Exception as exc:
        _write_json(target_dir / "_error.json", {"ok": False, "message": str(exc).splitlines()[0]})
        return {"ok": False, "collections": exported, "folder": str(target_dir), "message": str(exc).splitlines()[0]}


def _protect_row(row: dict[str, Any]) -> dict[str, Any]:
    protected: dict[str, Any] = {}
    for key, value in row.items():
        key_lower = key.lower()
        if value is not None and any(marker in key_lower for marker in SENSITIVE_KEYS):
            protected[key] = {
                "protected": True,
                "method": "werkzeug_pbkdf2_hash",
                "value": generate_password_hash(str(value)),
            }
        else:
            protected[key] = _json_ready(value)
    return protected


def _json_ready(value: Any) -> Any:
    if isinstance(value, dict):
        return {str(k): _json_ready(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_json_ready(item) for item in value]
    if hasattr(value, "isoformat"):
        return value.isoformat()
    if hasattr(value, "binary"):
        return str(value)
    return value


def _write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(_json_ready(payload), indent=2, ensure_ascii=False), encoding="utf-8")
