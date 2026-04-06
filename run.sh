#!/bin/bash

# Automated Meeting Outcome Tracker - Startup Script for Unix/Mac

echo "============================================"
echo " Automated Meeting Outcome Tracker"
echo " Startup Script"
echo "============================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

echo "[1/5] Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

echo "[2/5] Activating virtual environment..."
source venv/bin/activate

echo "[3/5] Installing backend dependencies..."
pip install -r requirements.txt

echo "[4/5] Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "[5/5] Starting services..."
echo ""
echo "============================================"
echo "Backend will start on: http://127.0.0.1:8000"
echo "Frontend will start on: http://127.0.0.1:5173"
echo "============================================"
echo ""

# Start backend in background
echo "Starting backend server..."
(cd backend && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000) &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend in background
echo "Starting frontend dev server..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "Services are starting in background"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop the services, run: kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
