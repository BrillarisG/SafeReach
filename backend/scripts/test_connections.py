from __future__ import annotations

from pathlib import Path
import os
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from dotenv import load_dotenv

load_dotenv(ROOT / ".env")


def result(name: str, ok: bool, detail: str = "") -> tuple[str, bool, str]:
    status = "PASS" if ok else "FAIL"
    print(f"{status} {name}{': ' + detail if detail else ''}")
    return name, ok, detail


def db_url(name: str) -> str:
    value = os.getenv(name, "")
    if value and "sslmode=" not in value:
        value += ("&" if "?" in value else "?") + "sslmode=require"
    return value


def test_postgres(label: str, env_name: str) -> tuple[str, bool, str]:
    try:
        import psycopg

        url = db_url(env_name)
        if not url:
            return result(label, False, f"{env_name} missing")
        with psycopg.connect(url, connect_timeout=8) as conn:
            with conn.cursor() as cur:
                cur.execute("select 1")
                cur.fetchone()
        return result(label, True, "connected")
    except Exception as exc:
        return result(label, False, exc.__class__.__name__)


def test_mongo() -> tuple[str, bool, str]:
    try:
        from pymongo import MongoClient

        uri = os.getenv("MONGODB_URI", "")
        db_name = os.getenv("MONGODB_DB", "safereach2026")
        if not uri:
            return result("MongoDB DB-3", False, "MONGODB_URI missing")
        client = MongoClient(uri, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000, socketTimeoutMS=5000)
        client.admin.command("ping")
        client[db_name]["api_test_results"].insert_one({"test_name": "backend_connection_check", "status": "passed"})
        return result("MongoDB DB-3", True, "ping + insert ok")
    except Exception as exc:
        return result("MongoDB DB-3", False, exc.__class__.__name__)


def test_redis() -> tuple[str, bool, str]:
    try:
        import requests

        upstash_url = os.getenv("UPSTASH_REDIS_REST_URL", "").rstrip("/")
        upstash_token = os.getenv("UPSTASH_REDIS_REST_TOKEN", "")
        if upstash_url and upstash_token:
            response = requests.get(
                f"{upstash_url}/ping",
                headers={"Authorization": f"Bearer {upstash_token}"},
                timeout=8,
            )
            return result("Redis / Upstash", response.ok, f"HTTP {response.status_code}")

        redis_url = os.getenv("REDIS_URL", "")
        if not redis_url:
            return result("Redis / Upstash", False, "REDIS_URL missing")
        import redis

        client = redis.from_url(redis_url, socket_connect_timeout=8)
        return result("Redis / Upstash", bool(client.ping()), "PING ok")
    except Exception as exc:
        return result("Redis / Upstash", False, exc.__class__.__name__)


def test_google_sheet() -> tuple[str, bool, str]:
    try:
        from google.oauth2.service_account import Credentials
        from googleapiclient.discovery import build

        credential_file = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE", "")
        sheet_id = os.getenv("GOOGLE_SHEET_ID", "")
        if not credential_file or not sheet_id:
            return result("Google Sheets", False, "credentials missing")
        path = (ROOT / credential_file).resolve()
        if not path.exists():
            return result("Google Sheets", False, "credential file missing")
        scopes = ["https://www.googleapis.com/auth/spreadsheets"]
        credentials = Credentials.from_service_account_file(path, scopes=scopes)
        service = build("sheets", "v4", credentials=credentials, cache_discovery=False)
        service.spreadsheets().get(spreadsheetId=sheet_id).execute()
        return result("Google Sheets", True, "spreadsheet reachable")
    except Exception as exc:
        return result("Google Sheets", False, exc.__class__.__name__)


def test_twilio() -> tuple[str, bool, str]:
    try:
        from twilio.rest import Client

        sid = os.getenv("TWILIO_ACCOUNT_SID", "")
        token = os.getenv("TWILIO_AUTH_TOKEN", "")
        if not sid or not token:
            return result("Twilio", False, "credentials missing")
        Client(sid, token).api.accounts(sid).fetch()
        return result("Twilio", True, "account reachable")
    except Exception as exc:
        return result("Twilio", False, exc.__class__.__name__)


def test_resend() -> tuple[str, bool, str]:
    try:
        import requests

        api_key = os.getenv("RESEND_API_KEY", "")
        if not api_key:
            return result("Resend", False, "RESEND_API_KEY missing")
        response = requests.get(
            "https://api.resend.com/domains",
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=8,
        )
        return result("Resend", response.ok, f"HTTP {response.status_code}")
    except Exception as exc:
        return result("Resend", False, exc.__class__.__name__)


def test_flask_api() -> list[tuple[str, bool, str]]:
    from app import create_app

    checks = []
    app = create_app()
    with app.test_client() as client:
        health = client.get("/health")
        checks.append(result("HTTP /health", health.status_code == 200, f"HTTP {health.status_code}"))

        bootstrap = client.get("/api/v1/bootstrap")
        checks.append(result("HTTP /api/v1/bootstrap", bootstrap.status_code == 200, f"HTTP {bootstrap.status_code}"))

        login = client.post(
            "/api/v1/auth/login",
            json={"email": "admin@safereach.school", "password": os.getenv("SEED_ADMIN_PASSWORD", "")},
        )
        checks.append(result("HTTP /api/v1/auth/login", login.status_code == 200, f"HTTP {login.status_code}"))
    return checks


def main() -> int:
    checks = [
        test_postgres("Supabase DB-1", "DB1_URL"),
        test_postgres("Supabase DB-2", "DB2_URL"),
        test_mongo(),
        test_redis(),
        test_google_sheet(),
        test_twilio(),
        test_resend(),
        *test_flask_api(),
    ]
    failed = [name for name, ok, _ in checks if not ok]
    if failed:
        print("FAILED_CHECKS=" + ", ".join(failed))
        return 1
    print("ALL_BACKEND_CONNECTION_CHECKS_PASSED")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
