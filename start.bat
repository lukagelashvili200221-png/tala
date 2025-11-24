@echo off
REM Quick Start Script for Gold Trading Platform (Windows)
REM This script sets up and runs the application

echo.
echo 🚀 شروع سریع پلتفرم طلا آنلاین
echo ================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

echo ✅ Node.js found:
node --version
echo.

REM Check if .env.local exists
if not exist ".env.local" (
    echo ⚠️  .env.local not found
    echo Creating .env.local file...
    (
        echo # Please update these values
        echo DATABASE_URL=postgresql://user:password@localhost:5432/goldtrading
        echo TELEGRAM_BOT_TOKEN=your_bot_token_here
        echo TELEGRAM_CHAT_ID=-1001234567890
        echo SMS_API_TOKEN=your_sms_token_here
        echo PORT=5000
        echo VITE_API_URL=http://localhost:5000
    ) > .env.local
    echo ✅ Created .env.local - Please update it with your values
    echo.
)

REM Add Node to PATH
set PATH=C:\Program Files\nodejs;%PATH%

REM Install dependencies
echo 📦 Installing dependencies...
call npm install --legacy-peer-deps

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed
echo.

REM Build the project
echo 🏗️  Building the project...
call npm run build

if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Build complete
echo.

REM Start the application
echo 🌐 Starting application...
echo Server will run on: http://localhost:5000
echo.
echo Press Ctrl+C to stop
echo.

call npm start
pause
