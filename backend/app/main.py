from fastapi import FastAPI
from database import Base, engine
from backend.routes.upload_routes import router as upload_router
from backend.routes.process_routes import router as process_router
from dotenv import load_dotenv
load_dotenv()


app = FastAPI()
app.include_router(upload_router)
app.include_router(process_router)

@app.get("/")
def root():
    return {"message": "Automated Meeting Outcome Tracker running"}
