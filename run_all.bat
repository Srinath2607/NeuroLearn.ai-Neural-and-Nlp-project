@echo off
echo ===================================================
echo   Starting NeuroLearn AI Platform Stack
echo ===================================================

echo.
echo [1/3] Starting Python FastAPI AI Service...
start "NeuroLearn - AI Service (Port 8000)" cmd /k "cd ai-service && venv\Scripts\python main.py"

echo [2/3] Starting Express Backend Service...
start "NeuroLearn - Express Backend (Port 5001)" cmd /k "cd backend && npm run dev"

echo [3/3] Starting Next.js Frontend...
start "NeuroLearn - Next.js Frontend (Port 3000)" cmd /k "cd frontend && set NODE_OPTIONS=--max-old-space-size=1536 && npm run dev"

echo.
echo ===================================================
echo   All services are launching in separate windows!
echo   Frontend -> http://localhost:3000
echo   To stop a service, simply close its window.
echo ===================================================
echo.
pause

