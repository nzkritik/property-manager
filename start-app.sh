#!/bin/bash

echo "🚀 Starting Property Investment Manager..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. You have version $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
fi

# Check if database exists
if [ ! -f "prisma/dev.db" ]; then
    echo "🗄️  Setting up database..."
    npm run db:generate
    npm run db:push
    echo ""
    
    echo "🌱 Seeding demo data..."
    npm run db:seed
    echo ""
fi

echo "🎉 Setup complete!"
echo "🌐 Starting development server..."
echo "📍 Application will be available at http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
