#!/bin/bash

echo "🚀 Starting Property Investment Manager..."
echo ""

# Detect operating system
OS="$(uname -s)"
IS_MAC=false
if [ "$OS" = "Darwin" ]; then
    IS_MAC=true
    echo "✅ Detected macOS system"
    echo ""
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    echo "Visit: https://nodejs.org/"
    if [ "$IS_MAC" = true ]; then
        echo "Or install via Homebrew: brew install node"
    fi
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

# Mac-specific setup
if [ "$IS_MAC" = true ]; then
    CURRENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    # Check if running from /Applications
    if [[ "$CURRENT_DIR" != /Applications/* ]]; then
        echo "💡 Mac Setup Recommendation"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "For easier access, you can:"
        echo "1. Move this app to /Applications folder"
        echo "2. Create a terminal alias for quick access"
        echo ""
        read -p "Would you like to set up quick access? (y/n) " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            # Detect shell
            if [ -n "$ZSH_VERSION" ]; then
                SHELL_RC="$HOME/.zshrc"
            elif [ -n "$BASH_VERSION" ]; then
                SHELL_RC="$HOME/.bash_profile"
            else
                SHELL_RC="$HOME/.profile"
            fi
            
            ALIAS_NAME="property-manager"
            ALIAS_COMMAND="alias $ALIAS_NAME='cd \"$CURRENT_DIR\" && ./start-app.sh'"
            
            # Check if alias already exists
            if grep -q "alias $ALIAS_NAME=" "$SHELL_RC" 2>/dev/null; then
                echo "⚠️  Alias '$ALIAS_NAME' already exists in $SHELL_RC"
            else
                echo "📝 Adding alias to $SHELL_RC..."
                echo "" >> "$SHELL_RC"
                echo "# Property Manager shortcut" >> "$SHELL_RC"
                echo "$ALIAS_COMMAND" >> "$SHELL_RC"
                echo "✅ Alias added!"
                echo ""
                echo "After this script finishes, run:"
                echo "  source $SHELL_RC"
                echo ""
                echo "Then you can start the app from anywhere by typing:"
                echo "  $ALIAS_NAME"
            fi
            echo ""
        fi
    else
        echo "✅ Running from /Applications - Great!"
        echo ""
    fi
fi

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
echo ""

if [ "$IS_MAC" = true ]; then
    # Get local IP address on Mac
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
    echo "🌐 Access Options:"
    echo "   Local:   http://localhost:3000"
    if [ -n "$LOCAL_IP" ]; then
        echo "   Network: http://$LOCAL_IP:3000 (from other devices)"
    fi
    echo ""
    echo "💡 Tips:"
    echo "   • Bookmark http://localhost:3000 in your browser"
    echo "   • Keep this Terminal window open while using the app"
    echo "   • Database backup: $CURRENT_DIR/prisma/dev.db"
    echo "   • Press Ctrl+C to stop the server"
else
    echo "🌐 Starting development server..."
    echo "📍 Application will be available at http://localhost:3000"
    echo ""
    echo "Press Ctrl+C to stop the server"
fi

echo ""

npm run dev
