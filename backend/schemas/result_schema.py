# schemas/result_schema.py
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class ResultCreate(BaseModel):
    meeting_id: int
    summary: str
    key_points: Optional[str] = None

class ResultResponse(BaseModel):
    id: int
    meeting_id: int
    summary: str
    key_points: Optional[str]

    class Config:
        from_attributes = True


class SummaryResponse(BaseModel):
    meeting_id: int
    summary: str

class SummaryApproval(BaseModel):
    meeting_id: int
    approved: bool