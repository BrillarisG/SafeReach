from __future__ import annotations

import os
from pathlib import Path

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
    ("app.teacher.results.enter", "Enter assigned class student results"),
    ("app.admin.results.configure", "Configure result exams and mark limits"),
    ("app.parent.child.ready_to_school", "Mark child ready for school"),
    ("app.parent.child.reached_home", "Confirm child reached home"),
    ("app.timetable.edit", "Edit timetable subjects and break timing"),
    ("app.notification.read", "Read allowed notifications"),
]

ROLE_KEYS = {
    "main_admin": [key for key, _ in PERMISSIONS],
    "school_admin": [key for key, _ in PERMISSIONS if key.startswith("app.admin") or key.startswith("app.timetable") or key == "app.notification.read"],
    "teacher": ["app.teacher.student.edit_assigned", "app.teacher.attendance.submit", "app.teacher.go_out.submit", "app.teacher.results.enter", "app.timetable.edit", "app.notification.read"],
    "assistant_incharge": ["app.teacher.student.edit_assigned", "app.teacher.attendance.submit", "app.teacher.go_out.submit", "app.teacher.results.enter", "app.timetable.edit", "app.notification.read"],
    "parent": ["app.parent.child.ready_to_school", "app.parent.child.reached_home", "app.notification.read"],
}

CLASS_DATA = [
    (4, "A", "Sarah Jenkins", "James Anderson"),
    (5, "A", "Elena Roy", "David Kumar"),
    (6, "A", "Priya Nair", "Ravi Menon"),
    (7, "A", "Anika Sharma", "Kiran Patel"),
    (8, "A", "Meera Iyer", "Arjun Singh"),
]
SUBJECTS = ["English", "Mathematics", "Science", "Social Studies", "Computer"]
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
PARENT_NAMES = [
    "Sarah Thompson", "Nisha Sharma", "Ravi Patel", "Meena Gupta", "Arun Kumar", "Kavya Iyer",
    "Sanjay Rao", "Lakshmi Nair", "Vikram Singh", "Divya Menon", "Rahul Verma", "Pooja Das",
    "Manoj Shah", "Anita Joshi", "Deepak Kapoor", "Renu Bhat", "Suresh Reddy", "Asha Pillai",
    "Naveen George", "Swathi Krishnan", "Harish Mehta", "Neha Malhotra", "Girish Jain", "Rekha Sethi",
    "Sunil Shetty", "Maya Chandra", "Rajesh Prasad", "Shilpa Bose", "Karthik Rao", "Anjali Thomas",
]
FIRST_NAMES = [
    "Leo", "Maya", "Aarav", "Ananya", "Vihaan", "Diya", "Arjun", "Isha", "Kabir", "Riya",
    "Aditya", "Meera", "Rohan", "Kavya", "Ishaan", "Nila", "Arnav", "Saanvi", "Vivaan", "Tara",
]
LAST_NAMES = ["Thompson", "Sharma", "Patel", "Gupta", "Kumar", "Iyer", "Rao", "Nair", "Singh", "Menon"]


def database_url(name: str) -> str:
    value = os.getenv(name, "")
    if not value:
        raise SystemExit(f"{name} is not configured")
    return value if "sslmode=" in value else value + ("&" if "?" in value else "?") + "sslmode=require"


def one(cur, sql: str, params: tuple):
    cur.execute(sql, params)
    return cur.fetchone()[0]


def ensure_user(cur, school_id, role_id, full_name: str, email: str, password: str, phone: str):
    return one(cur, """
        insert into users(school_id, role_id, full_name, email, phone, password_hash, terms_accepted_at)
        values(%s,%s,%s,%s,%s,%s,now())
        on conflict(email) do update set school_id=excluded.school_id, role_id=excluded.role_id,
          full_name=excluded.full_name, phone=excluded.phone, password_hash=excluded.password_hash, updated_at=now()
        returning id
    """, (school_id, role_id, full_name, email, phone, generate_password_hash(password, method="scrypt")))


