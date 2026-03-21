# schemas/transcript_schema.py

from pydantic import BaseModel
from datetime import datetime

class TranscriptCreate(BaseModel):
    meeting_id: int
    transcript_text: str

class TranscriptResponse(BaseModel):
    id: int
    meeting_id: int
    transcript_text: str
    created_at: datetime

    class Config:
        from_attributes = True