import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from sqlalchemy import Column, String, Integer
from Database.db_base import Base, SessionLocal, engine
import datetime

class UserSession(Base):
    __tablename__ = "user_sessions"
    username     = Column(String, primary_key=True)
    week_number  = Column(Integer, nullable=False)
    year         = Column(Integer, nullable=False)

Base.metadata.create_all(bind=engine)

def get_current_week():
    now = datetime.datetime.utcnow()
    return now.isocalendar()[1], now.year

def check_and_update_session(username):
    """
    Returns:
      "new_week"   - first login or new week started
      "returning"  - same week, returning after logout
    """
    current_week, current_year = get_current_week()
    db = SessionLocal()
    try:
        session = db.query(UserSession).filter_by(username=username).first()
        if not session:
            session = UserSession(username=username, week_number=current_week, year=current_year)
            db.add(session)
            db.commit()
            return "new_week"
        if session.week_number != current_week or session.year != current_year:
            session.week_number = current_week
            session.year = current_year
            db.commit()
            return "new_week"
        return "returning"
    finally:
        db.close()
