from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")

import sys

sys.path.append(str(ROOT))
from migrations.schema_catalog import DB1_TABLES


def db_url(name: str) -> str:
    value = os.getenv(name, "")
    if not value:
        raise SystemExit(f"{name} is not configured")
    if "sslmode=" not in value:
        value += ("&" if "?" in value else "?") + "sslmode=require"
    return value


def table_columns(conn: psycopg.Connection, table_name: str) -> list[str]:
    with conn.cursor() as cur:
        cur.execute(
            """
            select column_name
            from information_schema.columns
            where table_schema='public' and table_name=%s
            order by ordinal_position
            """,
            (table_name,),
        )
        return [row["column_name"] if isinstance(row, dict) else row[0] for row in cur.fetchall()]


def fetch_rows(conn: psycopg.Connection, table_name: str, columns: list[str]) -> list[dict[str, Any]]:
    quoted_columns = ", ".join(f'"{column}"' for column in columns)
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(f'select {quoted_columns} from "{table_name}"')
        return [dict(row) for row in cur.fetchall()]


def insert_rows(conn: psycopg.Connection, table_name: str, columns: list[str], rows: list[dict[str, Any]]) -> int:
    if not rows:
        return 0
    quoted_columns = ", ".join(f'"{column}"' for column in columns)
    placeholders = ", ".join(["%s"] * len(columns))
    sql = f'insert into "{table_name}" ({quoted_columns}) values ({placeholders}) on conflict do nothing'
    inserted = 0
    with conn.cursor() as cur:
        for row in rows:
            cur.execute(sql, [row.get(column) for column in columns])
            inserted += cur.rowcount
    return inserted


def main() -> None:
    total_inserted = 0
    with psycopg.connect(db_url("DB1_URL"), row_factory=dict_row) as db1, psycopg.connect(db_url("DB2_URL")) as db2:
        for table_name in DB1_TABLES:
            db1_columns = table_columns(db1, table_name)
            db2_columns = table_columns(db2, table_name)
            columns = [column for column in db1_columns if column in db2_columns]
            rows = fetch_rows(db1, table_name, columns)
            inserted = insert_rows(db2, table_name, columns, rows)
            total_inserted += inserted
            print(f"{table_name}: copied {inserted} new rows from {len(rows)} DB-1 rows")
        db2.commit()
    print(f"DB-2 mirror complete. New rows inserted: {total_inserted}")


if __name__ == "__main__":
    main()
