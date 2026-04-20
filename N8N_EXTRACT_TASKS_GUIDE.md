# N8N Extract Tasks Function Guide

## Complete Setup for Task Extraction from Transcripts & Action Items

### 🎯 Overview

Three extraction endpoints are available for n8n integration:

1. **`/extract-tasks`** - Extract from meeting transcripts (uses Gemini AI)
2. **`/extract-tasks-from-action-items`** - Convert existing action items to tasks
3. **`/extract-tasks-unified`** - Flexible endpoint supporting both sources

---

## Endpoint 1: Extract Tasks from Meeting Transcript

### URL & Method
```
POST http://127.0.0.1:8000/extract-tasks
```

### Request Body
```json
{
  "meeting_text": "Meeting transcription here with task assignments..."
}
```

### Example Request
```bash
curl -X POST http://127.0.0.1:8000/extract-tasks \
  -H "Content-Type: application/json" \
  -d '{
    "meeting_text": "In the meeting, Riya volunteered to submit the quarterly report by April 7. Rahul (rahul@gmail.com) agreed to review it by April 8. Dev will prepare the presentation slides tomorrow."
  }'
```

### Example Response
```json
{
  "status": "success",
  "tasks": [
    {
      "id": 1,
      "person_name": "Riya",
      "email": null,
      "task_description": "submit the quarterly report",
      "deadline": "2026-04-07",
      "status": "pending",
      "created_at": "2026-04-17T10:30:00"
    },
    {
      "id": 2,
      "person_name": "Rahul",
      "email": "rahul@gmail.com",
      "task_description": "review quarterly report",
      "deadline": "2026-04-08",
      "status": "pending",
      "created_at": "2026-04-17T10:30:00"
    },
    {
      "id": 3,
      "person_name": "Dev",
      "email": null,
      "task_description": "prepare the presentation slides",
      "deadline": "2026-04-18",
      "status": "pending",
      "created_at": "2026-04-17T10:30:00"
    }
  ],
  "count": 3
}
```

### Key Features
✅ Uses Gemini AI for intelligent task extraction  
✅ Auto-detects person names, emails, tasks, and deadlines  
✅ Fallback regex email extraction if AI misses them  
✅ Validates email format  
✅ Automatically stores tasks in database with IDs  

---

## Endpoint 2: Extract Tasks from Action Items

### URL & Method
```
POST http://127.0.0.1:8000/extract-tasks-from-action-items
```

### Request Body
```json
{
  "action_items": [
    {
      "assigned_to": "John john@example.com",
      "description": "Complete project documentation",
      "deadline": "2026-04-20",
      "status": "pending"
    },
    {
      "assigned_to": "Sarah",
      "title": "Review code changes",
      "deadline": "2026-04-19"
    }
  ]
}
```

### Example Request
```bash
curl -X POST http://127.0.0.1:8000/extract-tasks-from-action-items \
  -H "Content-Type: application/json" \
  -d '{
    "action_items": [
      {
        "assigned_to": "alice@company.com",
        "description": "Fix critical bug in authentication module",
        "deadline": "2026-04-18",
        "status": "pending"
      },
      {
        "assigned_to": "Bob Smith",
        "title": "Update API documentation",
        "deadline": "2026-04-20",
        "status": "in_progress"
      }
    ]
  }'
```

### Example Response
```json
{
  "status": "success",
  "tasks": [
    {
      "id": 4,
      "person_name": "Alice",
      "email": "alice@company.com",
      "task_description": "Fix critical bug in authentication module",
      "deadline": "2026-04-18",
      "status": "pending",
      "created_at": "2026-04-17T10:35:00"
    },
    {
      "id": 5,
      "person_name": "Bob Smith",
      "email": null,
      "task_description": "Update API documentation",
      "deadline": "2026-04-20",
      "status": "in_progress",
      "created_at": "2026-04-17T10:35:00"
    }
  ],
  "count": 2,
  "extracted_from": "action_items"
}
```

