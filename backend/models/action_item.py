from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.app.database import Base

class ActionItem(Base):
    __tablename__ = "action_items"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"))
    
    title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    assigned_to = Column(String(255))
    deadline = Column(String, nullable=True)
    status = Column(String(50), default="Pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    meeting = relationship("Meeting", back_populates="action_items")




