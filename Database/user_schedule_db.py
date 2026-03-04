import sys, os, datetime, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sqlalchemy import Column, String, Text, Date
from db_base import Base, SessionLocal

class UserSchedule(Base):
    __tablename__  = "user_schedules"
    __table_args__ = {"extend_existing": True}
    username       = Column(String, primary_key=True)
    schedule_json  = Column(Text, nullable=False)
    saved_on       = Column(Date, nullable=False)

def save_schedule(username, schedule_data):
    db = SessionLocal()
    try:
        record = db.query(UserSchedule).filter_by(username=username).first()
        if not record:
            record = UserSchedule(username=username, schedule_json=json.dumps(schedule_data), saved_on=datetime.date.today())
            db.add(record)
        else:
            record.schedule_json = json.dumps(schedule_data)
            record.saved_on      = datetime.date.today()
        db.commit()
    finally:
        db.close()

def get_saved_schedule(username):
    db = SessionLocal()
    try:
        record = db.query(UserSchedule).filter_by(username=username).first()
        if record:
            return json.loads(record.schedule_json)
        return None
    finally:
        db.close()
