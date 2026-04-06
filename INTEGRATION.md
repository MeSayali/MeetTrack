# Integration Guide - Automated Meeting Outcome Tracker

## Overview

This document provides a comprehensive guide on how the backend and frontend are integrated for the Automated Meeting Outcome Tracker project.

## Architecture

```
┌─────────────────────┐
│   Frontend (React)  │
│  - Authentication   │
│  - File Upload      │
│  - Dashboard        │
│  - History          │
└──────────┬──────────┘
           │ HTTP/API Calls
           │ (Port 5173 → 8000)
           ▼
┌─────────────────────┐
│  Backend (FastAPI)  │
│  - Auth Endpoints   │
│  - Upload Routes    │
│  - Processing       │
│  - Results          │
│  - Action Items     │
└──────────┬──────────┘
           │ Database Queries
           │
           ▼
┌─────────────────────┐
│   PostgreSQL DB     │
│  - Users            │
│  - Meetings         │
│  - Results          │
│  - Action Items     │
└─────────────────────┘
```

## Setup Instructions

### Prerequisites

- **Backend:**
  - Python 3.8+
  - PostgreSQL database
  - Virtual environment (recommended)

- **Frontend:**
  - Node.js 16+
  - npm or yarn

### Backend Setup

1. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate.bat
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables in `.env`:**
   ```
   DATABASE_URL=postgresql://postgres:pass@localhost:5432/automated_meeting_db
   AWS_REGION=ap-south-1
   AWS_ACCESS_KEY=your_key_here
   AWS_SECRET_KEY=your_secret_here
   TRANSCRIBE_BUCKET=your_bucket_name
   TRANSCRIBE_ROLE_ARN=your_role_arn
   GEMINI_API_KEY=your_gemini_key
   ```

4. **Run migrations (if any):**
   ```bash
   # Tables are created automatically via SQLAlchemy
   ```

5. **Start backend server:**
   ```bash
   cd backend
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

   The backend will be available at: `http://127.0.0.1:8000`

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Create `.env.local` with API configuration:**
   ```
   VITE_API_BASE_URL=http://127.0.0.1:8000
   VITE_API_TIMEOUT=30000
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at: `http://127.0.0.1:5173`

### Quick Start (Using Provided Scripts)

**Windows:**
```bash
run.bat
```

**Unix/Mac:**
```bash
chmod +x run.sh
./run.sh
```

## API Integration Points

### Authentication Flow

1. **Register** - `POST /register`
   - Frontend sends email & password
   - Backend creates user and returns user data
   - Frontend stores user in localStorage

2. **Login** - `POST /login`
   - Frontend sends email/password as form data
   - Backend validates and returns JWT token
   - Frontend stores token in localStorage

3. **Protected Routes**
   - All API calls include JWT token in Authorization header
   - Token is validated by `get_current_user` dependency

### File Upload & Processing Flow

1. **Upload** - `POST /audio`
   - Frontend uploads MP3 file as FormData
   - Backend saves file to `uploads/` directory
   - Returns file path

2. **Process** - `POST /process`
   - Frontend sends file path as JSON
   - Backend:
     - Transcribes audio using AWS Transcribe
     - Extracts action items using NLP
     - Saves meeting record to database
     - Returns meeting data & action items

### Data Retrieval

1. **Get Meetings** - `GET /meetings`
   - Returns list of user's meetings

2. **Get Meeting Details** - `GET /meeting/{id}`
   - Returns specific meeting with transcript

3. **Get Results** - `GET /results/{meeting_id}`
   - Returns analysis results for meeting

4. **Get Action Items** - `GET /action-items?meeting_id={id}`
   - Returns action items for meeting

## Frontend Service Layer

All API calls are abstracted through service modules in `frontend/src/services/`:

### `api.js`
Base API client with:
- Authorization header management
- Error handling
- Request timeout
- File upload support

### `authService.js`
Authentication operations:
- `register(email, password, fullName)`
- `login(email, password)`
- `logout()`
- `getAccessToken()`
- `setAccessToken(token)`

### `uploadService.js`
File upload & processing:
- `uploadAudio(file)`
- `processFile(filePath, fileName)`
- `getMeeting(meetingId)`
- `getTranscript(meetingId)`

### `resultService.js`
Results & insights:
- `getMeetingResults(meetingId)`
- `getPendingTasks()`
- `getInsights()`

### `actionItemService.js`
Action item management:
- `getActionItems(meetingId)`
- `updateActionItem(itemId, data)`
- `updateStatus(itemId, status)`
- `deleteActionItem(itemId)`

## Environment Configuration

### Backend Configuration (`backend/app/settings.py`)

```python
# Database
DATABASE_URL = "postgresql://..."

# AWS
AWS_REGION = "ap-south-1"
AWS_ACCESS_KEY = "..."
AWS_SECRET_KEY = "..."

# API
CORS_ORIGINS = [
    "http://127.0.0.1:5173",  # Frontend dev
    "http://localhost:5173",
]

# Auth
SECRET_KEY = "supersecretkey123"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
```

### Frontend Configuration (`frontend/.env.local`)

```
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_API_TIMEOUT=30000
```

## CORS Configuration

The backend has CORS middleware configured to allow requests from:
- `http://127.0.0.1:5173` (local dev)
- `http://localhost:5173`

You can add production URLs to `CORS_ORIGINS` in `backend/app/settings.py`

## Debugging API Issues

### Check Backend is Running
```bash
curl http://127.0.0.1:8000
```

### Check Authentication
```bash
curl -X POST http://127.0.0.1:8000/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=password123"
```

### Check Frontend API Configuration
Open browser console and check:
```javascript
console.log(import.meta.env.VITE_API_BASE_URL)
```

### View API Logs
- Backend: Check terminal where `uvicorn` is running
- Frontend: Check browser Console tab (F12)

## Production Deployment

### Backend
1. Set environment variables on production server
2. Update `CORS_ORIGINS` to include production frontend URL
3. Use production database URL
4. Run with production ASGI server (e.g., Gunicorn with Uvicorn workers)

### Frontend
1. Build for production:
   ```bash
   npm run build
   ```
2. Update `VITE_API_BASE_URL` in `.env.production`
3. Deploy build output to static hosting (Vercel, Netlify, etc.)
4. Configure API proxy if needed for CORS

## Troubleshooting

### Frontend can't connect to backend
- Check backend is running on port 8000
- Check `VITE_API_BASE_URL` in `.env.local`
- Check browser console for specific error
- Verify CORS settings in backend

### CORS errors
- Backend has CORS middleware configured
- Ensure frontend URL is in `CORS_ORIGINS`
- Clear browser cache

### Authentication fails
- Check secret key is consistent
- Verify JWT token is being sent with requests
- Check token hasn't expired

### Database connection errors
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Verify database exists and user has permissions

## API Endpoints Reference

See [API_ENDPOINTS.md](./API_ENDPOINTS.md) for complete API documentation.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs (terminal output)
3. Check frontend console (F12)
4. Check network tab for API calls

