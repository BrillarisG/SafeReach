from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")

import sys
sys.path.append(str(ROOT))
from migrations.schema_catalog import DB1_TABLES, DB2_TABLES, DB3_TABLES

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]


def service():
    service_account = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE", "")
    sheet_id = os.getenv("GOOGLE_SHEET_ID", "")
    if not service_account or not sheet_id:
        raise SystemExit("GOOGLE_SERVICE_ACCOUNT_FILE and GOOGLE_SHEET_ID must be configured")
    creds = Credentials.from_service_account_file(str((ROOT / service_account).resolve()), scopes=SCOPES)
    return build("sheets", "v4", credentials=creds), sheet_id


def ensure_sheet(api, sheet_id: str, title: str) -> None:
    meta = api.spreadsheets().get(spreadsheetId=sheet_id).execute()
    existing = {sheet["properties"]["title"] for sheet in meta.get("sheets", [])}
    if title in existing:
        return
    api.spreadsheets().batchUpdate(
        spreadsheetId=sheet_id,
        body={"requests": [{"addSheet": {"properties": {"title": title}}}]},
    ).execute()


def values_for(prefix: str, tables: dict[str, list[str]]) -> list[list[str]]:
    rows = [["Sheet/Table Name", "Database", "Table Name", "Keys / Attributes"]]
    for index, (table_name, attrs) in enumerate(tables.items(), start=1):
        rows.append([f"{prefix}.{index} {table_name}", prefix, table_name, ", ".join(attrs)])
    return rows


def write_sheet(api, sheet_id: str, title: str, rows: list[list[str]]) -> None:
    ensure_sheet(api, sheet_id, title)
    api.spreadsheets().values().clear(spreadsheetId=sheet_id, range=f"{title}!A:Z").execute()
    api.spreadsheets().values().update(
        spreadsheetId=sheet_id,
        range=f"{title}!A1",
        valueInputOption="RAW",
        body={"values": rows},
    ).execute()


def main() -> None:
    api, sheet_id = service()
    write_sheet(api, sheet_id, "db-1", values_for("sheet-1", DB1_TABLES))
    write_sheet(api, sheet_id, "db-2", values_for("sheet-2", DB2_TABLES))
    write_sheet(api, sheet_id, "log-db", values_for("sheet-3", DB3_TABLES))
    print("Google Sheet schema tabs updated: db-1, db-2, log-db")


if __name__ == "__main__":
    main()
