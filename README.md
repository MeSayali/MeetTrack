# 📅 Automated Meeting Outcome Tracker

A smart web application that automatically processes meeting audio files and extracts useful information like summaries, transcripts, and action items—saving you time on post-meeting analysis.

---

## 🎯 What This Project Does

Upload a meeting recording → System automatically extracts summaries, action items, and key insights → View everything in a clean dashboard.

### Key Features
- 🎙️ **Upload** meeting audio files (MP3, WAV, etc.)
- 📝 **Automatic Transcription** - converts speech to text
- 📄 **Meeting Summaries** - AI-generated key points
- ✅ **Action Items** - extracts who needs to do what and by when
- 👤 **User Profiles** - manage your account and meetings
- 📊 **Dashboard** - view all your meetings and insights
- 🔐 **Secure Authentication** - JWT-based login system

---

## 🛠️ Technologies Used

### **Backend (What runs on the server)**
| Technology | Purpose |
|-----------|---------|
| **Python** | Programming language for backend |
| **FastAPI** | Web framework - receives requests and sends responses |
| **PostgreSQL** | Database - stores users, meetings, summaries, action items |
| **SQLAlchemy** | Database connector - helps Python talk to PostgreSQL |
| **JWT (JSON Web Tokens)** | Authentication - secure login system |
| **Whisper** | Converts speech to text from audio files |

| **Google Gemini API** | AI that extracts summaries and action items |

### **Frontend (What you see in browser)**
| Technology | Purpose |
|-----------|---------|
| **React 19** | JavaScript framework for UI |
| **Vite** | Build tool - bundles code for browsers |
| **Tailwind CSS** | Styling - makes it look nice |
| **React Router** | Navigation between pages |
| **Framer Motion** | Animations and smooth transitions |
| **Radix UI** | Pre-built UI components (buttons, dialogs, etc.) |
| **Recharts** | Data visualization - shows graphs |
| **Fetch API** | Communicates with backend |

---

## 📊 How Everything Works (Step by Step)

### **Step 1: User Registration & Login**
```
User visits website
  ↓
Enters email & password
  ↓
Frontend sends to Backend API
  ↓
Backend checks PostgreSQL database
  ↓
If new user → creates account with hashed password
  ↓
Returns JWT token (secure key for authentication)
  ↓
User logged in! ✅
```

### **Step 2: Uploading an Audio File**
```
User clicks "Upload Meeting"
  ↓
Selects MP3/WAV file from computer
  ↓
Frontend sends file to Backend
  ↓
Backend receives file and stores it in AWS S3 (cloud storage)
  ↓
Backend creates a "Meeting" record in PostgreSQL database
  ↓
Returns meeting ID to frontend
  ↓
Upload complete! ✅
```

### **Step 3: Processing the Audio (The Magic Part!)**
```
Backend receives audio file
  ↓
Sends file to AWS Transcribe service
  ↓
AWS listens to audio and converts speech → text
  ↓
Backend receives transcript back
  ↓
Stores transcript in PostgreSQL database
  ↓
Sends transcript to Google Gemini AI
  ↓
Gemini reads transcript and:
   - Generates summary of meeting
   - Extracts action items (who, what, deadline)
   - Identifies key discussion points
  ↓
Stores all results in database
  ↓
Processing complete! ✅
```

### **Step 4: Viewing Results**
```
User goes to Dashboard
  ↓
Frontend requests all meetings from Backend API
  ↓
Backend queries database for user's meetings
  ↓
Returns list with:
   - Meeting title
   - Date & time
   - Summary
   - Action items
   - Transcript
  ↓
Frontend displays data in nice format
  ↓
User can click any meeting to see full details
```

---

## 📁 Project Structure Explained

