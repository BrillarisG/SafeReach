from flask import Blueprint, jsonify, request

from ..services import safereach_service

api_bp = Blueprint("api", __name__)


@api_bp.get("/bootstrap")
def bootstrap():
    try:
        return jsonify(safereach_service.bootstrap())
    except Exception as exc:
        return _api_error("bootstrap_failed", exc, 503)


@api_bp.post("/auth/login")
def login():
    payload = request.get_json(silent=True) or {}
    try:
        return jsonify(safereach_service.login(payload.get("email", ""), payload.get("password", "")))
    except PermissionError as exc:
        return _api_error("login_failed", exc, 401)
    except Exception as exc:
        return _api_error("login_unavailable", exc, 503)


def _api_error(code: str, exc: Exception, status: int):
    return (
        jsonify(
            {
                "ok": False,
                "code": code,
                "message": str(exc).splitlines()[0],
            }
        ),
        status,
    )
