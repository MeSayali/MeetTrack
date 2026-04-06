# n8n Workflow Configuration Guide

## Complete n8n Workflow for Task Extraction & Email Sending

### Workflow Overview

```
Webhook Input (meeting_text)
    ↓
HTTP Request → FastAPI Extract
    ↓
Code Node (Process Array)
    ↓
PostgreSQL Insert Tasks
    ↓
Code Node (Filter Emails)
    ↓
Send Email
    ↓
HTTP Request (Update Status)
```

---

## Step-by-Step Configuration

### Step 1: Webhook Trigger (START)

**Node Type:** Webhook

**Configuration:**
- **Method:** POST
- **Authentication:** None (or add if needed)
- **URL:** `https://your-n8n-instance.com/webhook/meeting-tasks`

**Request Body Format:**
```json
{
  "meeting_text": "Meeting transcription here..."
}
```

**Test Webhook Call:**
```bash
curl -X POST https://your-n8n-instance.com/webhook/meeting-tasks \
  -H "Content-Type: application/json" \
  -d '{
    "meeting_text": "Riya will submit the report by April 7. Rahul (rahul@gmail.com) will review it tomorrow."
  }'
```

---

### Step 2: HTTP Request → Extract Tasks

**Node Type:** HTTP Request

**Configuration:**
- **Method:** POST
- **URL:** `http://127.0.0.1:8000/extract-tasks`
- **Headers:**
  ```
  Content-Type: application/json
  ```

**Body (JSON):**
```json
{
  "meeting_text": "={{$json.meeting_text}}"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "tasks": [
    {
      "id": 1,
      "person_name": "Riya",
      "email": null,
      "task_description": "submit the report",
      "deadline": "2026-04-07",
      "status": "pending"
    }
  ],
  "count": 1
}
```

---

### Step 3: Code Node - Convert to Array Items

**Node Type:** Code

**Language:** JavaScript

**Code:**
```javascript
// Extract tasks from response and convert to individual items
const response = items[0].json;
const tasks = response.tasks || response.json?.tasks || [];

if (!Array.isArray(tasks)) {
  return [];
}

return tasks.map(task => ({
  json: task
}));
```

**What This Does:**
- Takes the array from HTTP response
- Splits into individual items for n8n processing
- Each item becomes a separate workflow execution

---

### Step 4: PostgreSQL - Insert Tasks (OPTIONAL)

**Node Type:** PostgreSQL

**Configuration:**
- **Connection:** Your PostgreSQL DB
- **Query:**
  ```sql
  INSERT INTO tasks (person_name, email, task_description, deadline, status)
  VALUES (
    {{$json.person_name}},
    {{$json.email}},
    {{$json.task_description}},
    {{$json.deadline}},
    '{{$json.status}}'
  )
  ```

**Note:** Tasks are already inserted by FastAPI, this is optional

---

### Step 5: Code Node - Filter Valid Emails

**Node Type:** Code

**Language:** JavaScript

**Code:**
```javascript
// Filter only tasks with valid emails
return items.filter(item => {
  const email = item.json.email;
  
  // Check if email exists and is valid
  if (!email) return false;
  if (typeof email !== 'string') return false;
  if (email === 'null' || email === 'undefined') return false;
  if (email.trim() === '') return false;
  if (!email.includes('@')) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
});
```

**What This Does:**
- Removes tasks without emails
- Validates email format
- Ensures no null/undefined values
- Only sends to valid addresses

---

### Step 6: Send Email

**Node Type:** Gmail / SendGrid / SMTP

#### Option A: Gmail
**Node Type:** Gmail

**Configuration:**
- **From Account:** Your Gmail
- **To:** `={{$json.email}}`
- **Subject:** `Task Reminder: {{$json.task_description}}`
- **Message:**
  ```
  Hi {{$json.person_name}},

  You have an action item from the meeting:

  📌 Task: {{$json.task_description}}
  📅 Deadline: {{$json.deadline}}
  
  Please complete this by the deadline.

  Thanks!
  ```

#### Option B: SendGrid
**Node Type:** SendGrid

**Configuration:**
- **API Key:** Your SendGrid API key
- **To:** `={{$json.email}}`
- **From:** `noreply@company.com`
- **Subject:** `Task Reminder: {{$json.task_description}}`
- **HTML Body:**
  ```html
  <p>Hi {{$json.person_name}},</p>
  <p>You have an action item from the meeting:</p>
  <p>
    <strong>📌 Task:</strong> {{$json.task_description}}<br>
    <strong>📅 Deadline:</strong> {{$json.deadline}}
  </p>
  <p>Please complete this by the deadline.</p>
  <p>Thanks!</p>
  ```

#### Option C: Custom SMTP
**Node Type:** Email (SMTP)

