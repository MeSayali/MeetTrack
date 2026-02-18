from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.services.transcribe_service import transcribe_audio

import os
import uuid
import shutil

router = APIRouter(prefix="/upload", tags=["Audio Upload"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/audio")
async def upload_audio(file: UploadFile = File(...)):
    # Validate file type
    if not file.filename.lower().endswith((".mp3", ".wav", ".mp4", ".m4a")):
        raise HTTPException(status_code=400, detail="Unsupported audio format")

    # Save file
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Transcribe
    try:
        transcript = transcribe_audio(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "message": "Audio uploaded & transcribed successfully",
        "filename": file.filename,
        "transcript": transcript
    }
