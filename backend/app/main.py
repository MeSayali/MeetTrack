from fastapi import FastAPI, Depends, HTTPException
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
load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()


# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


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


# ✅ LOGIN
@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.login_user(db, user)

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(data={"user_id": db_user.id})

    return {
        "access_token": token,
        "token_type": "bearer"
    }



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


# Include routers
app.include_router(upload_router)
app.include_router(process_router)
app.include_router(result_router)
app.include_router(action_router)