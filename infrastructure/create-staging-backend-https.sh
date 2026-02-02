#!/bin/bash

# ============================================
# 🔒 Create HTTPS CloudFront for Staging Backend
# ============================================

set -e

AWS_REGION="ap-south-1"
BACKEND_URL="expo-project-staging-env.eba-msq3qh3p.ap-south-1.elasticbeanstalk.com"

echo "🔒 Creating CloudFront distribution for staging backend..."
echo "   Backend: $BACKEND_URL"
echo ""

# Create CloudFront distribution config
cat > /tmp/staging-backend-cf-config.json <<EOF
{
  "CallerReference": "staging-backend-$(date +%s)",
  "Aliases": {
    "Quantity": 0
  },
  "DefaultRootObject": "",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "EB-Staging-Backend",
        "DomainName": "${BACKEND_URL}",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only",
          "OriginSslProtocols": {
            "Quantity": 1,
            "Items": ["TLSv1.2"]
          },
          "OriginReadTimeout": 60,
          "OriginKeepaliveTimeout": 5
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "EB-Staging-Backend",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 7,
      "Items": ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "ForwardedValues": {
      "QueryString": true,
      "Cookies": {
        "Forward": "all"
      },
      "Headers": {
        "Quantity": 4,
        "Items": ["Authorization", "Content-Type", "Accept", "Origin"]
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 0,
    "MaxTTL": 0,
    "Compress": true,
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    }
  },
  "Comment": "Staging Backend CloudFront for expo-project",
  "Enabled": true
}
EOF

# Create the distribution
echo "📦 Creating CloudFront distribution..."
CF_RESULT=$(aws cloudfront create-distribution \
    --distribution-config file:///tmp/staging-backend-cf-config.json \
    2>&1)

if echo "$CF_RESULT" | grep -q "DomainName"; then
    CF_DOMAIN=$(echo "$CF_RESULT" | jq -r '.Distribution.DomainName')
    CF_ID=$(echo "$CF_RESULT" | jq -r '.Distribution.Id')
    
    echo "✅ CloudFront distribution created!"
    echo "   Domain: $CF_DOMAIN"
    echo "   ID: $CF_ID"
    echo ""
    echo "⏳ Distribution is deploying (this takes 10-15 minutes)..."
    echo "   You can check status at: https://console.aws.amazon.com/cloudfront/"
    echo ""
    echo "🔗 HTTPS Backend URL: https://$CF_DOMAIN"
    echo ""
    
    # Save the URL
    echo "STAGING_BACKEND_HTTPS_URL=https://$CF_DOMAIN" >> "$(dirname "$0")/.env.staging.urls"
    
    echo "✅ Saved to .env.staging.urls"
else
    echo "❌ Failed to create CloudFront distribution"
    echo "$CF_RESULT"
    exit 1
fi
