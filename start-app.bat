@echo off
REM filepath: /home/user16/Dev/property-manager/start-app.bat

echo Starting Property Investment Manager...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js 18 or higher.
    echo Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node -v
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo .env file created
    echo.
)

REM Check if database exists
if not exist "prisma\dev.db" (
    echo Setting up database...
    call npm run db:generate
    call npm run db:push
    echo.
    
    echo Seeding demo data...
    call npm run db:seed
    echo.
)

echo Setup complete!
echo Starting development server...
echo Application will be available at http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev