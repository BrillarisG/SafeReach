# SafeReach Backend

Flask backend foundation for SafeReach. This backend is designed to support the existing Next.js frontend through WebSocket-first realtime events plus minimal HTTP fallback endpoints for health and bootstrap checks.

## Setup

```powershell
cd E:\Projects\Live\SafeReach\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Fill `backend\.env` with the real values. Do not commit `.env`.

## Run

```powershell
python scripts/migrate.py all
python scripts/seed.py
python scripts/mirror_db1_to_db2.py
python run.py
```

Backend URL:

```text
http://localhost:5000
ws://localhost:5000/socket.io/
```

## WebSocket Events

Incoming events:

- `auth.login`
- `data.bootstrap`
- `student.ready_to_school`
- `attendance.submit`
- `travel.go_out`
- `parent.reached_home`
- `timetable.break.move`

Outgoing events:

- `safe.connected`
- `auth.login.success`
- `data.bootstrap.success`
- `student.status.changed`
- `attendance.marked`
- `timetable.updated`
- `safe.error`

## Database Plan

- DB-1: editable Supabase/PostgreSQL operational store.
- DB-2: protected Supabase/PostgreSQL mirror of the DB-1 table structure. Inserts are allowed for backup/sync, while update/delete operations are blocked by DB-2 triggers.
- DB-3: MongoDB realtime/event/log store, configured by `MONGODB_URI`.
- Redis: cache/session/rate-limit/queue store, configured by `REDIS_URL` or Upstash REST variables.

## Google Sheets Schema Export

```powershell
python scripts/export_google_sheet_schema.py
python scripts/export_google_sheet_data.py
```

This updates:

- `sheet-1` and `sheet-1.x` DB-1 tables
- `sheet-2` and `sheet-2.x` DB-2 mirror tables
- `sheet-3` and `sheet-3.x` DB-3 realtime collections

with table names, keys, and attributes.
