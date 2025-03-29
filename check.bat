@echo off
echo ===================================================
echo             CONNECTION CHECK TOOL
echo ===================================================

echo.
echo Checking if backend is running on port 8080...
curl -s http://127.0.0.1:8080/health
IF %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Backend is NOT responding on http://127.0.0.1:8080/health
    echo - Please check if backend is running
    echo - Check backend console for errors
) ELSE (
    echo [SUCCESS] Backend is responding on http://127.0.0.1:8080/health
)

echo.
echo Checking if frontend is running on port 5173...
curl -s http://localhost:5173
IF %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Frontend is NOT responding on http://localhost:5173
    echo - Please check if frontend is running
    echo - Check frontend console for errors
) ELSE (
    echo [SUCCESS] Frontend is responding on http://localhost:5173
)

echo.
echo ===================================================
echo Testing backend connection from command line...
echo.
echo Using localhost:
curl -s http://localhost:8080/health
echo.
echo Using 127.0.0.1:
curl -s http://127.0.0.1:8080/health
echo.
echo ===================================================

echo.
echo If backend is running but frontend can't connect:
echo 1. Try manually opening http://127.0.0.1:8080/health in browser
echo 2. If it works in browser but not in app, check the CORS settings
echo 3. Try using the simple-start.bat script
echo ===================================================

pause 