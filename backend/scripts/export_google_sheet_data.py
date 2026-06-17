from __future__ import annotations

import os
import time
from pathlib import Path
from typing import Any

import psycopg
from dotenv import load_dotenv
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from psycopg.rows import dict_row
from pymongo import MongoClient

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


def sheet_range(title: str, cell_range: str = "A1") -> str:
    escaped = title.replace("'", "''")
    return f"'{escaped}'!{cell_range}"


def ensure_sheets(api, sheet_id: str, titles: list[str]) -> dict[str, int]:
    meta = api.spreadsheets().get(spreadsheetId=sheet_id).execute()
    existing = {sheet["properties"]["title"]: sheet["properties"]["sheetId"] for sheet in meta.get("sheets", [])}
    requests = [{"addSheet": {"properties": {"title": title}}} for title in titles if title not in existing]
    if requests:
        api.spreadsheets().batchUpdate(spreadsheetId=sheet_id, body={"requests": requests}).execute()
        meta = api.spreadsheets().get(spreadsheetId=sheet_id).execute()
        existing = {sheet["properties"]["title"]: sheet["properties"]["sheetId"] for sheet in meta.get("sheets", [])}
    return existing


def write_sheet(api, sheet_id: str, title: str, rows: list[list[Any]], value_input_option: str = "RAW") -> None:
    api.spreadsheets().values().clear(spreadsheetId=sheet_id, range=sheet_range(title, "A:ZZ")).execute()
    api.spreadsheets().values().update(
        spreadsheetId=sheet_id,
        range=sheet_range(title),
        valueInputOption=value_input_option,
        body={"values": rows or [["No rows"]]},
    ).execute()


def batch_write_sheets(api, sheet_id: str, sheets: dict[str, list[list[Any]]], value_input_option: str = "USER_ENTERED") -> None:
    ranges = [sheet_range(title, "A:ZZ") for title in sheets]
    body = {
        "valueInputOption": value_input_option,
        "data": [
            {"range": sheet_range(title), "values": rows or [["No rows"]]}
            for title, rows in sheets.items()
        ],
    }
    for attempt in range(2):
        try:
            api.spreadsheets().values().batchClear(spreadsheetId=sheet_id, body={"ranges": ranges}).execute()
            api.spreadsheets().values().batchUpdate(spreadsheetId=sheet_id, body=body).execute()
            return
        except Exception:
            if attempt == 0:
                time.sleep(65)
                continue
            raise


def format_sheets(api, sheet_id: str, gids: dict[str, int], titles: list[str]) -> None:
    requests = []
    for title in titles:
        gid = gids.get(title)
        if gid is None:
            continue
        requests.extend(
            [
                {
                    "repeatCell": {
                        "range": {"sheetId": gid, "startRowIndex": 0, "endRowIndex": 1},
                        "cell": {
                            "userEnteredFormat": {
                                "backgroundColor": {"red": 0.03, "green": 0.19, "blue": 0.49},
                                "textFormat": {"foregroundColor": {"red": 1, "green": 1, "blue": 1}, "bold": True},
                            }
                        },
                        "fields": "userEnteredFormat(backgroundColor,textFormat)",
                    }
                },
                {"autoResizeDimensions": {"dimensions": {"sheetId": gid, "dimension": "COLUMNS", "startIndex": 0, "endIndex": 20}}},
                {"updateSheetProperties": {"properties": {"sheetId": gid, "gridProperties": {"frozenRowCount": 1}}, "fields": "gridProperties.frozenRowCount"}},
            ]
        )
    if requests:
        api.spreadsheets().batchUpdate(spreadsheetId=sheet_id, body={"requests": requests}).execute()


def postgres_table_rows(db_url: str | None, table_name: str) -> tuple[list[str], list[list[Any]]]:
    if not db_url:
        return [], []
    with psycopg.connect(db_url, row_factory=dict_row) as conn:
        with conn.cursor() as cur:
            cur.execute(f"select * from {table_name} limit 200")
            records = cur.fetchall()
            columns = [column.name for column in cur.description] if cur.description else []
    rows = [[serialize(record.get(column)) for column in columns] for record in records]
    return columns, rows


