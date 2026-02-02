#!/bin/bash

# ============================================
# 🧪 Start Testing Server for QA Engineers
# ============================================
# This script starts a separate testing server with ngrok
# that creates a public URL for testing without affecting production
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$SCRIPT_DIR/server"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     🧪 EXPO PROJECT - TESTING SERVER LAUNCHER              ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║  This will create a public testing URL for QA engineers    ║"
echo "║  that is SEPARATE from production but uses SAME database   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed!"
    echo ""
    echo "Please install ngrok:"
    echo "  1. Go to https://ngrok.com/download"
    echo "  2. Download and install ngrok"
    echo "  3. Run: ngrok config add-authtoken YOUR_TOKEN"
    echo ""
    exit 1
fi

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    exit 1
fi

# Kill any existing processes on ports 5001 and 4040
echo "🔄 Cleaning up existing processes..."
lsof -ti:5001 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:4040 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1

# Navigate to server directory
cd "$SERVER_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing server dependencies..."
    npm install
fi

# Copy testing environment file
if [ -f ".env.testing" ]; then
    echo "✅ Using .env.testing configuration"
    cp .env.testing .env.test-active
else
    echo "⚠️  .env.testing not found, using default configuration"
    cat > .env.test-active << EOF
PORT=5001
NODE_ENV=testing
DATABASE_URL=postgresql://postgres:EventPass123!@expo-project-prod-db.cvmk8awyksm7.ap-south-1.rds.amazonaws.com:5432/expo_db
EOF
fi

# Start the server in background
echo ""
echo "🚀 Starting testing server on port 5001..."
PORT=5001 node -r dotenv/config server.js dotenv_config_path=.env.test-active &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Check if server is running
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "❌ Server failed to start!"
    exit 1
fi

echo "✅ Server started with PID: $SERVER_PID"

# Start ngrok tunnel
echo ""
echo "🌐 Creating public URL with ngrok..."
ngrok http 5001 --log=stdout > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

# Wait for ngrok to initialize
sleep 3

# Get the public URL from ngrok API
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | head -1 | sed 's/"public_url":"//')

if [ -z "$NGROK_URL" ]; then
    echo "⚠️  Could not get ngrok URL automatically."
    echo "Check http://localhost:4040 for the public URL"
    NGROK_URL="Check http://localhost:4040"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                    🎉 TESTING SERVER READY!                            ║"
echo "╠════════════════════════════════════════════════════════════════════════╣"
echo "║                                                                        ║"
echo "║  🔗 TESTING API URL:                                                   ║"
echo "║     $NGROK_URL"
echo "║                                                                        ║"
echo "║  📊 Local Dashboard: http://localhost:5001/api/dashboard               ║"
echo "║  🔧 ngrok Inspector:  http://localhost:4040                            ║"
echo "║                                                                        ║"
echo "╠════════════════════════════════════════════════════════════════════════╣"
echo "║  📋 SHARE WITH QA ENGINEER:                                            ║"
echo "║                                                                        ║"
echo "║  Base URL: $NGROK_URL"
echo "║                                                                        ║"
echo "║  Example API Calls:                                                    ║"
echo "║    GET  $NGROK_URL/api/dashboard"
echo "║    GET  $NGROK_URL/api/events"
echo "║    POST $NGROK_URL/api/login"
echo "║                                                                        ║"
echo "╠════════════════════════════════════════════════════════════════════════╣"
echo "║  ⚠️  NOTE: This is connected to PRODUCTION database!                   ║"
echo "║      Any data changes will affect production.                          ║"
echo "╠════════════════════════════════════════════════════════════════════════╣"
echo "║  Press Ctrl+C to stop the testing server                               ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Save the URL to a file for reference
echo "$NGROK_URL" > /tmp/testing-server-url.txt

# Create a testing info file
cat > "$SCRIPT_DIR/TESTING_SERVER_INFO.txt" << EOF
============================================
  EXPO PROJECT - TESTING SERVER
============================================

Testing Server URL: $NGROK_URL

Started: $(date)

API Endpoints:
- Dashboard: $NGROK_URL/api/dashboard
- Events: $NGROK_URL/api/events
- Login: $NGROK_URL/api/login (POST)
- Organizations: $NGROK_URL/api/organizations

See API_DOCUMENTATION.md for complete API reference.

WARNING: Connected to production database!
============================================
EOF

echo "📄 Testing info saved to: TESTING_SERVER_INFO.txt"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down testing server..."
    kill $SERVER_PID 2>/dev/null || true
    kill $NGROK_PID 2>/dev/null || true
    rm -f "$SERVER_DIR/.env.test-active"
    echo "✅ Testing server stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running
wait $SERVER_PID
