# AI Task Extraction & Email Workflow Setup

## 🚀 System Architecture

```
Meeting Transcription
        ↓
n8n Webhook (receive meeting_text)
        ↓
FastAPI /extract-tasks Endpoint
        ↓
Gemini AI extracts structured tasks
        ↓
PostgreSQL stores tasks
        ↓
n8n Scheduler (daily/hourly)
        ↓
Filter pending tasks with valid emails
        ↓
Send personalized emails
```

## 📋 API Endpoints

### 1️⃣ Extract Tasks (Webhook for n8n)

**POST** `http://127.0.0.1:8000/extract-tasks`

**Request Body:**
```json
{
  "meeting_text": "Riya will submit the report by April 7. Rahul (rahul@gmail.com) will review it by tomorrow."
}
```

**Response:**
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
    },
    {
      "id": 2,
      "person_name": "Rahul",
      "email": "rahul@gmail.com",
      "task_description": "review it",
      "deadline": "2026-04-06",
      "status": "pending"
    }
  ],
  "count": 2
}
```

### 2️⃣ Get All Tasks

**GET** `http://127.0.0.1:8000/tasks`

**Query Parameters:**
- `status`: "pending", "completed", "cancelled"
- `email`: filter by email

**Response:**
```json
[
  {
    "id": 1,
    "person_name": "Riya",
    "email": null,
    "task_description": "submit the report",
    "deadline": "2026-04-07",
    "status": "pending",
    "created_at": "2026-04-06T10:30:00Z"
  }
]
```

### 3️⃣ Get Pending Tasks for Email

**GET** `http://127.0.0.1:8000/tasks/pending/for-email`

Returns only pending tasks with **valid email addresses** (filtered).

**Response:**
```json
{
  "tasks": [
    {
      "id": 2,
      "person_name": "Rahul",
      "email": "rahul@gmail.com",
      "task_description": "review it",
      "deadline": "2026-04-06"
    }
  ],
  "count": 1
}
```

### 4️⃣ Update Task Status

**PUT** `http://127.0.0.1:8000/tasks/{task_id}/status`

**Request Body:**
```json
{
  "status": "completed"
}
```

## 🔧 n8n Workflow Setup

### Step 1: Webhook Trigger (INPUT)

**Type:** Webhook

**Method:** POST

**URL:** `http://YOUR_N8N_ADDRESS/webhook/extract-workflow`

**Webhook Body:**
```json
{
  "meeting_text": "transcribed meeting text here"
}
```

**How to trigger:**
```bash
curl -X POST http://YOUR_N8N_ADDRESS/webhook/extract-workflow \
  -H "Content-Type: application/json" \
  -d '{
    "meeting_text": "John will fix the bug by tomorrow. Sarah (sarah@company.com) will test it."
  }'
```

### Step 2: HTTP Request to FastAPI

**Type:** HTTP Request

**Method:** POST

**URL:** `http://127.0.0.1:8000/extract-tasks`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "meeting_text": "{{$json.meeting_text}}"
}
```

### Step 3: Process Array (JavaScript Node)

**Type:** Code

**Code:**
```javascript
return items[0].json.tasks||items[0].json.json.tasks;
```

This converts the response array into individual items for n8n processing.

### Step 4: PostgreSQL Insert (Optional - already in database)

**Type:** PostgreSQL

**Query:**
```sql
INSERT INTO tasks (person_name, email, task_description, deadline, status)
VALUES (
  {{$json.person_name}},
  {{$json.email}},
  {{$json.task_description}},
  {{$json.deadline}},
  'pending'
);
```

### Step 5: Filter Valid Emails

**Type:** Code

**Code:**
```javascript
return items.filter(item => {
  const email = item.json.email;
  return email && email !== "undefined" && email.trim() !== "" && email.includes("@");
});
```

### Step 6: Send Email

**Type:** Send Email (or custom SMTP)

**To:** `{{$json.email}}`

**Subject:** `Task Reminder: {{$json.task_description}}`

**Body Template:**
```
Hi {{$json.person_name}},

You have a pending task:
📌 {{$json.task_description}}

Deadline: {{$json.deadline}}

Please complete this task on time.

Thanks!
```

### Step 7: Update Task Status (Optional)

**Type:** HTTP Request

**Method:** PUT

**URL:** `http://127.0.0.1:8000/tasks/{{$json.id}}/status`

**Body:**
```json
{
  "status": "sent"
}
```

## ⏰ Scheduler (Optional - for recurring tasks)

**Type:** Schedule

**Trigger:** Daily at 9 AM (or custom interval)

**Connected to:**
1. HTTP Request → Get pending tasks
2. Filter emails
3. Send emails
4. Update status

## 🧪 Testing

### Test 1: Extract Tasks from Text

```bash
curl -X POST http://127.0.0.1:8000/extract-tasks \
  -H "Content-Type: application/json" \
  -d '{
    "meeting_text": "In our meeting, Priya committed to fixing the authentication bug by April 8th. Mike (mike.smith@company.com) will review the code by April 7th. Ria and James will handle the deployment next week on April 10th."
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "tasks": [
    {
      "id": 1,
      "person_name": "Priya",
      "email": null,
      "task_description": "fixing the authentication bug",
      "deadline": "2026-04-08",
      "status": "pending"
    },
    {
      "id": 2,
      "person_name": "Mike",
      "email": "mike.smith@company.com",
      "task_description": "review the code",
      "deadline": "2026-04-07",
      "status": "pending"
    },
    {
      "id": 3,
      "person_name": "Ria",
      "email": null,
      "task_description": "handle the deployment",
      "deadline": "2026-04-10",
      "status": "pending"
    },
    {
      "id": 4,
      "person_name": "James",
      "email": null,
      "task_description": "handle the deployment",
      "deadline": "2026-04-10",
      "status": "pending"
    }
  ],
  "count": 4
}
```

### Test 2: Get Pending Tasks with Emails

```bash
curl http://127.0.0.1:8000/tasks/pending/for-email
```

### Test 3: Update Task Status

```bash
curl -X PUT http://127.0.0.1:8000/tasks/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

## 📊 Database Schema

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  person_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  task_description TEXT NOT NULL,
  deadline VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Fields:**
- `person_name`: Who is assigned (required)
- `email`: Team member email (optional)
- `task_description`: What needs to be done (required)
- `deadline`: Due date in YYYY-MM-DD format (optional)
- `status`: pending | completed | cancelled

## 🔍 AI Extraction Features

✅ **Smart Extraction:**
- Identifies action items automatically
- Extracts names and deadlines
- Handles multiple formats

✅ **Email Fallback:**
- Primary: Direct email extraction from text
- Fallback: Regex pattern matching
- Validation: Ensures valid email format

✅ **Date Parsing:**
- Converts natural language dates to YYYY-MM-DD
- Handles relative dates (tomorrow, next week, etc.)
- Fallback to null if unparseable

✅ **Error Handling:**
- Graceful failures
- Logging for debugging
- Returns structured errors

## 📝 Notes for n8n Workflow

1. **Array Processing:** After HTTP request, MUST convert to array items
2. **Email Validation:** Filter out empty/invalid emails BEFORE sending
3. **Status Tracking:** Update task status after email sent (optional)
4. **Error Logging:** Capture failed extractions for review
5. **Rate Limiting:** Set delays if sending many emails

## 🚀 Next Steps

1. Set up n8n triggers
2. Configure email provider (Gmail, SendGrid, etc.)
3. Create scheduler for recurring task reminders
4. Set up error notifications
5. Monitor extraction quality and refine prompts as needed
