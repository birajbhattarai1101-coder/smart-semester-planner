import sys, os, datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
DB_DIR   = os.path.join(ROOT_DIR, "Database")

for p in [ROOT_DIR, BASE_DIR, DB_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

from dotenv import load_dotenv
load_dotenv(os.path.join(BASE_DIR, ".env"))

from flask import Flask, request, jsonify
from utils.csv_generator import generate_all_csvs
generate_all_csvs()
from db_base import init_all_tables
init_all_tables()
from historic_priority_engine.historic_priority_engine import run_historic_priority_engine
from task_priority_engine.task_priority_engine import run_task_priority_engine
from scheduler_engine.scheduler_engine import run_scheduler
from user_credentials_db import register_user, authenticate_user
from user_coverage_db import upsert_coverage, get_coverage_for_user
from user_availability_db import upsert_availability, get_availability_for_user, clear_availability
from user_tasks_db import add_task, get_tasks_for_user, delete_task
from user_session_db import check_and_update_session
from user_schedule_db import save_schedule, get_saved_schedule, get_previous_schedule
from notification_routes import notify_bp

from flask_cors import CORS
app = Flask(__name__)
CORS(app, origins=["https://smart-semester-planner-7dqmheqy0.vercel.app", "http://localhost:3000", "*"])
app.register_blueprint(notify_bp)

def _ok(data, status=200): return jsonify({"status":"success","data":data}), status
def _err(msg, status=400): return jsonify({"status":"error","message":msg}), status
def _require(body, *keys):
    missing = [k for k in keys if k not in body or body[k] is None]
    if missing: raise ValueError(f"Missing: {', '.join(missing)}")

@app.get("/api/health")
def health():
    return _ok({"message":"Smart Semester Planner API running.","timestamp":str(datetime.datetime.utcnow())})

@app.post("/api/login-check")
def login_check():
    try:
        body = request.get_json(force=True) or {}
        username = body.get("user_id", "")
        if not username: return _err("user_id required")
        status = check_and_update_session(username)
        return _ok({"login_status": status})
    except Exception as e: return _err(str(e))

@app.post("/api/register")
def register():
    try:
        body = request.get_json(force=True) or {}
        _require(body, "username", "password")
        user = register_user(body["username"], body["password"], email=body.get("email"))
        return _ok(user, 201)
    except ValueError as e: return _err(str(e), 409)
    except Exception as e: return _err(str(e))

@app.post("/api/login")
def login():
    try:
        body = request.get_json(force=True) or {}
        _require(body, "username", "password")
        ok = authenticate_user(body["username"], body["password"])
        if not ok: return _err("Invalid credentials.", 401)
        return _ok({"authenticated":True,"username":body["username"]})
    except Exception as e: return _err(str(e))

@app.post("/api/coverage")
def save_coverage():
    try:
        body = request.get_json(force=True) or {}
        _require(body, "user_id", "coverage")
        uid = body["user_id"]
        saved = []
        for subject, pct in body["coverage"].items():
            r = upsert_coverage(uid, subject, float(pct))
            saved.append({"subject":r.subject,"coverage_percentage":r.coverage_percentage})
        return _ok({"user_id":uid,"coverage":saved})
    except Exception as e: return _err(str(e))

@app.get("/api/coverage/<user_id>")
def get_coverage(user_id):
    try: return _ok({"user_id":user_id,"coverage":get_coverage_for_user(user_id)})
    except Exception as e: return _err(str(e))

@app.post("/api/availability")
def save_availability():
    try:
        body = request.get_json(force=True) or {}
        _require(body, "user_id", "availability")
        uid = body["user_id"]
        clear_availability(uid)
        saved = []
        for entry in body["availability"]:
            r = upsert_availability(uid, entry["day_label"], float(entry["available_hours"]))
            saved.append({"day_label":r.day_label,"available_hours":r.available_hours})
        return _ok({"user_id":uid,"availability":saved})
    except Exception as e: return _err(str(e))

@app.get("/api/availability/<user_id>")
def get_availability(user_id):
    try: return _ok({"user_id":user_id,"availability":get_availability_for_user(user_id)})
    except Exception as e: return _err(str(e))

@app.post("/api/tasks")
def create_task():
    HOURS_MAP = {("Assignment","Hard"):3.0,("Assignment","Medium"):2.0,("Assignment","Easy"):1.5,("Lab","Hard"):2.0,("Lab","Medium"):1.5,("Lab","Easy"):0.75}
    try:
        body = request.get_json(force=True) or {}
        _require(body, "user_id","task_name","task_type","difficulty","deadline")
        ttype = body["task_type"]; diff = body["difficulty"]
        hrs = HOURS_MAP.get((ttype, diff))
        if hrs is None: return _err(f"Unknown type/difficulty: {ttype}/{diff}")
        deadline = datetime.date.fromisoformat(body["deadline"])
        r = add_task(user_id=body["user_id"],task_name=body["task_name"],task_type=ttype,difficulty=diff,hours_required=hrs,deadline=deadline,subject=body.get("subject","General"))
        return _ok({"id":r.id,"task_name":r.task_name,"task_type":r.task_type,"subject":r.subject,"difficulty":r.difficulty,"hours_required":r.hours_required,"deadline":str(r.deadline)},201)
    except Exception as e: return _err(str(e))

@app.get("/api/tasks/<user_id>")
def list_tasks(user_id):
    try: return _ok({"user_id":user_id,"tasks":get_tasks_for_user(user_id)})
    except Exception as e: return _err(str(e))

@app.delete("/api/tasks/<int:task_id>")
def remove_task(task_id):
    try: delete_task(task_id); return _ok({"deleted":task_id})
    except Exception as e: return _err(str(e))

@app.post("/api/historic-priority")
def historic_priority():
    try:
        body = request.get_json(force=True) or {}
        coverage = body.get("coverage",{})
        if not coverage: return _err("coverage dict is required.")
        return _ok(run_historic_priority_engine(coverage))
    except Exception as e: return _err(str(e))

@app.post("/api/task-priority")
def task_priority():
    try:
        body = request.get_json(force=True) or {}
        extra = body.get("extra_tasks",[])
        return _ok(run_task_priority_engine(extra_tasks=extra if extra else None))
    except Exception as e: return _err(str(e))

@app.post("/api/schedule")
def generate_schedule():
    try:
        body = request.get_json(force=True) or {}
        uid  = body.get("user_id","")
        availability = body.get("availability") or []
        if not availability and uid: availability = get_availability_for_user(uid)
        while len(availability) < 7: availability.append({"day_label":f"Day{len(availability)+1}","available_hours":0})
        coverage_raw = body.get("coverage") or {}
        if not coverage_raw and uid:
            rows = get_coverage_for_user(uid)
            coverage_raw = {r["subject"]:r["coverage_percentage"] for r in rows}
        if not coverage_raw: return _err("coverage is required.")
        selected_subjects = body.get("selected_subjects") or None
        if selected_subjects:
            coverage_raw = {k: v for k, v in coverage_raw.items() if k in selected_subjects}
        subject_priorities = run_historic_priority_engine(coverage_raw)
        today = datetime.date.today()
        db_tasks = []
        if uid:
            for t in get_tasks_for_user(uid):
                dl = datetime.date.fromisoformat(t["deadline"])
                days_left = max(0,(dl-today).days)
                db_tasks.append({"task_name":t["task_name"],"task_type":t["task_type"],"difficulty":t["difficulty"],"hours_required":t["hours_required"],"deadline_days":days_left})
        combined = db_tasks + (body.get("extra_tasks") or [])
        task_priorities = run_task_priority_engine(extra_tasks=combined if combined else [])
        schedule = run_scheduler(availability=availability,task_priorities=task_priorities,subject_priorities=subject_priorities,start_offset_days=int(body.get("start_offset_days",0)))
        try:
            from user_credentials_db import get_user_email
            from email_notifier import send_deadline_alert
            user_email = get_user_email(uid) if uid else None
            if user_email:
                urgent = [t for t in db_tasks if t.get("deadline_days") == 1]
                if urgent:
                    send_deadline_alert(user_email, uid, urgent)
        except: pass
        return _ok({"schedule":schedule,"subject_priorities":subject_priorities,"task_priorities":task_priorities[:20]})
    except Exception as e:
        import traceback; traceback.print_exc()
        return _err(str(e))


@app.post("/api/schedule/save")
def save_user_schedule():
    try:
        body = request.get_json(force=True) or {}
        uid = body.get("user_id", "")
        schedule_data = body.get("schedule_data")
        if not uid or not schedule_data: return _err("user_id and schedule_data required")
        save_schedule(uid, schedule_data)
        return _ok({"saved": True})
    except Exception as e: return _err(str(e))

@app.get("/api/schedule/previous/<user_id>")
def get_previous_schedule_route(user_id):
    try:
        data = get_previous_schedule(user_id)
        if not data: return _ok({"schedule": None})
        return _ok({"schedule": data})
    except Exception as e: return _err(str(e))
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)














