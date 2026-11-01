# SellSync - Windows PowerShell Runner
$ErrorActionPreference = "Stop"
$DIR = $PSScriptRoot

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Starting SellSync Commerce Platform" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Backend
Write-Host "-> Starting Backend (FastAPI on http://127.0.0.1:8000)..." -ForegroundColor Green
$backendVenv = Join-Path $DIR "backend\venv\Scripts\python.exe"
if (-not (Test-Path $backendVenv)) {
    Write-Host "Setting up Python virtual environment..."
    Set-Location (Join-Path $DIR "backend")
    python -m venv venv
    & (Join-Path $DIR "backend\venv\Scripts\pip.exe") install -r requirements.txt
}

$backendProc = Start-Process -FilePath $backendVenv -ArgumentList "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload" -WorkingDirectory (Join-Path $DIR "backend") -PassThru

# Frontend
Write-Host "-> Starting Frontend (Vite on http://127.0.0.1:5173)..." -ForegroundColor Green
$frontendNodeModules = Join-Path $DIR "frontend\node_modules"
if (-not (Test-Path $frontendNodeModules)) {
    Write-Host "Installing frontend npm packages..."
    Set-Location (Join-Path $DIR "frontend")
    npm install
}

$frontendProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm run dev -- --host 127.0.0.1 --port 5173" -WorkingDirectory (Join-Path $DIR "frontend") -PassThru

Write-Host ""
Write-Host "SellSync is live!" -ForegroundColor Yellow
Write-Host "-> Frontend UI:        http://127.0.0.1:5173" -ForegroundColor Yellow
Write-Host "-> Backend API Docs:   http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "Press Ctrl+C or close the window to stop." -ForegroundColor Gray
Write-Host "==================================================" -ForegroundColor Cyan

try {
    Wait-Process -Id $backendProc.Id, $frontendProc.Id
} finally {
    Write-Host "`nStopping SellSync services..." -ForegroundColor Red
    Stop-Process -Id $backendProc.Id -ErrorAction SilentlyContinue
    Stop-Process -Id $frontendProc.Id -ErrorAction SilentlyContinue
}
