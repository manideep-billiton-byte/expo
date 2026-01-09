#!/bin/bash

# Frontend Deployment Script for AWS S3 + CloudFront
# Builds and deploys the React/Vite frontend

set -e

echo "🚀 Frontend Deployment to AWS S3 + CloudFront"
echo "=============================================="

# Check prerequisites
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it first."
    exit 1
fi

# Configuration
read -p "Enter AWS Region (default: ap-south-1): " AWS_REGION
AWS_REGION=${AWS_REGION:-ap-south-1}

read -p "Enter Project Name (default: expo-project): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-expo-project}

read -p "Enter Environment (dev/staging/prod) (default: prod): " ENVIRONMENT
ENVIRONMENT=${ENVIRONMENT:-prod}

read -p "Enter Backend API URL: " API_URL
if [ -z "$API_URL" ]; then
    echo "❌ Backend API URL is required"
    exit 1
fi

BUCKET_NAME="${PROJECT_NAME}-${ENVIRONMENT}-frontend"

# Navigate to client directory
cd "$(dirname "$0")/../client"

echo ""
echo "📋 Deployment Configuration:"
echo "  Bucket: $BUCKET_NAME"
echo "  Region: $AWS_REGION"
echo "  API URL: $API_URL"
echo ""

# Create production environment file
echo "📝 Creating production environment configuration..."
cat > .env.production <<EOF
VITE_API_URL=${API_URL}
VITE_ENV=production
EOF

echo "✅ Environment configuration created"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Build the application
echo ""
echo "🔨 Building production bundle..."
npm run build

# Check if bucket exists
BUCKET_EXISTS=$(aws s3 ls "s3://${BUCKET_NAME}" 2>&1 || echo "not found")

if [[ "$BUCKET_EXISTS" == *"not found"* ]]; then
    echo "❌ S3 bucket not found: $BUCKET_NAME"
    echo "Please run ./aws-setup.sh first to create infrastructure"
    exit 1
fi

# Sync to S3
echo ""
echo "📤 Uploading to S3..."
aws s3 sync dist/ "s3://${BUCKET_NAME}" \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "index.html"

# Upload index.html separately with no cache
aws s3 cp dist/index.html "s3://${BUCKET_NAME}/index.html" \
    --cache-control "no-cache, no-store, must-revalidate"

echo "✅ Files uploaded to S3"

# Get CloudFront distribution ID
echo ""
echo "🔍 Finding CloudFront distribution..."
CF_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Origins.Items[?DomainName.contains(@, '${BUCKET_NAME}')]].Id | [0]" \
    --output text)

if [ "$CF_ID" != "None" ] && [ -n "$CF_ID" ]; then
    echo "📦 Invalidating CloudFront cache..."
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$CF_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    echo "✅ CloudFront invalidation created: $INVALIDATION_ID"
    
    # Get CloudFront domain
    CF_DOMAIN=$(aws cloudfront get-distribution \
        --id "$CF_ID" \
        --query 'Distribution.DomainName' \
        --output text)
else
    echo "⚠️  CloudFront distribution not found. Skipping invalidation."
    CF_DOMAIN="<not configured>"
fi

# Get S3 website endpoint
S3_WEBSITE="http://${BUCKET_NAME}.s3-website-${AWS_REGION}.amazonaws.com"

echo ""
echo "=============================================="
echo "✅ Frontend Deployment Complete!"
echo "=============================================="
echo ""
echo "🌐 S3 Website URL: $S3_WEBSITE"
if [ "$CF_DOMAIN" != "<not configured>" ]; then
    echo "🌐 CloudFront URL: https://$CF_DOMAIN"
fi
echo ""
echo "📝 Next Steps:"
echo "  1. Test the application"
echo "  2. Configure custom domain (optional)"
echo "  3. Set up SSL certificate (automatic with CloudFront)"
echo ""
