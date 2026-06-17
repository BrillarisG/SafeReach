from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

import jwt
from flask import current_app
from werkzeug.security import check_password_hash, generate_password_hash


def hash_password(password: str) -> str:
    return generate_password_hash(password, method="scrypt")


def verify_password(password: str, password_hash: str) -> bool:
    return check_password_hash(password_hash, password)


def create_token(user: dict, token_type: str = "access") -> str:
    now = datetime.now(timezone.utc)
    delta = current_app.config["JWT_ACCESS_DELTA"] if token_type == "access" else current_app.config["JWT_REFRESH_DELTA"]
    payload = {
        "jti": str(uuid4()),
        "sub": str(user["id"]),
        "email": user["email"],
        "role": user["role_key"],
        "school_id": str(user["school_id"]) if user.get("school_id") else None,
        "type": token_type,
        "iat": now,
        "exp": now + delta,
    }
    return jwt.encode(payload, current_app.config["JWT_SECRET"], algorithm="HS256")


def decode_token(token: str) -> dict:
    return jwt.decode(token, current_app.config["JWT_SECRET"], algorithms=["HS256"])
