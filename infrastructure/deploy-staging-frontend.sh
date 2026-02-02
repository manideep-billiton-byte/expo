#!/bin/bash

# ============================================
# 🎨 Deploy Staging Frontend to AWS
# ============================================
# Builds and deploys the React frontend to
# staging S3 bucket and CloudFront
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLIENT_DIR="$SCRIPT_DIR/../client"

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║     🎨 DEPLOY STAGING FRONTEND - Expo Project                          ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
AWS_REGION="ap-south-1"
PROJECT_NAME="expo-project"
ENVIRONMENT="staging"

# Check prerequisites
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found."
    exit 1
fi

# Get AWS Account ID
AWS_ACCOUNT=$(aws sts get-caller-identity --query 'Account' --output text)
BUCKET_NAME="${PROJECT_NAME}-${ENVIRONMENT}-frontend-${AWS_ACCOUNT}"

echo "📋 Deployment Configuration:"
echo "   S3 Bucket: $BUCKET_NAME"
echo "   Region:    $AWS_REGION"
echo ""

# Get staging backend URL
if [ -f "$SCRIPT_DIR/.env.staging.urls" ]; then
    source "$SCRIPT_DIR/.env.staging.urls"
    STAGING_API_URL="$STAGING_BACKEND_URL"
else
    read -p "Enter Staging Backend URL: " STAGING_API_URL
fi

if [ -z "$STAGING_API_URL" ]; then
    echo "❌ Backend URL is required. Deploy backend first."
    exit 1
fi

echo "🌐 Using Backend URL: $STAGING_API_URL"
echo ""

# Navigate to client directory
cd "$CLIENT_DIR"

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create staging environment file
echo "📝 Creating staging environment configuration..."
cat > .env.staging <<EOF
VITE_API_URL=$STAGING_API_URL
VITE_ENV=staging
EOF

# Build for staging
echo ""
echo "🔨 Building frontend for staging..."
VITE_API_URL="$STAGING_API_URL" VITE_ENV=staging npm run build

# Check if build succeeded
if [ ! -d "dist" ]; then
    echo "❌ Build failed. Check for errors above."
    exit 1
fi

echo "✅ Build completed successfully"

# Upload to S3
echo ""
echo "📤 Uploading to S3..."
aws s3 sync dist/ "s3://${BUCKET_NAME}" \
    --delete \
    --cache-control "max-age=31536000" \
    --region "$AWS_REGION"

# Set correct content types
aws s3 cp "s3://${BUCKET_NAME}/index.html" "s3://${BUCKET_NAME}/index.html" \
    --metadata-directive REPLACE \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "text/html" \
    --region "$AWS_REGION"

echo "✅ Files uploaded to S3"

# Find and invalidate CloudFront
echo ""
echo "🔄 Invalidating CloudFront cache..."

CF_DISTRIBUTION_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Comment=='Staging CloudFront for ${PROJECT_NAME}'].Id" \
    --output text 2>/dev/null)

if [ -n "$CF_DISTRIBUTION_ID" ] && [ "$CF_DISTRIBUTION_ID" != "None" ]; then
    aws cloudfront create-invalidation \
        --distribution-id "$CF_DISTRIBUTION_ID" \
        --paths "/*" \
        --region "$AWS_REGION" > /dev/null
    echo "✅ CloudFront cache invalidated"
    
    # Get CloudFront domain
    CF_DOMAIN=$(aws cloudfront get-distribution \
        --id "$CF_DISTRIBUTION_ID" \
        --query 'Distribution.DomainName' \
        --output text)
else
    echo "⚠️  CloudFront distribution not found. Using S3 website URL."
    CF_DOMAIN="${BUCKET_NAME}.s3-website.${AWS_REGION}.amazonaws.com"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║     ✅ STAGING FRONTEND DEPLOYMENT COMPLETE!                           ║"
echo "╠════════════════════════════════════════════════════════════════════════╣"
echo "║                                                                        ║"
echo "║  🌐 STAGING FRONTEND URL:                                              ║"
echo "║     https://$CF_DOMAIN"
echo "║                                                                        ║"
echo "║  🔗 Connected to Backend:                                              ║"
echo "║     $STAGING_API_URL"
echo "║                                                                        ║"
echo "║  📝 Note: CloudFront may take a few minutes to propagate              ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Save URLs
echo "STAGING_FRONTEND_URL=https://$CF_DOMAIN" >> "$SCRIPT_DIR/.env.staging.urls"
echo "✅ Staging frontend URL saved to .env.staging.urls"
