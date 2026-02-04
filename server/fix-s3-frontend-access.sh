#!/bin/bash

echo "=========================================="
echo "🔧 FIXING S3 BUCKET POLICY FOR FRONTEND"
echo "=========================================="
echo ""

BUCKET="expo-project-prod-frontend"
REGION="ap-south-1"

echo "📦 Bucket: $BUCKET"
echo "🌍 Region: $REGION"
echo ""

# Create bucket policy that allows public read for ALL files
cat > /tmp/s3-frontend-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::expo-project-prod-frontend/*"
    }
  ]
}
EOF

echo "📋 New Bucket Policy:"
cat /tmp/s3-frontend-policy.json
echo ""

echo "🔄 Applying bucket policy..."
aws s3api put-bucket-policy \
  --bucket "$BUCKET" \
  --policy file:///tmp/s3-frontend-policy.json \
  --region "$REGION"

if [ $? -eq 0 ]; then
    echo "✅ Bucket policy applied successfully!"
    echo ""
    
    echo "🧪 Testing access..."
    echo ""
    
    # Test CloudFront URL
    echo "Testing: https://d2ux36xl31uki3.cloudfront.net/"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://d2ux36xl31uki3.cloudfront.net/)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ CloudFront access working! (HTTP $HTTP_CODE)"
    else
        echo "⚠️  CloudFront returned HTTP $HTTP_CODE"
        echo "   Note: CloudFront cache may take 5-10 minutes to update"
        echo "   Try invalidating cache or wait a few minutes"
    fi
    
    echo ""
    echo "=========================================="
    echo "✅ FIX COMPLETE!"
    echo "=========================================="
    echo ""
    echo "🌐 Your frontend should now be accessible at:"
    echo "   https://d2ux36xl31uki3.cloudfront.net/"
    echo ""
    echo "⏰ If still showing 403:"
    echo "   1. Wait 5-10 minutes for CloudFront cache to clear"
    echo "   2. Or invalidate CloudFront cache manually"
    echo "   3. Or try in incognito/private browsing mode"
    echo ""
else
    echo "❌ Failed to apply bucket policy"
    echo "Check AWS permissions and try again"
fi

# Cleanup
rm -f /tmp/s3-frontend-policy.json
