from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import SessionLocal
from backend.app.auth import get_current_user
from backend.models.meeting import Meeting
from backend.models.result import Result
from backend.schemas.meeting_schema import MeetingResponse

router = APIRouter(prefix="/meeting", tags=["Meetings"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def list_meetings(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all meetings for current user"""
    meetings = db.query(Meeting).filter(Meeting.user_id == current_user.id).all()

    return [
        {
            "id": m.id,
            "title": m.title,
            "audio_path": m.audio_path,
            "created_at": m.created_at,
            "user_id": m.user_id
        }
        for m in meetings
    ]


@router.get("/{meeting_id}")
def get_meeting(
    meeting_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get meeting details"""
    meeting = db.query(Meeting).filter(
        Meeting.id == meeting_id,
        Meeting.user_id == current_user.id
    ).first()

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    return {
        "id": meeting.id,
        "title": meeting.title,
        "transcript": meeting.transcript,
        "audio_path": meeting.audio_path,
        "created_at": meeting.created_at,
        "user_id": meeting.user_id
    }


@router.get("/{meeting_id}/transcript")
def get_transcript(
    meeting_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get meeting transcript"""
    meeting = db.query(Meeting).filter(
        Meeting.id == meeting_id,
        Meeting.user_id == current_user.id
    ).first()

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    return {
        "meeting_id": meeting.id,
        "title": meeting.title,
        "transcript": meeting.transcript
    }


@router.get("/{meeting_id}/summary")
def get_summary(
    meeting_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get meeting summary"""
    result = db.query(Result).filter(Result.meeting_id == meeting_id).first()

    if not result:
        raise HTTPException(status_code=404, detail="Summary not found")

    return {
        "meeting_id": meeting_id,
        "summary": result.summary,
        "key_points": result.key_points,
        "created_at": result.created_at
    }
