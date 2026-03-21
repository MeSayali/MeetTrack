from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from backend.app.database import SessionLocal
from backend.models.result import Result
from backend.models.meeting import Meeting
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
def get_result(meeting_id: int, db: Session = Depends(get_db)):
    result = db.query(Result).filter(Result.meeting_id == meeting_id).first()

    if not result:
        raise HTTPException(status_code=404, detail="Result not found")

    return result