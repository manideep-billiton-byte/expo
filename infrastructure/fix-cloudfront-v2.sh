#!/bin/bash

# Fix CloudFront Configuration - Alternative Approach
# This script provides instructions and a Python helper to update CloudFront

set -e

echo "🔧 CloudFront Configuration Fix"
echo ""
echo "The issue: Your CloudFront distribution only serves the S3 frontend."
echo "API requests to /api/* are returning HTML instead of JSON."
echo ""
echo "Solution: We need to add your backend as an origin and create a behavior for /api/*"
echo ""

# Configuration
CLOUDFRONT_DOMAIN="d36p7i1koir3da.cloudfront.net"
BACKEND_URL="expo-project-prod-env.eba-i8rfmfk2.ap-south-1.elasticbeanstalk.com"

# Get distribution ID
DISTRIBUTION_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?DomainName=='${CLOUDFRONT_DOMAIN}'].Id" --output text)

echo "📊 Distribution ID: $DISTRIBUTION_ID"
echo "🔗 Backend URL: $BACKEND_URL"
echo ""

# Create Python script to properly update CloudFront
cat > /tmp/update_cloudfront.py << 'PYTHON_SCRIPT'
import boto3
import json
import sys

def update_cloudfront_config(distribution_id, backend_domain):
    client = boto3.client('cloudfront')
    
    # Get current configuration
    print("📥 Getting current configuration...")
    response = client.get_distribution_config(Id=distribution_id)
    config = response['DistributionConfig']
    etag = response['ETag']
    
    # Check if backend origin exists
    backend_origin_id = 'backend-api'
    origin_exists = any(origin['Id'] == backend_origin_id for origin in config['Origins']['Items'])
    
    if not origin_exists:
        print(f"➕ Adding backend origin: {backend_domain}")
        config['Origins']['Quantity'] += 1
        config['Origins']['Items'].append({
            'Id': backend_origin_id,
            'DomainName': backend_domain,
            'OriginPath': '',
            'CustomHeaders': {
                'Quantity': 0
            },
            'CustomOriginConfig': {
                'HTTPPort': 80,
                'HTTPSPort': 443,
                'OriginProtocolPolicy': 'http-only',
                'OriginSslProtocols': {
                    'Quantity': 3,
                    'Items': ['TLSv1', 'TLSv1.1', 'TLSv1.2']
                },
                'OriginReadTimeout': 30,
                'OriginKeepaliveTimeout': 5
            },
            'ConnectionAttempts': 3,
            'ConnectionTimeout': 10,
            'OriginShield': {
                'Enabled': False
            }
        })
    else:
        print("ℹ️  Backend origin already exists")
    
    # Check if /api/* behavior exists
    if 'CacheBehaviors' not in config or 'Items' not in config['CacheBehaviors']:
        config['CacheBehaviors'] = {'Quantity': 0, 'Items': []}
    
    api_behavior_exists = any(
        behavior.get('PathPattern') == '/api/*' 
        for behavior in config['CacheBehaviors']['Items']
    )
    
    if not api_behavior_exists:
        print("➕ Adding /api/* cache behavior...")
        config['CacheBehaviors']['Quantity'] += 1
        
        # Create behavior based on default behavior but for backend
        default_behavior = config['DefaultCacheBehavior']
        
        api_behavior = {
            'PathPattern': '/api/*',
            'TargetOriginId': backend_origin_id,
            'ViewerProtocolPolicy': 'redirect-to-https',
            'AllowedMethods': {
                'Quantity': 7,
                'Items': ['GET', 'HEAD', 'OPTIONS', 'PUT', 'POST', 'PATCH', 'DELETE'],
                'CachedMethods': {
                    'Quantity': 2,
                    'Items': ['GET', 'HEAD']
                }
            },
            'Compress': True,
            'CachePolicyId': '4135ea2d-6df8-44a3-9df3-4b5a84be39ad',  # CachingDisabled
            'OriginRequestPolicyId': '216adef6-5c7f-47e4-b989-5492eafa07d3',  # AllViewer
            'SmoothStreaming': False,
            'FieldLevelEncryptionId': '',
            'TrustedSigners': {
                'Enabled': False,
                'Quantity': 0
            },
            'TrustedKeyGroups': {
                'Enabled': False,
                'Quantity': 0
            }
        }
        
        # Copy Lambda associations if they exist in default behavior
        if 'LambdaFunctionAssociations' in default_behavior:
            api_behavior['LambdaFunctionAssociations'] = default_behavior['LambdaFunctionAssociations']
        else:
            api_behavior['LambdaFunctionAssociations'] = {'Quantity': 0}
        
        # Copy Function associations if they exist
        if 'FunctionAssociations' in default_behavior:
            api_behavior['FunctionAssociations'] = default_behavior['FunctionAssociations']
        else:
            api_behavior['FunctionAssociations'] = {'Quantity': 0}
        
        config['CacheBehaviors']['Items'].append(api_behavior)
    else:
        print("ℹ️  /api/* cache behavior already exists")
    
    # Update the distribution
    print("🚀 Updating CloudFront distribution...")
    try:
        client.update_distribution(
            Id=distribution_id,
            DistributionConfig=config,
            IfMatch=etag
        )
        print("✅ CloudFront distribution updated successfully!")
        print("")
        print("⏳ CloudFront is now deploying the changes (5-15 minutes)...")
        print(f"   Check status: aws cloudfront get-distribution --id {distribution_id} --query 'Distribution.Status'")
        return True
    except Exception as e:
        print(f"❌ Error updating distribution: {e}")
        return False

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python update_cloudfront.py <distribution_id> <backend_domain>")
        sys.exit(1)
    
    distribution_id = sys.argv[1]
    backend_domain = sys.argv[2]
    
    success = update_cloudfront_config(distribution_id, backend_domain)
    sys.exit(0 if success else 1)
PYTHON_SCRIPT

echo "🐍 Running Python script to update CloudFront..."
python3 /tmp/update_cloudfront.py "$DISTRIBUTION_ID" "$BACKEND_URL"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Configuration update complete!"
    echo ""
    echo "📊 Monitor deployment:"
    echo "   aws cloudfront wait distribution-deployed --id $DISTRIBUTION_ID"
    echo ""
    echo "✨ Once deployed, test with:"
    echo "   curl https://${CLOUDFRONT_DOMAIN}/api/organizations"
else
    echo ""
    echo "❌ Update failed. Please check the error message above."
    exit 1
fi

# Clean up
rm -f /tmp/update_cloudfront.py
