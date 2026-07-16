from flask import Blueprint, jsonify, request

from ..services import industry_menu_service, integration_status_service, json_backup_service, safereach_service

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


@api_bp.get("/industry-menu-access")
def industry_menu_access():
    try:
        return jsonify(industry_menu_service.list_access())
    except Exception as exc:
        return _api_error("industry_menu_access_failed", exc, 503)


@api_bp.put("/industry-menu-access/<school_id>/<menu_key>")
def update_industry_menu_access(school_id: str, menu_key: str):
    payload = request.get_json(silent=True) or {}
    try:
        return jsonify(
            industry_menu_service.set_access(
                school_id=school_id,
                menu_key=menu_key,
                enabled=bool(payload.get("enabled")),
                actor_user_id=payload.get("actorUserId"),
                school_name=payload.get("schoolName"),
            )
        )
    except ValueError as exc:
        return _api_error("industry_menu_access_invalid", exc, 400)
    except Exception as exc:
        return _api_error("industry_menu_access_update_failed", exc, 503)


@api_bp.post("/backup/json")
def create_json_backup():
    try:
        return jsonify(json_backup_service.create_backup())
    except Exception as exc:
        return _api_error("json_backup_failed", exc, 503)


@api_bp.get("/integrations/status")
def integrations_status():
    return jsonify(integration_status_service.integration_status())


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
