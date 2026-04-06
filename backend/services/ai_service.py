"""
AI Service for extracting structured tasks from meeting text using Gemini AI
"""
import os
import json
import re
import logging
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash-exp")


def extract_emails(text: str):
    """Fallback email extraction using regex"""
    try:
        emails = re.findall(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
        return emails
    except Exception as e:
        logger.error(f"Email extraction failed: {e}")
        return []


def extract_tasks(meeting_text: str):
    """
    Extract structured action items from meeting text using Gemini AI
    
    Returns:
        list: Array of task objects with name, email, task, deadline
    """
    try:
        if not meeting_text or len(meeting_text.strip()) == 0:
            logger.warning("Empty meeting text provided")
            return []

        print(f"🔍 Extracting tasks from meeting text ({len(meeting_text)} chars)")

        prompt = f"""
You are an AI assistant that extracts structured action items from meeting transcripts.

From the meeting text, extract ALL action items/tasks. For each one, identify:
- person_name: The person assigned to this task (required)
- email: Email address if mentioned (optional, can be null)
- task_description: Clear, actionable description of what needs to be done (required)
- deadline: Convert to YYYY-MM-DD format if mentioned, else null (optional)

Rules:
1. Extract ALL mentions of tasks, assignments, or action items
2. Return ONLY a valid JSON array
3. Each object must have person_name and task_description
4. Email and deadline can be null
5. Do not include any markdown formatting, code blocks, or explanations
6. Return empty array [] if no tasks found

Meeting Text:
{meeting_text}

Return ONLY the JSON array, no other text:
"""

        print("🤖 Calling Gemini API...")
        response = model.generate_content(prompt)
        raw = response.text.strip()

        print(f"✅ Raw response: {raw[:200]}...")

        # Clean markdown formatting
        cleaned = raw.replace("```json", "").replace("```", "").strip()

        try:
            tasks = json.loads(cleaned)
            print(f"✅ Parsed {len(tasks)} tasks")

            if not isinstance(tasks, list):
                tasks = [tasks]

            # 🔥 Fallback email detection
            emails = extract_emails(meeting_text)
            print(f"📧 Found {len(emails)} emails via regex")

            for i, task in enumerate(tasks):
                # Assign extracted emails if not present
                if not task.get("email") and i < len(emails):
                    task["email"] = emails[i]
                    print(f"  ✓ Assigned email {emails[i]} to task {i+1}")

                # Ensure required fields
                if "person_name" not in task:
                    task["person_name"] = "Unassigned"
                if "task_description" not in task:
                    task["task_description"] = task.get("task", "")
                if "deadline" not in task:
                    task["deadline"] = None

                # Validate email format
                if task.get("email"):
                    if not re.match(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", task["email"]):
                        task["email"] = None

            print(f"✅ Task extraction complete: {len(tasks)} tasks extracted")
            return tasks

        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing failed: {e}")
            logger.error(f"Raw text: {raw}")
            print(f"❌ JSON parsing failed: {e}")
            return [{"error": "AI parsing failed", "raw": raw}]

    except Exception as e:
        logger.error(f"Task extraction error: {str(e)}")
        print(f"❌ Task extraction error: {str(e)}")
        return [{"error": f"Extraction failed: {str(e)}"}]
