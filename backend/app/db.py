from __future__ import annotations

from contextlib import contextmanager
from typing import Iterator

import psycopg
from flask import current_app


@contextmanager
def db1_conn() -> Iterator[psycopg.Connection]:
    url = current_app.config.get("DB1_URL")
    if not url:
        raise RuntimeError("DB1_URL is not configured")
    with psycopg.connect(url) as conn:
        yield conn


@contextmanager
def db2_conn() -> Iterator[psycopg.Connection]:
    url = current_app.config.get("DB2_URL")
    if not url:
        raise RuntimeError("DB2_URL is not configured")
    with psycopg.connect(url) as conn:
        yield conn
