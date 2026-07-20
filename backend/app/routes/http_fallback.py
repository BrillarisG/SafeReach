from flask import Blueprint, jsonify, request

from ..services import industry_menu_service, integration_status_service, json_backup_service, safereach_service, safety_protocol_service

api_bp = Blueprint("api", __name__)


@api_bp.get("/bootstrap")
def bootstrap():
    try:
        payload, cache_state = safereach_service.bootstrap_cached()
        response = jsonify(payload)
        # The response contains student data, so cache only in the server-side
        # Redis layer and never in a shared browser or CDN cache.
        response.headers["Cache-Control"] = "private, no-store"
        response.headers["X-SafeReach-Cache"] = cache_state
        return response
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


@api_bp.post("/student-travel/<student_id>/ready-to-school")
def student_ready_to_school(student_id: str):
    payload = request.get_json(silent=True) or {}
    try:
        return jsonify(safereach_service.mark_ready_to_school(student_id, payload.get("actorUserId")))
    except LookupError as exc:
        return _api_error("student_travel_not_found", exc, 404)
    except Exception as exc:
        return _api_error("student_ready_to_school_failed", exc, 503)


@api_bp.post("/student-travel/<student_id>/reached-home")
def student_reached_home(student_id: str):
    payload = request.get_json(silent=True) or {}
    try:
        return jsonify(safereach_service.mark_reached_home(student_id, payload.get("actorUserId")))
    except LookupError as exc:
        return _api_error("student_travel_not_found", exc, 404)
    except Exception as exc:
        return _api_error("student_reached_home_failed", exc, 503)


@api_bp.post("/student-travel/<student_id>/attendance")
def student_attendance(student_id: str):
    payload = request.get_json(silent=True) or {}
    try:
        return jsonify(safereach_service.submit_attendance(student_id, payload.get("status", ""), payload.get("actorUserId")))
    except ValueError as exc:
        return _api_error("attendance_invalid", exc, 400)
    except LookupError as exc:
        return _api_error("student_travel_not_found", exc, 404)
    except Exception as exc:
        return _api_error("attendance_submit_failed", exc, 503)


@api_bp.post("/student-travel/go-out")
def student_go_out():
    payload = request.get_json(silent=True) or {}
    student_ids = payload.get("studentIds") or []
    if not isinstance(student_ids, list):
        return _api_error("go_out_invalid", ValueError("studentIds must be a list"), 400)
    try:
        results = [safereach_service.submit_go_out(student_id, payload.get("actorUserId")) for student_id in student_ids]
        return jsonify({"ok": True, "records": results})
    except LookupError as exc:
        return _api_error("student_travel_not_found", exc, 404)
    except Exception as exc:
        return _api_error("go_out_submit_failed", exc, 503)


@api_bp.get("/safety-protocols")
def safety_protocols():
    try:
        return jsonify(safety_protocol_service.list_protocols(request.args.get("role", ""), request.args.get("schoolId")))
    except ValueError as exc:
        return _api_error("safety_protocol_invalid", exc, 400)
    except Exception as exc:
        return _api_error("safety_protocol_list_failed", exc, 503)


@api_bp.post("/safety-protocols")
def create_safety_protocol():
    payload = request.get_json(silent=True) or {}
    try:
        return jsonify(
            safety_protocol_service.create_protocol(
                role_key=payload.get("role", ""),
                label=payload.get("label", ""),
                actor_user_id=payload.get("actorUserId"),
                school_id=payload.get("schoolId"),
            )
        )
    except ValueError as exc:
        return _api_error("safety_protocol_invalid", exc, 400)
    except Exception as exc:
        return _api_error("safety_protocol_create_failed", exc, 503)


@api_bp.patch("/safety-protocols/<protocol_id>")
def update_safety_protocol(protocol_id: str):
    payload = request.get_json(silent=True) or {}
    try:
        return jsonify(safety_protocol_service.update_protocol(protocol_id, payload, payload.get("actorUserId")))
    except ValueError as exc:
        return _api_error("safety_protocol_invalid", exc, 400)
    except LookupError as exc:
        return _api_error("safety_protocol_not_found", exc, 404)
    except Exception as exc:
        return _api_error("safety_protocol_update_failed", exc, 503)


@api_bp.post("/safety-protocols/submit")
def submit_safety_protocols():
    payload = request.get_json(silent=True) or {}
    protocol_ids = payload.get("protocolIds") or []
    if not isinstance(protocol_ids, list):
        return _api_error("safety_protocol_invalid", ValueError("protocolIds must be a list"), 400)
    try:
        return jsonify(
            safety_protocol_service.submit_protocols(
                role_key=payload.get("role", ""),
                protocol_ids=protocol_ids,
                actor_user_id=payload.get("actorUserId"),
                school_id=payload.get("schoolId"),
            )
        )
    except ValueError as exc:
        return _api_error("safety_protocol_invalid", exc, 400)
    except Exception as exc:
        return _api_error("safety_protocol_submit_failed", exc, 503)


@api_bp.delete("/safety-protocols/<protocol_id>")
def delete_safety_protocol(protocol_id: str):
    payload = request.get_json(silent=True) or {}
    try:
        return jsonify(safety_protocol_service.delete_protocol(protocol_id, payload.get("actorUserId")))
    except LookupError as exc:
        return _api_error("safety_protocol_not_found", exc, 404)
    except Exception as exc:
        return _api_error("safety_protocol_delete_failed", exc, 503)


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
