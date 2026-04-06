"""
Quick test script for AI task extraction
Run this to verify the AI extraction is working
"""
import os
import sys
from dotenv import load_dotenv

# Add project to path
sys.path.insert(0, os.path.dirname(__file__))

load_dotenv()

from backend.services.ai_service import extract_tasks

# Test meeting transcripts
TEST_CASES = [
    {
        "name": "Simple task with email",
        "text": "Riya will submit the report by April 7. Rahul (rahul@gmail.com) will review it by tomorrow."
    },
    {
        "name": "Multiple people and tasks",
        "text": "In our meeting, John (john@company.com) will fix the bug by Friday. Sarah needs to test the code by April 8th. Mike will handle deployment next week."
    },
    {
        "name": "Complex with dates",
        "text": "Priya committed to fixing the authentication bug by April 10th, 2026. Mike (mike.smith@company.com) will review the code by April 9th. Ria and James (james@test.com) will handle the deployment on April 12th."
    },
    {
        "name": "No emails",
        "text": "Tom will prepare the presentation for tomorrow. Lisa will collect feedback by end of week."
    },
    {
        "name": "Mixed with invalid emails",
        "text": "Alex (not-an-email) will start the project. Beatrice (beatrice@company.com) will supervise. Chris will document everything."
    }
]

def run_tests():
    print("=" * 80)
    print("🧪 AI TASK EXTRACTION TEST SUITE")
    print("=" * 80)
    
    for i, test_case in enumerate(TEST_CASES, 1):
        print(f"\n📌 Test {i}: {test_case['name']}")
        print("-" * 80)
        print(f"Input: {test_case['text'][:100]}...")
        print()
        
        try:
            tasks = extract_tasks(test_case['text'])
            
            print(f"✅ Extracted {len(tasks)} tasks:\n")
            
            for j, task in enumerate(tasks, 1):
                if "error" in task:
                    print(f"  ⚠️  Error: {task['error']}")
                else:
                    print(f"  {j}. {task.get('person_name', 'N/A')}")
                    print(f"     📌 Task: {task.get('task_description', 'N/A')}")
                    print(f"     📧 Email: {task.get('email') or 'Not provided'}")
                    print(f"     📅 Deadline: {task.get('deadline') or 'Not specified'}")
                    print()
            
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")
        
        print("-" * 80)
    
    print("\n" + "=" * 80)
    print("✅ Tests completed!")
    print("=" * 80)

if __name__ == "__main__":
    run_tests()
