import os
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from backend.services.transcribe_service import transcribe_audio
from backend.services.nlp_service import extract_action_items
from backend.app.database import SessionLocal
from backend.models.meeting import Meeting
from backend.models.action_item import ActionItem
from backend.app.auth import get_current_user

router = APIRouter()


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def process_meeting(
    file_path: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        # 1️⃣ Transcribe Audio
        transcript = transcribe_audio(file_path)

        # 2️⃣ Save Meeting
        new_meeting = Meeting(
            user_id=current_user.id,
            title="Untitled Meeting",
            audio_path=file_path,
            transcript=transcript
        )

        db.add(new_meeting)
        db.commit()
        db.refresh(new_meeting)

        # 3️⃣ Extract Action Items
        action_items = extract_action_items(transcript)

        # 4️⃣ Save Action Items
        for item in action_items:
            action = ActionItem(
                meeting_id=new_meeting.id,
                assigned_to=item.get("assigned_to"),
                deadline=item.get("deadline"),
                status=item.get("status", "Pending")
            )
            db.add(action)

        db.commit()

        return {
            "meeting_id": new_meeting.id,
            "transcript": transcript,
            "action_items": action_items
        }

    except Exception as e:
        print("🔥 ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))