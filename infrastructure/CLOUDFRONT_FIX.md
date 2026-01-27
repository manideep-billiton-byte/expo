# CloudFront Configuration Fix - Manual Steps

## Problem
Your CloudFront distribution at `https://d36p7i1koir3da.cloudfront.net/` is only configured to serve the frontend from S3. When the application tries to make API requests to `/api/*`, CloudFront returns the `index.html` file instead of forwarding the request to your backend server.

This causes the "Failed to fetch" error because the frontend receives HTML instead of JSON.

## Solution
Configure CloudFront to route `/api/*` requests to your Elastic Beanstalk backend.

## Manual Fix via AWS Console

### Step 1: Open CloudFront Console
1. Go to [AWS CloudFront Console](https://console.aws.amazon.com/cloudfront)
2. Find distribution: **E1U3WEIJ9OZDTY** (domain: d36p7i1koir3da.cloudfront.net)
3. Click on the distribution ID

### Step 2: Add Backend Origin
1. Click on the **Origins** tab
2. Click **Create origin**
3. Configure:
   - **Origin domain**: `expo-project-prod-env.eba-i8rfmfk2.ap-south-1.elasticbeanstalk.com`
   - **Protocol**: HTTP only
   - **HTTP port**: 80
   - **Origin path**: (leave empty)
   - **Name**: `backend-api` (or auto-generated)
   - **Enable Origin Shield**: No
4. Click **Create origin**

### Step 3: Add Cache Behavior for /api/*
1. Click on the **Behaviors** tab
2. Click **Create behavior**
3. Configure:
   - **Path pattern**: `/api/*`
   - **Origin**: Select the backend origin you just created (`backend-api`)
   - **Viewer protocol policy**: Redirect HTTP to HTTPS
   - **Allowed HTTP methods**: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   - **Cache policy**: CachingDisabled (or create custom policy with 0 TTL)
   - **Origin request policy**: AllViewer
   - **Response headers policy**: (none)
4. Click **Create behavior**

### Step 4: Wait for Deployment
- CloudFront will deploy the changes (5-15 minutes)
- Status will show "In Progress" then "Deployed"
- You can check status in the **General** tab

### Step 5: Test the Fix
Once deployed, test the API endpoint:

```bash
curl https://d36p7i1koir3da.cloudfront.net/api/organizations
```

You should receive JSON data instead of HTML.

## Alternative: Use AWS CLI (If boto3 is available)

If you have Python boto3 installed, you can use the automated script:

```bash
cd infrastructure
./fix-cloudfront-v2.sh
```

## Verification

After the changes are deployed:

1. **Test API endpoint directly**:
   ```bash
   curl https://d36p7i1koir3da.cloudfront.net/api/organizations
   ```
   Expected: JSON array of organizations

2. **Test in browser**:
   - Open https://d36p7i1koir3da.cloudfront.net/
   - Open browser console (F12)
   - Try to login
   - You should see successful API requests instead of "Failed to fetch"

## Important Notes

- **Cache Behavior Order**: CloudFront evaluates behaviors in order. The `/api/*` behavior will be checked before the default behavior.
- **CORS**: Make sure your backend has CORS configured to allow requests from the CloudFront domain.
- **HTTPS**: The backend origin uses HTTP, but CloudFront serves HTTPS to clients (this is normal).

## Troubleshooting

### If API still returns HTML:
1. Check that the behavior was created correctly
2. Verify the origin domain is correct
3. Wait for full deployment (check status)
4. Clear browser cache or use incognito mode

### If you get CORS errors:
Check that your backend `/server/index.js` has CORS configured:
```javascript
app.use(cors({
  origin: ['https://d36p7i1koir3da.cloudfront.net', 'http://localhost:5173'],
  credentials: true
}));
```

### If you get 502 Bad Gateway:
1. Check that the backend Elastic Beanstalk environment is running
2. Verify the backend URL is correct
3. Check backend health in Elastic Beanstalk console

## Next Steps

After fixing CloudFront:
1. ✅ Test all API endpoints
2. ✅ Test login functionality
3. ✅ Test organization management
4. ✅ Verify QR code scanning works
5. ✅ Check that all features work in production

## Distribution Details

- **Distribution ID**: E1U3WEIJ9OZDTY
- **Domain**: d36p7i1koir3da.cloudfront.net
- **Backend**: expo-project-prod-env.eba-i8rfmfk2.ap-south-1.elasticbeanstalk.com
- **Region**: ap-south-1
