@echo off
echo ============================
echo RESTARTING ALL SERVICES
echo ============================

echo Killing all node processes...
taskkill /F /IM node.exe 2>nul
echo Waiting for processes to end...
timeout /t 3 /nobreak > nul

echo Starting backend (port 5000)...
start cmd /k "cd backend && npm run dev"

echo Waiting for backend to initialize...
timeout /t 8 /nobreak > nul

echo Starting frontend...
start cmd /k "cd frontend && npm run dev"

echo ============================
echo All services started!
echo ============================
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000 