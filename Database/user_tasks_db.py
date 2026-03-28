import sys, os, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sqlalchemy import Column, Integer, String, Float, Date
from db_base import Base, SessionLocal

class UserTask(Base):
    __tablename__  = "user_tasks"
    __table_args__ = {"extend_existing": True}
    id                       = Column(Integer, primary_key=True, index=True)
    user_id                  = Column(String, index=True, nullable=False)
    task_name                = Column(String, nullable=False)
    task_type                = Column(String, nullable=False)
    subject                  = Column(String, nullable=True, default="General")
    difficulty               = Column(String, nullable=False)
    hours_required           = Column(Float, nullable=False)
    deadline                 = Column(Date, nullable=False)
    deadline_days_from_today = Column(Integer, nullable=True)

def add_task(user_id, task_name, task_type, difficulty, hours_required, deadline, subject="General"):
    db = SessionLocal()
    try:
        today  = datetime.date.today()
        record = UserTask(user_id=user_id, task_name=task_name, task_type=task_type,
                          subject=subject, difficulty=difficulty, hours_required=hours_required,
                          deadline=deadline, deadline_days_from_today=(deadline - today).days)
        db.add(record); db.commit(); db.refresh(record)
        return record
    finally:
        db.close()

def get_tasks_for_user(user_id):
    db = SessionLocal()
    try:
        rows = db.query(UserTask).filter_by(user_id=user_id).order_by(UserTask.deadline).all()
        return [{"id": r.id, "task_name": r.task_name, "task_type": r.task_type,
                 "subject": r.subject, "difficulty": r.difficulty,
                 "hours_required": r.hours_required, "deadline": str(r.deadline),
                 "deadline_days_from_today": r.deadline_days_from_today} for r in rows]
    finally:
        db.close()

def delete_task(task_id):
    db = SessionLocal()
    try:
        db.query(UserTask).filter_by(id=task_id).delete()
        db.commit()
    finally:
        db.close()

def clear_tasks(user_id):
    db = SessionLocal()
    try:
        db.query(UserTask).filter_by(user_id=user_id).delete()
        db.commit()
    finally:
        db.close()

def update_task(task_id, task_name=None, difficulty=None, hours_required=None, deadline=None):
    db = SessionLocal()
    try:
        record = db.query(UserTask).filter_by(id=task_id).first()
        if not record:
            raise ValueError(f"Task {task_id} not found")
        today = datetime.date.today()
        if task_name is not None:
            record.task_name = task_name
        if difficulty is not None:
            record.difficulty = difficulty
        if hours_required is not None:
            record.hours_required = hours_required
        if deadline is not None:
            record.deadline = deadline
            record.deadline_days_from_today = (deadline - today).days
        db.commit()
        db.refresh(record)
        return record
    finally:
        db.close()
