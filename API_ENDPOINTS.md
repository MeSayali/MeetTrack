# API Endpoints Reference

## Authentication Endpoints

### Register User
```http
POST /register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe"
}

Response: 200 OK
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe"
}
```

### Login User
```http
POST /login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=password123

Response: 200 OK
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

### Update Profile
```http
PUT /profile/{user_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "full_name": "Jane Doe",
  "email": "jane@example.com"
}

Response: 200 OK
{
  "id": 1,
  "email": "jane@example.com",
  "full_name": "Jane Doe"
}
```

## Meeting Endpoints

### List Meetings
```http
GET /meetings
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": 1,
    "title": "Team Meeting",
    "audio_path": "uploads/meeting.mp3",
    "created_at": "2024-01-15T10:30:00"
  }
]
```

### Get Meeting Details
```http
GET /meeting/{meeting_id}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": 1,
  "title": "Team Meeting",
  "transcript": "...",
  "audio_path": "uploads/meeting.mp3",
  "created_at": "2024-01-15T10:30:00"
}
```

### Get Meeting Transcript
```http
GET /meeting/{meeting_id}/transcript
Authorization: Bearer {access_token}

Response: 200 OK
{
  "meeting_id": 1,
  "title": "Team Meeting",
  "transcript": "..."
}
```

### Get Meeting Summary
```http
GET /meeting/{meeting_id}/summary
Authorization: Bearer {access_token}

Response: 200 OK
{
  "meeting_id": 1,
  "summary": "...",
  "key_points": ["Point 1", "Point 2"],
  "created_at": "2024-01-15T10:30:00"
}
```

## Upload Endpoints

### Upload Audio File
```http
POST /audio
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

file: <binary>

Response: 200 OK
{
  "message": "Upload successful",
  "file_path": "uploads/meeting.mp3",
  "file_name": "meeting.mp3"
}
```

### Process Meeting
```http
POST /process
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "file_path": "uploads/meeting.mp3",
  "file_name": "meeting.mp3"
}

Response: 200 OK
{
  "status": "success",
  "meeting_id": 1,
  "title": "meeting",
  "transcript": "...",
  "action_items": [
    {
      "assigned_to": "user@example.com",
      "title": "Task 1",
      "deadline": "2024-01-20",
      "status": "Pending"
    }
  ]
}
```

## Results Endpoints

### Get Meeting Results
```http
GET /results/{meeting_id}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "meeting_id": 1,
  "summary": "...",
  "key_points": ["Point 1"],
  "created_at": "2024-01-15T10:30:00"
}
```

### Get Pending Tasks
```http
GET /results/pending/tasks
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": 1,
    "title": "Task 1",
    "description": "Description",
    "assigned_to": "user@example.com",
    "deadline": "2024-01-20",
    "status": "Pending"
  }
]
```

### Get Dashboard Insights
```http
GET /results/insights
Authorization: Bearer {access_token}

Response: 200 OK
{
  "total_meetings": 5,
  "total_results": 5,
  "total_actions": 10,
  "pending_actions": 3,
  "completed_actions": 7
}
```

### Get Statistics
```http
GET /results/stats
Authorization: Bearer {access_token}

Response: 200 OK
{
  "total_meetings": 5,
  "recent_meetings": [
    {
      "id": 1,
      "title": "Meeting 1",
      "created_at": "2024-01-15T10:30:00"
    }
  ]
}
```

## Action Item Endpoints

### Get Action Items
```http
GET /action-items?meeting_id={meeting_id}
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": 1,
    "meeting_id": 1,
    "title": "Task 1",
    "description": "Description",
    "assigned_to": "user@example.com",
    "deadline": "2024-01-20",
    "status": "Pending"
  }
]
```

### Get User's Action Items
```http
GET /action-items/me
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": 1,
    "meeting_id": 1,
    "title": "Task 1",
    "description": "Description",
    "assigned_to": "user@example.com",
    "deadline": "2024-01-20",
    "status": "Pending"
  }
]
```

### Get Action Item
```http
GET /action-items/{action_id}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": 1,
  "meeting_id": 1,
  "title": "Task 1",
  "description": "Description",
  "assigned_to": "user@example.com",
  "deadline": "2024-01-20",
  "status": "Pending"
}
```

### Create Action Item
```http
POST /action-items
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "meeting_id": 1,
  "title": "New Task",
  "description": "Task description",
  "assigned_to": "user@example.com",
  "deadline": "2024-01-20"
}

Response: 201 Created
{
  "id": 2,
  "meeting_id": 1,
  "title": "New Task",
  "description": "Task description",
  "assigned_to": "user@example.com",
  "deadline": "2024-01-20",
  "status": "Pending"
}
```

### Update Action Item
```http
PUT /action-items/{action_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "Updated Task",
  "status": "Completed"
}

Response: 200 OK
{
  "id": 1,
  "meeting_id": 1,
  "title": "Updated Task",
  "description": "Description",
  "assigned_to": "user@example.com",
  "deadline": "2024-01-20",
  "status": "Completed"
}
```

### Update Action Item Status
```http
PUT /action-items/{action_id}/status
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "status": "Completed"
}

Response: 200 OK
{
  "message": "Status updated",
  "action_id": 1,
  "new_status": "Completed"
}
```

### Delete Action Item
```http
DELETE /action-items/{action_id}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "message": "Action item deleted successfully"
}
```

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

Common HTTP Status Codes:
- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or failed
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Authentication

All protected endpoints require an `Authorization` header with a JWT token:

```
Authorization: Bearer {access_token}
```

Obtain the token from the `/login` or `/register` endpoints.

