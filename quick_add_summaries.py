#!/usr/bin/env python3
"""
Quick fix: Add manual summaries to existing meetings
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.app.database import SessionLocal
from backend.models.meeting import Meeting

db = SessionLocal()

try:
    # Get all meetings
    meetings = db.query(Meeting).all()
    
    print(f"📊 Found {len(meetings)} meetings total")
    
    # Add summaries to meetings that need them
    updated = 0
    for meeting in meetings:
        if not meeting.summary or meeting.summary == "":
            # Generate a basic summary from transcript if available
            if meeting.transcript:
                # Take first 300 chars of transcript as summary
                summary = meeting.transcript[:300]
                if len(meeting.transcript) > 300:
                    summary += "..."
                meeting.summary = summary
                updated += 1
                print(f"✅ Updated: {meeting.title}")
            else:
                # No transcript, add default
                meeting.summary = f"Meeting: {meeting.title}"
                updated += 1
                print(f"✅ Added placeholder: {meeting.title}")
    
    if updated > 0:
        db.commit()
        print(f"\n✅ Updated {updated} meetings!")
    else:
        print("✅ All meetings already have summaries!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
