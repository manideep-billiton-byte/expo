#!/bin/bash

# ==============================================================================
# PRODUCTION DEPLOYMENT SCRIPT
# ==============================================================================
# ⚠️  CRITICAL: Only run after staging is verified!
# Usage: ./deploy-production.sh
# ==============================================================================

set -e  # Exit on error

echo "🚨 PRODUCTION DEPLOYMENT"
echo "=================================="
echo "⚠️  WARNING: You are about to deploy to PRODUCTION"
echo ""
read -p "Have you verified staging? (yes/no): " VERIFIED
if [ "$VERIFIED" != "yes" ]; then
    echo "❌ Deployment cancelled. Verify staging first!"
    exit 1
fi

# Configuration
PROD_SERVER="user@production-server-ip"  # UPDATE THIS
APP_PATH="/path/to/application"          # UPDATE THIS
PROD_BUCKET="expo-production-frontend"   # UPDATE THIS
PROD_CF_ID="YOUR_PRODUCTION_CF_ID"       # UPDATE THIS

# Step 1: Create production tag
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
TAG="prod-$TIMESTAMP"
echo ""
echo "🏷️  Step 1: Creating production tag $TAG..."
git tag -a $TAG -m "Production deployment $TIMESTAMP"
git push origin $TAG

# Step 2: Backup production
echo ""
echo "💾 Step 2: Backing up production (CRITICAL)..."
ssh $PROD_SERVER << ENDSSH
    set -e
    
    echo "📦 Backing up application..."
    sudo cp -r $APP_PATH $APP_PATH/../backups/app-backup-$(date +%Y%m%d-%H%M%S)
    
    echo "🗄️  Backing up database..."
    pg_dump -U postgres your_production_database > ~/backups/prod-db-backup-$(date +%Y%m%d-%H%M%S).sql
    
    echo "✅ Backups created"
    ls -lh ~/backups/ | tail -5
ENDSSH

# Step 3: Deploy to production
echo ""
echo "🌐 Step 3: Deploying to production server..."
ssh $PROD_SERVER << ENDSSH
    set -e
    
    cd $APP_PATH
    
    # Pull code
    echo "⬇️  Pulling production code..."
    git fetch --tags
    git checkout $TAG
    
    # Backend
    echo "🔧 Updating backend..."
    cd server
    npm install --production
    
    # Frontend
    echo "🎨 Building frontend..."
    cd ../client
    npm install
    npm run build
    
    echo "✅ Code updated on production"
ENDSSH

# Step 4: Deploy frontend to production S3
echo ""
echo "☁️  Step 4: Deploying frontend to production S3..."
ssh $PROD_SERVER << ENDSSH
    cd $APP_PATH/client
    aws s3 sync dist/ s3://$PROD_BUCKET --delete
    aws cloudfront create-invalidation --distribution-id $PROD_CF_ID --paths "/*"
ENDSSH

# Step 5: Restart production backend
echo ""
echo "🔄 Step 5: Restarting production services..."
ssh $PROD_SERVER << 'ENDSSH'
    pm2 restart all
    pm2 save
    echo "✅ Production services restarted"
ENDSSH

# Step 6: Verify production
echo ""
echo "✅ Step 6: Verifying production deployment..."
sleep 10
ssh $PROD_SERVER << 'ENDSSH'
    pm2 status
    curl -f http://localhost:5000/health || echo "❌ Health check failed!"
ENDSSH

echo ""
echo "=================================="
echo "✅ PRODUCTION DEPLOYMENT COMPLETE!"
echo "=================================="
echo ""
echo "⚠️  IMPORTANT: Monitor for next 15 minutes!"
echo ""
echo "Monitoring commands:"
echo "  ssh $PROD_SERVER 'pm2 logs'"
echo "  ssh $PROD_SERVER 'pm2 monit'"
echo ""
echo "Test production: https://yourapp.com"
echo ""
