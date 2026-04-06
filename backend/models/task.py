from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.app.database import Base


class Task(Base):
    __tablename__ = "tasks"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    person_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    task_description = Column(Text, nullable=False)
    deadline = Column(String(50), nullable=True)  # YYYY-MM-DD format
    status = Column(String(50), default="pending")  # pending, completed, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
