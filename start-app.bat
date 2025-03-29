@echo off
echo Starting EtherealMind Application...

REM Kill any existing Node processes to free up ports
echo Terminating any existing Node.js processes to free up ports...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak > nul

REM Kill any processes specifically using our ports
for /f "tokens=5" %%a in ('netstat -ano ^| find ":4000" ^| find "LISTENING"') do (
    echo Killing process on port 4000 with PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| find ":5173" ^| find "LISTENING"') do (
    echo Killing process on port 5173 with PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Starting Backend on port 4000...
start "EtherealMind Backend" cmd /k "cd backend && npm run dev"

echo.
echo Waiting for backend to initialize (5 seconds)...
timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend...
start "EtherealMind Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Services started! Access your application at:
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:4000
echo.
echo Check the opened terminal windows for detailed logs. 