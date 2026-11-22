# DestinationCampaign AI Launcher Script
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "DestinationCampaign AI – Travel Marketing Visual Generator" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

$backendDir = Join-Path $PSScriptRoot "backend"
$frontendDir = Join-Path $PSScriptRoot "frontend"

Write-Host "1. Checking environment..." -ForegroundColor Green
& python --version
& node --version

Write-Host "2. Starting Backend server on http://127.0.0.1:5000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; python app.py"

Start-Sleep -Seconds 3

Write-Host "3. Starting Frontend dev server on http://localhost:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev"

Write-Host "`nApp successfully launched!" -ForegroundColor Green
Write-Host "Backend API:  http://127.0.0.1:5000" -ForegroundColor Cyan
Write-Host "Frontend App: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Demo Login:   demo@destinationcampaign.ai / demo123" -ForegroundColor Yellow
