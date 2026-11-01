@echo off
setlocal
set "DIR=%~dp0"
title SellSync Local Launcher

echo ==================================================
echo   SellSync - One Click Local Launcher
echo ==================================================
echo.

where python >nul 2>nul
if errorlevel 1 (
  echo ERROR: Python was not found. Install Python 3.10 or newer and enable "Add Python to PATH".
  pause
  exit /b 1
)
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js was not found. Install Node.js 18 or newer, then run this file again.
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo ERROR: npm was not found. Reinstall Node.js 18 or newer.
  pause
  exit /b 1
)

if not exist "%DIR%backend\venv\Scripts\python.exe" (
  echo [1/4] Creating Python environment...
  pushd "%DIR%backend"
  python -m venv venv
  if errorlevel 1 (popd & echo Failed to create Python environment.& pause & exit /b 1)
  popd
)

if not exist "%DIR%backend\venv\Scripts\uvicorn.exe" (
  echo [2/4] Installing backend packages. This may take a few minutes...
  "%DIR%backend\venv\Scripts\python.exe" -m pip install --upgrade pip
  "%DIR%backend\venv\Scripts\python.exe" -m pip install -r "%DIR%backend\requirements.txt"
  if errorlevel 1 (echo Backend package installation failed.& pause & exit /b 1)
)

if not exist "%DIR%frontend\node_modules\vite" (
  echo [3/4] Installing frontend packages. This may take a few minutes...
  pushd "%DIR%frontend"
  call npm install
  if errorlevel 1 (popd & echo Frontend package installation failed.& pause & exit /b 1)
  popd
) else (
  echo [3/4] Frontend packages already present.
)

echo [4/4] Starting SellSync services...
start "SellSync Backend - FastAPI" /D "%DIR%backend" cmd /k ""%DIR%backend\venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
start "SellSync Frontend - Vite" /D "%DIR%frontend" cmd /k "npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo Waiting for the local website to start...
timeout /t 7 /nobreak >nul
start "" "http://127.0.0.1:5173"
echo.
echo SellSync should now be open in your browser.
echo Website: http://127.0.0.1:5173
echo API docs: http://127.0.0.1:8000/docs
echo.
echo Keep both service windows open while using SellSync.
echo Close those windows to stop the app.
echo ==================================================
pause
endlocal
