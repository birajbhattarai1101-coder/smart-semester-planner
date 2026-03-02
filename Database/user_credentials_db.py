import sys, os, hashlib, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sqlalchemy import Column, Integer, String, DateTime
from db_base import Base, SessionLocal

class UserCredential(Base):
    __tablename__  = "user_credentials"
    __table_args__ = {"extend_existing": True}
    id             = Column(Integer, primary_key=True, index=True)
    username       = Column(String, unique=True, index=True, nullable=False)
    password_hash  = Column(String, nullable=False)
    email          = Column(String, nullable=True)
    created_at     = Column(DateTime, default=datetime.datetime.utcnow)

def _hash_password(password, salt=""):
    return hashlib.sha256((salt + password).encode()).hexdigest()

def _make_salt():
    return os.urandom(16).hex()

def register_user(username, password, email=None):
    db = SessionLocal()
    try:
        if db.query(UserCredential).filter_by(username=username).first():
            raise ValueError(f"Username already exists.")
        salt   = _make_salt()
        record = UserCredential(username=username, password_hash=f"{salt}${_hash_password(password,salt)}", email=email)
        db.add(record); db.commit(); db.refresh(record)
        return {"id": record.id, "username": record.username, "email": record.email}
    finally:
        db.close()

def authenticate_user(username, password):
    db = SessionLocal()
    try:
        record = db.query(UserCredential).filter_by(username=username).first()
        if not record: return False
        salt, stored_hash = record.password_hash.split("$", 1)
        return _hash_password(password, salt) == stored_hash
    finally:
        db.close()

def get_user_email(username):
    db = SessionLocal()
    try:
        record = db.query(UserCredential).filter_by(username=username).first()
        return record.email if record else None
    finally:
        db.close()

def update_user_email(username, email):
    db = SessionLocal()
    try:
        record = db.query(UserCredential).filter_by(username=username).first()
        if not record: raise ValueError("User not found.")
        record.email = email; db.commit()
        return {"username": username, "email": email}
    finally:
        db.close()

def user_exists(username):
    db = SessionLocal()
    try:
        return db.query(UserCredential).filter_by(username=username).first() is not None
    finally:
        db.close()
