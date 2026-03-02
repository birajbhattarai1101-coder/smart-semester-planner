import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sqlalchemy import Column, Integer, String, Float
from db_base import Base, SessionLocal

class UserCoverage(Base):
    __tablename__  = "user_coverage"
    __table_args__ = {"extend_existing": True}
    id                  = Column(Integer, primary_key=True, index=True)
    user_id             = Column(String, index=True, nullable=False)
    subject             = Column(String, nullable=False)
    coverage_percentage = Column(Float, nullable=False, default=0.0)

def upsert_coverage(user_id, subject, coverage_percentage):
    db = SessionLocal()
    try:
        record = db.query(UserCoverage).filter_by(user_id=user_id, subject=subject).first()
        if record:
            record.coverage_percentage = coverage_percentage
        else:
            record = UserCoverage(user_id=user_id, subject=subject, coverage_percentage=coverage_percentage)
            db.add(record)
        db.commit(); db.refresh(record)
        return record
    finally:
        db.close()

def get_coverage_for_user(user_id):
    db = SessionLocal()
    try:
        rows = db.query(UserCoverage).filter_by(user_id=user_id).all()
        return [{"subject": r.subject, "coverage_percentage": r.coverage_percentage} for r in rows]
    finally:
        db.close()

def delete_coverage(user_id, subject):
    db = SessionLocal()
    try:
        db.query(UserCoverage).filter_by(user_id=user_id, subject=subject).delete()
        db.commit()
    finally:
        db.close()
