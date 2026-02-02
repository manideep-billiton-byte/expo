#!/bin/bash

# ============================================
# 🚀 Deploy Staging Backend to AWS
# ============================================
# Deploys the Node.js backend to staging
# Elastic Beanstalk environment
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$SCRIPT_DIR/../server"

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║     🚀 DEPLOY STAGING BACKEND - Expo Project                           ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
AWS_REGION="ap-south-1"
PROJECT_NAME="expo-project"
ENVIRONMENT="staging"
EB_APP_NAME="${PROJECT_NAME}-${ENVIRONMENT}"
EB_ENV_NAME="${PROJECT_NAME}-${ENVIRONMENT}-env"

# Check prerequisites
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found."
    exit 1
fi

if ! command -v eb &> /dev/null; then
    echo "📦 Installing EB CLI..."
    pip install awsebcli --upgrade --user
fi

# Check for staging env file
if [ ! -f "$SCRIPT_DIR/.env.staging" ]; then
    echo "❌ .env.staging not found. Run setup-staging-environment.sh first."
    exit 1
fi

echo "📋 Deployment Configuration:"
echo "   Application: $EB_APP_NAME"
echo "   Environment: $EB_ENV_NAME"
echo "   Region:      $AWS_REGION"
echo ""

# Navigate to server directory
cd "$SERVER_DIR"

# Initialize EB if needed
if [ ! -d ".elasticbeanstalk" ]; then
    echo "📦 Initializing Elastic Beanstalk..."
    eb init -p "Node.js 20" -r "$AWS_REGION" "$EB_APP_NAME" --platform "Node.js 20"
fi

# Update EB config to use staging environment
cat > ".elasticbeanstalk/config.yml" <<EOF
branch-defaults:
  main:
    environment: $EB_ENV_NAME
environment-defaults:
  $EB_ENV_NAME:
    branch: null
    repository: null
global:
  application_name: $EB_APP_NAME
  default_platform: Node.js 20
  default_region: $AWS_REGION
  profile: null
  sc: null
  workspace_type: Application
EOF

# Check if environment exists
ENV_EXISTS=$(aws elasticbeanstalk describe-environments \
    --application-name "$EB_APP_NAME" \
    --environment-names "$EB_ENV_NAME" \
    --region "$AWS_REGION" \
    --query 'Environments[0].Status' \
    --output text 2>/dev/null || echo "None")

if [ "$ENV_EXISTS" = "None" ] || [ "$ENV_EXISTS" = "Terminated" ]; then
    echo "📦 Creating staging environment..."
    
    eb create "$EB_ENV_NAME" \
        --instance-type t3.small \
        --region "$AWS_REGION" \
        --single \
        --envvars PORT=8080,NODE_ENV=staging
    
    echo "⏳ Waiting for environment to be ready..."
    sleep 60
else
    echo "✅ Environment exists: $EB_ENV_NAME (Status: $ENV_EXISTS)"
fi

# Set environment variables from .env.staging
echo ""
echo "📝 Setting environment variables from .env.staging..."

declare -a ENV_PAIRS
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ $key =~ ^#.*$ ]] && continue
    [[ -z $key ]] && continue
    
    # Remove leading/trailing whitespace and quotes
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | sed 's/^"//;s/"$//;s/^'\''//;s/'\''$//' | xargs)
    
    if [ -n "$value" ] && [ -n "$key" ]; then
        ENV_PAIRS+=("${key}=${value}")
    fi
done < "$SCRIPT_DIR/.env.staging"

if [ ${#ENV_PAIRS[@]} -gt 0 ]; then
    eb setenv "${ENV_PAIRS[@]}" 2>/dev/null || echo "Environment variables may already be set"
    echo "✅ Environment variables updated"
fi

# Create deployment package
echo ""
echo "📦 Creating deployment package..."
cd "$SERVER_DIR"

# Create zip excluding unnecessary files
zip -r ../staging-backend.zip . \
    -x "node_modules/*" \
    -x ".elasticbeanstalk/*" \
    -x "*.log" \
    -x ".env" \
    -x ".env.*" \
    -x "uploads/*" \
    -x ".git/*"

# Deploy
echo ""
echo "📤 Deploying to staging environment..."
eb deploy "$EB_ENV_NAME" --staged

# Get the staging URL
STAGING_URL=$(aws elasticbeanstalk describe-environments \
    --application-name "$EB_APP_NAME" \
    --environment-names "$EB_ENV_NAME" \
    --region "$AWS_REGION" \
    --query 'Environments[0].CNAME' \
    --output text)

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║     ✅ STAGING BACKEND DEPLOYMENT COMPLETE!                            ║"
echo "╠════════════════════════════════════════════════════════════════════════╣"
echo "║                                                                        ║"
echo "║  🌐 STAGING BACKEND URL:                                               ║"
echo "║     http://$STAGING_URL"
echo "║                                                                        ║"
echo "║  🔍 Health Check:                                                      ║"
echo "║     http://$STAGING_URL/api/dashboard"
echo "║                                                                        ║"
echo "║  📝 Commands:                                                          ║"
echo "║     View logs: eb logs                                                 ║"
echo "║     SSH:       eb ssh                                                  ║"
echo "║     Status:    eb status                                               ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Test the deployment
echo "🧪 Testing staging backend..."
sleep 5
curl -s "http://$STAGING_URL/api/dashboard" | head -c 100
echo ""
echo ""

# Save the URL
echo "STAGING_BACKEND_URL=http://$STAGING_URL" >> "$SCRIPT_DIR/.env.staging.urls"
echo ""
echo "✅ Staging backend URL saved to .env.staging.urls"
