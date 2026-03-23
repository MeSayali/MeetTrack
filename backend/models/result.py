from sqlalchemy import Boolean, Column, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.app.database import Base

class Result(Base):
    __tablename__ = "results"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"))
    meeting = relationship("Meeting")

    

    transcript = Column(Text)

    # NEW
    summary = Column(Text, nullable=True)
    summary_approved = Column(Boolean, default=False)
    transcript = Column(Text)
summary = Column(Text, nullable=True)
summary_approved = Column(Boolean, default=False)
