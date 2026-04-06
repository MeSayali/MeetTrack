# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL (for production) or SQLite (for development)

### 1. Clone & Navigate
```bash
cd Automated-Meeting-Outcome-Tracker
```

### 2. Run Startup Script

**Windows:**
```bash
run.bat
```

**Mac/Linux:**
```bash
chmod +x run.sh
./run.sh
```

This will:
- Create Python virtual environment
- Install backend dependencies
- Install frontend dependencies
- Start backend server on http://127.0.0.1:8000
- Start frontend dev server on http://127.0.0.1:5173

### 3. Open in Browser
Navigate to: **http://127.0.0.1:5173**

### 4. Create Account & Test
1. Click **Register**
2. Enter email and password
3. Upload an MP3 file
4. Wait for analysis
5. View results

## 📋 Manual Setup

### Backend

```bash
# 1. Create virtual environment
python -m venv venv

# 2. Activate it
source venv/bin/activate  # Mac/Linux
# or
venv\Scripts\activate.bat  # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set environment variables
# Create .env file with database credentials

# 5. Start server
cd backend
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env.local
echo "VITE_API_BASE_URL=http://127.0.0.1:8000" > .env.local

# 4. Start dev server
npm run dev
```

## 🔧 Configuration

### Backend Configuration
Edit `.env`:
```
DATABASE_URL=postgresql://user:pass@localhost:5432/db_name
AWS_REGION=ap-south-1
AWS_ACCESS_KEY=your_key
AWS_SECRET_KEY=your_secret
TRANSCRIBE_BUCKET=bucket_name
TRANSCRIBE_ROLE_ARN=arn:aws:iam::account:role/role-name
GEMINI_API_KEY=your_api_key
```

### Frontend Configuration
Create `frontend/.env.local`:
```
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_API_TIMEOUT=30000
```

## 🌐 Access Points

- **Frontend:** http://127.0.0.1:5173
- **Backend API:** http://127.0.0.1:8000
- **API Docs:** http://127.0.0.1:8000/docs

## 📚 Documentation

- [Integration Guide](./INTEGRATION.md) - Detailed architecture and setup
- [API Endpoints](./API_ENDPOINTS.md) - Complete API reference

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is already in use
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process or use different port
uvicorn app.main:app --port 8001
```

### Frontend can't connect to backend
1. Check backend is running: `http://127.0.0.1:8000`
2. Check `.env.local` has correct API URL
3. Check browser console for errors (F12)

### Database connection error
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in `.env` is correct
3. Verify database exists

## 📦 Project Structure

```
.
├── backend/              # FastAPI backend
│   ├── app/             # Main application
│   ├── routes/          # API routes
│   ├── models/          # Database models
│   ├── services/        # Business logic
│   └── schemas/         # Pydantic schemas
├── frontend/            # React frontend
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # UI components
│   │   ├── services/    # API service layer
│   │   └── context/     # React context
│   └── public/          # Static assets
├── .env                 # Environment variables
├── requirements.txt     # Python dependencies
└── README.md           # Main documentation
```

## 🎯 Next Steps

1. **Explore Features:**
   - Upload meeting recordings
   - Generate summaries
   - Track action items
   - View insights

2. **Customize:**
   - Update branding in frontend
   - Configure AWS services
   - Add custom NLP models

3. **Deploy:**
   - Follow deployment guide in INTEGRATION.md
   - Set up production database
   - Configure production environment variables

## 🤝 Support

For issues:
1. Check documentation files
2. Review browser console (F12)
3. Check backend terminal output
4. Verify all services are running

Happy analyzing! 🎉
