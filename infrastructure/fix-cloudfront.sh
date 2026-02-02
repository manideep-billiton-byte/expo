#!/bin/bash

# Fix CloudFront Configuration to Route API Requests to Backend
# This script adds the Elastic Beanstalk backend as an origin and creates a behavior for /api/*

set -e

echo "🔧 Fixing CloudFront Configuration..."

# Configuration
CLOUDFRONT_DOMAIN="d2mwpnz04jz48g.cloudfront.net"
BACKEND_URL="expo-project-staging-env.eba-msq3qh3p.ap-south-1.elasticbeanstalk.com"
REGION="ap-south-1"

# Get CloudFront distribution ID
echo "📡 Finding CloudFront distribution..."
DISTRIBUTION_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?DomainName=='${CLOUDFRONT_DOMAIN}'].Id" --output text)

if [ -z "$DISTRIBUTION_ID" ]; then
    echo "❌ Error: Could not find CloudFront distribution with domain ${CLOUDFRONT_DOMAIN}"
    exit 1
fi

echo "✅ Found distribution: $DISTRIBUTION_ID"

# Get current configuration
echo "📥 Downloading current configuration..."
aws cloudfront get-distribution-config --id "$DISTRIBUTION_ID" > /tmp/cf-config.json

# Extract ETag
ETAG=$(jq -r '.ETag' /tmp/cf-config.json)
echo "📝 Current ETag: $ETAG"

# Extract just the DistributionConfig
jq '.DistributionConfig' /tmp/cf-config.json > /tmp/cf-dist-config.json

# Check if backend origin already exists
BACKEND_ORIGIN_EXISTS=$(jq --arg domain "$BACKEND_URL" '.Origins.Items[] | select(.DomainName == $domain)' /tmp/cf-dist-config.json)

if [ -z "$BACKEND_ORIGIN_EXISTS" ]; then
    echo "➕ Adding backend origin..."
    
    # Add backend origin
    jq --arg domain "$BACKEND_URL" \
       '.Origins.Quantity += 1 | 
        .Origins.Items += [{
          "Id": "backend-api",
          "DomainName": $domain,
          "OriginPath": "",
          "CustomHeaders": { "Quantity": 0 },
          "CustomOriginConfig": {
            "HTTPPort": 80,
            "HTTPSPort": 443,
            "OriginProtocolPolicy": "http-only",
            "OriginSslProtocols": {
              "Quantity": 3,
              "Items": ["TLSv1", "TLSv1.1", "TLSv1.2"]
            },
            "OriginReadTimeout": 30,
            "OriginKeepaliveTimeout": 5
          },
          "ConnectionAttempts": 3,
          "ConnectionTimeout": 10,
          "OriginShield": { "Enabled": false }
        }]' /tmp/cf-dist-config.json > /tmp/cf-dist-config-temp.json
    mv /tmp/cf-dist-config-temp.json /tmp/cf-dist-config.json
fi

# Check if /api/* behavior already exists
API_BEHAVIOR_EXISTS=$(jq '.CacheBehaviors.Items[]? | select(.PathPattern == "/api/*")' /tmp/cf-dist-config.json)

if [ -z "$API_BEHAVIOR_EXISTS" ]; then
    echo "➕ Adding /api/* cache behavior..."
    
    # Add /api/* cache behavior
    jq '.CacheBehaviors = (if .CacheBehaviors then .CacheBehaviors else { "Quantity": 0, "Items": [] } end) |
        .CacheBehaviors.Quantity += 1 | 
        .CacheBehaviors.Items += [{
          "PathPattern": "/api/*",
          "TargetOriginId": "backend-api",
          "ViewerProtocolPolicy": "redirect-to-https",
          "AllowedMethods": {
            "Quantity": 7,
            "Items": ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
            "CachedMethods": {
              "Quantity": 2,
              "Items": ["GET", "HEAD"]
            }
          },
          "Compress": true,
          "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
          "OriginRequestPolicyId": "216adef6-5c7f-47e4-b989-5492eafa07d3",
          "SmoothStreaming": false,
          "FieldLevelEncryptionId": "",
          "TrustedSigners": { "Enabled": false, "Quantity": 0 },
          "TrustedKeyGroups": { "Enabled": false, "Quantity": 0 },
          "LambdaFunctionAssociations": { "Quantity": 0 },
          "FunctionAssociations": { "Quantity": 0 }
        }]' /tmp/cf-dist-config.json > /tmp/cf-dist-config-temp.json
    mv /tmp/cf-dist-config-temp.json /tmp/cf-dist-config.json
fi

# Update the distribution
echo "🚀 Updating CloudFront distribution..."
aws cloudfront update-distribution \
    --id "$DISTRIBUTION_ID" \
    --distribution-config file:///tmp/cf-dist-config.json \
    --if-match "$ETAG" > /tmp/cf-update-result.json

echo "✅ CloudFront distribution updated successfully!"
echo "⏳ Changes are being deployed (5-15 mins)."
rm -f /tmp/cf-config.json /tmp/cf-dist-config.json /tmp/cf-update-result.json

echo ""
echo "🎉 Configuration update complete!"
