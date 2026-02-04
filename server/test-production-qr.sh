#!/bin/bash

echo "=========================================="
echo "🧪 TESTING QR EMAIL ON PRODUCTION SERVER"
echo "=========================================="
echo ""

# Get EB environment URL
echo "📡 Getting production server URL..."
EB_URL=$(eb status | grep "CNAME" | awk '{print $2}')

if [ -z "$EB_URL" ]; then
    echo "❌ Could not get EB URL"
    echo "Please check: eb status"
    exit 1
fi

echo "✅ Production URL: https://$EB_URL"
echo ""

echo "=========================================="
echo "🧪 TEST OPTIONS"
echo "=========================================="
echo ""

echo "Option 1: SSH to Server and Run Diagnostic"
echo "-------------------------------------------"
echo "This will SSH to the production server and run the QR email test."
echo ""
read -p "Do you want to SSH to production and test? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔐 Connecting to production server..."
    echo ""
    
    # SSH and run test
    eb ssh << 'EOF'
cd /var/app/current
echo "📍 Current directory: $(pwd)"
echo ""

echo "🔍 Checking if test script exists..."
if [ -f "test-qr-email-diagnostic.js" ]; then
    echo "✅ Test script found"
    echo ""
    echo "🧪 Running QR email diagnostic test..."
    echo ""
    node test-qr-email-diagnostic.js
else
    echo "❌ Test script not found"
    echo "Files in current directory:"
    ls -la
fi
EOF
    
    echo ""
    echo "=========================================="
    echo "✅ TEST COMPLETE"
    echo "=========================================="
    echo ""
    echo "Check your email: deepak@btsind.com"
    echo "Subject: QR Code Test Email"
    echo ""
fi

echo ""
echo "Option 2: Test via API Call"
echo "-------------------------------------------"
echo "This will create a test event via the production API."
echo ""
read -p "Do you want to test via API? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📤 Creating test event on production..."
    echo ""
    
    RESPONSE=$(curl -s -X POST "https://$EB_URL/api/events" \
        -H "Content-Type: application/json" \
        -d '{
            "organizationId": "3",
            "eventName": "QR Test Event - Production",
            "description": "Testing QR code in production",
            "startDate": "2026-03-15",
            "endDate": "2026-03-17",
            "venue": "Test Venue",
            "city": "Mumbai",
            "organizerEmail": "deepak@btsind.com",
            "organizerName": "Test Organizer"
        }')
    
    echo "Response:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    echo ""
    
    # Check if event was created
    if echo "$RESPONSE" | grep -q '"id"'; then
        echo "✅ Event created successfully!"
        EVENT_ID=$(echo "$RESPONSE" | jq -r '.id' 2>/dev/null)
        echo "Event ID: $EVENT_ID"
        echo ""
        echo "📧 Check your email: deepak@btsind.com"
        echo "Subject: 🎉 Event Created: QR Test Event - Production"
        echo ""
        
        # Cleanup
        read -p "Delete test event? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            curl -s -X DELETE "https://$EB_URL/api/events/$EVENT_ID"
            echo "✅ Test event deleted"
        fi
    else
        echo "❌ Event creation failed"
        echo "Check the response above for errors"
    fi
fi

echo ""
echo "Option 3: Test via Dashboard"
echo "-------------------------------------------"
echo "1. Go to: https://d2ux36xl31uki3.cloudfront.net"
echo "2. Login with organization credentials"
echo "3. Create a new event"
echo "4. Check email: deepak@btsind.com"
echo ""

echo "=========================================="
echo "📊 PRODUCTION SERVER STATUS"
echo "=========================================="
eb status

echo ""
echo "=========================================="
echo "💡 TROUBLESHOOTING"
echo "=========================================="
echo ""
echo "If QR code still doesn't show:"
echo ""
echo "1. Check server logs:"
echo "   eb logs"
echo ""
echo "2. Verify environment variables:"
echo "   eb printenv"
echo ""
echo "3. Check if deployment succeeded:"
echo "   eb status"
echo ""
echo "4. View recent events:"
echo "   eb logs --stream"
echo ""
