@echo off
echo ===================================================
echo        SIMPLE START FOR ETHEREALMIND
echo ===================================================

echo.
echo Force closing all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo Starting backend (no window title)...
start cmd /c "cd backend && npm run dev"

echo.
echo Waiting 15 seconds for backend to start...
timeout /t 15 /nobreak > nul

echo.
echo Starting frontend (no window title)...
start cmd /c "cd frontend && npm run dev"

echo.
echo ===================================================
echo Both services should now be starting
echo ===================================================
echo.
echo IMPORTANT: Wait about 30 seconds for everything to initialize
echo.
echo Frontend: http://localhost:5173
echo Backend: http://127.0.0.1:8080
echo.
echo =================================================== 