#!/bin/bash

# Script to configure S3 bucket policy for public QR code access

set -e

echo "=========================================="
echo "🔧 S3 BUCKET PUBLIC ACCESS CONFIGURATION"
echo "=========================================="
echo ""

BUCKET_NAME="expo-project-prod-frontend"
REGION="ap-south-1"

echo "📦 Bucket: $BUCKET_NAME"
echo "🌍 Region: $REGION"
echo ""

# Create the bucket policy JSON
cat > /tmp/qr-bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadQRCodes",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${BUCKET_NAME}/qr/*"
    }
  ]
}
EOF

echo "📋 Bucket Policy to be applied:"
cat /tmp/qr-bucket-policy.json
echo ""

read -p "🤔 Apply this policy to allow public access to QR codes? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    rm /tmp/qr-bucket-policy.json
    exit 1
fi

echo ""
echo "🔓 Step 1: Checking current bucket policy..."
aws s3api get-bucket-policy --bucket $BUCKET_NAME --region $REGION 2>/dev/null || echo "No existing policy found"

echo ""
echo "📝 Step 2: Applying new bucket policy..."
aws s3api put-bucket-policy \
    --bucket $BUCKET_NAME \
    --policy file:///tmp/qr-bucket-policy.json \
    --region $REGION

if [ $? -eq 0 ]; then
    echo "✅ Bucket policy applied successfully!"
else
    echo "❌ Failed to apply bucket policy"
    echo ""
    echo "⚠️  You may need to disable 'Block Public Access' first:"
    echo "   1. Go to: https://s3.console.aws.amazon.com/s3/buckets/${BUCKET_NAME}?region=${REGION}&tab=permissions"
    echo "   2. Click 'Edit' under 'Block public access (bucket settings)'"
    echo "   3. Uncheck 'Block all public access'"
    echo "   4. Save changes"
    echo "   5. Run this script again"
    rm /tmp/qr-bucket-policy.json
    exit 1
fi

echo ""
echo "🧪 Step 3: Testing access..."
echo "Uploading test file..."

# Create a test file
echo "Test QR Code Access" > /tmp/test-qr.txt
aws s3 cp /tmp/test-qr.txt s3://${BUCKET_NAME}/qr/test.txt --region $REGION

# Try to access it
TEST_URL="https://d2ux36xl31uki3.cloudfront.net/qr/test.txt"
echo "Testing URL: $TEST_URL"

sleep 2  # Wait for CloudFront to propagate

if curl -s -o /dev/null -w "%{http_code}" "$TEST_URL" | grep -q "200"; then
    echo "✅ Public access is working!"
else
    echo "⚠️  CloudFront may need time to propagate (wait 5-10 minutes)"
    echo "   Or you may need to invalidate CloudFront cache"
fi

# Cleanup
rm /tmp/qr-bucket-policy.json
rm /tmp/test-qr.txt
aws s3 rm s3://${BUCKET_NAME}/qr/test.txt --region $REGION 2>/dev/null || true

echo ""
echo "=========================================="
echo "✅ CONFIGURATION COMPLETE!"
echo "=========================================="
echo ""
echo "📋 Next steps:"
echo "   1. Wait 2-3 minutes for changes to propagate"
echo "   2. Test the QR URL again: https://d2ux36xl31uki3.cloudfront.net/qr/event_999999.png"
echo "   3. Create a new event to generate a fresh QR code"
echo ""
