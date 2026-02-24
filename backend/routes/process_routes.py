from fastapi import APIRouter, HTTPException
from backend.services.transcribe_service import transcribe_audio

router = APIRouter()

@router.post("/")
def process_meeting(file_path: str):
    try:
        transcript = transcribe_audio(file_path)
        return {"transcript": transcript}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))