# SafeReach JSON Backups

This folder is the default output location for backend JSON backups created by:

```text
POST /api/v1/backup/json
```

Each backup run creates a timestamped folder with separate subfolders:

- `db1/` for editable operational database table JSON files
- `db2/` for protected mirror/backup database table JSON files
- `db3/` for MongoDB realtime/event collection JSON files, when configured

Sensitive fields such as passwords, password hashes, API keys, tokens, and secrets are not written as plain text. They are replaced with protected hash objects for backup safety.

Do not commit generated timestamped backup folders to source control.
