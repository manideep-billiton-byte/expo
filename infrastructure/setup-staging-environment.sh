#!/bin/bash

# ============================================
# 🧪 AWS STAGING ENVIRONMENT SETUP
# ============================================
# Creates a complete staging environment on AWS
# separate from production for testing purposes
# ============================================

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║     🧪 AWS STAGING ENVIRONMENT SETUP - Expo Project                    ║"
echo "╠════════════════════════════════════════════════════════════════════════╣"
echo "║  This script creates a SEPARATE staging environment on AWS            ║"
echo "║  with its own database, backend, and frontend.                         ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it first:"
    echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "❌ jq not found. Installing..."
    sudo apt-get install -y jq 2>/dev/null || brew install jq
fi

# Verify AWS credentials
echo "🔐 Verifying AWS credentials..."
AWS_ACCOUNT=$(aws sts get-caller-identity --query 'Account' --output text 2>/dev/null)
if [ -z "$AWS_ACCOUNT" ]; then
    echo "❌ AWS credentials not configured. Run: aws configure"
    exit 1
fi
echo "✅ AWS Account: $AWS_ACCOUNT"

# Configuration
AWS_REGION="ap-south-1"
PROJECT_NAME="expo-project"
ENVIRONMENT="staging"

echo ""
echo "📋 Staging Configuration:"
echo "   Region:      $AWS_REGION"
echo "   Project:     $PROJECT_NAME"
echo "   Environment: $ENVIRONMENT"
echo ""

read -p "Continue with this configuration? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "Setup cancelled"
    exit 0
fi

# Generate strong password for staging database
STAGING_DB_PASSWORD="StgPass$(date +%s | sha256sum | head -c 8)!"
echo ""
echo "🔑 Generated staging database password (save this!):"
echo "   $STAGING_DB_PASSWORD"
echo ""

# ==================================
# STEP 1: Create Staging RDS Database
# ==================================
echo "═══════════════════════════════════════════════════════════════"
echo "STEP 1: Creating Staging RDS PostgreSQL Database..."
echo "═══════════════════════════════════════════════════════════════"

DB_IDENTIFIER="${PROJECT_NAME}-${ENVIRONMENT}-db"
DB_NAME="expo_staging_db"

# Check if database already exists
DB_EXISTS=$(aws rds describe-db-instances \
    --db-instance-identifier "$DB_IDENTIFIER" \
    --region "$AWS_REGION" \
    --query 'DBInstances[0].DBInstanceStatus' \
    --output text 2>/dev/null || echo "none")

if [ "$DB_EXISTS" = "none" ]; then
    echo "📦 Creating new staging database..."
    
    aws rds create-db-instance \
        --db-instance-identifier "$DB_IDENTIFIER" \
        --db-instance-class db.t3.micro \
        --engine postgres \
        --engine-version 15.15 \
        --master-username postgres \
        --master-user-password "$STAGING_DB_PASSWORD" \
        --allocated-storage 20 \
        --db-name "$DB_NAME" \
        --publicly-accessible \
        --backup-retention-period 1 \
        --region "$AWS_REGION" \
        --tags "Key=Project,Value=$PROJECT_NAME" "Key=Environment,Value=$ENVIRONMENT" \
        > /dev/null

    echo "⏳ Waiting for database to become available (5-10 minutes)..."
    aws rds wait db-instance-available \
        --db-instance-identifier "$DB_IDENTIFIER" \
        --region "$AWS_REGION"
else
    echo "✅ Staging database already exists: $DB_IDENTIFIER"
fi

# Get database endpoint
DB_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier "$DB_IDENTIFIER" \
    --region "$AWS_REGION" \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text)

echo "✅ Staging Database ready: $DB_ENDPOINT"

# Modify security group to allow connections
DB_SG=$(aws rds describe-db-instances \
    --db-instance-identifier "$DB_IDENTIFIER" \
    --region "$AWS_REGION" \
    --query 'DBInstances[0].VpcSecurityGroups[0].VpcSecurityGroupId' \
    --output text)

aws ec2 authorize-security-group-ingress \
    --group-id "$DB_SG" \
    --protocol tcp \
    --port 5432 \
    --cidr 0.0.0.0/0 \
    --region "$AWS_REGION" 2>/dev/null || echo "Security group rule may already exist"

