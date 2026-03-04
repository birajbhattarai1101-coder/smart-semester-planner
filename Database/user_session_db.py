import sys, os, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sqlalchemy import Column, String, Integer, Date
from db_base import Base, SessionLocal

class UserSession(Base):
    __tablename__  = "user_sessions"
    __table_args__ = {"extend_existing": True}
    username        = Column(String, primary_key=True)
    session_start   = Column(Date, nullable=False)
    session_end     = Column(Date, nullable=False)

def get_current_session_window():
    today = datetime.date.today()
    days_since_wednesday = (today.weekday() - 2) % 7
    session_start = today - datetime.timedelta(days=days_since_wednesday)
    session_end   = session_start + datetime.timedelta(days=6)
    return session_start, session_end

def check_and_update_session(username):
    session_start, session_end = get_current_session_window()
    db = SessionLocal()
    try:
        record = db.query(UserSession).filter_by(username=username).first()
        if not record:
            record = UserSession(username=username, session_start=session_start, session_end=session_end)
            db.add(record)
            db.commit()
            return "new_week"
        if record.session_start != session_start:
            record.session_start = session_start
            record.session_end   = session_end
            db.commit()
            return "new_week"
        return "returning"
    finally:
        db.close()
