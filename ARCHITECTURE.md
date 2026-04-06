# Project Architecture & Integration Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Integration Points](#integration-points)
5. [Setup Instructions](#setup-instructions)
6. [Deployment Guide](#deployment-guide)

## System Overview

The Automated Meeting Outcome Tracker is a full-stack application that:
- Records and uploads meeting audio files
- Transcribes meetings using AWS Transcribe
- Extracts action items using NLP
- Provides a dashboard for insights
- Manages user profiles and action items
- Generates meeting summaries

### Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                     User Browser                              │
├──────────────────────────────────────────────────────────────┤
│                    React Frontend                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Auth Page  │  │ Dashboard    │  │  History     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                  │                  │               │
│         └──────────────────┼──────────────────┘               │
│                            │                                   │
│           ┌────────────────────────────────┐                 │
│           │  API Service Layer             │                 │
│           │  - authService                 │                 │
│           │  - uploadService               │                 │
│           │  - resultService               │                 │
│           └────────────────────────────────┘                 │
│                            │                                   │
│         HTTP/CORS          │ (Port 5173 → 8000)               │
└────────────────────────────┼───────────────────────────────────┘
                             │
┌────────────────────────────┼───────────────────────────────────┐
│          Backend (FastAPI)  ▼                                   │
├───────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐  │
│  │              API Endpoints                             │  │
│  │  ┌──────────────┐  ┌──────────────┐ ┌──────────────┐ │  │
│  │  │ Auth Routes  │  │ Upload       │ │ Result       │ │  │
│  │  │ /register    │  │ /audio       │ │ /results/*   │ │  │
│  │  │ /login       │  │ /process     │ │ /insights    │ │  │
│  │  └──────────────┘  └──────────────┘ └──────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         Business Logic Services                        │  │
│  │  ┌──────────────┐  ┌──────────────┐ ┌──────────────┐ │  │
│  │  │ Transcribe   │  │ NLP          │ │ Summary      │ │  │
│  │  │ Service      │  │ Service      │ │ Service      │ │  │
│  │  └──────────────┘  └──────────────┘ └──────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         SQLAlchemy ORM Models                          │  │
│  │  User, Meeting, Result, ActionItem, Transcript         │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│               External Services                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ AWS          │  │ Google       │  │ PostgreSQL   │        │
│  │ Transcribe   │  │ Gemini API   │  │ Database     │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└───────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend
- **Framework:** FastAPI (Python web framework)
- **ORM:** SQLAlchemy
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **External APIs:**
  - AWS Transcribe (audio transcription)
  - Google Gemini API (NLP & summarization)
  - AWS S3 (audio storage)

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **UI Components:** Radix UI
- **Animation:** Framer Motion
- **HTTP Client:** Fetch API

### Infrastructure
- **Authentication:** JWT tokens
- **CORS:** FastAPI CORS middleware
- **Development Servers:**
  - Backend: Uvicorn
  - Frontend: Vite dev server

## Project Structure

```
Automated-Meeting-Outcome-Tracker/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # App entry point, routes
│   │   ├── auth.py              # JWT authentication
│   │   ├── config.py            # Config (mostly in settings.py)
│   │   ├── settings.py          # Environment & app settings
│   │   ├── database.py          # Database configuration
│   │   ├── schemas.py           # Pydantic models (request/response)
│   │   ├── crud.py              # Database operations
│   │   └── create_tables.py     # Table initialization
│   ├── models/
│   │   ├── user.py              # User model
│   │   ├── meeting.py           # Meeting model
│   │   ├── action_item.py       # Action item model
│   │   ├── result.py            # Result model
│   │   └── transcript.py        # Transcript model
│   ├── routes/
│   │   ├── upload_routes.py     # File upload & processing
│   │   ├── process_routes.py    # Meeting processing
│   │   ├── result_routes.py     # Results & insights
│   │   ├── action_item_routes.py # Action item management
│   │   └── meeting_routes.py    # Meeting endpoints
│   ├── services/
│   │   ├── transcribe_service.py # AWS Transcribe integration
│   │   ├── nlp_service.py        # NLP & action extraction
│   │   ├── summary_service.py    # Meeting summarization
│   │   ├── notification_service.py # Email notifications
│   │   └── sns_service.py        # AWS SNS integration
│   ├── schemas/
│   │   ├── action_item_schema.py
│   │   ├── meeting_schema.py
│   │   ├── result_schema.py
│   │   └── transcript_schema.py
│   └── utils/
│       └── helpers.py
├── frontend/
│   ├── src/
│   │   ├── main.jsx             # Entry point
│   │   ├── App.jsx              # Router setup
│   │   ├── App.css
│   │   ├── index.css
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── HistoryPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   ├── ContactPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── components/
│   │   │   ├── ActionItemCard.jsx
│   │   │   ├── BrandLogo.jsx
│   │   │   ├── EntityCard.jsx
│   │   │   ├── PublicNavbar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── ThemeToggle.jsx
│   │   │   └── UploadProcessor.jsx
│   │   ├── services/           # API service layer
│   │   │   ├── api.js          # Base API client
│   │   │   ├── authService.js
│   │   │   ├── uploadService.js
│   │   │   ├── resultService.js
│   │   │   ├── actionItemService.js
│   │   │   └── index.js
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── authContextObject.jsx
│   │   │   ├── AuthProvider.jsx
│   │   │   ├── ThemeProvider.jsx
│   │   │   ├── useAuth.jsx
│   │   │   └── useTheme.jsx
│   │   ├── layouts/
│   │   │   ├── AppLayout.jsx
│   │   │   └── PublicLayout.jsx
│   │   ├── lib/
│   │   │   └── motionPresets.js
│   │   ├── data/
│   │   │   └── mockData.js
│   │   └── assets/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── .env.local (local development)
├── uploads/                    # Uploaded audio files
├── .env                        # Backend environment variables
├── .env.local                  # Frontend env (development)
├── .env.production             # Frontend env (production)
├── requirements.txt            # Python dependencies
├── pyvenv.cfg                  # Python venv config
├── INTEGRATION.md              # Integration guide
├── API_ENDPOINTS.md            # API reference
├── QUICKSTART.md               # Quick start guide
├── run.bat                     # Windows startup script
├── run.sh                      # Unix/Mac startup script
└── README.md                   # Main documentation
```

## Integration Points

### 1. Authentication Flow

**Frontend:** `AuthPage.jsx` → `AuthContext.jsx` → `authService.js` → `api.js`

```javascript
// 1. User submits login form
await login(email, password)

// 2. AuthContext calls authService
const response = await authService.login(email, password)

// 3. authService uses API client
fetch(`${API_URL}/login`, {headers, body: formData})

// 4. Token stored in localStorage
localStorage.setItem('access_token', token)

// 5. Subsequent requests include token
headers['Authorization'] = `Bearer ${token}`
```

**Backend:** `main.py` → `auth.py` → CRUD → Database

```python
# 1. Login endpoint validates credentials
@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm):
    # 2. Lookup user in database
    db_user = crud.login_user(db, credentials)
    
    # 3. Create JWT token
    token = create_access_token(data={"user_id": db_user.id})
    
    # 4. Return token
    return {"access_token": token, "token_type": "bearer"}
```

### 2. File Upload & Processing Flow

**Frontend:** `DashboardPage.jsx` → API calls → Backend processing

```javascript
// Step 1: Upload file
const uploadRes = await fetch("/audio", {
  method: "POST",
  body: formData  // File upload
})
const {file_path} = await uploadRes.json()

// Step 2: Process file
const processRes = await fetch("/process", {
  method: "POST",
  body: JSON.stringify({file_path, file_name})
})
const result = await processRes.json()
// result includes: meeting_id, transcript, action_items
```

**Backend:** `upload_routes.py` → services

```python
# 1. Save uploaded file
@router.post("/audio")
async def upload_audio(file: UploadFile):
    # Save to disk
    # Return file_path

# 2. Process meeting
@router.post("/process") 
async def process_meeting(data):
    # 1. Transcribe audio using AWS
    transcript = transcribe_audio(file_path)
    
    # 2. Create meeting record
    meeting = Meeting(...)
    
    # 3. Extract action items using NLP
    items = extract_action_items(transcript)
    
    # 4. Save to database
    db.add(meeting)
    db.add(items)
    
    # 5. Return results
    return {..., action_items}
```

### 3. Data Retrieval Flow

**Frontend:** Services → API calls → Backend routes → Database

```javascript
// 1. Component requests data
const results = await resultService.getMeetingResults(meetingId)

// 2. Service calls API
api.get(`/results/${meetingId}`)

// 3. API client sends authenticated request
fetch(url, {headers: {Authorization: `Bearer ${token}`}})
```

**Backend:** Route → Auth check → Database query → Response

```python
# 1. Route with auth dependency
@router.get("/results/{meeting_id}")
def get_result(
    meeting_id: int,
    current_user=Depends(get_current_user),  # Auth check
    db: Session = Depends(get_db)
):
    # 2. Query database
    result = db.query(Result).filter(...).first()
    
    # 3. Return data
    return result
```

## Setup Instructions

See [INTEGRATION.md](./INTEGRATION.md) for detailed setup instructions.

Quick version:
```bash
# 1. Backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd backend && uvicorn app.main:app --reload

# 2. Frontend (new terminal)
cd frontend
npm install
echo "VITE_API_BASE_URL=http://127.0.0.1:8000" > .env.local
npm run dev
```

## Deployment Guide

### Backend Deployment (Production)

1. **Choose hosting:** Heroku, AWS, Railway, etc.
2. **Set environment variables** with production database
3. **Update CORS origins** to include production frontend URL
4. **Run migrations** if needed
5. **Deploy:** Follow platform-specific instructions

### Frontend Deployment (Production)

1. **Build for production:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Update API URL** in `.env.production`

3. **Deploy to static hosting:** Vercel, Netlify, GitHub Pages, etc.

## Development Workflow

1. **Start both servers** (use run.bat or run.sh)
2. **Make backend changes** - Restart uvicorn (auto-reload)
3. **Make frontend changes** - Vite auto-refreshes
4. **Test in browser** at http://127.0.0.1:5173
5. **Check Console** (F12) for errors

## Key Integration Features

✅ **CORS Enabled** - Frontend and backend can communicate
✅ **JWT Authentication** - Secure token-based auth
✅ **API Service Layer** - Clean separation of concerns
✅ **Error Handling** - Consistent error responses
✅ **Loading States** - User feedback during API calls
✅ **Environment Configuration** - Different configs per environment