# ==================================
# STEP 2: Create Staging S3 Bucket
# ==================================
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "STEP 2: Creating Staging S3 Bucket for Frontend..."
echo "═══════════════════════════════════════════════════════════════"

BUCKET_NAME="${PROJECT_NAME}-${ENVIRONMENT}-frontend-${AWS_ACCOUNT}"

aws s3 mb "s3://${BUCKET_NAME}" --region "$AWS_REGION" 2>/dev/null || echo "Bucket may already exist"

# Disable block public access
aws s3api put-public-access-block \
    --bucket "$BUCKET_NAME" \
    --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
    --region "$AWS_REGION"

# Enable static website hosting
aws s3 website "s3://${BUCKET_NAME}" \
    --index-document index.html \
    --error-document index.html

# Set bucket policy for public read
cat > /tmp/staging-bucket-policy.json <<EOF
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
    --policy file:///tmp/staging-bucket-policy.json

echo "✅ Staging S3 Bucket created: $BUCKET_NAME"

# ==================================
# STEP 3: Create Staging CloudFront
# ==================================
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "STEP 3: Creating Staging CloudFront Distribution..."
echo "═══════════════════════════════════════════════════════════════"

cat > /tmp/staging-cloudfront-config.json <<EOF
{
  "CallerReference": "staging-$(date +%s)",
  "Aliases": {
    "Quantity": 0
  },
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-${BUCKET_NAME}",
        "DomainName": "${BUCKET_NAME}.s3-website.${AWS_REGION}.amazonaws.com",
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
      "QueryString": true,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 3600,
    "MaxTTL": 86400,
    "Compress": true
  },
  "Comment": "Staging CloudFront for ${PROJECT_NAME}",
  "Enabled": true,
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      },
      {
        "ErrorCode": 403,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  }
}
EOF

