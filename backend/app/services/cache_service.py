from __future__ import annotations

import json
from threading import Lock
from time import monotonic
from typing import Any

import requests
from flask import current_app

_redis_client = None
_redis_url = ""
_memory_cache: dict[str, tuple[float, Any]] = {}
_memory_lock = Lock()


def get_json(key: str) -> Any | None:
    with _memory_lock:
        cached = _memory_cache.get(key)
        if cached and cached[0] > monotonic():
            return cached[1]
        if cached:
            _memory_cache.pop(key, None)

    value = _command("GET", key)
    if value is None:
        return None
    try:
        decoded = json.loads(value)
        # Keep a small L1 copy in the Render worker. This avoids an external
        # Upstash round trip for repeated dashboard refreshes.
        with _memory_lock:
            _memory_cache[key] = (monotonic() + 15, decoded)
        return decoded
    except (TypeError, ValueError):
        return None


def set_json(key: str, value: Any, ttl_seconds: int) -> bool:
    encoded = json.dumps(value, default=str, separators=(",", ":"))
    with _memory_lock:
        _memory_cache[key] = (monotonic() + ttl_seconds, value)
    # An L1 hit still improves the active worker if the shared cache is
    # temporarily unavailable, so cache writes intentionally fail open.
    _command("SET", key, encoded, "EX", str(ttl_seconds))
    return True


def delete(key: str) -> None:
    with _memory_lock:
        _memory_cache.pop(key, None)
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
