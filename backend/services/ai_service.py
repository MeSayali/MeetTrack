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
            
            # ✅ Normalize output format for n8n
            formatted_tasks = []
            for task in tasks:
                formatted_tasks.append({
                    "name": task.get("person_name"),
                    "email": task.get("email"),
                    "task": task.get("task_description"),
                    "deadline": task.get("deadline")
                })
            
            print(f"✅ Formatted {len(formatted_tasks)} tasks for n8n")
            return formatted_tasks

        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing failed: {e}")
            logger.error(f"Raw text: {raw}")
            print(f"❌ JSON parsing failed: {e}")
            return [{"error": "AI parsing failed", "raw": raw}]

    except Exception as e:
        logger.error(f"Task extraction error: {str(e)}")
        print(f"❌ Task extraction error: {str(e)}")
        return [{"error": f"Extraction failed: {str(e)}"}]


def extract_tasks_from_action_items(action_items: list) -> list:
    """
    Convert existing action items to task format for n8n
    
    Args:
        action_items: List of action item dictionaries with keys:
                     - assigned_to (or title/description for name extraction)
                     - description (or title for task description)
                     - deadline
                     - Any other metadata
    
    Returns:
        list: Array of task objects with person_name, email, task_description, deadline
    """
    try:
        print(f"🔄 Converting {len(action_items)} action items to tasks")
        
        tasks = []
        for item in action_items:
            # Extract person name from assigned_to field
            person_name = item.get("assigned_to", "").strip()
            if not person_name:
                person_name = item.get("assigned_by", "").strip()
            if not person_name:
                person_name = "Unassigned"
            
            # Extract task description from description or title
            task_description = item.get("description", "").strip()
            if not task_description:
                task_description = item.get("title", "").strip()
            
            # Skip if no description
            if not task_description:
                logger.warning(f"Skipping action item without description: {item}")
                continue
            
            # Extract email from assigned_to if it contains email format
            email = None
            if "@" in person_name:
                email = person_name
                # Try to extract name before email (e.g., "John john@example.com")
                email_match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", person_name)
                if email_match:
                    email = email_match.group(0)
                    person_name = person_name.replace(email, "").strip() or "Unassigned"
            
            # Validate email format
            if email and not re.match(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", email):
                email = None
            
            # Extract deadline
            deadline = item.get("deadline")
            if deadline:
                # Ensure YYYY-MM-DD format
                if isinstance(deadline, str):
                    # Try to parse and reformat if needed
                    try:
                        from datetime import datetime
                        parsed_date = datetime.fromisoformat(deadline.split("T")[0])
                        deadline = parsed_date.strftime("%Y-%m-%d")
                    except:
                        deadline = deadline.split("T")[0] if "T" in deadline else deadline
            
            task = {
                "name": person_name,
                "email": email,
                "task": task_description,
                "deadline": deadline,
                "status": item.get("status", "pending")
            }
            
            tasks.append(task)
            print(f"  ✓ Converted: {person_name} - {task_description[:40]}...")
        
        print(f"✅ Action item conversion complete: {len(tasks)} tasks created")
        return tasks
        
    except Exception as e:
        logger.error(f"Action item extraction error: {str(e)}")
        print(f"❌ Action item extraction error: {str(e)}")
        return [{"error": f"Conversion failed: {str(e)}"}]


def extract_tasks_unified(
    source: str,
    content: dict
) -> list:
    """
    Unified function to extract tasks from different sources (transcript or action_items)
    
    Args:
        source: 'transcript' or 'action_items'
        content: Dictionary containing either:
                - meeting_text: str (for transcript source)
                - action_items: list (for action_items source)
    
    Returns:
        list: Array of extracted task objects
    """
    try:
        print(f"🔀 Starting unified extraction from source: {source}")
        
        if source.lower() == "transcript" or source.lower() == "meeting_text":
            meeting_text = content.get("meeting_text") or content.get("text", "")
            if not meeting_text:
                logger.warning("No meeting text provided")
                return []
            return extract_tasks(meeting_text)
        
        elif source.lower() == "action_items":
            action_items = content.get("action_items", [])
            if not action_items:
                logger.warning("No action items provided")
                return []
            return extract_tasks_from_action_items(action_items)
        
        else:
            logger.error(f"Unknown source: {source}")
            return [{"error": f"Unknown source: {source}"}]
            
    except Exception as e:
        logger.error(f"Unified extraction error: {str(e)}")
        print(f"❌ Unified extraction error: {str(e)}")
        return [{"error": f"Extraction failed: {str(e)}"}]
