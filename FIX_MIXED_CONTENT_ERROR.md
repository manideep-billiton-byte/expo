# Fix: "Failed to Fetch" Error - Mixed Content Issue

## Problem Identified

Your frontend is served over **HTTPS** (via CloudFront: `https://d2ux36xl31uki3.cloudfront.net/`)  
But your backend API is only available over **HTTP**: `http://expo-project-prod-env.eba-i8rfmfk2.ap-south-1.elasticbeanstalk.com`

**Modern browsers block mixed content** - HTTPS pages cannot make HTTP requests for security reasons.

## Solution Options

### Option 1: Enable HTTPS on Elastic Beanstalk (Recommended for Production)

#### Step 1: Add HTTPS Listener to Load Balancer

1. Go to **AWS Elastic Beanstalk Console**
2. Select your environment: `expo-project-prod-env`
3. Click **Configuration** → **Load balancer** → **Edit**
4. Under **Listeners**, click **Add listener**:
   - Port: `443`
   - Protocol: `HTTPS`
   - SSL certificate: Select **"Use an AWS Certificate Manager (ACM) certificate"**
   - If you don't have a certificate, click **"Request a new ACM certificate"**

#### Step 2: Request ACM Certificate (if needed)

1. Go to **AWS Certificate Manager**: https://console.aws.amazon.com/acm
2. Click **Request a certificate**
3. Choose **Request a public certificate**
4. Domain name: `*.elasticbeanstalk.com` OR your custom domain
5. Validation method: **DNS validation** (recommended)
6. Complete the validation process
7. Once validated, go back to Elastic Beanstalk and select this certificate

#### Step 3: Update Frontend Configuration

Once HTTPS is enabled on the backend:

```bash
cd /home/billiton/Documents/Billiton/Expo_project/client

# Update .env.production
cat > .env.production <<EOF
VITE_API_URL=https://expo-project-prod-env.eba-i8rfmfk2.ap-south-1.elasticbeanstalk.com
VITE_ENV=production
EOF

# Rebuild and redeploy frontend
npm run build
aws s3 sync dist/ s3://expo-project-prod-frontend/ --delete
aws cloudfront create-invalidation --distribution-id E1YWRKVDWXGBG9 --paths "/*"
```

---

### Option 2: Quick Temporary Fix (For Testing Only)

**Access the site via HTTP instead of HTTPS:**

Instead of: `https://d2ux36xl31uki3.cloudfront.net/`  
Use: `http://expo-project-prod-frontend.s3-website-ap-south-1.amazonaws.com/`

This will work because both frontend and backend are using HTTP.

**⚠️ Warning**: This is NOT secure for production use!

---

### Option 3: Use CloudFront for Backend Too (Alternative)

Create a CloudFront distribution for your backend API:

1. Go to **CloudFront Console**
2. Create a new distribution
3. Origin domain: `expo-project-prod-env.eba-i8rfmfk2.ap-south-1.elasticbeanstalk.com`
4. Protocol: HTTP only
5. Once created, update frontend to use the CloudFront URL (which will be HTTPS)

---

## Recommended Action

**For production deployment**, use **Option 1** to enable HTTPS on Elastic Beanstalk.

**For quick testing**, use **Option 2** to access via HTTP.

---

## Current Status

- ✅ Backend API is working correctly (tested via curl)
- ✅ Frontend is deployed and accessible
- ❌ Mixed content blocking HTTPS → HTTP requests
- 🔧 **Fix needed**: Enable HTTPS on backend OR access frontend via HTTP

---

## Testing Commands

```bash
# Test backend (HTTP - works)
curl http://expo-project-prod-env.eba-i8rfmfk2.ap-south-1.elasticbeanstalk.com/api/organizations

# Test backend (HTTPS - currently fails)
curl https://expo-project-prod-env.eba-i8rfmfk2.ap-south-1.elasticbeanstalk.com/api/organizations

# Access frontend via HTTP (temporary workaround)
# Open: http://expo-project-prod-frontend.s3-website-ap-south-1.amazonaws.com/
```
