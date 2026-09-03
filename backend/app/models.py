from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False) # 'author' or 'reviewer'

class Tip(Base):
    __tablename__ = "tips"
    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    body = Column(String(280), nullable=False)
    status = Column(String, nullable=False, default="pending") # pending, approved, rejected, unscored
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    score = Column(Integer, nullable=True)
    flags = Column(JSON, nullable=True, default=list)
    review_note = Column(Text, nullable=True)
