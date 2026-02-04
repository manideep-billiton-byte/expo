#!/bin/bash

# Quick Deploy Script for QR Code Email Fix
# This script deploys ONLY the backend changes needed for QR code email fix

set -e  # Exit on error

echo "=========================================="
echo "🚀 QR CODE EMAIL FIX - QUICK DEPLOY"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in server directory"
    echo "Please run this from: /home/billiton/Documents/event_management_hub/all_work/Expo_project/server"
    exit 1
fi

echo "📋 Changes to deploy:"
echo "  1. Updated .env with CLOUDFRONT_DOMAIN and S3_QR_BUCKET"
echo "  2. Fixed qrStorageService.js (removed ACL parameter)"
echo "  3. QR codes will now display in emails via base64 embedding"
echo ""

# Check if infrastructure directory exists
if [ ! -d "../infrastructure" ]; then
    echo "❌ Error: infrastructure directory not found"
    echo "Please ensure you have the deployment scripts set up"
    exit 1
fi

echo "🔍 Checking AWS CLI configuration..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Error: AWS CLI not configured or credentials invalid"
    echo "Please run: aws configure"
    exit 1
fi

echo "✅ AWS CLI configured"
echo ""

# Ask for confirmation
read -p "🤔 Do you want to deploy the backend changes now? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "📦 Step 1: Preparing deployment package..."
echo "----------------------------------------"

# Check if Elastic Beanstalk is initialized
if [ ! -d ".elasticbeanstalk" ]; then
    echo "⚠️  Elastic Beanstalk not initialized"
    echo "Please run the full deployment workflow first: /deploy-aws"
    exit 1
fi

echo "✅ Elastic Beanstalk initialized"
echo ""

echo "📤 Step 2: Deploying to Elastic Beanstalk..."
echo "----------------------------------------"

# Deploy using EB CLI
if command -v eb &> /dev/null; then
    echo "Using EB CLI to deploy..."
    eb deploy
else
    echo "❌ Error: EB CLI not installed"
    echo "Please install: pip install awsebcli"
    exit 1
fi

echo ""
echo "🔧 Step 3: Updating environment variables..."
echo "----------------------------------------"

# Get the environment name
ENV_NAME=$(eb list | grep '\*' | sed 's/\* //' | tr -d ' ')

if [ -z "$ENV_NAME" ]; then
    echo "❌ Error: Could not determine Elastic Beanstalk environment name"
    exit 1
fi

echo "Environment: $ENV_NAME"

# Set the environment variables
echo "Setting CLOUDFRONT_DOMAIN..."
eb setenv CLOUDFRONT_DOMAIN=d2ux36xl31uki3.cloudfront.net

echo "Setting S3_QR_BUCKET..."
eb setenv S3_QR_BUCKET=expo-project-prod-frontend

echo "✅ Environment variables updated"
echo ""

echo "🔄 Step 4: Restarting application..."
echo "----------------------------------------"
eb restart

echo ""
echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo "  1. Wait 2-3 minutes for the application to restart"
echo "  2. Test by creating a new event"
echo "  3. Check the email for QR code"
echo ""
echo "🧪 To test immediately:"
echo "  ssh into your EC2 instance and run:"
echo "  cd /var/app/current"
echo "  node test-qr-email-diagnostic.js"
echo ""
echo "📊 Monitor deployment:"
echo "  eb logs"
echo "  eb health"
echo ""
echo "🌐 Application URL:"
eb status | grep "CNAME"
echo ""
