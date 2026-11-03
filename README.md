from pathlib import Path

readme = r'''# 📅 Automated Meeting Outcome Tracker

A web application that processes meeting audio recordings and helps users review what happened in a meeting. It converts audio into text, extracts useful information such as action items, and makes the results available through a dashboard.

---

## 🎯 What This Project Does

Upload a meeting recording → transcribe the audio → process the transcript → view the meeting information and action items.

### Key Features

- 🎙️ Upload meeting audio files (such as MP3 and WAV)
- 📝 Automatic transcription using **OpenAI Whisper**
- 📄 Review meeting summaries and important information
- ✅ Extract action items, including the task, assignee, and deadline when available
- 👤 Register and log in to a user account
- 📊 View meetings and their processed results
- 🔐 JWT-based authentication
- 📧 Send meeting updates and action-item notifications through **n8n automation**

---

## 🛠️ Technologies Used

### Backend

| Technology | Purpose |
|---|---|
| **Python** | Main backend programming language |
| **FastAPI** | Builds REST APIs and handles frontend requests |
| **OpenAI Whisper** | Converts meeting audio into text |
| **NLP** | Processes the transcript and identifies useful information |
| **Regex** | Helps identify patterns such as task-related phrases, names, and dates |
| **spaCy** | NLP library used for text processing and entity-related extraction |
| **PostgreSQL** | Stores users, meetings, transcripts, results, and action items |
| **SQLAlchemy** | ORM used to interact with the PostgreSQL database |
| **JWT** | Handles user authentication |

### Frontend

| Technology | Purpose |
|---|---|
| **React** | Builds the user interface |
| **Vite** | Frontend development and build tool |
| **Tailwind CSS** | Styles the application |
| **React Router** | Handles navigation between pages |
| **Framer Motion** | Adds UI animations |
| **Radix UI** | Provides accessible UI components |
| **Recharts** | Displays charts and visual information |
| **Fetch API** | Sends requests to the backend REST APIs |

### Automation

| Technology | Purpose |
|---|---|
| **n8n** | Automates email notifications and delivery of meeting minutes/action items |

---

## 📊 How the Application Works

### Step 1: User Registration and Login

1. The user opens the application.
2. The user registers or logs in with their email and password.
3. The frontend sends the details to the FastAPI backend.
4. The backend validates the details and interacts with PostgreSQL.
5. After successful authentication, the backend returns a JWT token.
6. The frontend uses the token for protected API requests.

### Step 2: Uploading a Meeting Recording

1. The user selects a meeting audio file.
2. The frontend sends the file to the backend through an API request.
3. FastAPI receives the uploaded file.
4. The backend creates or updates the meeting record in PostgreSQL.
5. The audio is passed to the transcription service.

### Step 3: Audio Transcription

1. The backend sends the audio to **OpenAI Whisper**.
2. Whisper converts the spoken content into text.
3. The backend receives the transcript.
4. The transcript is stored in PostgreSQL for later access and processing.

### Step 4: NLP Processing and Action-Item Extraction

1. The transcript is passed to the NLP processing logic.
2. **Regex** is used to identify relevant text patterns.
3. **spaCy** helps process the text and identify useful entities.
4. The extraction logic identifies action-related information, such as:
   - The task that needs