### Supported Fields
- **assigned_to** - Primary source for person name & email
- **assigned_by** - Fallback for person name
- **description** or **title** - Task description
- **deadline** - Converts to YYYY-MM-DD format
- **status** - Preserved from source

---

## Endpoint 3: Unified Extract (Recommended)

### URL & Method
```
POST http://127.0.0.1:8000/extract-tasks-unified
```

### Request Body (Flexible)
```json
{
  "source": "transcript|meeting_text|action_items",
  "meeting_text": "Optional: transcript text",
  "action_items": [
    { "assigned_to": "...", "description": "..." }
  ]
}
```

### Example 1: From Transcript
```bash
curl -X POST http://127.0.0.1:8000/extract-tasks-unified \
  -H "Content-Type: application/json" \
  -d '{
    "source": "transcript",
    "meeting_text": "Sarah will design the new dashboard by Friday. Mike (mike@test.com) will implement it next week."
  }'
```

### Example 2: From Action Items
```bash
curl -X POST http://127.0.0.1:8000/extract-tasks-unified \
  -H "Content-Type: application/json" \
  -d '{
    "source": "action_items",
    "action_items": [
      {
        "assigned_to": "DevTeam",
        "description": "Deploy to staging environment",
        "deadline": "2026-04-19"
      }
    ]
  }'
```

### Response Format
```json
{
  "status": "success|error",
  "tasks": [{ ...task objects... }],
  "count": 3,
  "extracted_from": "transcript|action_items",
  "errors": [
    "Optional error messages if any"
  ]
}
```

---

## N8N Workflow Setup

### Workflow 1: From Transcript

```
Webhook (POST /webhook/extract-tasks)
    ↓
HTTP Request → /extract-tasks (with meeting_text)
    ↓
Code Node (Structure tasks)
    ↓
Database Insert (or PostgreSQL)
    ↓
Send Email to Assignees
    ↓
Update Task Status
```

### Workflow 2: From Action Items

```
Fetch Action Items from Database
    ↓
HTTP Request → /extract-tasks-from-action-items
    ↓
Filter Tasks with Email
    ↓
Send Email Notifications
    ↓
Update Database Status
```

### Workflow 3: Unified (Recommended)

```
Webhook Input
    ↓
Decision: Source Type?
    ├─→ "transcript" → /extract-tasks-unified (source=transcript)
    └─→ "action_items" → /extract-tasks-unified (source=action_items)
    ↓
Store Results
    ↓
Send Notifications
```

---

## N8N Configuration Steps

### Step 1: Create Webhook Trigger

**Node Type:** Webhook

**Configuration:**
- Method: POST
- URL Pattern: `/webhook/extract-tasks` or `/webhook/action-items`
- Authentication: None (or Bearer token if preferred)

**Test payload:**
```json
{
  "source": "transcript",
  "meeting_text": "Text or action_items array"
}
```

### Step 2: HTTP Request to API

**Node Type:** HTTP Request

**Configuration:**
- Method: POST
- URL: `http://127.0.0.1:8000/extract-tasks-unified`
- Headers:
  ```
  Content-Type: application/json
  ```
- Body (JSON):
  ```json
  {
    "source": "={{$json.source}}",
    "meeting_text": "={{$json.meeting_text}}",
    "action_items": "={{$json.action_items}}"
  }
  ```

### Step 3: Process Results (JavaScript Code Node)

```javascript
// Extract email addresses from tasks
const tasksWithEmail = $input.all()[0].json.tasks.filter(t => t.email && t.email.length > 0);

return {
  total_tasks: $input.all()[0].json.count,
  tasks_with_email: tasksWithEmail.length,
  tasks: tasksWithEmail,
  timestamp: new Date().toISOString()
};
```

### Step 4: Send Email Notifications

**Node Type:** Email

