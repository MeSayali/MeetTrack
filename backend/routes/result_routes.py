from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from backend.app.database import SessionLocal
from backend.models.result import Result
from backend.models.meeting import Meeting
from backend.models.action_item import ActionItem
from backend.app.auth import get_current_user
from backend.schemas.result_schema import ResultCreate, ResultResponse
from backend.services.notification_service import send_email_notification

router = APIRouter(
    prefix="/results",
    tags=["Results"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=ResultResponse)
def create_result(
    result: ResultCreate,
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meeting = db.query(Meeting).filter(Meeting.id == result.meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    existing = db.query(Result).filter(Result.meeting_id == result.meeting_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Result already exists")

    new_result = Result(
        meeting_id=result.meeting_id,
        summary=result.summary,
        key_points=result.key_points
    )

    db.add(new_result)
    db.commit()
    db.refresh(new_result)

    background_tasks.add_task(
        send_email_notification,
        "Meeting Result Generated",
        f"Meeting '{meeting.title}' result has been generated."
    )

    return new_result


@router.get("/{meeting_id}", response_model=ResultResponse)
def get_result(
    meeting_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = db.query(Result).filter(Result.meeting_id == meeting_id).first()

    if not result:
        raise HTTPException(status_code=404, detail="Result not found")

    return result


@router.get("/pending/tasks")
def get_pending_tasks(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all pending action items for current user"""
    items = db.query(ActionItem).filter(
        ActionItem.assigned_to == current_user.email,
        ActionItem.status == "Pending"
    ).all()

    return [
        {
            "id": item.id,
            "title": item.title,
            "description": item.description,
            "assigned_to": item.assigned_to,
            "deadline": item.deadline,
            "status": item.status
        }
        for item in items
    ]


@router.get("/insights")
def get_insights(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard insights"""
    meetings = db.query(Meeting).filter(Meeting.user_id == current_user.id).all()
    results = db.query(Result).all()
    action_items = db.query(ActionItem).all()

    return {
        "total_meetings": len(meetings),
        "total_results": len(results),
        "total_actions": len(action_items),
        "pending_actions": len([a for a in action_items if a.status == "Pending"]),
        "completed_actions": len([a for a in action_items if a.status == "Completed"])
    }


@router.get("/stats")
def get_stats(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get meeting statistics"""
    meetings = db.query(Meeting).filter(Meeting.user_id == current_user.id).all()
    
    return {
        "total_meetings": len(meetings),
        "recent_meetings": [
            {
                "id": m.id,
                "title": m.title,
                "created_at": m.created_at
            }
            for m in sorted(meetings, key=lambda x: x.created_at, reverse=True)[:5]
        ]
    }