```
Automated-Meeting-Outcome-Tracker/
│
├── backend/                     # Server code (Python)
│   ├── app/
│   │   ├── main.py             # Main application entry point
│   │   ├── auth.py             # Login/authentication logic
│   │   ├── database.py         # PostgreSQL connection
│   │   ├── models.py           # Database table definitions
│   │   └── crud.py             # Create, Read, Update, Delete operations
│   │
│   ├── routes/                 # API endpoints
│   │   ├── upload_routes.py    # Handle file uploads
│   │   ├── process_routes.py   # Process audio to text
│   │   ├── result_routes.py    # Get summaries & results
│   │   ├── action_item_routes.py  # Manage action items
│   │   └── meeting_routes.py   # Meeting operations
│   │
│   ├── services/               # Business logic (heavy lifting)
│   │   ├── ai_service.py       # Google Gemini AI integration
│   │   ├── transcribe_service.py  # AWS Transcribe integration
│   │   ├── summary_service.py  # Generate summaries
│   │   ├── nlp_service.py      # Text processing
│   │   └── notification_service.py # Send notifications
│   │
│   └── models/                 # Data structure definitions
│       ├── user.py             # User database table
│       ├── meeting.py          # Meeting database table
│       ├── transcript.py       # Transcript storage
│       ├── action_item.py      # Action items storage
│       └── result.py           # Meeting results storage
│
├── frontend/                   # Website code (React)
│   ├── src/
│   │   ├── pages/             # Web pages
│   │   │   ├── LandingPage.jsx    # Homepage
│   │   │   ├── AuthPage.jsx       # Login/Register
│   │   │   ├── DashboardPage.jsx  # Main dashboard
│   │   │   ├── HistoryPage.jsx    # Past meetings
│   │   │   └── ProfilePage.jsx    # User profile
│   │   │
│   │   ├── components/        # Reusable UI parts
│   │   │   ├── ActionItemCard.jsx # Display action items
│   │   │   ├── EntityCard.jsx     # Show extracted info
│   │   │   └── UploadProcessor.jsx # Upload widget
│   │   │
│   │   ├── services/          # API communication
│   │   │   ├── api.js         # Base API setup
│   │   │   ├── authService.js # Login/Register calls
│   │   │   ├── uploadService.js # Upload calls
│   │   │   └── resultService.js  # Get results calls
│   │   │
│   │   ├── context/           # Global state management
│   │   │   ├── AuthContext.jsx    # User login state
│   │   │   └── ThemeProvider.jsx  # Dark/light mode
│   │   │
│   │   └── App.jsx            # Main app component
│   │
│   └── vite.config.js         # Frontend build settings
│
├── requirements.txt           # Python packages list
├── .env                       # Secret keys & configuration
└── README.md                  # This file!
```

---

## 🚀 How to Run the Project

### **Quick Start (Easiest Way)**

**Windows:**
```bash
run.bat
```

**Mac/Linux:**
```bash
chmod +x run.sh
./run.sh
```

This automatically:
- Sets up Python environment
- Installs all packages
- Starts backend on `http://127.0.0.1:8000`
- Starts frontend on `http://127.0.0.1:5173`

### **Manual Setup**

**Backend Setup:**
```bash
# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Mac/Linux

# Install packages
pip install -r requirements.txt

# Start server
cd backend
uvicorn app.main:app --reload --port 8000
```

**Frontend Setup:**
```bash
# Navigate to frontend
cd frontend

# Install packages
npm install

# Start dev server
npm run dev
```

---

## ⚙️ Configuration (Important Settings)

Create a `.env` file in project root with:

```env
# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/meeting_db

# AWS Transcription
AWS_REGION=ap-south-1
AWS_ACCESS_KEY=your_aws_key
AWS_SECRET_KEY=your_aws_secret
TRANSCRIBE_BUCKET=your-s3-bucket
TRANSCRIBE_ROLE_ARN=arn:aws:iam::account:role/service-role

# Google AI (for summaries & action items)
GEMINI_API_KEY=your_google_gemini_api_key

# JWT Authentication
SECRET_KEY=your_random_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

---

## 📡 API Endpoints (What Frontend Calls)

### **Authentication**
| Endpoint | What it does |
|----------|-------------|
| `POST /register` | Create new account |
| `POST /login` | Login user |
| `GET /me` | Get current user info |

### **Meetings**
| Endpoint | What it does |
|----------|-------------|
| `GET /meetings` | List all your meetings |
| `GET /meetings/{id}` | Get specific meeting |
| `POST /meetings` | Create new meeting |
| `DELETE /meetings/{id}` | Delete meeting |

### **Upload & Processing**
| Endpoint | What it does |
|----------|-------------|
| `POST /audio/upload` | Upload audio file |
| `POST /process` | Send audio for transcription |
| `GET /process/status/{id}` | Check processing status |

### **Results**
| Endpoint | What it does |
|----------|-------------|
| `GET /results/{meeting_id}` | Get meeting summary |
| `GET /insights/{meeting_id}` | Get extracted insights |
| `GET /action-items/{meeting_id}` | Get action items |

---

## 🔄 Data Flow Summary

```
User → Frontend → Backend API → Database & External Services → Results → Frontend Display

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  1. USER UPLOADS FILE                                           │
│     └─→ File saved to AWS S3                                   │
│     └─→ Meeting record created in database                     │
│                                                                 │
│  2. TRANSCRIPTION (AWS Transcribe)                             │
│     └─→ Audio file sent to AWS                                 │
│     └─→ AWS returns text transcript                            │
│     └─→ Transcript saved in database                           │
│                                                                 │
│  3. AI ANALYSIS (Google Gemini)                                │
│     └─→ Transcript sent to Gemini AI                           │
│     └─→ AI generates: Summary, Action Items, Key Points        │
│     └─→ Results saved in database                              │
│                                                                 │
│  4. USER VIEWS DASHBOARD                                       │
│     └─→ Frontend requests data from backend                    │
│     └─→ Backend retrieves from database                        │
│     └─→ Frontend displays beautifully                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎓 Understanding Key Components

