@echo off
echo Starting EtherealMind Backend on port 4000...

REM Kill any processes specifically using our port
for /f "tokens=5" %%a in ('netstat -ano ^| find ":4000" ^| find "LISTENING"') do (
    echo Killing process on port 4000 with PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

cd backend
npm run dev 