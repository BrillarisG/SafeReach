from __future__ import annotations

import os
from pathlib import Path
from urllib import request

import psycopg
import redis
from dotenv import load_dotenv
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from pymongo import MongoClient

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")

import sys

sys.path.append(str(ROOT))
from app import create_app
from app.services.email_service import send_email
from app.services.sms_service import send_parent_sms


def safe_detail(value: object) -> str:
    text = str(value)
    for name in [
        "DB1_URL",
        "DB2_URL",
        "MONGODB_URI",
        "REDIS_URL",
        "UPSTASH_REDIS_REST_URL",
        "UPSTASH_REDIS_REST_TOKEN",
        "TWILIO_AUTH_TOKEN",
        "TWILIO_ACCOUNT_SID",
        "RESEND_API_KEY",
        "SENTRY_DSN",
    ]:
        secret = os.getenv(name)
        if secret:
            text = text.replace(secret, "[redacted]")
    return text[:900]


def record(test_name: str, service_name: str, status: str, detail: object) -> None:
    db1_url = os.getenv("DB1_URL")
    print(f"{service_name}: {status} - {safe_detail(detail)}")
    if not db1_url:
        return
    with psycopg.connect(db1_url) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                insert into api_test_results(test_name, service_name, status, detail)
                values(%s,%s,%s,%s)
                """,
                (test_name, service_name, status, safe_detail(detail)),
            )
        conn.commit()


def check_db1() -> None:
    url = os.getenv("DB1_URL")
    if not url:
        record("DB-1 connection", "Supabase PostgreSQL DB-1", "skipped", "DB1_URL not configured")
        return
    with psycopg.connect(url) as conn:
        with conn.cursor() as cur:
            cur.execute("select (select count(*) from schools), (select count(*) from students), (select count(*) from teachers)")
            schools, students, teachers = cur.fetchone()
    record("DB-1 connection", "Supabase PostgreSQL DB-1", "passed", f"schools={schools}, students={students}, teachers={teachers}")


def check_db2() -> None:
    url = os.getenv("DB2_URL")
    if not url:
        record("DB-2 mirror check", "Supabase PostgreSQL DB-2", "skipped", "DB2_URL not configured")
        return
    with psycopg.connect(url) as conn:
        with conn.cursor() as cur:
            cur.execute("select (select count(*) from schools), (select count(*) from students), (select count(*) from teachers)")
            schools, students, teachers = cur.fetchone()
            cur.execute(
                "insert into api_test_results(test_name, service_name, status, detail) values(%s,%s,%s,%s) on conflict do nothing",
                ("DB-2 mirror insert", "Supabase PostgreSQL DB-2", "passed", "Insert allowed; update/delete protected by DB-2 triggers."),
            )
        conn.commit()
    record("DB-2 mirror check", "Supabase PostgreSQL DB-2", "passed", f"schools={schools}, students={students}, teachers={teachers}")


def check_mongodb() -> None:
    uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("MONGODB_DB", "safereach2026")
    if not uri:
        record("DB-3 realtime insert", "MongoDB DB-3", "skipped", "MONGODB_URI not configured")
        return
    client = MongoClient(uri, serverSelectionTimeoutMS=8000)
    client.admin.command("ping")
    result = client[db_name]["system_checks"].insert_one({"source": "integration_check", "status": "passed"})
    client.close()
    record("DB-3 realtime insert", "MongoDB DB-3", "passed", f"system_checks inserted: {result.inserted_id}")


def check_redis() -> None:
    url = os.getenv("REDIS_URL")
    upstash_url = os.getenv("UPSTASH_REDIS_REST_URL")
    upstash_token = os.getenv("UPSTASH_REDIS_REST_TOKEN")
    if upstash_url and upstash_token:
        ping_url = f"{upstash_url.rstrip('/')}/ping"
        req = request.Request(ping_url, headers={"Authorization": f"Bearer {upstash_token}"})
        with request.urlopen(req, timeout=8) as response:
            body = response.read().decode("utf-8")
        record("Upstash Redis REST ping", "Upstash Redis", "passed" if "PONG" in body.upper() else "unknown", body)
        return
    if url:
        client = redis.Redis.from_url(url, socket_connect_timeout=3)
        record("Redis ping", "Redis", "passed" if client.ping() else "failed", "PING completed")
        return
    record("Redis ping", "Redis", "skipped", "REDIS_URL or UPSTASH Redis REST env not configured")


def check_google_sheet() -> None:
    service_account = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE")
    sheet_id = os.getenv("GOOGLE_SHEET_ID")
    if not service_account or not sheet_id:
        record("Google Sheet access", "Google Sheets", "skipped", "Google Sheet env not configured")
        return
    creds = Credentials.from_service_account_file(str((ROOT / service_account).resolve()), scopes=["https://www.googleapis.com/auth/spreadsheets"])
    api = build("sheets", "v4", credentials=creds)
    meta = api.spreadsheets().get(spreadsheetId=sheet_id).execute()
    record("Google Sheet access", "Google Sheets", "passed", f"spreadsheet title: {meta.get('properties', {}).get('title')}")


def check_sms_and_email() -> None:
    app = create_app()
    with app.app_context():
        test_phone = app.config.get("TWILIO_TEST_TO_PHONE")
        if test_phone:
            sms_result = send_parent_sms(test_phone, "SafeReach integration test SMS.")
            record("Twilio SMS send", "Twilio", sms_result.get("status", "unknown"), sms_result)
        else:
            record("Twilio SMS send", "Twilio", "skipped", "TWILIO_TEST_TO_PHONE not configured")

        test_email = os.getenv("TEST_EMAIL_TO")
        if test_email:
            email_result = send_email(test_email, "SafeReach integration test", "<p>SafeReach backend email integration test.</p>")
            record("Resend email send", "Resend", "passed" if isinstance(email_result, dict) and email_result.get("id") else "unknown", email_result)
        else:
            record("Resend email send", "Resend", "skipped", "TEST_EMAIL_TO not configured")


def main() -> None:
    checks = [check_db1, check_db2, check_mongodb, check_redis, check_google_sheet, check_sms_and_email]
    for check in checks:
        try:
            check()
        except Exception as exc:
            record(check.__name__, check.__name__.replace("check_", ""), "failed", exc)


if __name__ == "__main__":
    main()