### **Database (PostgreSQL)**
- Stores all permanent data
- Tables: users, meetings, transcripts, action_items, results
- Each user has their own meetings
- Everything is linked by IDs

### **FastAPI Backend**
- Receives requests from frontend
- Validates user authentication (JWT)
- Calls external services (AWS, Google)
- Stores/retrieves data from database
- Sends responses back to frontend

### **React Frontend**
- Users interact with this
- Sends requests to backend
- Displays results beautifully
- Manages user sessions

### **External Services**
- **AWS Transcribe**: Converts audio → text (costs money)
- **Google Gemini**: AI that extracts summaries & action items (costs money)
- **AWS S3**: Stores audio files (costs money)

---

## 🔐 Security Features

- **JWT Authentication**: Only logged-in users can see their data
- **Hashed Passwords**: Passwords never stored as plain text
- **CORS Security**: Frontend can only talk to authorized backend
- **Database Queries**: Protected from SQL injection
- **Environment Variables**: Secret keys never in code

---

## 📝 Typical User Journey

```
1. User visits website → Sees landing page
2. Clicks Register → Creates account → Gets logged in
3. Dashboard appears → Sees empty meeting list
4. Clicks "Upload Meeting" → Selects audio file
5. Waits for processing (30 seconds to 2 minutes)
6. Sees results: Summary, Transcript, Action Items
7. Can view past meetings in History
8. Can edit profile settings
```

---

## 🤝 How Services Work Together

```
┌──────────────┐
│  User Action │
└──────┬───────┘
       │
       ▼
┌─────────────────────┐
│   Frontend React    │ ← Displays UI, handles clicks
└──────────┬──────────┘
           │
           ▼ (HTTP Request)
┌─────────────────────┐
│  FastAPI Backend    │ ← Receives requests, validates auth
└──────────┬──────────┘
           │
           ├──→ [SQLAlchemy ORM] → PostgreSQL (database)
           │
           ├──→ [AI Service] → Google Gemini (AI extraction)
           │
           ├──→ [Transcribe Service] → AWS Transcribe (speech→text)
           │
           └──→ [Storage Service] → AWS S3 (file storage)
           │
           ▼ (HTTP Response)
┌─────────────────────┐
│  Frontend React     │ ← Displays results
└─────────────────────┘
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't connect to backend | Check if backend is running on port 8000 |
| Database errors | Make sure PostgreSQL is running |
| AWS Transcribe fails | Check AWS credentials in .env |
| Gemini API errors | Check GEMINI_API_KEY is valid |
| Frontend won't load | Check if frontend is running on port 5173 |
| Login not working | Clear browser cache and try again |

---

## 📚 Documentation Files

- `ARCHITECTURE.md` - Detailed system design
- `API_ENDPOINTS.md` - All API endpoint specifications
- `INTEGRATION_CHECKLIST.md` - Setup checklist
- `QUICKSTART.md` - Step-by-step setup guide

---

## 🤖 How AI Extraction Works

**Gemini AI reads the transcript and extracts:**

1. **Summary** - Key points in bullet format
2. **Action Items** - Who needs to do what by when
3. **Participants** - People mentioned in meeting
4. **Topics** - Main subjects discussed
5. **Decisions** - Important conclusions made

All in under 1 minute! 🚀

---

## 💡 In Simple Words

Think of this project like a smart assistant for meetings:

1. **You**: "Here's my meeting recording"
2. **System**: "Let me listen and take notes..."
3. **System**: "Done! Here's what happened, who needs to do what, and by when"
4. **You**: "Perfect! See you next meeting" ✅

---

## 📞 Questions?

- Check `QUICKSTART.md` for setup help
- Check `API_ENDPOINTS.md` for API details
- Check `ARCHITECTURE.md` for technical deep dive
