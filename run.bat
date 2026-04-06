@echo off
REM Automated Meeting Outcome Tracker - Startup Script for Windows

echo ============================================
echo  Automated Meeting Outcome Tracker
echo  Startup Script
echo ============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo [1/5] Creating virtual environment...
if not exist venv (
    python -m venv venv
)

echo [2/5] Activating virtual environment...
call venv\Scripts\activate.bat

echo [3/5] Installing backend dependencies...
pip install -r requirements.txt

echo [4/5] Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo [5/5] Starting services...
echo.
echo ============================================
echo Backend will start on: http://127.0.0.1:8000
echo Frontend will start on: http://127.0.0.1:5173
echo ============================================
echo.

REM Start backend in new terminal
echo Starting backend server...
start cmd /k "call venv\Scripts\activate.bat && cd backend && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

REM Wait a bit for backend to start
timeout /t 3 /nobreak

REM Start frontend in new terminal
echo Starting frontend dev server...
start cmd /k "cd frontend && npm run dev"

echo.
echo Servers are starting. Check the terminals for more details.
echo Press any key to continue...
pause
