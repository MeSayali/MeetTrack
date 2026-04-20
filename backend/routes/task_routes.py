"""
Routes for task extraction and management
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from backend.app.database import SessionLocal
from backend.app.auth import get_current_user
from backend.services.ai_service import extract_tasks as ai_extract_tasks
from backend.services.ai_service import extract_tasks_from_action_items as ai_extract_from_actions
from backend.services.ai_service import extract_tasks_unified
from backend.models.task import Task

logger = logging.getLogger(__name__)
router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class TaskSchema(BaseModel):
    person_name: str
    email: Optional[str] = None
    task_description: str
    deadline: Optional[str] = None
    status: str = "pending"


class ExtractTasksRequest(BaseModel):
    meeting_text: str


class TaskResponse(BaseModel):
    id: int
    person_name: str
    email: Optional[str]
    task_description: str
    deadline: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ✅ N8N Request/Response Models
class ExtractTasksFromActionItemsRequest(BaseModel):
    """Request model for extracting tasks from action items"""
    action_items: List[Dict[str, Any]]


class UnifiedExtractRequest(BaseModel):
    """Request model for unified extraction from any source"""
    source: str  # 'transcript', 'meeting_text', or 'action_items'
    meeting_text: Optional[str] = None
    text: Optional[str] = None
    action_items: Optional[List[Dict[str, Any]]] = None


class ExtractTasksResponse(BaseModel):
    """Response model for task extraction"""
    status: str
    tasks: List[Dict[str, Any]]
    count: int
    extracted_from: Optional[str] = None
    errors: Optional[List[str]] = None


@router.post("/extract-tasks")
async def extract_tasks_webhook(
    request: ExtractTasksRequest,
    db: Session = Depends(get_db)
):
    """
    Webhook endpoint for n8n
    Extracts tasks from meeting text and stores in database
    
    Input:
        meeting_text: str - Transcribed meeting text
    
    Returns:
        List of extracted tasks with IDs
    """
    try:
        print(f"📥 Extract tasks webhook called")
        print(f"Meeting text length: {len(request.meeting_text)}")

        # Extract tasks using AI
        tasks = ai_extract_tasks(request.meeting_text)

        if not tasks:
            print("⚠️  No tasks extracted")
            return {"tasks": [], "count": 0}

        # Filter out error responses
        valid_tasks = [t for t in tasks if "error" not in t]
        error_tasks = [t for t in tasks if "error" in t]

        if error_tasks:
            logger.warning(f"Error tasks: {error_tasks}")
            print(f"⚠️  {len(error_tasks)} tasks had errors")

        print(f"✅ Processing {len(valid_tasks)} valid tasks")

        # Store tasks in database
        stored_tasks = []
        for task_data in valid_tasks:
            try:
                # Validate required fields - use new normalized names
                if not task_data.get("name"):
                    logger.warning(f"Skipping task without name: {task_data}")
                    continue

                task = Task(
                    person_name=task_data.get("name", "Unassigned"),
                    email=task_data.get("email"),
                    task_description=task_data.get("task", ""),
                    deadline=task_data.get("deadline"),
                    status="pending"
                )
                db.add(task)
                db.flush()

                stored_tasks.append({
                    "id": task.id,
                    "person_name": task.person_name,
                    "email": task.email,
                    "task_description": task.task_description,
                    "deadline": task.deadline,
                    "status": task.status,
                    "created_at": task.created_at.isoformat()
                })
                print(f"  ✓ Stored: {task.person_name} - {task.task_description[:50]}")

            except Exception as e:
                logger.error(f"Failed to store task: {e}")
                print(f"  ❌ Failed to store task: {e}")
                continue

        db.commit()
        print(f"✅ Stored {len(stored_tasks)} tasks in database")

        return {
            "status": "success",
            "tasks": stored_tasks,
            "count": len(stored_tasks),
            "meeting_text": request.meeting_text  # ✅ Include for n8n workflow
        }

    except Exception as e:
        logger.error(f"Error in extract-tasks: {str(e)}")
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Task extraction failed: {str(e)}")


@router.get("/tasks", response_model=List[TaskResponse])
async def get_all_tasks(
    status: Optional[str] = None,
    email: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all tasks with optional filtering"""
    try:
        query = db.query(Task)

        if status:
            query = query.filter(Task.status == status)

        if email:
            query = query.filter(Task.email == email)

        tasks = query.order_by(Task.created_at.desc()).all()
        return tasks

    except Exception as e:
        logger.error(f"Error fetching tasks: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch tasks")