def ensure_teacher(cur, school_id, user_id, employee_code: str, subject: str):
    cur.execute("select id from teachers where user_id=%s", (user_id,))
    row = cur.fetchone()
    if row:
        cur.execute("update teachers set employee_code=%s, subject=%s, qualification=%s, status='available', updated_at=now() where id=%s", (employee_code, subject, "B.Ed / SafeReach Faculty", row[0]))
        return row[0]
    return one(cur, """
        insert into teachers(school_id, user_id, employee_code, subject, qualification, status)
        values(%s,%s,%s,%s,%s,'available') returning id
    """, (school_id, user_id, employee_code, subject, "B.Ed / SafeReach Faculty"))


def ensure_assignment(cur, school_id, teacher_id, class_id, section_id, assignment_type: str, subject: str | None):
    cur.execute("""
        select id from teacher_assignments
        where school_id=%s and teacher_id=%s and class_id=%s and section_id=%s and assignment_type=%s
          and coalesce(subject, '')=coalesce(%s, '')
        limit 1
    """, (school_id, teacher_id, class_id, section_id, assignment_type, subject))
    if cur.fetchone() is None:
        cur.execute("""
            insert into teacher_assignments(school_id, teacher_id, class_id, section_id, assignment_type, subject)
            values(%s,%s,%s,%s,%s,%s)
        """, (school_id, teacher_id, class_id, section_id, assignment_type, subject))


