#!/usr/bin/env bash
# Quick Start Script for Gold Trading Platform
# This script sets up and runs the application

echo "🚀 شروع سریع پلتفرم طلا آنلاین"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found"
    echo "Creating .env.local file..."
    cat > .env.local << 'EOF'
# Please update these values
DATABASE_URL=postgresql://user:password@localhost:5432/goldtrading
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=-1001234567890
SMS_API_TOKEN=your_sms_token_here
PORT=5000
VITE_API_URL=http://localhost:5000
EOF
    echo "✅ Created .env.local - Please update it with your values"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Build the project
echo "🏗️  Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build complete"
echo ""

# Start the application
echo "🌐 Starting application..."
echo "Server will run on: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm start
