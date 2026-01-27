#!/bin/bash

# Fix CloudFront Configuration to Route API Requests to Backend
# This script adds the Elastic Beanstalk backend as an origin and creates a behavior for /api/*

set -e

echo "🔧 Fixing CloudFront Configuration..."

# Configuration
CLOUDFRONT_DOMAIN="d36p7i1koir3da.cloudfront.net"
BACKEND_URL="expo-project-prod-env.eba-i8rfmfk2.ap-south-1.elasticbeanstalk.com"
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
          "CustomHeaders": {
            "Quantity": 0
          },
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
          "OriginShield": {
            "Enabled": false
          }
        }]' /tmp/cf-dist-config.json > /tmp/cf-dist-config-new.json
    
    mv /tmp/cf-dist-config-new.json /tmp/cf-dist-config.json
    echo "✅ Backend origin added"
else
    echo "ℹ️  Backend origin already exists"
fi

# Check if /api/* behavior already exists
API_BEHAVIOR_EXISTS=$(jq '.CacheBehaviors.Items[]? | select(.PathPattern == "/api/*")' /tmp/cf-dist-config.json)

if [ -z "$API_BEHAVIOR_EXISTS" ]; then
    echo "➕ Adding /api/* cache behavior..."
    
    # Get default cache behavior settings to use as template
    DEFAULT_TARGET_ORIGIN=$(jq -r '.DefaultCacheBehavior.TargetOriginId' /tmp/cf-dist-config.json)
    
    # Add /api/* cache behavior
    jq '.CacheBehaviors.Quantity += 1 | 
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
          "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
          },
          "TrustedKeyGroups": {
            "Enabled": false,
            "Quantity": 0
          }
        }]' /tmp/cf-dist-config.json > /tmp/cf-dist-config-new.json
    
    mv /tmp/cf-dist-config-new.json /tmp/cf-dist-config.json
    echo "✅ /api/* cache behavior added"
else
    echo "ℹ️  /api/* cache behavior already exists"
fi

# Update the distribution
echo "🚀 Updating CloudFront distribution..."
aws cloudfront update-distribution \
    --id "$DISTRIBUTION_ID" \
    --distribution-config file:///tmp/cf-dist-config.json \
    --if-match "$ETAG" > /tmp/cf-update-result.json

echo "✅ CloudFront distribution updated successfully!"
echo ""
echo "⏳ CloudFront is now deploying the changes..."
echo "   This typically takes 5-15 minutes."
echo ""
echo "📊 You can check the status with:"
echo "   aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.Status'"
echo ""
echo "🔄 To monitor deployment progress:"
echo "   aws cloudfront wait distribution-deployed --id $DISTRIBUTION_ID"
echo ""
echo "✨ Once deployed, your API requests to https://${CLOUDFRONT_DOMAIN}/api/* will be routed to the backend!"

# Clean up
rm -f /tmp/cf-config.json /tmp/cf-dist-config.json /tmp/cf-update-result.json

echo ""
echo "🎉 Configuration update complete!"
