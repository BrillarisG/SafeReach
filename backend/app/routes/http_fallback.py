from flask import Blueprint, jsonify, request

from ..services import safereach_service

api_bp = Blueprint("api", __name__)


@api_bp.get("/bootstrap")
def bootstrap():
    return jsonify(safereach_service.bootstrap())


@api_bp.post("/auth/login")
def login():
    payload = request.get_json(silent=True) or {}
    return jsonify(safereach_service.login(payload.get("email", ""), payload.get("password", "")))
