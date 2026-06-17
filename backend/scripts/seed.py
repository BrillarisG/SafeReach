from pathlib import Path
import os
import sys

import psycopg
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")

PERMISSIONS = [
    ("app.main_admin.school.accept", "Accept school registration requests"),
    ("app.main_admin.school.reject", "Reject school registration requests"),
    ("app.admin.student.add", "Add student records"),
    ("app.admin.student.edit", "Edit student records"),
    ("app.admin.student.delete", "Delete student records"),
    ("app.admin.student.move_next_standard", "Move existing student to next standard"),
    ("app.admin.teacher.create", "Create teacher accounts"),
    ("app.admin.teacher.assign_incharge", "Assign primary and assistant incharge"),
    ("app.teacher.student.edit_assigned", "Edit assigned class students"),
    ("app.teacher.attendance.submit", "Submit attendance"),
    ("app.teacher.go_out.submit", "Submit go-out attendance"),
    ("app.parent.child.ready_to_school", "Mark child ready/tracking to school"),
    ("app.parent.child.reached_home", "Confirm child reached home"),
    ("app.timetable.edit", "Edit timetable subjects and break timing"),
    ("app.notification.read", "Read allowed notifications"),
]

ROLE_PERMISSION_KEYS = {
    "main_admin": [key for key, _ in PERMISSIONS],
    "school_admin": [key for key, _ in PERMISSIONS if key.startswith("app.admin") or key.startswith("app.timetable") or key == "app.notification.read"],
    "teacher": ["app.teacher.student.edit_assigned", "app.teacher.attendance.submit", "app.teacher.go_out.submit", "app.timetable.edit", "app.notification.read"],
    "assistant_incharge": ["app.teacher.student.edit_assigned", "app.teacher.attendance.submit", "app.teacher.go_out.submit", "app.timetable.edit", "app.notification.read"],
    "parent": ["app.parent.child.ready_to_school", "app.parent.child.reached_home", "app.notification.read"],
}


def db_url(name: str) -> str:
    value = os.getenv(name, "")
    if not value:
        raise SystemExit(f"{name} is not configured")
    if "sslmode=" not in value:
        value += ("&" if "?" in value else "?") + "sslmode=require"
    return value


def scalar(cur, sql: str, params: tuple):
    cur.execute(sql, params)
    return cur.fetchone()[0]


