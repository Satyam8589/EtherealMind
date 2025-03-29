@echo off
echo Installing backend dependencies...
npm install
echo.
echo Creating initial .env file...
echo PORT=5000 > .env
echo MONGODB_URI=mongodb://localhost:27017/etherealmind >> .env
echo NODE_ENV=development >> .env
echo.
echo Setup complete!
echo Run "npm run dev" to start the development server
pause 