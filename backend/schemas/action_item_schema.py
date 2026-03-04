# schemas/action_item_schema.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ActionItemCreate(BaseModel):
    meeting_id: int
    description: str
    assigned_to: Optional[str] = None

class ActionItemResponse(BaseModel):
    id: int
    meeting_id: int
    description: str
    assigned_to: Optional[str]
    status: str
    created_at: datetime

    class Config:
        orm_mode = True