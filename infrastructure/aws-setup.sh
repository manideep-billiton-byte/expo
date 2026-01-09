#!/bin/bash

# AWS Infrastructure Setup Script
# This script sets up the complete AWS infrastructure for the Expo project

set -e

echo "🚀 AWS Infrastructure Setup for Expo Project"
echo "=============================================="

# Check for AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it first:"
    echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check for jq
if ! command -v jq &> /dev/null; then
    echo "❌ jq not found. Please install it: sudo apt-get install jq"
    exit 1
fi

# Configuration
read -p "Enter AWS Region (default: ap-south-1): " AWS_REGION
AWS_REGION=${AWS_REGION:-ap-south-1}

read -p "Enter Project Name (default: expo-project): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-expo-project}

read -p "Enter Environment (dev/staging/prod) (default: prod): " ENVIRONMENT
ENVIRONMENT=${ENVIRONMENT:-prod}

read -p "Enter Database Name (default: expo_db): " DB_NAME
DB_NAME=${DB_NAME:-expo_db}

read -sp "Enter Database Master Password: " DB_PASSWORD
echo

if [ -z "$DB_PASSWORD" ]; then
    echo "❌ Database password is required"
    exit 1
fi

echo ""
echo "📋 Configuration Summary:"
echo "  Region: $AWS_REGION"
echo "  Project: $PROJECT_NAME"
echo "  Environment: $ENVIRONMENT"
echo "  Database: $DB_NAME"
echo ""
read -p "Continue with this configuration? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "Setup cancelled"
    exit 0
fi

# Step 1: Create RDS PostgreSQL Database
echo ""
echo "📦 Step 1: Creating RDS PostgreSQL Database..."
DB_IDENTIFIER="${PROJECT_NAME}-${ENVIRONMENT}-db"

aws rds create-db-instance \
    --db-instance-identifier "$DB_IDENTIFIER" \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --engine-version 15.15 \
    --master-username postgres \
    --master-user-password "$DB_PASSWORD" \
    --allocated-storage 20 \
    --db-name "$DB_NAME" \
    --publicly-accessible \
    --region "$AWS_REGION" \
    --tags "Key=Project,Value=$PROJECT_NAME" "Key=Environment,Value=$ENVIRONMENT" \
    > /dev/null 2>&1 || echo "⚠️  Database may already exist or error occurred"

echo "✅ RDS Database creation initiated (this takes 5-10 minutes)"

# Step 2: Wait for database to be available
echo "⏳ Waiting for database to become available..."
aws rds wait db-instance-available \
    --db-instance-identifier "$DB_IDENTIFIER" \
    --region "$AWS_REGION"

# Get database endpoint
DB_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier "$DB_IDENTIFIER" \
    --region "$AWS_REGION" \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text)

echo "✅ Database is ready at: $DB_ENDPOINT"

# Step 3: Create S3 Bucket for Frontend
echo ""
echo "📦 Step 2: Creating S3 Bucket for Frontend..."
BUCKET_NAME="${PROJECT_NAME}-${ENVIRONMENT}-frontend"

aws s3 mb "s3://${BUCKET_NAME}" --region "$AWS_REGION" || echo "⚠️  Bucket may already exist"

# Enable static website hosting
aws s3 website "s3://${BUCKET_NAME}" \
    --index-document index.html \
    --error-document index.html

# Set bucket policy for public read
cat > /tmp/bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
    --bucket "$BUCKET_NAME" \
    --policy file:///tmp/bucket-policy.json

echo "✅ S3 Bucket created: $BUCKET_NAME"

# Step 4: Create CloudFront Distribution
echo ""
echo "📦 Step 3: Creating CloudFront Distribution..."

cat > /tmp/cloudfront-config.json <<EOF
{
  "CallerReference": "$(date +%s)",
  "Aliases": {
    "Quantity": 0
  },
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-${BUCKET_NAME}",
        "DomainName": "${BUCKET_NAME}.s3-website-${AWS_REGION}.amazonaws.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only"
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-${BUCKET_NAME}",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "Compress": true
  },
  "Comment": "CloudFront distribution for ${PROJECT_NAME}",
  "Enabled": true,
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  }
}
EOF

CF_RESULT=$(aws cloudfront create-distribution \
    --distribution-config file:///tmp/cloudfront-config.json \
    --region "$AWS_REGION" 2>&1 || echo "error")

if [ "$CF_RESULT" != "error" ]; then
    CF_DOMAIN=$(echo "$CF_RESULT" | jq -r '.Distribution.DomainName')
    echo "✅ CloudFront Distribution created: $CF_DOMAIN"
else
    echo "⚠️  CloudFront creation skipped or error occurred"
    CF_DOMAIN="<pending>"
fi

# Step 5: Initialize Elastic Beanstalk Application
echo ""
echo "📦 Step 4: Creating Elastic Beanstalk Application..."
EB_APP_NAME="${PROJECT_NAME}-${ENVIRONMENT}"

aws elasticbeanstalk create-application \
    --application-name "$EB_APP_NAME" \
    --description "Expo Project Backend API" \
    --region "$AWS_REGION" \
    > /dev/null 2>&1 || echo "⚠️  Application may already exist"

echo "✅ Elastic Beanstalk application ready: $EB_APP_NAME"

# Step 6: Create environment configuration
echo ""
echo "📦 Step 5: Saving environment configuration..."

DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@${DB_ENDPOINT}:5432/${DB_NAME}"

cat > .env.production <<EOF
# Production Environment Variables
# Generated on $(date)

# Server
PORT=8080
NODE_ENV=production
INVITE_LINK_BASE=https://${CF_DOMAIN}

# Database
DATABASE_URL=${DATABASE_URL}
PGSSLMODE=require

# Add your credentials below:
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM=

GST_API_KEY=
EOF

echo "✅ Environment configuration saved to .env.production"

# Summary
echo ""
echo "=============================================="
echo "✅ AWS Infrastructure Setup Complete!"
echo "=============================================="
echo ""
echo "📋 Resources Created:"
echo "  • RDS Database: $DB_IDENTIFIER"
echo "  • Database Endpoint: $DB_ENDPOINT"
echo "  • S3 Bucket: $BUCKET_NAME"
echo "  • CloudFront Domain: $CF_DOMAIN"
echo "  • EB Application: $EB_APP_NAME"
echo ""
echo "📝 Next Steps:"
echo "  1. Edit .env.production and add your SMTP, Twilio, and GST API credentials"
echo "  2. Run ./backend-deploy.sh to deploy the backend"
echo "  3. Run ./frontend-deploy.sh to deploy the frontend"
echo ""
echo "💾 Save these values:"
echo "  Database URL: $DATABASE_URL"
echo "  Frontend URL: https://$CF_DOMAIN"
echo ""
