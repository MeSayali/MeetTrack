from sqlalchemy import Column, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.app.database import Base

class Result(Base):
    __tablename__ = "results"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"))
    summary = Column(Text, nullable=False)
    key_points = Column(Text, nullable=True)

    meeting = relationship("Meeting")

    