@echo off
echo ========================================
echo   Starting EtherealMind Application    
echo ========================================

REM Kill any existing Node.js processes
echo Terminating any existing Node.js processes...
taskkill /F /IM node.exe 2>nul
echo Waiting for processes to terminate...
timeout /t 3 /nobreak > nul

REM Clear npm cache to avoid stale modules
echo Clearing npm cache...
call npm cache clean --force

REM Make sure the ports we need are free
echo Checking for port availability...
for /f "tokens=5" %%a in ('netstat -ano ^| find ":3001" ^| find "LISTENING"') do (
    echo Killing process on port 3001 with PID: %%a
    taskkill /F /PID %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| find ":5173" ^| find "LISTENING"') do (
    echo Killing process on port 5173 with PID: %%a
    taskkill /F /PID %%a 2>nul
)

echo ========================================
echo   Starting Backend Server (port 3001)
echo ========================================
start cmd /k "cd backend && title EtherealMind Backend && npm run dev"

REM Give backend time to start up
echo Waiting for backend to initialize (10 seconds)...
timeout /t 10 /nobreak > nul

REM Check if backend is running
echo Checking if backend is responding...
curl -s http://localhost:3001/health > nul
if %errorlevel% neq 0 (
    echo Backend is not responding. Continuing anyway, but you may see connection errors.
) else (
    echo Backend is up and running!
)

echo ========================================
echo   Starting Frontend Server (port 5173)
echo ========================================
start cmd /k "cd frontend && title EtherealMind Frontend && npm run dev"

echo ========================================
echo   Application Started Successfully
echo ========================================
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:3001
echo.
echo You can close this window now. 