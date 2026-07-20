from pathlib import Path
import sys

import psycopg
from dotenv import load_dotenv
import os

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")


def db_url(name: str) -> str:
    value = os.getenv(name, "")
    if not value:
        raise SystemExit(f"{name} is not configured")
    if "sslmode=" not in value:
        value += ("&" if "?" in value else "?") + "sslmode=require"
    return value


def run_sql(url: str, file_name: str) -> None:
    sql = (ROOT / "migrations" / file_name).read_text(encoding="utf-8")
    with psycopg.connect(url) as conn:
      with conn.cursor() as cur:
          cur.execute(sql)
      conn.commit()
    print(f"Applied {file_name}")


def prepare_existing_messages(url: str) -> None:
    """Upgrade pre-messaging schemas before db1_schema creates message indexes."""
    with psycopg.connect(url) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                alter table if exists messages add column if not exists student_id uuid references students(id) on delete set null;
                alter table if exists messages add column if not exists message_kind text not null default 'chat';
                """
            )
        conn.commit()


def main() -> None:
    target = sys.argv[1] if len(sys.argv) > 1 else "all"
    if target in {"all", "db1"}:
        primary_url = db_url("DB1_URL")
        prepare_existing_messages(primary_url)
        run_sql(primary_url, "db1_schema.sql")
        phase2 = ROOT / "migrations" / "db1_phase2_schema.sql"
        if phase2.exists():
            run_sql(primary_url, "db1_phase2_schema.sql")
        phase3 = ROOT / "migrations" / "db1_phase3_messaging.sql"
        if phase3.exists():
            run_sql(primary_url, "db1_phase3_messaging.sql")
    if target in {"all", "db2"}:
        replica_url = db_url("DB2_URL")
        prepare_existing_messages(replica_url)
        run_sql(replica_url, "db1_schema.sql")
        phase2 = ROOT / "migrations" / "db1_phase2_schema.sql"
        if phase2.exists():
            run_sql(replica_url, "db1_phase2_schema.sql")
        phase3 = ROOT / "migrations" / "db1_phase3_messaging.sql"
        if phase3.exists():
            run_sql(replica_url, "db1_phase3_messaging.sql")
        run_sql(replica_url, "db2_schema.sql")


if __name__ == "__main__":
    main()
