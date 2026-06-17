from __future__ import annotations

from flask import current_app

try:
    import resend
except ImportError:  # pragma: no cover - optional integration package
    resend = None


def send_email(to_email: str, subject: str, html: str) -> dict:
    api_key = current_app.config.get("RESEND_API_KEY")
    if resend is None:
        return {"status": "skipped", "reason": "resend_package_not_installed", "to": to_email}
    if not api_key:
        return {"status": "skipped", "reason": "resend_not_configured", "to": to_email}
    resend.api_key = api_key
    return resend.Emails.send({
        "from": current_app.config["RESEND_FROM_EMAIL"],
        "to": to_email,
        "subject": subject,
        "html": html,
    })
