from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import SessionLocal
from backend.app import crud
from backend.app.auth import get_current_user
from backend.models.action_item import ActionItem

router = APIRouter(prefix="/action-items", tags=["Action Items"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def get_action_items(
    meeting_id: int = None,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all action items, optionally filtered by meeting"""
    query = db.query(ActionItem)

    if meeting_id:
        query = query.filter(ActionItem.meeting_id == meeting_id)

    items = query.all()

    return [
        {
            "id": item.id,
            "meeting_id": item.meeting_id,
            "title": item.title,
            "description": item.description,
            "assigned_to": item.assigned_to,
            "deadline": item.deadline,
            "status": item.status
        }
        for item in items
    ]


@router.get("/me")
def get_user_action_items(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all action items assigned to current user"""
    items = db.query(ActionItem).filter(
        ActionItem.assigned_to == current_user.email
    ).all()

    return [
        {
            "id": item.id,
            "meeting_id": item.meeting_id,
            "title": item.title,
            "description": item.description,
            "assigned_to": item.assigned_to,
            "deadline": item.deadline,
            "status": item.status
        }
        for item in items
    ]


@router.get("/{action_id}")
def get_action_item(
    action_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific action item"""
    item = db.query(ActionItem).filter(ActionItem.id == action_id).first()

    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")

    return {
        "id": item.id,
        "meeting_id": item.meeting_id,
        "title": item.title,
        "description": item.description,
        "assigned_to": item.assigned_to,
        "deadline": item.deadline,
        "status": item.status
    }


@router.post("/")
def create_action_item(
    data: dict,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new action item"""
    try:
        item = ActionItem(
            meeting_id=data.get("meeting_id"),
            title=data.get("title"),
            description=data.get("description", ""),
            assigned_to=data.get("assigned_to"),
            deadline=data.get("deadline"),
            status="Pending"
        )

        db.add(item)
        db.commit()
        db.refresh(item)

        return {
            "id": item.id,
            "meeting_id": item.meeting_id,
            "title": item.title,
            "description": item.description,
            "assigned_to": item.assigned_to,
            "deadline": item.deadline,
            "status": item.status
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create action item: {str(e)}")


@router.put("/{action_id}")
def update_action_item(
    action_id: int,
    data: dict,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update action item"""
    item = db.query(ActionItem).filter(ActionItem.id == action_id).first()

    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")

    # Update fields if provided
    if "title" in data:
        item.title = data["title"]
    if "description" in data:
        item.description = data["description"]
    if "assigned_to" in data:
        item.assigned_to = data["assigned_to"]
    if "deadline" in data:
        item.deadline = data["deadline"]
    if "status" in data:
        item.status = data["status"]

    db.commit()
    db.refresh(item)

    return {
        "id": item.id,
        "meeting_id": item.meeting_id,
        "title": item.title,
        "description": item.description,
        "assigned_to": item.assigned_to,
        "deadline": item.deadline,
        "status": item.status
    }


@router.put("/{action_id}/status")
def update_status(
    action_id: int,
    status: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update action item status"""
    updated = crud.update_action_status(db, action_id, status)

    if not updated:
        raise HTTPException(status_code=404, detail="Action item not found")

    return {
        "message": "Status updated",
        "action_id": updated.id,
        "new_status": updated.status
    }


@router.delete("/{action_id}")
def delete_action_item(
    action_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete action item"""
    item = db.query(ActionItem).filter(ActionItem.id == action_id).first()

    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")

    db.delete(item)
    db.commit()

    return {"message": "Action item deleted successfully"}