**Configuration:**
- For each task in the previous step:
  - To: `={{$item().email}}`
  - Subject: `Task Assigned: {{$item().task_description}}`
  - Body:
    ```
    Hi {{$item().person_name}},
    
    You have been assigned a new task:
    {{$item().task_description}}
    
    Deadline: {{$item().deadline}}
    
    Best regards,
    Meeting Automation System
    ```

### Step 5: Update Task Status

**Node Type:** HTTP Request

**Configuration:**
- Method: PUT
- URL: `http://127.0.0.1:8000/tasks/{{$item().id}}/status`
- Body (JSON):
  ```json
  {
    "status": "notified"
  }
  ```

---

## Error Handling

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `No tasks extracted` | Empty or invalid text | Check meeting_text length/format |
| `Email parsing failed` | Invalid email format | Emails are validated; set to null if invalid |
| `JSON parsing failed` | Gemini AI response malformed | Retry or check Gemini API key |
| `Task extraction timeout` | Large transcript | Split into smaller chunks |

### Retry Logic
```javascript
// n8n Code Node for retry
if ($input.all()[0].json.status === "error") {
  // Retry with smaller chunk
  const halfLength = Math.floor(input_text.length / 2);
  return {
    retry: true,
    text_chunk: input_text.substring(0, halfLength)
  };
}
```

---

## Database Schema (Reference)

### tasks Table
```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  person_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  task_description TEXT NOT NULL,
  deadline VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Testing Endpoints

### Using Postman or cURL

**1. Test Transcript Extraction:**
```bash
curl -X POST http://localhost:8000/extract-tasks \
  -H "Content-Type: application/json" \
  -d '{
    "meeting_text": "During the meeting John agreed to prepare the financial report by Friday. Lisa will verify the numbers by next Monday."
  }'
```

**2. Test Action Items Extraction:**
```bash
curl -X POST http://localhost:8000/extract-tasks-from-action-items \
  -H "Content-Type: application/json" \
  -d '{
    "action_items": [
      { "assigned_to": "john@company.com", "description": "Financial report", "deadline": "2026-04-18" }
    ]
  }'
```

**3. Test Unified Endpoint:**
```bash
curl -X POST http://localhost:8000/extract-tasks-unified \
  -H "Content-Type: application/json" \
  -d '{
    "source": "transcript",
    "meeting_text": "Josh will handle the deployment tomorrow morning."
  }'
```

---

## Performance Tips

✅ **Batch Processing:** Process multiple action items in one request  
✅ **Caching:** Cache email lists for quick matching  
✅ **Chunking:** Split large transcripts (>5000 chars) into smaller pieces  
✅ **Async:** Use n8n async mode for webhook triggers with many tasks  
✅ **Indexing:** Add database index on `email` field for faster queries  

---

## API Response Fields

### Task Object
```json
{
  "id": 1,                                    // Database ID
  "person_name": "John",                      // Assigned person
  "email": "john@example.com",                // Email (nullable)
  "task_description": "Complete report",      // Task details
  "deadline": "2026-04-20",                   // YYYY-MM-DD format
  "status": "pending",                        // pending|notified|completed
  "created_at": "2026-04-17T10:30:00"         // ISO timestamp
}
```

---

## Next Steps

1. ✅ Deploy backend with new endpoints
2. ✅ Test endpoints locally with cURL
3. ✅ Configure n8n webhook triggers
4. ✅ Set up HTTP requests in n8n
5. ✅ Configure email notifications
6. ✅ Monitor task creation in database
7. ✅ Set up error handling & retry logic

---

## Support & Debugging

### Enable Debug Logging
```python
# In main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Check Gemini API
```bash
# Verify GEMINI_API_KEY is set
echo $GEMINI_API_KEY
```

### View Task Creation Logs
```bash
# Monitor database
SELECT * FROM tasks ORDER BY created_at DESC LIMIT 10;
```

---

**Last Updated:** April 17, 2026  
**Version:** 2.0 (with unified extraction)
