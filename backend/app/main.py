from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from backend.app.database import Base, engine
from backend.routes.upload_routes import router as upload_router
from backend.routes.process_routes import router as process_router
from backend.routes.result_routes import router as result_router
from dotenv import load_dotenv
from backend.models import user, meeting, action_item
from . import models, schemas, crud

load_dotenv()

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "Automated Meeting Outcome Tracker running"}

@app.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db, user)

app.include_router(upload_router)
app.include_router(process_router)
app.include_router(result_router)
