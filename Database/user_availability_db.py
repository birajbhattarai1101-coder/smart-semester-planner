import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sqlalchemy import Column, Integer, String, Float
from db_base import Base, SessionLocal

class UserAvailability(Base):
    __tablename__  = "user_availability"
    __table_args__ = {"extend_existing": True}
    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(String, index=True, nullable=False)
    day_label       = Column(String, nullable=False)
    available_hours = Column(Float, nullable=False, default=0.0)

def upsert_availability(user_id, day_label, available_hours):
    db = SessionLocal()
    try:
        record = db.query(UserAvailability).filter_by(user_id=user_id, day_label=day_label).first()
        if record:
            record.available_hours = available_hours
        else:
            record = UserAvailability(user_id=user_id, day_label=day_label, available_hours=available_hours)
            db.add(record)
        db.commit(); db.refresh(record)
        return record
    finally:
        db.close()

def get_availability_for_user(user_id):
    db = SessionLocal()
    try:
        rows = db.query(UserAvailability).filter_by(user_id=user_id).order_by(UserAvailability.id).all()
        return [{"day_label": r.day_label, "available_hours": r.available_hours} for r in rows]
    finally:
        db.close()

def clear_availability(user_id):
    db = SessionLocal()
    try:
        db.query(UserAvailability).filter_by(user_id=user_id).delete()
        db.commit()
    finally:
        db.close()