@router.get("/tasks/pending/for-email")
async def get_pending_tasks_for_email(
    db: Session = Depends(get_db)
):
    """Get pending tasks with valid emails for email sending"""
    try:
        tasks = db.query(Task).filter(
            Task.status == "pending",
            Task.email.isnot(None)
        ).all()

        # Filter out invalid emails
        valid_tasks = [
            {
                "id": t.id,
                "person_name": t.person_name,
                "email": t.email,
                "task_description": t.task_description,
                "deadline": t.deadline
            }
            for t in tasks
            if t.email and t.email.strip() and "@" in t.email
        ]

        return {"tasks": valid_tasks, "count": len(valid_tasks)}

    except Exception as e:
        logger.error(f"Error fetching pending tasks: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch pending tasks")


@router.put("/tasks/{task_id}/status")
async def update_task_status(
    task_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    """Update task status"""
    try:
        task = db.query(Task).filter(Task.id == task_id).first()

        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        task.status = status
        db.commit()
        db.refresh(task)

        return {"status": "success", "task": task}

    except Exception as e:
        logger.error(f"Error updating task: {e}")
        raise HTTPException(status_code=500, detail="Failed to update task")


# ✅ NEW N8N ENDPOINTS ✅


@router.post("/extract-tasks-from-action-items", response_model=ExtractTasksResponse)
async def extract_tasks_from_actionitems_webhook(
    request: ExtractTasksFromActionItemsRequest,
    db: Session = Depends(get_db)
):
    """
    N8N Webhook endpoint to extract tasks from existing action items
    
    Useful for converting stored action items into task format
    for task tracking and email notifications.
    
    Input:
        action_items: List of action item objects with:
            - assigned_to: Person assigned
            - description/title: Task description
            - deadline: When it's due
            - status: current status
    
    Returns:
        Extracted tasks with IDs stored in database
    """
    try:
        print(f"📥 Extract from action items webhook called")
        print(f"Processing {len(request.action_items)} action items")

        if not request.action_items:
            print("⚠️  No action items provided")
            return {
                "status": "success",
                "tasks": [],
                "count": 0,
                "extracted_from": "action_items"
            }

        # Extract tasks from action items
        tasks = ai_extract_from_actions(request.action_items)

        if not tasks:
            print("⚠️  No tasks extracted from action items")
            return {
                "status": "success",
                "tasks": [],
                "count": 0,
                "extracted_from": "action_items"
            }

        # Filter out error responses
        valid_tasks = [t for t in tasks if "error" not in t]
        error_tasks = [t for t in tasks if "error" in t]

        if error_tasks:
            logger.warning(f"Error tasks: {error_tasks}")
            print(f"⚠️  {len(error_tasks)} tasks had errors")

        print(f"✅ Processing {len(valid_tasks)} valid tasks from action items")

        # Store tasks in database
        stored_tasks = []
        for task_data in valid_tasks:
            try:
                # Validate required fields - use new normalized names
                if not task_data.get("name"):
                    logger.warning(f"Skipping task without name: {task_data}")
                    continue

                task = Task(
                    person_name=task_data.get("name", "Unassigned"),
                    email=task_data.get("email"),
                    task_description=task_data.get("task", ""),
                    deadline=task_data.get("deadline"),
                    status=task_data.get("status", "pending")
                )
                db.add(task)
                db.flush()

                stored_tasks.append({
                    "id": task.id,
                    "person_name": task.person_name,
                    "email": task.email,
                    "task_description": task.task_description,
                    "deadline": task.deadline,
                    "status": task.status,
                    "created_at": task.created_at.isoformat()
                })
                print(f"  ✓ Stored: {task.person_name} - {task.task_description[:50]}")

            except Exception as e:
                logger.error(f"Failed to store task: {e}")
                print(f"  ❌ Failed to store task: {e}")
                continue

        db.commit()
        print(f"✅ Stored {len(stored_tasks)} tasks from action items in database")

        return {
            "status": "success",
            "tasks": stored_tasks,
            "count": len(stored_tasks),
            "extracted_from": "action_items",
            "action_items": request.action_items,  # ✅ Include for n8n workflow
            "errors": [str(e.get("error", "Unknown error")) for e in error_tasks] if error_tasks else None
        }

    except Exception as e:
        logger.error(f"Error in extract-tasks-from-action-items: {str(e)}")
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Task extraction from action items failed: {str(e)}")


@router.post("/extract-tasks-unified", response_model=ExtractTasksResponse)
async def extract_tasks_unified_webhook(
    request: UnifiedExtractRequest,
    db: Session = Depends(get_db)
):
    """
    N8N Unified Webhook endpoint - extract tasks from any source
    
    Supports flexible input from:
    - meeting_text/text: Raw transcript (AI parsed)
    - action_items: Existing action items (converted to tasks)
    
    Input:
        source: 'transcript', 'meeting_text', or 'action_items'
        meeting_text: Raw transcript text (for transcript source)
        action_items: List of action items (for action_items source)
    
    Returns:
        Extracted tasks with IDs stored in database
    """
    try:
        print(f"📥 Unified extract webhook called with source: {request.source}")

        # Prepare content dict for unified function
        content = {
            "meeting_text": request.meeting_text or request.text,
            "action_items": request.action_items or []
        }

        # Extract using unified function
        tasks = extract_tasks_unified(request.source, content)

        if not tasks:
            print("⚠️  No tasks extracted")
            return {
                "status": "success",
                "tasks": [],
                "count": 0,
                "extracted_from": request.source
            }

        # Filter out error responses
        valid_tasks = [t for t in tasks if "error" not in t]
        error_tasks = [t for t in tasks if "error" in t]

        if error_tasks:
            logger.warning(f"Error tasks: {error_tasks}")
            print(f"⚠️  {len(error_tasks)} tasks had errors")

        print(f"✅ Processing {len(valid_tasks)} valid tasks")

        # Store tasks in database
        stored_tasks = []
        for task_data in valid_tasks:
            try:
                # Validate required fields - use new normalized names
                if not task_data.get("name"):
                    logger.warning(f"Skipping task without name: {task_data}")
                    continue

                task = Task(
                    person_name=task_data.get("name", "Unassigned"),
                    email=task_data.get("email"),
                    task_description=task_data.get("task", ""),
                    deadline=task_data.get("deadline"),
                    status=task_data.get("status", "pending")
                )
                db.add(task)
                db.flush()

                stored_tasks.append({
                    "id": task.id,
                    "person_name": task.person_name,
                    "email": task.email,
                    "task_description": task.task_description,
                    "deadline": task.deadline,
                    "status": task.status,
                    "created_at": task.created_at.isoformat()
                })
                print(f"  ✓ Stored: {task.person_name} - {task.task_description[:50]}")

            except Exception as e:
                logger.error(f"Failed to store task: {e}")
                print(f"  ❌ Failed to store task: {e}")
                continue

        db.commit()
        print(f"✅ Stored {len(stored_tasks)} tasks in database from {request.source}")

        return {
            "status": "success",
            "tasks": stored_tasks,
            "count": len(stored_tasks),
            "extracted_from": request.source,
            "source": request.source,  # ✅ Include for n8n workflow
            "meeting_text": request.meeting_text or request.text,  # ✅ Include for n8n workflow
            "action_items": request.action_items,  # ✅ Include for n8n workflow
            "errors": [str(e.get("error", "Unknown error")) for e in error_tasks] if error_tasks else None
        }

    except Exception as e:
        logger.error(f"Error in extract-tasks-unified: {str(e)}")
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unified task extraction failed: {str(e)}")
