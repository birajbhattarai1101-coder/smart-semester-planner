import datetime
from flask import Blueprint, request, jsonify

notify_bp = Blueprint("notify", __name__)

def _ok(data, status=200):
    return jsonify({"status": "success", "data": data}), status

def _err(msg, status=400):
    return jsonify({"status": "error", "message": msg}), status

@notify_bp.post("/api/notify/deadline")
def notify_deadline():
    try:
        from email_notifier import send_deadline_alert
        from user_credentials_db import get_user_email
        from user_tasks_db import get_tasks_for_user
        body     = request.get_json(force=True) or {}
        username = body.get("user_id") or body.get("username")
        if not username:
            return _err("user_id is required.")
        email = body.get("email") or get_user_email(username)
        if not email:
            return _err("No email on file. Register with an email first.")
        today  = datetime.date.today()
        tasks  = get_tasks_for_user(username)
        urgent = []
        for t in tasks:
            dl = datetime.date.fromisoformat(t["deadline"])
            days_left = (dl - today).days
            if 0 <= days_left <= 2:
                t["deadline_days_from_today"] = days_left
                urgent.append(t)
        result = send_deadline_alert(email, username, urgent)
        return _ok(result)
    except Exception as e:
        return _err(str(e))

@notify_bp.post("/api/notify/daily")
def notify_daily():
    try:
        from email_notifier import send_daily_reminder
        from user_credentials_db import get_user_email
        from user_availability_db import get_availability_for_user
        from user_coverage_db import get_coverage_for_user
        from user_tasks_db import get_tasks_for_user
        from historic_priority_engine.historic_priority_engine import run_historic_priority_engine
        from task_priority_engine.task_priority_engine import run_task_priority_engine
        from scheduler_engine.scheduler_engine import run_scheduler
        body     = request.get_json(force=True) or {}
        username = body.get("user_id") or body.get("username")
        if not username:
            return _err("user_id is required.")
        email = body.get("email") or get_user_email(username)
        if not email:
            return _err("No email on file.")
        availability = get_availability_for_user(username)
        while len(availability) < 7:
            availability.append({"day_label": f"Day{len(availability)+1}", "available_hours": 0})
        coverage_rows = get_coverage_for_user(username)
        coverage_map  = {r["subject"]: r["coverage_percentage"] for r in coverage_rows}
        if not coverage_map:
            return _err("No coverage data found.")
        subject_priorities = run_historic_priority_engine(coverage_map)
        today    = datetime.date.today()
        db_tasks = []
        for t in get_tasks_for_user(username):
            dl        = datetime.date.fromisoformat(t["deadline"])
            days_left = max(0, (dl - today).days)
            db_tasks.append({**t, "deadline_days": days_left})
        task_priorities = run_task_priority_engine(extra_tasks=db_tasks if db_tasks else None)
        schedule        = run_scheduler(availability=availability, task_priorities=task_priorities, subject_priorities=subject_priorities)
        todays_tasks = [r for r in schedule if r["day"].startswith("Day1")]
        total_hours  = round(sum(r["allocated_hours"] for r in todays_tasks), 2)
        result = send_daily_reminder(email, username, todays_tasks, total_hours)
        return _ok(result)
    except Exception as e:
        import traceback; traceback.print_exc()
        return _err(str(e))

@notify_bp.post("/api/notify/weekly")
def notify_weekly():
    try:
        from email_notifier import send_weekly_summary
        from user_credentials_db import get_user_email
        from user_availability_db import get_availability_for_user
        from user_coverage_db import get_coverage_for_user
        from user_tasks_db import get_tasks_for_user
        from historic_priority_engine.historic_priority_engine import run_historic_priority_engine
        from task_priority_engine.task_priority_engine import run_task_priority_engine
        from scheduler_engine.scheduler_engine import run_scheduler
        body     = request.get_json(force=True) or {}
        username = body.get("user_id") or body.get("username")
        if not username:
            return _err("user_id is required.")
        email = body.get("email") or get_user_email(username)
        if not email:
            return _err("No email on file.")
        availability = get_availability_for_user(username)
        while len(availability) < 7:
            availability.append({"day_label": f"Day{len(availability)+1}", "available_hours": 0})
        coverage_rows = get_coverage_for_user(username)
        coverage_map  = {r["subject"]: r["coverage_percentage"] for r in coverage_rows}
        if not coverage_map:
            return _err("No coverage data found.")
        subject_priorities = run_historic_priority_engine(coverage_map)
        today    = datetime.date.today()
        db_tasks = []
        for t in get_tasks_for_user(username):
            dl        = datetime.date.fromisoformat(t["deadline"])
            days_left = max(0, (dl - today).days)
            db_tasks.append({**t, "deadline_days": days_left})
        task_priorities = run_task_priority_engine(extra_tasks=db_tasks if db_tasks else None)
        schedule        = run_scheduler(availability=availability, task_priorities=task_priorities, subject_priorities=subject_priorities)
        result = send_weekly_summary(email, username, schedule, subject_priorities)
        return _ok(result)
    except Exception as e:
        import traceback; traceback.print_exc()
        return _err(str(e))

@notify_bp.post("/api/user/email")
def update_email():
    try:
        from user_credentials_db import update_user_email
        body     = request.get_json(force=True) or {}
        username = body.get("username") or body.get("user_id")
        email    = body.get("email")
        if not username or not email:
            return _err("username and email are required.")
        result = update_user_email(username, email)
        return _ok(result)
    except Exception as e:
        return _err(str(e))
