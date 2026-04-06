from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
import os
import shutil
from datetime import datetime
import traceback
import logging

from backend.app.database import SessionLocal
from backend.app.auth import get_current_user
from backend.models.meeting import Meeting
from backend.services.transcribe_service import transcribe_audio
from backend.services.nlp_service import extract_action_items
from backend.services.summary_service import generate_summary
from backend.models.action_item import ActionItem

logger = logging.getLogger(__name__)

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class ProcessRequest(BaseModel):
    file_path: str
    file_name: str = "Unknown"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/audio")
async def upload_audio(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {
            "message": "Upload successful",
            "file_path": file_path,
            "file_name": file.filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.post("/process")
async def process_meeting(
    request: ProcessRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Process uploaded audio file and extract meeting information"""
    try:
        print(f"📋 Starting processing for user: {current_user.id}")
        file_path = request.file_path
        file_name = request.file_name
        print(f"📂 File path: {file_path}")

        if not file_path or not os.path.exists(file_path):
            raise HTTPException(status_code=400, detail="File not found")

        # Transcribe audio
        print("🎙️  Step 1: Transcribing audio...")
        transcript = transcribe_audio(file_path)
        print(f"✅ Transcript obtained: {len(transcript)} characters")

        # Create meeting record
        print("💾 Step 2: Creating meeting record...")
        new_meeting = Meeting(
            user_id=current_user.id,
            title=file_name.replace(".mp3", "").replace(".wav", ""),
            audio_path=file_path,
            transcript=transcript,
            created_at=datetime.utcnow()
        )

        db.add(new_meeting)
        db.commit()
        db.refresh(new_meeting)
        print(f"✅ Meeting created with ID: {new_meeting.id}")

        # Extract action items
        print("🔍 Step 3: Extracting action items...")
        action_items = extract_action_items(transcript)
        print(f"✅ Found {len(action_items)} action items")

        # Save action items
        print("💾 Step 4: Saving action items to database...")
        for idx, item in enumerate(action_items):
            action = ActionItem(
                meeting_id=new_meeting.id,
                assigned_to=item.get("assigned_to") or "Unassigned",
                title=item.get("description", "")[:100],  # Use first 100 chars as title
                description=item.get("description", ""),
                deadline=item.get("deadline"),
                status=item.get("status", "Pending")
            )
            db.add(action)
            if (idx + 1) % 5 == 0:
                print(f"  - Added {idx + 1} action items...")

        db.commit()
        print(f"✅ All {len(action_items)} action items saved")

        # Generate summary
        print("📝 Step 5: Generating summary...")
        try:
            summary = generate_summary(transcript)
            print(f"✅ Summary generated: {len(summary)} characters")
        except Exception as e:
            print(f"⚠️  Summary generation failed: {e}")
            summary = "Summary generation failed. Please check your API key."

        print("✅ Processing complete!")
        return {
            "status": "success",
            "meeting_id": new_meeting.id,
            "title": new_meeting.title,
            "transcript": transcript,
            "action_items": action_items,
            "summary": summary
        }

    except Exception as e:
        error_msg = f"Processing failed: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        print(f"❌ ERROR in /process: {error_msg}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=error_msg)
