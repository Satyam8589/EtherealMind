@echo off
REM EtherealMind Starter Script for Windows

REM Colors for terminal output
set GREEN=[92m
set YELLOW=[93m
set CYAN=[96m
set RED=[91m
set NC=[0m

REM Check for Node.js
echo %CYAN%==== Checking requirements ====%NC%
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo %RED%Error: Node.js is not installed%NC%
  echo Please install Node.js from: https://nodejs.org/
  exit /b 1
)

for /f "tokens=1,2,3 delims=." %%a in ('node -v') do (
  set NODE_VERSION=%%a.%%b.%%c
)
set NODE_VERSION=%NODE_VERSION:~1%
echo %GREEN%✓ Node.js%NC% (v%NODE_VERSION%)

REM Check for NPM
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo %RED%Error: npm is not installed%NC%
  echo Please install npm
  exit /b 1
)

for /f "tokens=1" %%a in ('npm -v') do (
  set NPM_VERSION=%%a
)
echo %GREEN%✓ npm%NC% (v%NPM_VERSION%)
echo.

REM Add shortcut scripts to start frontend and backend separately
echo %CYAN%==== Creating shortcut scripts ====%NC%
echo.

echo @echo off > start-frontend.bat
echo echo Starting frontend server... >> start-frontend.bat
echo cd frontend >> start-frontend.bat
echo npm run dev >> start-frontend.bat
echo %GREEN%Created start-frontend.bat%NC%

echo @echo off > start-backend.bat
echo echo Starting backend server... >> start-backend.bat
echo cd backend >> start-backend.bat
echo npm run dev >> start-backend.bat
echo %GREEN%Created start-backend.bat%NC%

echo.
echo %CYAN%==== Instructions ====%NC%
echo.
echo To start the frontend: %GREEN%.\start-frontend.bat%NC%
echo To start the backend: %GREEN%.\start-backend.bat%NC%
echo.

REM Start the backend server
echo %CYAN%==== Starting Backend Server ====%NC%
echo.

cd backend

REM Check if node_modules exists, if not, install dependencies
if not exist "node_modules\" (
  echo %YELLOW%Installing backend dependencies...%NC%
  call npm install
)

REM Start the server
echo %GREEN%Starting backend server...%NC%
start cmd /k "npm run dev"
echo Backend server started in a new window

REM Return to the parent directory
cd ..
echo.

REM Start the frontend server
echo %CYAN%==== Starting Frontend Server ====%NC%
echo.

cd frontend

REM Check if node_modules exists, if not, install dependencies
if not exist "node_modules\" (
  echo %YELLOW%Installing frontend dependencies...%NC%
  call npm install
)

REM Start the development server
echo %GREEN%Starting frontend development server...%NC%
start cmd /k "npm run dev"
echo Frontend server started in a new window

REM Return to the parent directory
cd ..
echo.

REM Wait a moment for servers to be fully ready
timeout /t 5 /nobreak > nul

REM Display health check information
echo %CYAN%==== Checking Service Health ====%NC%
echo.

REM Create a PowerShell compatible health check script
echo try { > check-health.ps1
echo   $response = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get >> check-health.ps1
echo   Write-Host "Backend is healthy!" >> check-health.ps1
echo   Write-Host ($response ^| ConvertTo-Json) >> check-health.ps1
echo } catch { >> check-health.ps1
echo   Write-Host "Failed to connect to backend: $_" -ForegroundColor Red >> check-health.ps1
echo } >> check-health.ps1

REM Execute the PowerShell script
echo %YELLOW%Checking backend health...%NC%
powershell -ExecutionPolicy Bypass -File check-health.ps1

echo.
echo %GREEN%✓ Frontend%NC% should be available at: http://localhost:3000
echo %GREEN%✓ Backend API%NC% should be available at: http://localhost:5000
echo.

REM Instructions for the user
echo %CYAN%==== EtherealMind is Running ====%NC%
echo.
echo Open %CYAN%http://localhost:3000%NC% in your browser to use the application
echo.
echo Close the server windows when you're done using the application
echo.

pause 