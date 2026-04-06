import os
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from backend.models.result import Result
from backend.models.meeting import Meeting
from backend.models.action_item import ActionItem
from backend.schemas.result_schema import SummaryApproval
from backend.services.transcribe_service import transcribe_audio
from backend.services.nlp_service import extract_action_items
from backend.services.summary_service import generate_summary
from backend.app.database import SessionLocal
from backend.app.auth import get_current_user

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------------
# Process Meeting Endpoint
# -------------------------------
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
            "status": "success",
            "meeting_id": new_meeting.id,
            "transcript": transcript,
            "action_items": action_items
        }

    except Exception as e:
        print("🔥 ERROR:", e)
        return {
            "status": "error",
            "message": str(e)
        }

# -------------------------------
# Generate Summary Endpoint
# -------------------------------
@router.post("/generate-summary/{meeting_id}")
def generate_summary_api(meeting_id: int, db: Session = Depends(get_db)):
    result = db.query(Result).filter(Result.meeting_id == meeting_id).first()
    
    # ✅ create if not exists
    if not result:
        meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
        if not meeting:
            raise HTTPException(status_code=404, detail="Meeting not found")
        
        result = Result(
            meeting_id=meeting_id,
            transcript=meeting.transcript
        )
        db.add(result)
        db.commit()
        db.refresh(result)

    if not result.transcript:
        raise HTTPException(status_code=400, detail="Transcript missing")

    summary = generate_summary(result.transcript)
    result.summary = summary
    db.commit()

    return {
        "meeting_id": meeting_id,
        "summary": summary
    }

# -------------------------------
# Approve Summary Endpoint
# -------------------------------
@router.post("/approve-summary")
def approve_summary(data: SummaryApproval, db: Session = Depends(get_db)):
    result = db.query(Result).filter(Result.meeting_id == data.meeting_id).first()

    if not result:
        raise HTTPException(status_code=404, detail="Meeting not found")

    result.summary_approved = data.approved

    if not data.approved:
        result.summary = None

    db.commit()

    return {"message": "Summary updated"}