CF_RESULT=$(aws cloudfront create-distribution \
    --distribution-config file:///tmp/staging-cloudfront-config.json 2>&1 || echo "error")

if echo "$CF_RESULT" | grep -q "DomainName"; then
    CF_FRONTEND_DOMAIN=$(echo "$CF_RESULT" | jq -r '.Distribution.DomainName')
    CF_FRONTEND_ID=$(echo "$CF_RESULT" | jq -r '.Distribution.Id')
    echo "✅ Staging CloudFront created: $CF_FRONTEND_DOMAIN"
else
    echo "⚠️  CloudFront might already exist, checking..."
    CF_FRONTEND_DOMAIN=$(aws cloudfront list-distributions \
        --query "DistributionList.Items[?Comment=='Staging CloudFront for ${PROJECT_NAME}'].DomainName" \
        --output text 2>/dev/null || echo "pending")
    CF_FRONTEND_ID=$(aws cloudfront list-distributions \
        --query "DistributionList.Items[?Comment=='Staging CloudFront for ${PROJECT_NAME}'].Id" \
        --output text 2>/dev/null || echo "")
fi

# ==================================
# STEP 4: Create Elastic Beanstalk
# ==================================
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "STEP 4: Creating Staging Elastic Beanstalk Application..."
echo "═══════════════════════════════════════════════════════════════"

EB_APP_NAME="${PROJECT_NAME}-${ENVIRONMENT}"
EB_ENV_NAME="${PROJECT_NAME}-${ENVIRONMENT}-env"

# Create application
aws elasticbeanstalk create-application \
    --application-name "$EB_APP_NAME" \
    --description "Expo Project Staging Backend API" \
    --region "$AWS_REGION" \
    2>/dev/null || echo "Application may already exist"

echo "✅ Elastic Beanstalk application ready: $EB_APP_NAME"

# ==================================
# STEP 5: Create Backend CloudFront
# ==================================
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "STEP 5: Creating Staging Backend CloudFront Distribution..."
echo "═══════════════════════════════════════════════════════════════"

# Note: Backend CloudFront will be created after EB environment is deployed
# For now, save the configuration

# ==================================
# STEP 6: Save Configuration
# ==================================
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "STEP 6: Saving Staging Environment Configuration..."
echo "═══════════════════════════════════════════════════════════════"

STAGING_DATABASE_URL="postgresql://postgres:${STAGING_DB_PASSWORD}@${DB_ENDPOINT}:5432/${DB_NAME}"

cat > "$(dirname "$0")/.env.staging" <<EOF
# ============================================
# STAGING Environment Variables
# Generated on $(date)
# ============================================

# Server
PORT=8080
NODE_ENV=staging
INVITE_LINK_BASE=https://${CF_FRONTEND_DOMAIN}

# Database (STAGING - separate from production)
DATABASE_URL=${STAGING_DATABASE_URL}
PGSSLMODE=require

# Email (use test credentials or leave empty for mock mode)
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM="Expo Staging <staging@test.com>"

# SMS (leave empty for mock mode)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM=

# GST API
GST_API_KEY=
EOF

echo "✅ Staging configuration saved to .env.staging"

# Save staging info
cat > "$(dirname "$0")/STAGING_INFO.md" <<EOF
# 🧪 EXPO PROJECT - STAGING ENVIRONMENT

## Created: $(date)

---

## 🔗 Staging URLs

| Resource | URL |
|----------|-----|
| **Frontend (CloudFront)** | https://${CF_FRONTEND_DOMAIN} |
| **Backend (EB)** | Will be available after deployment |
| **S3 Bucket** | ${BUCKET_NAME} |

---

## 🗄️ Database

| Property | Value |
|----------|-------|
| **Identifier** | $DB_IDENTIFIER |
| **Endpoint** | $DB_ENDPOINT |
| **Database** | $DB_NAME |
| **Username** | postgres |
| **Password** | $STAGING_DB_PASSWORD |
| **Connection String** | $STAGING_DATABASE_URL |

---

## 📋 AWS Resources

| Resource | Identifier |
|----------|------------|
| **RDS Database** | $DB_IDENTIFIER |
| **S3 Bucket** | $BUCKET_NAME |
| **CloudFront (Frontend)** | $CF_FRONTEND_ID |
| **EB Application** | $EB_APP_NAME |
| **EB Environment** | $EB_ENV_NAME |

---

## 🚀 Deployment Commands

### Deploy Backend:
\`\`\`bash
cd infrastructure
./deploy-staging-backend.sh
\`\`\`

### Deploy Frontend:
\`\`\`bash
cd infrastructure
./deploy-staging-frontend.sh
\`\`\`

---

## ⚠️ Important Notes

1. This is a **SEPARATE** environment from production
2. Database is isolated from production data
3. Perfect for QA testing without affecting production
4. Costs approximately \$30-40/month additional

---
EOF

echo "✅ Staging info saved to STAGING_INFO.md"

# ==================================
# Summary
# ==================================
echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║     ✅ STAGING ENVIRONMENT SETUP COMPLETE!                             ║"
echo "╠════════════════════════════════════════════════════════════════════════╣"
echo "║                                                                        ║"
echo "║  📊 STAGING RESOURCES CREATED:                                         ║"
echo "║                                                                        ║"
echo "║  🗄️  Database:                                                         ║"
echo "║      Endpoint: $DB_ENDPOINT"
echo "║      Password: $STAGING_DB_PASSWORD"
echo "║                                                                        ║"
echo "║  📦 S3 Bucket: $BUCKET_NAME"
echo "║                                                                        ║"
echo "║  🌐 CloudFront: $CF_FRONTEND_DOMAIN"
echo "║                                                                        ║"
echo "║  🚀 EB Application: $EB_APP_NAME"
echo "║                                                                        ║"
echo "╠════════════════════════════════════════════════════════════════════════╣"
echo "║                                                                        ║"
echo "║  📝 NEXT STEPS:                                                        ║"
echo "║                                                                        ║"
echo "║  1. Run database migrations:                                           ║"
echo "║     psql \"$STAGING_DATABASE_URL\" < ../server/schema.sql"
echo "║                                                                        ║"
echo "║  2. Deploy staging backend:                                            ║"
echo "║     ./deploy-staging-backend.sh                                        ║"
echo "║                                                                        ║"
echo "║  3. Deploy staging frontend:                                           ║"
echo "║     ./deploy-staging-frontend.sh                                       ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""
