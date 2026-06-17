from __future__ import annotations

from flask import current_app

try:
    from twilio.rest import Client
except ImportError:  # pragma: no cover - optional integration package
    Client = None


def send_parent_sms(to_phone: str, body: str) -> dict:
    if current_app.config.get("SMS_TEST_MODE"):
        to_phone = current_app.config.get("TWILIO_TEST_TO_PHONE") or to_phone
    sid = current_app.config.get("TWILIO_ACCOUNT_SID")
    token = current_app.config.get("TWILIO_AUTH_TOKEN")
    from_phone = current_app.config.get("TWILIO_FROM_PHONE")
    if Client is None:
        return {"status": "skipped", "reason": "twilio_package_not_installed", "to": to_phone}
    if not sid or not token or not from_phone:
        return {"status": "skipped", "reason": "twilio_not_configured", "to": to_phone}
    message = Client(sid, token).messages.create(from_=from_phone, to=to_phone, body=body)
    return {"status": message.status, "sid": message.sid, "to": to_phone}
