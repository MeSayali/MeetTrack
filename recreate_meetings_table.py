#!/usr/bin/env python3
"""
Migration script to recreate the meetings table.
Run this if the meetings table was accidentally dropped.
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.app.database import Base, engine
from backend.models.user import User
from backend.models.meeting import Meeting
from backend.models.action_item import ActionItem
from backend.models.contact_message import ContactMessage

print("🔄 Recreating database tables...")

try:
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")
    print("   - users table")
    print("   - meetings table")
    print("   - action_items table")
    print("   - contact_messages table")
except Exception as e:
    print(f"❌ Error creating tables: {e}")
    sys.exit(1)

print("\n✨ Database is ready!")
