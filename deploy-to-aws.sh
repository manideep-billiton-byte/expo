#!/bin/bash

# Quick Deploy to AWS Script
# Run after testing locally

set -e

echo "🚀 Deploying to AWS Production"
echo "================================"
echo ""

# Get version timestamp
VERSION="v-$(date +%s)"

# 1. Package and deploy backend
echo "📦 Step 1: Packaging backend..."
cd server
zip -r ../expo-backend-latest.zip . -x "*.git*" "node_modules/*" "*.log" "*.out" ".env" 2>&1 | grep -v "adding:" || true
cd ..

echo "📤 Step 2: Uploading to S3..."
aws s3 cp expo-backend-latest.zip s3://expo-project-prod-frontend/backend-deployments/

echo "📋 Step 3: Creating application version..."
aws elasticbeanstalk create-application-version \
  --application-name expo-project-prod \
  --version-label "$VERSION" \
  --source-bundle S3Bucket="expo-project-prod-frontend",S3Key="backend-deployments/expo-backend-latest.zip" \
  --region ap-south-1 > /dev/null

echo "🔄 Step 4: Deploying to Elastic Beanstalk..."
aws elasticbeanstalk update-environment \
  --environment-name expo-project-prod-env \
  --version-label "$VERSION" \
  --region ap-south-1 > /dev/null

echo "✅ Backend deployment initiated (version: $VERSION)"
echo ""
echo "⏳ Waiting for deployment to complete (this takes ~3-5 minutes)..."
echo "   Monitor status: aws elasticbeanstalk describe-environments --environment-names expo-project-prod-env --region ap-south-1"
echo ""

# 2. Deploy frontend
echo "📦 Step 5: Building frontend..."
cd client
npm run build > /dev/null 2>&1

echo "📤 Step 6: Uploading frontend to S3..."
aws s3 sync dist/ "s3://expo-project-prod-frontend" \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "index.html" 2>&1 | grep -v "upload:" | head -1 || true

aws s3 cp dist/index.html "s3://expo-project-prod-frontend/index.html" \
    --cache-control "no-cache, no-store, must-revalidate" > /dev/null

echo "🔄 Step 7: Invalidating CloudFront cache..."
INVALIDATION=$(aws cloudfront create-invalidation \
    --distribution-id E213ONMQR1EIZB \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)

cd ..

echo ""
echo "================================"
echo "✅ Deployment Complete!"
echo "================================"
echo ""
echo "Backend:"
echo "  Version: $VERSION"
echo "  Status: Deploying (check in 3-5 minutes)"
echo "  URL: https://d3cgzphanxg4ax.cloudfront.net"
echo ""
echo "Frontend:"
echo "  Uploaded to S3"
echo "  CloudFront Invalidation: $INVALIDATION"
echo "  URL: https://d2ux36xl31uki3.cloudfront.net"
echo ""
echo "⏰ Wait 5-10 minutes for CloudFront to propagate changes globally"
echo ""
