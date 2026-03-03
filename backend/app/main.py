from fastapi import FastAPI
from backend.app.database import Base, engine
from backend.routes.upload_routes import router as upload_router
from backend.routes.process_routes import router as process_router
from dotenv import load_dotenv
from backend.models import user, meeting, action_item
load_dotenv()


app = FastAPI()
app.include_router(upload_router, prefix="/upload", tags=["Upload"])
app.include_router(process_router, prefix="/process", tags=["Process"])


@app.get("/")
def root():
    return {"message": "Automated Meeting Outcome Tracker running"}

