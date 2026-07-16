from __future__ import annotations

from flask import current_app


def integration_status() -> dict:
    """Return non-secret integration readiness for frontend/admin checks."""

    checks = [
        {
            "key": "db1",
            "name": "DB-1 Supabase editable store",
            "configured": bool(current_app.config.get("DB1_URL")),
            "required": True,
            "usedFor": "Schools, users, students, attendance, reports, timetable, and editable app data.",
        },
        {
            "key": "db2",
            "name": "DB-2 Supabase immutable mirror",
            "configured": bool(current_app.config.get("DB2_URL")),
            "required": True,
            "usedFor": "Append-only audit, backup mirror, and deletion-protected history.",
        },
        {
            "key": "mongodb",
            "name": "MongoDB DB-3 realtime/event store",
            "configured": bool(current_app.config.get("MONGODB_URI") and current_app.config.get("MONGODB_DB")),
            "required": True,
            "usedFor": "Travel status events, realtime logs, notification events, and JSON backup records.",
        },
        {
            "key": "redis",
            "name": "Redis / Upstash cache and queue",
            "configured": bool(
                current_app.config.get("REDIS_URL")
                or (
                    current_app.config.get("UPSTASH_REDIS_REST_URL")
                    and current_app.config.get("UPSTASH_REDIS_REST_TOKEN")
                )
            ),
            "required": True,
            "usedFor": "Rate limiting, session/cache support, queues, and future background jobs.",
        },
        {
            "key": "google_sheets",
            "name": "Google Sheets export",
            "configured": bool(
                current_app.config.get("GOOGLE_SERVICE_ACCOUNT_FILE")
                and current_app.config.get("GOOGLE_SHEET_ID")
            ),
            "required": False,
            "usedFor": "Schema/table exports to the project Google Sheet workbook.",
        },
        {
            "key": "twilio",
            "name": "Twilio SMS",
            "configured": bool(
                current_app.config.get("TWILIO_ACCOUNT_SID")
                and current_app.config.get("TWILIO_AUTH_TOKEN")
                and current_app.config.get("TWILIO_FROM_PHONE")
            ),
            "required": True,
            "usedFor": "Parent SMS alerts for attendance, late arrival, absence, and travel updates.",
        },
        {
            "key": "resend",
            "name": "Resend email",
            "configured": bool(current_app.config.get("RESEND_API_KEY")),
            "required": True,
            "usedFor": "School admin onboarding, alerts, password flow, and report emails.",
        },
        {
            "key": "sentry",
            "name": "Sentry monitoring",
            "configured": bool(current_app.config.get("SENTRY_DSN")),
            "required": False,
            "usedFor": "Production error monitoring and backend exception visibility.",
        },
        {
            "key": "json_backup",
            "name": "Secure JSON backup folder",
            "configured": bool(current_app.config.get("JSON_BACKUP_DIR")),
            "required": True,
            "usedFor": "Encrypted/exportable JSON-format backup copies of DB records.",
        },
    ]

    missing_required = [item["key"] for item in checks if item["required"] and not item["configured"]]
    return {
        "ok": not missing_required,
        "missingRequired": missing_required,
        "integrations": checks,
    }
