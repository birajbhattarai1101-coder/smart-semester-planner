import sys, os, datetime, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sqlalchemy import Column, String, Text, Date, inspect as sa_inspect
from sqlalchemy import text
from db_base import Base, SessionLocal, engine
class UserSchedule(Base):
    __tablename__  = "user_schedules"
    __table_args__ = {"extend_existing": True}
    username               = Column(String, primary_key=True)
    schedule_json          = Column(Text, nullable=False)
    previous_schedule_json = Column(Text, nullable=True)
    saved_on               = Column(Date, nullable=False)

def _ensure_previous_column():
    try:
        with engine.connect() as conn:
            inspector = sa_inspect(engine)
            cols = [c["name"] for c in inspector.get_columns("user_schedules")]
            if "previous_schedule_json" not in cols:
                conn.execute(text("ALTER TABLE user_schedules ADD COLUMN previous_schedule_json TEXT"))
                conn.commit()
    except Exception as e:
        print("Migration warning:", e)

_ensure_previous_column()

def save_schedule(username, schedule_data):
    db = SessionLocal()
    try:
        record = db.query(UserSchedule).filter_by(username=username).first()
        if not record:
            record = UserSchedule(
                username=username,
                schedule_json=json.dumps(schedule_data),
                previous_schedule_json=None,
                saved_on=datetime.date.today()
            )
            db.add(record)
        else:
            record.previous_schedule_json = record.schedule_json
            record.schedule_json          = json.dumps(schedule_data)
            record.saved_on               = datetime.date.today()
        db.commit()
    finally:
        db.close()

def get_saved_schedule(username):
    db = SessionLocal()
    try:
        record = db.query(UserSchedule).filter_by(username=username).first()
        return json.loads(record.schedule_json) if record else None
    finally:
        db.close()

def get_previous_schedule(username):
    db = SessionLocal()
    try:
        record = db.query(UserSchedule).filter_by(username=username).first()
        if record and record.previous_schedule_json:
            return json.loads(record.previous_schedule_json)
        return None
    finally:
        db.close()