def main() -> None:
    admin_password = os.getenv("SEED_ADMIN_PASSWORD", "SafeReach@2026")
    teacher_password = os.getenv("SEED_TEACHER_PASSWORD", "Teacher@2026")
    parent_password = os.getenv("SEED_PARENT_PASSWORD", "Parent@2026")
    test_phone = os.getenv("TWILIO_TEST_TO_PHONE", "+910000000000")

    with psycopg.connect(db_url("DB1_URL")) as conn:
        with conn.cursor() as cur:
            for role_key, name in [
                ("main_admin", "Main Admin"),
                ("school_admin", "School Admin"),
                ("teacher", "Teacher"),
                ("assistant_incharge", "Assistant Incharge"),
                ("parent", "Parent"),
            ]:
                cur.execute(
                    "insert into roles(role_key, name, description) values(%s,%s,%s) on conflict(role_key) do update set name=excluded.name returning id",
                    (role_key, name, f"SafeReach {name} role"),
                )

            for key, description in PERMISSIONS:
                cur.execute(
                    "insert into permissions(permission_key, description) values(%s,%s) on conflict(permission_key) do update set description=excluded.description",
                    (key, description),
                )

            for role_key, keys in ROLE_PERMISSION_KEYS.items():
                role_id = scalar(cur, "select id from roles where role_key=%s", (role_key,))
                for key in keys:
                    permission_id = scalar(cur, "select id from permissions where permission_key=%s", (key,))
                    cur.execute(
                        "insert into role_permissions(role_id, permission_id) values(%s,%s) on conflict do nothing",
                        (role_id, permission_id),
                    )

            school_id = scalar(
                cur,
                """
                insert into schools(name, code, address, city, state, phone, email)
                values(%s,%s,%s,%s,%s,%s,%s)
                on conflict(code) do update set name=excluded.name, updated_at=now()
                returning id
                """,
                ("SafeReach Demo Matric School", "SAFE-DEMO", "Demo Campus Road", "Chennai", "Tamil Nadu", test_phone, "admin@safereach.school"),
            )

            def role_id(role_key: str):
                return scalar(cur, "select id from roles where role_key=%s", (role_key,))

            users = [
                ("main@safereach.local", "SafeReach Main Admin", "main_admin", admin_password, None),
                ("admin@safereach.school", "School Admin Priya", "school_admin", admin_password, school_id),
                ("teacher@safereach.school", "Mr. James Anderson", "teacher", teacher_password, school_id),
                ("assistant@safereach.school", "Ms. Elena Roy", "assistant_incharge", teacher_password, school_id),
                ("parent@safereach.school", "Sarah Thompson", "parent", parent_password, school_id),
            ]
            user_ids = {}
            for email, full_name, role_key, password, user_school_id in users:
                user_ids[email] = scalar(
                    cur,
                    """
                    insert into users(school_id, role_id, full_name, email, phone, password_hash, terms_accepted_at)
                    values(%s,%s,%s,%s,%s,%s,now())
                    on conflict(email) do update set full_name=excluded.full_name, role_id=excluded.role_id, updated_at=now()
                    returning id
                    """,
                    (user_school_id, role_id(role_key), full_name, email, test_phone, generate_password_hash(password, method="scrypt")),
                )

            class_id = scalar(
                cur,
                "insert into classes(school_id, name, sort_order) values(%s,%s,%s) on conflict(school_id,name) do update set sort_order=excluded.sort_order returning id",
                (school_id, "Class 4", 4),
            )
            section_id = scalar(
                cur,
                "insert into sections(school_id, class_id, name, room) values(%s,%s,%s,%s) on conflict(class_id,name) do update set room=excluded.room returning id",
                (school_id, class_id, "B", "Room 4B"),
            )

            def upsert_teacher(email: str, employee_code: str, subject: str, qualification: str):
                cur.execute("select id from teachers where user_id=%s", (user_ids[email],))
                row = cur.fetchone()
                if row:
                    cur.execute(
                        "update teachers set employee_code=%s, subject=%s, qualification=%s, status='available', updated_at=now() where id=%s returning id",
                        (employee_code, subject, qualification, row[0]),
                    )
                    return cur.fetchone()[0]
                return scalar(
                    cur,
                    "insert into teachers(school_id, user_id, employee_code, subject, qualification, status) values(%s,%s,%s,%s,%s,%s) returning id",
                    (school_id, user_ids[email], employee_code, subject, qualification, "available"),
                )

            teacher_id = upsert_teacher("teacher@safereach.school", "EMP-10024", "Mathematics", "M.Sc Mathematics")
            assistant_id = upsert_teacher("assistant@safereach.school", "EMP-10025", "Science", "B.Ed Science")
            cur.execute("insert into teacher_assignments(school_id, teacher_id, class_id, section_id, assignment_type, subject) values(%s,%s,%s,%s,%s,%s) on conflict do nothing", (school_id, teacher_id, class_id, section_id, "primary_incharge", "Mathematics"))
            cur.execute("insert into teacher_assignments(school_id, teacher_id, class_id, section_id, assignment_type, subject) values(%s,%s,%s,%s,%s,%s) on conflict do nothing", (school_id, assistant_id, class_id, section_id, "assistant_incharge", "Science"))

            cur.execute("select id from parents where user_id=%s", (user_ids["parent@safereach.school"],))
            parent_row = cur.fetchone()
            if parent_row:
                parent_id = parent_row[0]
                cur.execute("update parents set guardian_name=%s, phone=%s, sms_enabled=true, updated_at=now() where id=%s", ("Sarah Thompson", test_phone, parent_id))
            else:
                parent_id = scalar(
                    cur,
                    "insert into parents(school_id, user_id, guardian_name, phone, sms_enabled) values(%s,%s,%s,%s,true) returning id",
                    (school_id, user_ids["parent@safereach.school"], "Sarah Thompson", test_phone),
                )

            students = [
                ("STU-2026-001", "Leo Thompson", "01"),
                ("STU-2026-002", "Maya Thompson", "02"),
                ("STU-2026-003", "Aarav Sharma", "03"),
                ("STU-2026-004", "Ananya Patel", "04"),
                ("STU-2026-005", "Priya Nair", "05"),
                ("STU-2026-006", "Rohan Gupta", "06"),
            ]
            for code, name, roll in students:
                student_id = scalar(
                    cur,
                    """
                    insert into students(school_id, class_id, section_id, parent_id, student_code, full_name, roll_no, emergency_notes)
                    values(%s,%s,%s,%s,%s,%s,%s,%s)
                    on conflict(student_code) do update set full_name=excluded.full_name, updated_at=now()
                    returning id
                    """,
                    (school_id, class_id, section_id, parent_id, code, name, roll, "No critical notes"),
                )
                cur.execute(
                    """
                    insert into student_travel_status(student_id, school_id, status, attendance_status, last_event)
                    values(%s,%s,'at_home','pending','seeded')
                    on conflict(student_id) do update set status=excluded.status, attendance_status=excluded.attendance_status, last_event_at=now()
                    """,
                    (student_id, school_id),
                )
                cur.execute(
                    """
                    insert into attendance_records(school_id, student_id, class_id, section_id, attendance_date, session, status, marked_by, locked)
                    values(%s,%s,%s,%s,current_date,'morning','present',%s,true)
                    on conflict(student_id, attendance_date, session)
                    do update set status=excluded.status, marked_by=excluded.marked_by, locked=true, updated_at=now()
                    """,
                    (school_id, student_id, class_id, section_id, user_ids["teacher@safereach.school"]),
                )

            days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            subjects = [
                ["English", "Maths", "Science", "Social", "Computer", "Tamil", "Activity", "Library"],
                ["Maths", "Science", "English", "Tamil", "Social", "Computer", "Sports", "Art"],
                ["Science", "English", "Maths", "Computer", "Tamil", "Social", "Library", "Activity"],
                ["Tamil", "Maths", "Science", "English", "Computer", "Social", "Art", "Sports"],
                ["Social", "English", "Computer", "Maths", "Science", "Tamil", "Activity", "Library"],
                ["Revision", "Maths Lab", "Science Lab", "English", "Club", "Sports", "Art", "Library"],
            ]
            for day, row in zip(days, subjects):
                for period_no, subject in enumerate(row, start=1):
                    cur.execute(
                        """
                        insert into timetable_periods(school_id, class_id, section_id, day_name, period_no, subject)
                        values(%s,%s,%s,%s,%s,%s)
                        on conflict(section_id, day_name, period_no) do update set subject=excluded.subject, updated_at=now()
                        """,
                        (school_id, class_id, section_id, day, period_no, subject),
                    )

            for break_key, label, after_period, tone in [
                ("interval1", "Interval-1", 2, "interval"),
                ("lunch", "Lunch", 4, "lunch"),
                ("interval2", "Interval-2", 6, "interval"),
            ]:
                cur.execute(
                    """
                    insert into timetable_breaks(school_id, class_id, section_id, break_key, label, after_period, tone)
                    values(%s,%s,%s,%s,%s,%s,%s)
                    on conflict(section_id, break_key) do update set label=excluded.label, after_period=excluded.after_period, updated_at=now()
                    """,
                    (school_id, class_id, section_id, break_key, label, after_period, tone),
                )

            # Store visible dashboard/report/incident data in DB-1 so frontend pages can avoid unstored demo rows.
            report_rows = [
                ("Overall School Safety", None, None, 96, 0, 100, "Stored school-wide safety report generated from seeded SafeReach data."),
                ("Class 4 Section B Safety", class_id, section_id, 94, 0, 100, "Class 4-B has all seeded students in a safe default state."),
            ]
            for title, report_class_id, report_section_id, score, alerts, attendance, text in report_rows:
                cur.execute(
                    """
                    insert into safety_reports(school_id, class_id, section_id, report_title, safety_score, alert_count, attendance_percent, report_text)
                    values(%s,%s,%s,%s,%s,%s,%s,%s)
                    on conflict do nothing
                    """,
                    (school_id, report_class_id, report_section_id, title, score, alerts, attendance, text),
                )

            cur.execute("select id from students where student_code=%s", ("STU-2026-001",))
            first_student_id = cur.fetchone()[0]
            cur.execute(
                """
                insert into incident_logs(school_id, student_id, incident_code, incident_type, level, priority, status, handler_name, detail)
                values(%s,%s,%s,%s,%s,%s,%s,%s,%s)
                on conflict(incident_code) do update set status=excluded.status, updated_at=now()
                """,
                (school_id, first_student_id, "INC-2026-001", "Medical Check", "Low", "Normal", "accepted", "Nurse Desk", "Stored sample low-level medical check for backend validation."),
            )

            for test_name, service_name, status, detail in [
                ("db1_seed", "Supabase DB-1", "passed", "Seeded school, users, students, attendance status, timetable, reports, and incident data."),
                ("db2_seed_audit", "Supabase DB-2", "passed", "Append-only audit event inserted by seed script when audit flag is used."),
            ]:
                cur.execute(
                    "insert into api_test_results(test_name, service_name, status, detail) values(%s,%s,%s,%s)",
                    (test_name, service_name, status, detail),
                )

        conn.commit()

    if "audit" in sys.argv:
        with psycopg.connect(db_url("DB2_URL")) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    insert into immutable_events(source_db, school_id, event_type, entity_type, entity_id, after_data, metadata)
                    values('db1', null, 'seed.completed', 'system', 'seed-script', %s::jsonb, %s::jsonb)
                    """,
                    ('{"status":"completed"}', '{"script":"backend/scripts/seed.py"}'),
                )
            conn.commit()
    print("Seed data inserted")


if __name__ == "__main__":
    main()
