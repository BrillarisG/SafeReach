from __future__ import annotations

import json
from typing import Any

import requests
from flask import current_app

_redis_client = None
_redis_url = ""


def get_json(key: str) -> Any | None:
    value = _command("GET", key)
    if value is None:
        return None
    try:
        return json.loads(value)
    except (TypeError, ValueError):
        return None


def set_json(key: str, value: Any, ttl_seconds: int) -> bool:
    encoded = json.dumps(value, default=str, separators=(",", ":"))
    return _command("SET", key, encoded, "EX", str(ttl_seconds)) == "OK"


def delete(key: str) -> None:
    _command("DEL", key)


def _command(*parts: str) -> Any | None:
    """Run a cache command without allowing cache outages to block DB reads."""
    try:
        redis_url = current_app.config.get("REDIS_URL", "")
        if redis_url:
            return _redis_command(redis_url, *parts)

        upstash_url = current_app.config.get("UPSTASH_REDIS_REST_URL", "").rstrip("/")
        upstash_token = current_app.config.get("UPSTASH_REDIS_REST_TOKEN", "")
        if upstash_url and upstash_token:
            response = requests.post(
                upstash_url,
                headers={"Authorization": f"Bearer {upstash_token}"},
                json=list(parts),
                timeout=(1.5, 2.5),
            )
            response.raise_for_status()
            return response.json().get("result")
    except Exception as exc:
        current_app.logger.warning("Cache command %s unavailable: %s", parts[0], exc)
    return None


def _redis_command(redis_url: str, *parts: str) -> Any | None:
    global _redis_client, _redis_url
    if _redis_client is None or _redis_url != redis_url:
        import redis

        _redis_client = redis.from_url(
            redis_url,
            decode_responses=True,
            socket_connect_timeout=1.5,
            socket_timeout=2.5,
        )
        _redis_url = redis_url
    return _redis_client.execute_command(*parts)
