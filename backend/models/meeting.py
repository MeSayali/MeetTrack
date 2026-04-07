from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func, true
from backend.app.database import Base
from sqlalchemy.orm import relationship

class Meeting(Base):
    __tablename__ = "meetings"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(255), nullable=True)
    audio_path = Column(Text, nullable=True)
    transcript = Column(Text, nullable=True)
    duration = Column(Integer, nullable=True)  # Duration in minutes
    participants = Column(Integer, nullable=True)  # Number of participants
    status = Column(String(50), default="Pending Review")  # Pending Review, Analyzed, etc.
    summary = Column(Text, nullable=True)  # Meeting summary
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    action_items = relationship("ActionItem", back_populates="meeting")