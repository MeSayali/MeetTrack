# ✅ MUST BE FIRST LINES (TOP OF FILE)
import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)
  # debug
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from backend.app.database import Base, engine, SessionLocal
from backend.app.settings import CORS_ORIGINS

# Import models (important)
from backend.models import user, meeting, action_item, result

# Routes
from backend.routes.upload_routes import router as upload_router
from backend.routes.process_routes import router as process_router
from backend.routes.result_routes import router as result_router
from backend.routes.action_item_routes import router as action_router
from backend.routes.meeting_routes import router as meeting_router
from backend.routes.task_routes import router as task_router

# Schemas & CRUD
from backend.app import schemas, crud
from backend.app.auth import create_access_token, get_current_user
from dotenv import load_dotenv
from pathlib import Path

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# ✅ CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ✅ DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ✅ Root
@app.get("/")
def root():
    return {"message": "Automated Meeting Outcome Tracker running"}


# ✅ Get all meetings for current user
@app.get("/meetings")
def get_all_meetings(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    from backend.models.meeting import Meeting
    meetings = db.query(Meeting).filter(Meeting.user_id == current_user.id).all()
    return [
        {
            "id": m.id,
            "title": m.title,
            "audio_path": m.audio_path,
            "created_at": m.created_at
        }
        for m in meetings
    ]


# ✅ REGISTER
@app.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.create_user(db, user)

    if not db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    return db_user


# ✅ LOGIN (FIXED 🔥)
@app.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    db_user = crud.login_user(
        db,
        schemas.UserLogin(
            email=form_data.username,   # Swagger sends username
            password=form_data.password
        )
    )

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(data={"user_id": db_user.id})
    
    import json
    skills = json.loads(db_user.skills) if db_user.skills else []

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": db_user.id,
        "email": db_user.email,
        "full_name": db_user.full_name,
        "role": db_user.role,
        # 👤 Personal Information
        "phone_number": db_user.phone_number,
        "profile_image": db_user.profile_image,
        "bio": db_user.bio,
        # 💼 Professional Details
        "job_title": db_user.job_title,
        "department": db_user.department,
        "employee_id": db_user.employee_id,
        "manager_name": db_user.manager_name,
        "skills": skills,
        # 📍 Location & Work Info
        "location": db_user.location,
        "work_mode": db_user.work_mode,
        "timezone": db_user.timezone
    }


# ✅ GET PROFILE (Fetch full user profile)
@app.get("/profile/{user_id}", response_model=schemas.UserResponse)
def get_profile(
    user_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Ensure user can only view their own profile
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Cannot view another user's profile")
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


# ✅ UPDATE PROFILE
@app.put("/profile/{user_id}", response_model=schemas.UserResponse)
def update_profile(
    user_id: int,
    user_data: schemas.UserUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Ensure user can only update their own profile
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Cannot update another user's profile")
    
    updated_user = crud.update_user_profile(db, user_id, user_data)

    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")

    return updated_user


# ✅ UPLOAD PROFILE IMAGE
@app.post("/profile/{user_id}/upload-image")
async def upload_profile_image(
    user_id: int,
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload and save profile image"""
    from fastapi import UploadFile, File
    import shutil
    from pathlib import Path
    import uuid
    
    # Ensure user can only upload for their own profile
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Cannot upload image for another user")
    
    # Create uploads directory if not exists
    upload_dir = Path("uploads/profile_images")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate filename with unique ID and proper extension
    file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    unique_filename = f"user_{user_id}_{uuid.uuid4().hex}.{file_extension}"
    file_path = upload_dir / unique_filename
    
    try:
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Convert to forward slashes for consistency
        relative_path = str(file_path).replace("\\", "/")
        
        # Update user profile_image path in database
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user.profile_image = relative_path
        db.commit()
        db.refresh(user)
        
        print(f"✅ Image uploaded for user {user_id}: {relative_path}")
        
        return {
            "status": "success",
            "message": "Image uploaded successfully",
            "file_path": relative_path
        }
    except Exception as e:
        print(f"❌ Image upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")


# ✅ GET PROFILE IMAGE (for serving images)
@app.get("/profile/{user_id}/image")
def get_profile_image(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get profile image path for a user"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user or not user.profile_image:
        raise HTTPException(status_code=404, detail="No profile image found")
    
    return {"profile_image": user.profile_image}


@app.get("/results/pending/tasks")
def get_pending_tasks():
    return [
        {
            "assignee": "Sayali",
            "task": "Finish backend",
            "deadline": "Tomorrow"
        }
    ]


# ✅ Include routers
app.include_router(upload_router)
app.include_router(process_router)
app.include_router(result_router)
app.include_router(action_router)
app.include_router(meeting_router)
app.include_router(task_router)
print("GEMINI KEY:", os.getenv("sGEMINI_API_KEY"))
