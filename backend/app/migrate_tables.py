"""
Migration script to drop and recreate tables with new schema
"""
from backend.app.database import Base, engine
from sqlalchemy import text

# IMPORT ALL MODELS HERE (IMPORTANT)
from backend.models.user import User
from backend.models.meeting import Meeting
from backend.models.action_item import ActionItem
from backend.models.result import Result
from backend.models.transcript import Transcript
from backend.models.task import Task

print("🗑️  Dropping existing tables...")
try:
    # Drop tables in reverse order of dependencies
    with engine.connect() as connection:
        connection.execute(text("DROP TABLE IF EXISTS tasks CASCADE"))
        connection.execute(text("DROP TABLE IF EXISTS action_items CASCADE"))
        connection.execute(text("DROP TABLE IF EXISTS results CASCADE"))
        connection.execute(text("DROP TABLE IF EXISTS transcripts CASCADE"))
        connection.execute(text("DROP TABLE IF EXISTS meetings CASCADE"))
        connection.execute(text("DROP TABLE IF EXISTS users CASCADE"))
        connection.commit()
    print("✅ Tables dropped successfully")
except Exception as e:
    print(f"⚠️  Error dropping tables: {e}")

print("📝 Creating new tables with updated schema...")
Base.metadata.create_all(bind=engine)
print("✅ Tables created successfully!")
