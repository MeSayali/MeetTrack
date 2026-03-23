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
    audio_path = Column(Text,nullable=True)
    transcript = Column(Text,nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    
    action_items = relationship("ActionItem", back_populates="meeting")