def mongo_table_rows(collection_name: str) -> tuple[list[str], list[list[Any]]]:
    uri = os.getenv("MONGODB_URI", "")
    database_name = os.getenv("MONGODB_DB", "safereach2026")
    if not uri:
        return [], []
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=8000)
        collection = client[database_name][collection_name]
        docs = list(collection.find().limit(200))
        columns = sorted({key for doc in docs for key in doc.keys()})
        rows = [[serialize(doc.get(column)) for column in columns] for doc in docs]
        client.close()
        return columns, rows
    except Exception as exc:
        return ["export_status", "detail"], [["MongoDB export unavailable", serialize(exc)[:500]]]


def serialize(value: Any) -> Any:
    if value is None:
        return ""
    if isinstance(value, (str, int, float, bool)):
        return value
    return str(value)


def schema_columns(attrs: list[str]) -> list[str]:
    return [item.split(" ")[0].replace(",", "") for item in attrs]


def table_title(prefix: str, index: int, table_name: str) -> str:
    return f"{prefix}.{index} {table_name}"


def build_table_tabs(prefix: str, tables: dict[str, list[str]], db_url: str | None = None, mongo: bool = False) -> tuple[list[str], dict[str, list[list[Any]]], list[list[Any]]]:
    titles: list[str] = []
    tab_rows: dict[str, list[list[Any]]] = {}
    index_rows = [["Sheet Link", "Database Area", "Table Name", "Keys / Attributes", "Stored Row Count"]]
    for index, (table_name, attrs) in enumerate(tables.items(), start=1):
      title = table_title(prefix, index, table_name)
      titles.append(title)
      columns, rows = mongo_table_rows(table_name) if mongo else postgres_table_rows(db_url, table_name)
      headers = columns or schema_columns(attrs)
      tab_rows[title] = [headers] + rows if headers else [["No schema available"]]
      index_rows.append([title, prefix, table_name, ", ".join(attrs), len(rows)])
    return titles, tab_rows, index_rows


def add_index_links(index_rows: list[list[Any]], gids: dict[str, int]) -> list[list[Any]]:
    linked = [index_rows[0]]
    for row in index_rows[1:]:
        title = row[0]
        gid = gids.get(title)
        link = f'=HYPERLINK("#gid={gid}","{title}")' if gid is not None else title
        linked.append([link, *row[1:]])
    return linked


def main() -> None:
    api, sheet_id = service()
    db1_url = os.getenv("DB1_URL")
    db2_url = os.getenv("DB2_URL")

    db1_titles, db1_rows, db1_index = build_table_tabs("sheet-1", DB1_TABLES, db1_url)
    db2_titles, db2_rows, db2_index = build_table_tabs("sheet-2", DB2_TABLES, db2_url)
    db3_titles, db3_rows, db3_index = build_table_tabs("sheet-3", DB3_TABLES, mongo=True)
    all_titles = ["sheet-1", "sheet-2", "sheet-3", "api-test-results", *db1_titles, *db2_titles, *db3_titles]
    gids = ensure_sheets(api, sheet_id, all_titles)

    all_rows = {
        "sheet-1": add_index_links(db1_index, gids),
        "sheet-2": add_index_links(db2_index, gids),
        "sheet-3": add_index_links(db3_index, gids),
        **db1_rows,
        **db2_rows,
        **db3_rows,
    }
    api_rows = db1_rows.get(table_title("sheet-1", list(DB1_TABLES).index("api_test_results") + 1, "api_test_results"), [["No API test data"]])
    all_rows["api-test-results"] = api_rows
    batch_write_sheets(api, sheet_id, all_rows)
    format_sheets(api, sheet_id, gids, all_titles)
    print(f"Google Sheet data tabs updated: {len(all_titles)} tabs")


if __name__ == "__main__":
    main()
