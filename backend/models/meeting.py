from sqlalchemy import Column, Integer, String, Text, ForeignKey
from backend.app.database import Base

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(200))
    audio_path = Column(Text)
    transcript = Column(Text)