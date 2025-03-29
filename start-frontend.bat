@echo off
echo Starting EtherealMind Frontend...

REM Kill any processes specifically using our port
for /f "tokens=5" %%a in ('netstat -ano ^| find ":5173" ^| find "LISTENING"') do (
    echo Killing process on port 5173 with PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

cd frontend
npm run dev 