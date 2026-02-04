#!/bin/bash

echo "=========================================="
echo "🚀 DEPLOYING QR EMAIL FIX TO PRODUCTION"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in server directory"
    echo "Please run from: /home/billiton/Documents/event_management_hub/all_work/Expo_project/server"
    exit 1
fi

echo "📋 Pre-deployment checklist:"
echo ""

# Check if EB CLI is installed
if ! command -v eb &> /dev/null; then
    echo "❌ EB CLI not installed"
    echo "Install with: pip install awsebcli"
    exit 1
fi
echo "✅ EB CLI installed"

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured"
    echo "Run: aws configure"
    exit 1
fi
echo "✅ AWS credentials configured"

# Check EB environment
if ! eb status &> /dev/null; then
    echo "❌ EB environment not initialized"
    echo "Run: eb init"
    exit 1
fi
echo "✅ EB environment initialized"

echo ""
echo "=========================================="
echo "📦 DEPLOYMENT STEPS"
echo "=========================================="
echo ""

echo "Step 1: Verify QR code fixes are in place..."
if grep -q "qrBase64" controllers/eventController.js; then
    echo "✅ QR email fixes found in eventController.js"
else
    echo "❌ QR email fixes NOT found"
    exit 1
fi

if grep -q "base64Data = qrBuffer.toString('base64')" services/qrStorageService.js; then
    echo "✅ Base64 conversion found in qrStorageService.js"
else
    echo "❌ Base64 conversion NOT found"
    exit 1
fi

echo ""
echo "Step 2: Check environment variables..."
if grep -q "CLOUDFRONT_DOMAIN" .env; then
    echo "✅ CLOUDFRONT_DOMAIN set in .env"
else
    echo "⚠️  CLOUDFRONT_DOMAIN not in .env (will use EB environment variable)"
fi

if grep -q "S3_QR_BUCKET" .env; then
    echo "✅ S3_QR_BUCKET set in .env"
else
    echo "⚠️  S3_QR_BUCKET not in .env (will use EB environment variable)"
fi

echo ""
echo "Step 3: Deploying to Elastic Beanstalk..."
echo ""

# Deploy to EB
eb deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ DEPLOYMENT SUCCESSFUL!"
    echo "=========================================="
    echo ""
    
    echo "🧪 TESTING ON PRODUCTION SERVER:"
    echo ""
    echo "Option 1: Create Event via Dashboard"
    echo "   1. Go to: https://d2ux36xl31uki3.cloudfront.net"
    echo "   2. Login as organization"
    echo "   3. Create a new event"
    echo "   4. Check email for QR code"
    echo ""
    
    echo "Option 2: Test via API"
    echo "   Run this command to test the production API:"
    echo ""
    echo "   curl -X POST https://your-eb-url.elasticbeanstalk.com/api/events \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"organizationId\":\"3\",\"eventName\":\"Test Event\",\"organizerEmail\":\"deepak@btsind.com\"}'"
    echo ""
    
    echo "Option 3: SSH to Server and Test"
    echo "   eb ssh"
    echo "   cd /var/app/current"
    echo "   node test-qr-email-diagnostic.js"
    echo ""
    
    echo "=========================================="
    echo "📊 DEPLOYMENT INFO"
    echo "=========================================="
    eb status
    
else
    echo ""
    echo "❌ DEPLOYMENT FAILED"
    echo ""
    echo "Check the error messages above and try again."
    echo "Common issues:"
    echo "  - AWS credentials expired"
    echo "  - EB environment not healthy"
    echo "  - Code syntax errors"
    echo ""
fi
