#!/bin/bash

# Backend Deployment Script for AWS Elastic Beanstalk
# Deploys the Node.js/Express backend to AWS

set -e

echo "🚀 Backend Deployment to AWS Elastic Beanstalk"
echo "=============================================="

# Check prerequisites
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it first."
    exit 1
fi

if ! command -v eb &> /dev/null; then
    echo "❌ EB CLI not found. Installing..."
    pip install awsebcli --upgrade --user
fi

# Configuration
read -p "Enter AWS Region (default: ap-south-1): " AWS_REGION
AWS_REGION=${AWS_REGION:-ap-south-1}

read -p "Enter Project Name (default: expo-project): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-expo-project}

read -p "Enter Environment (dev/staging/prod) (default: prod): " ENVIRONMENT
ENVIRONMENT=${ENVIRONMENT:-prod}

EB_APP_NAME="${PROJECT_NAME}-${ENVIRONMENT}"
EB_ENV_NAME="${PROJECT_NAME}-${ENVIRONMENT}-env"

# Navigate to server directory
cd "$(dirname "$0")/../server"

echo ""
echo "📋 Deployment Configuration:"
echo "  Application: $EB_APP_NAME" 
echo "  Environment: $EB_ENV_NAME"
echo "  Region: $AWS_REGION"
echo ""

# Check if EB is initialized
if [ ! -d ".elasticbeanstalk" ]; then
    echo "📦 Initializing Elastic Beanstalk..."
    eb init -p node.js -r "$AWS_REGION" "$EB_APP_NAME"
fi

# Check if environment exists
ENV_EXISTS=$(aws elasticbeanstalk describe-environments \
    --application-name "$EB_APP_NAME" \
    --environment-names "$EB_ENV_NAME" \
    --region "$AWS_REGION" \
    --query 'Environments[0].Status' \
    --output text 2>/dev/null || echo "None")

if [ "$ENV_EXISTS" = "None" ]; then
    echo "📦 Creating new environment..."
    
    # Create environment
    eb create "$EB_ENV_NAME" \
        --instance-type t3.small \
        --region "$AWS_REGION" \
        --envvars PORT=8080,NODE_ENV=production
    
    echo "⏳ Waiting for environment to be ready..."
    aws elasticbeanstalk wait environment-ready \
        --application-name "$EB_APP_NAME" \
        --environment-names "$EB_ENV_NAME" \
        --region "$AWS_REGION"
else
    echo "✅ Environment already exists: $EB_ENV_NAME"
fi

# Set environment variables from .env.production
if [ -f "../.env.production" ]; then
    echo "📝 Setting environment variables..."
    
    # Read .env.production and build array of KEY=VALUE pairs
    declare -a ENV_PAIRS
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ $key =~ ^#.*$ ]] && continue
        [[ -z $key ]] && continue
        
        # Remove quotes and whitespace
        value=$(echo "$value" | sed 's/^"//;s/"$//;s/^'\''//;s/'\''$//')
        
        if [ -n "$value" ]; then
            ENV_PAIRS+=("${key}=${value}")
        fi
    done < "../.env.production"
    
    if [ ${#ENV_PAIRS[@]} -gt 0 ]; then
        # eb setenv expects space-separated KEY=VALUE pairs
        eb setenv "${ENV_PAIRS[@]}"
        echo "✅ Environment variables updated"
    fi
else
    echo "⚠️  .env.production not found. Skipping environment variables."
fi

# Deploy the application
echo ""
echo "📤 Deploying application..."
eb deploy "$EB_ENV_NAME" --staged

# Get application URL
APP_URL=$(aws elasticbeanstalk describe-environments \
    --application-name "$EB_APP_NAME" \
    --environment-names "$EB_ENV_NAME" \
    --region "$AWS_REGION" \
    --query 'Environments[0].CNAME' \
    --output text)

echo ""
echo "=============================================="
echo "✅ Backend Deployment Complete!"
echo "=============================================="
echo ""
echo "🌐 Backend URL: http://$APP_URL"
echo "🔍 Health Check: http://$APP_URL/api/dashboard"
echo ""
echo "📝 To view logs: eb logs"
echo "📊 To check status: eb status"
echo "🔧 To SSH into instance: eb ssh"
echo ""
