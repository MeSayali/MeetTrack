# schemas/meeting_schema.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MeetingCreate(BaseModel):
    title: str
    description: Optional[str] = None

class MeetingResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True