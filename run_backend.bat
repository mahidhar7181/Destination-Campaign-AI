@echo off
echo ========================================================
echo Starting DestinationCampaign AI Backend (Flask)
echo ========================================================
cd /d "%~dp0backend"
set FLASK_APP=app.py
set FLASK_DEBUG=True
python app.py
pause
