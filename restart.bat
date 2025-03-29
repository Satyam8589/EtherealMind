@echo off
echo ===================================================
echo           RESTARTING ETHEREALMIND
echo ===================================================

echo.
echo Making sure all Node.js processes are stopped...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak > nul

echo.
echo Making sure ports 8080 and 5173 are free...
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') DO (
    echo Killing process on port 8080: %%P
    taskkill /F /PID %%P >nul 2>&1
)
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') DO (
    echo Killing process on port 5173: %%P
    taskkill /F /PID %%P >nul 2>&1
)
timeout /t 1 /nobreak > nul

echo.
echo Starting backend on port 8080...
start "EtherealMind Backend" cmd /k "cd backend && echo STARTING BACKEND... && npm run dev"

echo.
echo Waiting for backend to fully initialize...
timeout /t 12 /nobreak > nul

echo.
echo Checking if backend is running...
curl -s http://localhost:8080/health
IF %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Backend check failed! Starting frontend anyway...
) ELSE (
    echo [SUCCESS] Backend is running!
)

echo.
echo Starting frontend on port 5173...
start "EtherealMind Frontend" cmd /k "cd frontend && echo STARTING FRONTEND... && npm run dev"

echo.
echo ===================================================
echo           APPLICATION STARTED
echo ===================================================
echo.
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8080/api
echo Health Check: http://localhost:8080/health
echo.
echo Troubleshooting:
echo 1. If you see "Backend connection unavailable" message:
echo    - Try accessing http://localhost:8080/health in your browser
echo    - If it doesn't work, check the backend command window for errors
echo 2. If you need to restart, close all windows and run this script again
echo =================================================== 