**Configuration:**
- **SMTP Host:** Your SMTP server
- **Port:** 587 or 465
- **From Email:** `noreply@company.com`
- **To:** `={{$json.email}}`
- **Subject:** `Task Reminder: {{$json.task_description}}`
- **Text Message:**
  ```
  Hi {{$json.person_name}},

  You have an action item from the meeting:

  Task: {{$json.task_description}}
  Deadline: {{$json.deadline}}

  Please complete this by the deadline.

  Thanks!
  ```

---

### Step 7: HTTP Request - Update Task Status

**Node Type:** HTTP Request

**Configuration:**
- **Method:** PUT
- **URL:** `http://127.0.0.1:8000/tasks/{{$json.id}}/status`
- **Headers:**
  ```
  Content-Type: application/json
  ```

**Body:**
```json
{
  "status": "sent"
}
```

**What This Does:**
- Updates task status to "sent" after email sent
- Prevents duplicate emails
- Tracks task progress

---

### Step 8: Scheduler (Optional - for reminders)

**Node Type:** Schedule

**Configuration:**
- **Trigger:** Every Day at 9:00 AM
- **OR:** Every Hour
- **OR:** Specific times

**Connected To:**
1. HTTP Request → Get pending tasks
   ```
   GET http://127.0.0.1:8000/tasks/pending/for-email
   ```

2. Code Node → Extract tasks from response

3. Send Email → As above

4. Update Status → Mark as sent

---

## Complete Workflow JSON

Import this directly into n8n:

```json
{
  "name": "Meeting Task Extraction & Email",
  "active": true,
  "nodes": [
    {
      "parameters": {
        "path": "meeting-tasks",
        "authentication": "none",
        "responseMode": "onReceived",
        "options": {}
      },
      "id": "webhook_start",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 100]
    },
    {
      "parameters": {
        "url": "http://127.0.0.1:8000/extract-tasks",
        "method": "POST",
        "bodyParameters": {
          "parameters": [
            {
              "name": "meeting_text",
              "value": "={{$json.meeting_text}}"
            }
          ]
        },
        "options": {}
      },
      "id": "http_extract",
      "name": "Extract Tasks (FastAPI)",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [450, 100]
    },
    {
      "parameters": {
        "jsCode": "const tasks = items[0].json.tasks || [];\nreturn tasks.map(task => ({ json: task }));"
      },
      "id": "code_process",
      "name": "Process Array",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [650, 100]
    },
    {
      "parameters": {
        "jsCode": "return items.filter(item => {\n  const email = item.json.email;\n  if (!email || email === 'null' || email.trim() === '') return false;\n  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);\n});"
      },
      "id": "code_filter",
      "name": "Filter Emails",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [850, 100]
    },
    {
      "parameters": {
        "fromEmail": "noreply@company.com",
        "toEmail": "={{$json.email}}",
        "subject": "Task Reminder: {{$json.task_description}}",
        "text": "Hi {{$json.person_name}},\n\nYou have an action item:\n\n📌 {{$json.task_description}}\n📅 Deadline: {{$json.deadline}}\n\nPlease complete by deadline.\n\nThanks!"
      },
      "id": "email_send",
      "name": "Send Email",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 1,
      "position": [1050, 100]
    },
    {
      "parameters": {
        "url": "http://127.0.0.1:8000/tasks/{{$json.id}}/status",
        "method": "PUT",
        "bodyParameters": {
          "parameters": [
            {
              "name": "status",
              "value": "sent"
            }
          ]
        }
      },
      "id": "http_update",
      "name": "Update Status",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [1250, 100]
    }
  ],
  "connections": {
    "webhook_start": {
      "main": [
        [
          {
            "node": "http_extract",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "http_extract": {
      "main": [
        [
          {
            "node": "code_process",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "code_process": {
      "main": [
        [
          {
            "node": "code_filter",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "code_filter": {
      "main": [
        [
          {
            "node": "email_send",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "email_send": {
      "main": [
        [
          {
            "node": "http_update",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

---

## Quick Start Checklist

- [ ] Webhook URL copied
- [ ] FastAPI running on 127.0.0.1:8000
- [ ] PostgreSQL database configured
- [ ] Email credentials set up (Gmail/SendGrid/SMTP)
- [ ] Workflow imported
- [ ] Test message sent through webhook
- [ ] Email received
- [ ] Database checked for new tasks

---

## Testing

### Test 1: Send Meeting Text
```bash
curl -X POST http://localhost:3000/webhook/meeting-tasks \
  -H "Content-Type: application/json" \
  -d '{
    "meeting_text": "John (john@company.com) will fix the bug by Friday. Sarah will test on Monday."
  }'
```

### Test 2: Check Tasks in Database
```bash
curl http://127.0.0.1:8000/tasks
```

### Test 3: Check Pending Emails
```bash
curl http://127.0.0.1:8000/tasks/pending/for-email
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tasks not extracting | Check GEMINI_API_KEY in .env |
| Emails not sending | Verify email provider credentials |
| Array processing fails | Check JSON response structure |
| Tasks not in DB | Verify PostgreSQL connection |
| Status not updating | Check task ID format |

---

**Your n8n workflow is ready to automate meeting task extraction! 🚀**
