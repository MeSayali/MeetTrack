import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from .env file (2 levels up)
env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)

# Database Settings
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:pass@localhost:5432/automated_meeting_db")

# AWS Settings
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
TRANSCRIBE_BUCKET = os.getenv("TRANSCRIBE_BUCKET")
TRANSCRIBE_ROLE_ARN = os.getenv("TRANSCRIBE_ROLE_ARN")

# API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Authentication
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey123")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# CORS Settings
CORS_ORIGINS = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
]

# Upload settings
UPLOAD_DIR = "uploads"
MAX_UPLOAD_SIZE = 100 * 1024 * 1024  # 100MB
