from sqlalchemy import Column, Integer, Text, ForeignKey, String
from backend.app.database import Base


class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"))
    description = Column(Text)
    assigned_to = Column(String, nullable=True)
    deadline = Column(String, nullable=True)
    status = Column(String, default="Pending")
