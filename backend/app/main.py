# ✅ MUST BE FIRST LINES (TOP OF FILE)
import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)
  # debug
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from openai import api_key
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from backend.app.database import Base, engine, SessionLocal

# Import models (important)
from backend.models import user, meeting, action_item, result

# Routes
from backend.routes.upload_routes import router as upload_router
from backend.routes.process_routes import router as process_router
from backend.routes.result_routes import router as result_router
from backend.routes.action_item_routes import router as action_router

# Schemas & CRUD
from backend.app import schemas, crud
from backend.app.auth import create_access_token
from dotenv import load_dotenv
from pathlib import Path

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()


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

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# ✅ UPDATE PROFILE
@app.put("/profile/{user_id}", response_model=schemas.UserResponse)
def update_profile(
    user_id: int,
    user_data: schemas.UserUpdate,
    db: Session = Depends(get_db)
):
    updated_user = crud.update_user_profile(db, user_id, user_data)

    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")

    return updated_user


# ✅ Include routers
app.include_router(upload_router)
app.include_router(process_router)
app.include_router(result_router)
app.include_router(action_router)
print("GEMINI KEY:", os.getenv("GEMINI_API_KEY"))
