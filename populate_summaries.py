#!/usr/bin/env python3
"""
Utility script to populate summaries for existing meetings that don't have them.
Run this once to generate summaries for all meetings.
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.app.database import SessionLocal
from backend.models.meeting import Meeting
from backend.services.summary_service import generate_summary

db = SessionLocal()

try:
    # Find meetings without summaries
    meetings_without_summary = db.query(Meeting).filter(
        (Meeting.summary == None) | (Meeting.summary == "")
    ).all()
    
    print(f"📊 Found {len(meetings_without_summary)} meetings without summaries")
    
    if len(meetings_without_summary) == 0:
        print("✅ All meetings have summaries!")
        sys.exit(0)
    
    # Generate summaries for each meeting
    for idx, meeting in enumerate(meetings_without_summary):
        try:
            print(f"\n📝 [{idx + 1}/{len(meetings_without_summary)}] Processing: {meeting.title}")
            
            if not meeting.transcript:
                print(f"  ⚠️  No transcript found, skipping...")
                continue
            
            # Generate summary
            summary = generate_summary(meeting.transcript)
            meeting.summary = summary
            db.commit()
            print(f"  ✅ Summary generated ({len(summary)} chars)")
            
        except Exception as e:
            print(f"  ❌ Error: {e}")
            continue
    
    print(f"\n✅ Done! All {len(meetings_without_summary)} meetings now have summaries!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
finally:
    db.close()
