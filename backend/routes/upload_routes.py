from fastapi import APIRouter, UploadFile, File
import os
import shutil

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/audio")
async def upload_audio(file: UploadFile = File(...)):
    if not file.filename:
        return {"error": "No file uploaded"}

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # ✅ THIS IS CRITICAL
    return {
        "message": "Upload successful",
        "file_path": file_path
    }
