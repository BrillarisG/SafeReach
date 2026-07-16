import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")


def _database_url(name: str) -> str:
    value = os.getenv(name, "")
    if value and "sslmode=" not in value:
        separator = "&" if "?" in value else "?"
        value = f"{value}{separator}sslmode=require"
    return value


class Config:
    SAFE_REACH_ENV = os.getenv("SAFE_REACH_ENV", "development")
    DEBUG = SAFE_REACH_ENV == "development"
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-change-me")
    JWT_SECRET = os.getenv("JWT_SECRET", SECRET_KEY)
    JWT_ACCESS_MINUTES = int(os.getenv("JWT_ACCESS_MINUTES", "30"))
    JWT_REFRESH_DAYS = int(os.getenv("JWT_REFRESH_DAYS", "14"))
    JWT_ACCESS_DELTA = timedelta(minutes=JWT_ACCESS_MINUTES)
    JWT_REFRESH_DELTA = timedelta(days=JWT_REFRESH_DAYS)

    FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
    FRONTEND_ORIGINS = [
        origin.strip()
        for origin in os.getenv("FRONTEND_ORIGINS", f"{FRONTEND_ORIGIN},http://127.0.0.1:3000").split(",")
        if origin.strip()
    ]
    VERCEL_ORIGIN_SUFFIX = os.getenv("VERCEL_ORIGIN_SUFFIX", ".vercel.app")
    SOCKETIO_CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv("SOCKETIO_CORS_ORIGINS", "*").split(",")
        if origin.strip()
    ]

    DB1_URL = _database_url("DB1_URL")
    DB2_URL = _database_url("DB2_URL")
    MONGODB_URI = os.getenv("MONGODB_URI", "")
    MONGODB_DB = os.getenv("MONGODB_DB", "safereach_logs")
    REDIS_URL = os.getenv("REDIS_URL", "")
    UPSTASH_REDIS_REST_URL = os.getenv("UPSTASH_REDIS_REST_URL", "")
    UPSTASH_REDIS_REST_TOKEN = os.getenv("UPSTASH_REDIS_REST_TOKEN", "")

    GOOGLE_SERVICE_ACCOUNT_FILE = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE", "")
    GOOGLE_SHEET_ID = os.getenv("GOOGLE_SHEET_ID", "")

    TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_FROM_PHONE = os.getenv("TWILIO_FROM_PHONE", "")
    TWILIO_TEST_TO_PHONE = os.getenv("TWILIO_TEST_TO_PHONE", "")
    SMS_TEST_MODE = os.getenv("SMS_TEST_MODE", "true").lower() == "true"

    RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
    RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "SafeReach <noreply@safereach.local>")
    SENTRY_DSN = os.getenv("SENTRY_DSN", "")
    JSON_BACKUP_DIR = os.getenv("JSON_BACKUP_DIR", str(BASE_DIR / "json_backups"))
