#!/bin/bash

echo "=========================================="
echo "🔄 RESTARTING SERVER WITH LATEST CODE"
echo "=========================================="
echo ""

echo "📋 Current server status:"
ps aux | grep "node server.js" | grep -v grep || echo "   No server running"
echo ""

echo "⚠️  The server has been running for 4+ hours with OLD CODE"
echo "   The QR email fixes are NOT loaded in the current process"
echo ""

echo "🛑 To restart the server:"
echo ""
echo "1. Go to the terminal running 'npm start'"
echo "2. Press Ctrl+C to stop the server"
echo "3. Run 'npm start' again"
echo ""
echo "OR run this command in a new terminal:"
echo ""
echo "   cd /home/billiton/Documents/event_management_hub/all_work/Expo_project/server"
echo "   npm start"
echo ""

echo "=========================================="
echo "✅ AFTER RESTART:"
echo "=========================================="
echo ""
echo "1. Create a NEW event through the dashboard"
echo "2. Check your email inbox"
echo "3. The QR code should now be visible!"
echo ""

echo "🧪 Or test immediately with:"
echo "   node test-qr-email-diagnostic.js"
echo ""
