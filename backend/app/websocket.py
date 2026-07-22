from __future__ import annotations

from flask import request
from flask_socketio import emit, join_room

from .security import decode_token
from .services import academic_result_service, industry_menu_service, message_service, safereach_service


def register_socket_handlers(socketio):
    @socketio.on("connect")
    def on_connect(auth=None):
        user = None
        token = (auth or {}).get("token") if isinstance(auth, dict) else None
        if token:
            try:
                user = decode_token(token)
                join_room(f"user:{user['sub']}")
                if user.get("school_id"):
                    join_room(f"school:{user['school_id']}")
                join_room(f"role:{user['role']}")
            except Exception:
                user = None
        emit("safe.connected", {"sid": request.sid, "authenticated": bool(user), "user": user})

    @socketio.on("auth.login")
    def on_login(payload):
        try:
            result = safereach_service.login(payload.get("email", ""), payload.get("password", ""))
            emit("auth.login.success", result)
        except Exception as exc:
            emit("auth.login.error", {"message": str(exc)})

    @socketio.on("data.bootstrap")
    def on_bootstrap(payload=None):
        try:
            result, _ = safereach_service.bootstrap_cached()
            emit("data.bootstrap.success", result)
        except Exception as exc:
            emit("data.bootstrap.error", {"message": str(exc)})

    @socketio.on("student.ready_to_school")
    def on_ready(payload):
        return _handle_student_event("student.status.changed", lambda: safereach_service.mark_ready_to_school(payload["studentId"], payload.get("actorUserId")))

    @socketio.on("attendance.submit")
    def on_attendance(payload):
        return _handle_student_event("attendance.marked", lambda: safereach_service.submit_attendance(payload["studentId"], payload["status"], payload.get("actorUserId")))

    @socketio.on("student.sms.set")
    def on_student_sms_set(payload):
        return _handle_student_event(
            "student.sms.updated",
            lambda: safereach_service.set_student_sms_enabled(payload["studentId"], bool(payload["enabled"]), payload.get("actorUserId")),
        )

    @socketio.on("travel.go_out")
    def on_go_out(payload):
        student_ids = payload.get("studentIds")
        if isinstance(student_ids, list):
            return _handle_student_event(
                "student.status.changed",
                lambda: {"ok": True, "records": [safereach_service.submit_go_out(student_id, payload.get("actorUserId")) for student_id in student_ids]},
            )
        return _handle_student_event("student.status.changed", lambda: safereach_service.submit_go_out(payload["studentId"], payload.get("actorUserId")))

    @socketio.on("parent.reached_home")
    def on_reached(payload):
        return _handle_student_event("student.status.changed", lambda: safereach_service.mark_reached_home(payload["studentId"], payload.get("actorUserId")))

    @socketio.on("message.send")
    def on_message_send(payload):
        return _handle_student_event("message.created", lambda: message_service.send_parent_message(payload["studentId"], payload.get("body", ""), payload.get("actorUserId")))

    @socketio.on("absence.reason.submit")
    def on_absence_reason(payload):
        return _handle_student_event("absence.reason.submitted", lambda: message_service.submit_absence_reason(payload["studentId"], payload.get("reason", ""), payload.get("actorUserId")))

    @socketio.on("attendance.absence.notify")
    def on_absence_notify(payload):
        return _handle_student_event(
            "attendance.absence.notified",
            lambda: {"ok": True, "notifications": message_service.notify_absent_parents(payload.get("studentIds") or [], payload.get("actorUserId"))},
        )

    @socketio.on("timetable.break.move")
    def on_timetable_break_move(payload):
        try:
            result = safereach_service.move_timetable_break(payload["sectionId"], payload["breakKey"], int(payload["afterPeriod"]), payload.get("actorUserId"))
            emit("timetable.updated", result, broadcast=True)
        except Exception as exc:
            emit("timetable.error", {"message": str(exc)})

    @socketio.on("academic-results.exam.save")
    def on_result_exam_save(payload):
        payload = payload or {}
        return _handle_student_event("results.updated", lambda: academic_result_service.save_exam(payload, payload.get("actorUserId")))

    @socketio.on("academic-results.marks.save")
    def on_result_marks_save(payload):
        payload = payload or {}
        return _handle_student_event("results.updated", lambda: academic_result_service.submit_marks(payload, payload.get("actorUserId")))

    @socketio.on("industry.menu.set")
    def on_industry_menu_set(payload):
        try:
            result = industry_menu_service.set_access(
                school_id=payload["schoolId"],
                menu_key=payload["menuKey"],
                enabled=bool(payload["enabled"]),
                actor_user_id=payload.get("actorUserId"),
                school_name=payload.get("schoolName"),
            )
            emit("industry.menu.updated", result, broadcast=True)
        except Exception as exc:
            emit("industry.menu.error", {"message": str(exc)})

    def _handle_student_event(event_name, action):
        try:
            result = action()
            emit(event_name, result, broadcast=True)
            return {"ok": True, "data": result}
        except Exception as exc:
            emit("safe.error", {"message": str(exc)})
            return {"ok": False, "message": str(exc)}
