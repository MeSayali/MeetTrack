from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.services.nlp_service import extract_action_items

router = APIRouter(prefix="/process", tags=["NLP Processing"])


class TranscriptRequest(BaseModel):
    transcript: str


@router.post("/action-items")
def process_transcript(data: TranscriptRequest):
    if not data.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript is empty")

    action_items = extract_action_items(data.transcript)

    return {
        "total_action_items": len(action_items),
        "action_items": action_items
    }
