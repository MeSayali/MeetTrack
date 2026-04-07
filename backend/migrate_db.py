"""
Database migration script to recreate tables with new schema
Run this to fix the database schema issues
"""
import os
import sys
from pathlib import Path

# Add project to path
sys.path.insert(0, str(Path(__file__).parent))

from backend.app.database import Base, engine
from backend.models import user, meeting, action_item, result, transcript, task, contact_message

def reset_database():
    """Drop all tables and recreate them with new schema"""
    print("🔄 Dropping existing tables...")
    Base.metadata.drop_all(bind=engine)
    print("✅ Tables dropped")
    
    print("🔄 Creating new tables with updated schema...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")
    print("\n✨ Database schema has been updated:")
    print("   - meetings: Added duration, participants, status, summary, updated_at")
    print("   - contact_messages: New table for contact form submissions")

if __name__ == "__main__":
    reset_database()
