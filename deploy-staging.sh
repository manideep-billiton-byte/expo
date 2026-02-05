#!/bin/bash

# ==============================================================================
# STAGING DEPLOYMENT SCRIPT
# ==============================================================================
# This script automates the staging deployment process
# Usage: ./deploy-staging.sh
# ==============================================================================

set -e  # Exit on error

echo "🚀 Starting Staging Deployment..."
echo "=================================="

# Configuration
STAGING_SERVER="user@staging-server-ip"  # UPDATE THIS
APP_PATH="/path/to/application"           # UPDATE THIS
STAGING_BUCKET="expo-staging-frontend"    # UPDATE THIS
STAGING_CF_ID="YOUR_STAGING_CF_ID"        # UPDATE THIS

# Step 1: Local preparation
echo ""
echo "📦 Step 1: Preparing local code..."
git checkout main
git pull origin main

# Step 2: Tag release
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
TAG="staging-$TIMESTAMP"
echo ""
echo "🏷️  Step 2: Creating tag $TAG..."
git tag -a $TAG -m "Staging deployment $TIMESTAMP"
git push origin $TAG

# Step 3: Deploy to staging server
echo ""
echo "🌐 Step 3: Deploying to staging server..."
ssh $STAGING_SERVER << 'ENDSSH'
    set -e
    
    # Navigate to app
    cd /path/to/application  # UPDATE THIS
    
    # Backup
    echo "💾 Creating backup..."
    sudo cp -r . ../backups/app-backup-$(date +%Y%m%d-%H%M%S)
    
    # Pull code
    echo "⬇️  Pulling latest code..."
    git fetch origin
    git checkout main
    git pull origin main
    
    # Backend
    echo "🔧 Updating backend..."
    cd server
    npm install --production
    
    # Frontend
    echo "🎨 Building frontend..."
    cd ../client
    npm install
    npm run build
    
    echo "✅ Code updated on server"
ENDSSH

# Step 4: Deploy frontend to S3
echo ""
echo "☁️  Step 4: Deploying frontend to S3..."
ssh $STAGING_SERVER << ENDSSH
    cd $APP_PATH/client
    aws s3 sync dist/ s3://$STAGING_BUCKET --delete
    aws cloudfront create-invalidation --distribution-id $STAGING_CF_ID --paths "/*"
ENDSSH

# Step 5: Restart backend
echo ""
echo "🔄 Step 5: Restarting backend services..."
ssh $STAGING_SERVER << 'ENDSSH'
    pm2 restart all
    pm2 save
    echo "✅ Services restarted"
ENDSSH

# Step 6: Verify
echo ""
echo "✅ Step 6: Verifying deployment..."
sleep 5
ssh $STAGING_SERVER << 'ENDSSH'
    pm2 status
    curl -f http://localhost:5000/health || echo "❌ Health check failed!"
ENDSSH

echo ""
echo "=================================="
echo "✅ Staging Deployment Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Test staging: https://staging.yourapp.com"
echo "2. Verify all features work"
echo "3. Check logs: ssh $STAGING_SERVER 'pm2 logs'"
echo "4. If successful, proceed with production deployment"
echo ""
