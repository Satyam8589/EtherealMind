@echo off
echo EtherealMind - Full Application Setup
echo ====================================
echo.

echo Setting up frontend...
cd frontend
call npm install
cd ..

echo.
echo Setting up backend...
cd backend
call npm install

echo.
echo Creating initial .env file for backend...
echo PORT=5000 > .env
echo MONGODB_URI=mongodb://localhost:27017/etherealmind >> .env
echo NODE_ENV=development >> .env

cd ..

echo.
echo Setup complete!
echo.
echo To start the application:
echo 1. Start MongoDB server
echo 2. Run the backend: cd backend && npm run dev
echo 3. Run the frontend: cd frontend && npm run dev
echo.
pause 