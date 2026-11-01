#!/usr/bin/env bash
# SellSync — Unified Commerce Management Platform Runner
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
echo "=================================================="
echo " Starting SellSync Commerce Platform"
echo "=================================================="

# Function to clean up background processes on exit
cleanup() {
    echo ""
    echo "Stopping SellSync services..."
    kill $(jobs -p) 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Start Backend
echo "-> Starting Backend (FastAPI on http://127.0.0.1:8000)..."
cd "$DIR/backend"
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    ./venv/bin/pip install -r requirements.txt
fi
./venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

# Start Frontend
echo "-> Starting Frontend (Vite on http://127.0.0.1:5173)..."
cd "$DIR/frontend"
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
npm run dev -- --host 127.0.0.1 --port 5173 &
FRONTEND_PID=$!

echo ""
echo "SellSync is live!"
echo "-> Frontend UI:        http://127.0.0.1:5173"
echo "-> Backend API Docs:   http://127.0.0.1:8000/docs"
echo "Press Ctrl+C to stop both servers."
echo "=================================================="

wait