def main() -> None:
    main_password = os.getenv("SEED_MAIN_ADMIN_PASSWORD")
    admin_password = os.getenv("SEED_ADMIN_PASSWORD")
    teacher_password = os.getenv("SEED_TEACHER_PASSWORD")
    parent_password = os.getenv("SEED_PARENT_PASSWORD")
    if not all([main_password, admin_password, teacher_password, parent_password]):
        raise SystemExit("Set SEED_MAIN_ADMIN_PASSWORD, SEED_ADMIN_PASSWORD, SEED_TEACHER_PASSWORD, and SEED_PARENT_PASSWORD before seeding")
    phone = os.getenv("TWILIO_TEST_TO_PHONE", "+910000000000")

    with psycopg.connect(database_url("DB1_URL")) as conn:
        with conn.cursor() as cur:
            role_ids = {}
            for key, name in [("main_admin", "Main Admin"), ("school_admin", "School Administrator"), ("teacher", "Class Incharge"), ("assistant_incharge", "Assistant Incharge"), ("parent", "Parent / Guardian")]:
                role_ids[key] = one(cur, """
                    insert into roles(role_key, name, description) values(%s,%s,%s)
                    on conflict(role_key) do update set name=excluded.name, description=excluded.description returning id
                """, (key, name, f"SafeReach {name} access"))
            for key, description in PERMISSIONS:
                cur.execute("insert into permissions(permission_key, description) values(%s,%s) on conflict(permission_key) do update set description=excluded.description", (key, description))
            for role_key, permission_keys in ROLE_KEYS.items():
                for permission_key in permission_keys:
                    permission_id = one(cur, "select id from permissions where permission_key=%s", (permission_key,))
                    cur.execute("insert into role_permissions(role_id, permission_id) values(%s,%s) on conflict do nothing", (role_ids[role_key], permission_id))

            school_id = one(cur, """
                insert into schools(name, code, address, city, state, phone, email)
                values(%s,%s,%s,%s,%s,%s,%s)
                on conflict(code) do update set name=excluded.name, address=excluded.address, city=excluded.city,
                  state=excluded.state, phone=excluded.phone, email=excluded.email, updated_at=now() returning id
            """, ("SafeReach Academy", "SAFE-ACADEMY-01", "12 Knowledge Park", "Chennai", "Tamil Nadu", phone, "admin@safereach.school"))

            ensure_user(cur, None, role_ids["main_admin"], "SafeReach Platform Owner", "main@safereach.local", main_password, phone)
            school_admin_id = ensure_user(cur, school_id, role_ids["school_admin"], "Priya Raman", "admin@safereach.school", admin_password, phone)

            teacher_ids = {}
            for index, (_, _, primary_name, assistant_name) in enumerate(CLASS_DATA, start=1):
                for is_assistant, name in [(False, primary_name), (True, assistant_name)]:
                    email = f"{name.lower().replace(' ', '.')}@safereach.school"
                    role_key = "assistant_incharge" if is_assistant else "teacher"
                    user_id = ensure_user(cur, school_id, role_ids[role_key], name, email, teacher_password, phone)
                    teacher_ids[name] = ensure_teacher(cur, school_id, user_id, f"T-{index:02d}{'A' if is_assistant else 'P'}", SUBJECTS[(index + (1 if is_assistant else 0)) % len(SUBJECTS)])

            parent_ids = {}
            for index, name in enumerate(PARENT_NAMES, start=1):
                email = f"parent{index:02d}@safereach.school"
                user_id = ensure_user(cur, school_id, role_ids["parent"], name, email, parent_password, phone)
                cur.execute("select id from parents where user_id=%s", (user_id,))
                row = cur.fetchone()
                if row:
                    parent_ids[index] = row[0]
                    cur.execute("update parents set guardian_name=%s, phone=%s, sms_enabled=true, updated_at=now() where id=%s", (name, phone, row[0]))
                else:
                    parent_ids[index] = one(cur, "insert into parents(school_id, user_id, guardian_name, phone, sms_enabled) values(%s,%s,%s,%s,true) returning id", (school_id, user_id, name, phone))

            student_number = 1
            for grade, section_name, primary_name, assistant_name in CLASS_DATA:
                class_id = one(cur, """
                    insert into classes(school_id, name, sort_order) values(%s,%s,%s)
                    on conflict(school_id,name) do update set sort_order=excluded.sort_order returning id
                """, (school_id, f"Class {grade}", grade))
                section_id = one(cur, """
                    insert into sections(school_id, class_id, name, room) values(%s,%s,%s,%s)
                    on conflict(class_id,name) do update set room=excluded.room returning id
                """, (school_id, class_id, section_name, f"Room {grade}{section_name}"))
                primary_id, assistant_id = teacher_ids[primary_name], teacher_ids[assistant_name]
                ensure_assignment(cur, school_id, primary_id, class_id, section_id, "primary_incharge", SUBJECTS[0])
                ensure_assignment(cur, school_id, assistant_id, class_id, section_id, "assistant_incharge", SUBJECTS[1])
                for subject_index, subject in enumerate(SUBJECTS):
                    ensure_assignment(cur, school_id, primary_id if subject_index % 2 == 0 else assistant_id, class_id, section_id, "subject_teacher", subject)

                for day_index, day in enumerate(DAYS):
                    for period_no in range(1, 9):
                        subject = SUBJECTS[(day_index + period_no - 1) % len(SUBJECTS)]
                        cur.execute("""
                            insert into timetable_periods(school_id, class_id, section_id, day_name, period_no, subject)
                            values(%s,%s,%s,%s,%s,%s)
                            on conflict(section_id, day_name, period_no) do update set subject=excluded.subject, updated_at=now()
                        """, (school_id, class_id, section_id, day, period_no, subject))
                for break_key, label, after_period, tone in [("interval1", "Interval-1", 2, "interval"), ("lunch", "Lunch", 4, "lunch"), ("interval2", "Interval-2", 6, "interval")]:
                    cur.execute("""
                        insert into timetable_breaks(school_id, class_id, section_id, break_key, label, after_period, tone)
                        values(%s,%s,%s,%s,%s,%s,%s)
                        on conflict(section_id, break_key) do update set label=excluded.label, after_period=excluded.after_period, tone=excluded.tone, updated_at=now()
                    """, (school_id, class_id, section_id, break_key, label, after_period, tone))

                # Every section begins with a usable quarterly assessment.
                # Schools can later edit these component labels and maxima.
                exam_id = one(cur, """
                    insert into result_exams(school_id, class_id, section_id, name, created_by, updated_by)
                    values(%s,%s,%s,'Quarterly',%s,%s)
                    on conflict(section_id, name) do update set updated_by=excluded.updated_by, updated_at=now()
                    returning id
                """, (school_id, class_id, section_id, school_admin_id, school_admin_id))
                for subject in SUBJECTS:
                    for component_index, (label, maximum) in enumerate((("Internal 1", 25), ("Internal 2", 25), ("Exam", 50)), start=1):
                        cur.execute("""
                            insert into result_components(exam_id, subject, label, maximum_marks, sort_order)
                            values(%s,%s,%s,%s,%s)
                            on conflict(exam_id, subject, label)
                            do update set maximum_marks=excluded.maximum_marks, sort_order=excluded.sort_order, updated_at=now()
                        """, (exam_id, subject, label, maximum, component_index))

                for roll_no in range(1, 21):
                    if student_number == 1:
                        full_name, parent_index = "Leo Thompson", 1
                    elif student_number == 2:
                        full_name, parent_index = "Maya Thompson", 1
                    else:
                        full_name = f"{FIRST_NAMES[(student_number - 1) % len(FIRST_NAMES)]} {LAST_NAMES[(student_number - 1) % len(LAST_NAMES)]}"
                        parent_index = ((student_number - 3) % 29) + 2
                    student_code = f"SAFE-{grade}{section_name}-{roll_no:02d}"
                    student_id = one(cur, """
                        insert into students(school_id, class_id, section_id, parent_id, student_code, full_name, roll_no, emergency_notes)
                        values(%s,%s,%s,%s,%s,%s,%s,%s)
                        on conflict(student_code) do update set class_id=excluded.class_id, section_id=excluded.section_id,
                          parent_id=excluded.parent_id, full_name=excluded.full_name, roll_no=excluded.roll_no, updated_at=now()
                        returning id
                    """, (school_id, class_id, section_id, parent_ids[parent_index], student_code, full_name, str(roll_no), "No critical notes"))
                    cur.execute("""
                        insert into student_travel_status(student_id, school_id, status, attendance_status, last_event)
                        values(%s,%s,'at_home','pending','seeded_school_dataset')
                        on conflict(student_id) do update set status='at_home', attendance_status='pending', last_event='seeded_school_dataset', last_event_at=now()
                    """, (student_id, school_id))
                    attendance_status = "absent" if roll_no == 20 else "late" if roll_no == 19 else "present"
                    cur.execute("""
                        insert into attendance_records(school_id, student_id, class_id, section_id, attendance_date, session, status, reason, marked_by, locked)
                        values(%s,%s,%s,%s,current_date - 1,'morning',%s,%s,%s,true)
                        on conflict(student_id, attendance_date, session) do update set status=excluded.status,
                          reason=excluded.reason, marked_by=excluded.marked_by, locked=true, updated_at=now()
                    """, (
                        school_id, student_id, class_id, section_id, attendance_status,
                        "Seeded attendance history" if attendance_status != "present" else None, school_admin_id,
                    ))
                    if roll_no <= 3:
                        cur.execute("select id, maximum_marks from result_components where exam_id=%s order by subject, sort_order", (exam_id,))
                        for component_id, maximum_marks in cur.fetchall():
                            score = max(0, float(maximum_marks) - ((roll_no + int(float(maximum_marks))) % 6))
                            cur.execute("""
                                insert into student_result_marks(student_id, result_component_id, marks_obtained, entered_by)
                                values(%s,%s,%s,%s)
                                on conflict(student_id, result_component_id)
                                do update set marks_obtained=excluded.marks_obtained, entered_by=excluded.entered_by, updated_at=now()
                            """, (student_id, component_id, score, school_admin_id))
                    student_number += 1

                cur.execute("""
                    insert into safety_reports(school_id, class_id, section_id, report_title, safety_score, alert_count, attendance_percent, report_text)
                    select %s,%s,%s,%s,96,0,100,%s
                    where not exists (select 1 from safety_reports where school_id=%s and report_title=%s)
                """, (school_id, class_id, section_id, f"Class {grade}{section_name} Safety", f"Stored safety report for Class {grade}-{section_name}.", school_id, f"Class {grade}{section_name} Safety"))

            cur.execute("select id from students where student_code='SAFE-4A-01'")
            first_student_id = cur.fetchone()[0]
            cur.execute("""
                insert into incident_logs(school_id, student_id, incident_code, incident_type, level, priority, status, handler_name, detail)
                values(%s,%s,'INC-SAFE-001','Medical Check','Low','Normal','accepted','School Nurse','Seeded low-priority health check.')
                on conflict(incident_code) do update set status=excluded.status, updated_at=now()
            """, (school_id, first_student_id))
            cur.execute("insert into api_test_results(test_name, service_name, status, detail) values(%s,%s,%s,%s)", ("school_dataset_seed", "Supabase DB-1", "passed", "Seeded one school, 42 users, 5 classes, 100 students, permissions, and timetables."))
        conn.commit()

    print("SafeReach school dataset seeded in DB-1")


if __name__ == "__main__":
    main()
