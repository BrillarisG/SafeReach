DB1_TABLES = {
    "schools": ["id pk", "name", "code unique", "address", "city", "state", "country", "phone", "email", "status", "created_at", "updated_at"],
    "roles": ["id pk", "role_key unique", "name", "description", "created_at"],
    "permissions": ["id pk", "permission_key unique", "description", "created_at"],
    "role_permissions": ["role_id fk", "permission_id fk", "composite pk"],
    "users": ["id pk", "school_id fk", "role_id fk", "full_name", "email unique", "phone", "password_hash", "status", "terms_accepted_at"],
    "school_registration_requests": ["id pk", "school_name", "requester_name", "requester_email", "requester_phone", "password_hash", "status", "decision fields"],
    "classes": ["id pk", "school_id fk", "name", "sort_order", "unique school/name"],
    "sections": ["id pk", "school_id fk", "class_id fk", "name", "room", "unique class/name"],
    "teachers": ["id pk", "school_id fk", "user_id fk", "employee_code", "subject", "qualification", "status"],
    "teacher_assignments": ["id pk", "school_id fk", "teacher_id fk", "class_id fk", "section_id fk", "assignment_type", "subject", "active"],
    "parents": ["id pk", "school_id fk", "user_id fk", "guardian_name", "phone", "alternate_phone", "sms_enabled"],
    "students": ["id pk", "school_id fk", "class_id fk", "section_id fk", "parent_id fk", "student_code unique", "full_name", "roll_no", "emergency_notes"],
    "attendance_records": ["id pk", "student_id fk", "attendance_date", "session", "status", "reason", "marked_by", "locked", "unique student/date/session"],
    "student_travel_status": ["student_id pk/fk", "school_id fk", "status", "attendance_status", "last_event", "last_event_at", "updated_by"],
    "timetable_breaks": ["id pk", "school_id fk", "class_id fk", "section_id fk", "break_key", "label", "after_period", "tone"],
    "timetable_periods": ["id pk", "school_id fk", "class_id fk", "section_id fk", "day_name", "period_no", "subject"],
    "notifications": ["id pk", "school_id fk", "audience_role", "user_id fk", "title", "body", "event_type", "read_at"],
    "messages": ["id pk", "school_id fk", "conversation_type", "sender_id", "recipient_id", "class_id", "section_id", "body"],
    "sms_delivery_logs": ["id pk", "school_id fk", "student_id fk", "to_phone", "body", "provider", "provider_message_id", "status"],
    "incident_logs": ["id pk", "school_id fk", "student_id fk", "incident_code unique", "incident_type", "level", "priority", "status", "handler_name", "incident_time", "detail"],
    "safety_reports": ["id pk", "school_id fk", "class_id fk", "section_id fk", "report_title", "safety_score", "alert_count", "attendance_percent", "report_text"],
    "result_exams": ["id pk", "school_id fk", "class_id fk", "section_id fk", "name", "active", "created_by", "updated_by", "unique section/name"],
    "result_components": ["id pk", "exam_id fk", "subject", "label", "maximum_marks", "sort_order", "unique exam/subject/label"],
    "student_result_marks": ["id pk", "student_id fk", "result_component_id fk", "marks_obtained", "entered_by", "unique student/component"],
    "api_test_results": ["id pk", "test_name", "service_name", "status", "detail", "created_at"],
}

DB2_TABLES = DB1_TABLES

DB3_TABLES = {
    "student_status": ["student_id", "school_id", "status", "attendance_status", "last_event", "last_event_at", "updated_by"],
    "travel_events": ["event_id", "student_id", "actor_role", "actor_id", "event_type", "status", "created_at"],
    "attendance_events": ["event_id", "student_id", "session", "status", "reason", "marked_by", "created_at"],
    "notification_events": ["event_id", "audience", "user_id", "title", "body", "created_at", "read_at"],
    "sms_events": ["event_id", "student_id", "to_phone", "body", "provider_status", "created_at"],
    "timetable_events": ["event_id", "class_id", "section_id", "break_key", "after_period", "subject_changes", "updated_by", "created_at"],
}
