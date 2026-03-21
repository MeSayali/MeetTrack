from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import SessionLocal
from backend.app import crud

router = APIRouter(prefix="/action-items", tags=["Action Items"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.put("/{action_id}/status")
def update_status(action_id: int, status: str, db: Session = Depends(get_db)):
    updated = crud.update_action_status(db, action_id, status)

    if not updated:
        raise HTTPException(status_code=404, detail="Action item not found")

    return {
        "message": "Status updated",
        "action_id": updated.id,
        "new_status": updated.status
    }