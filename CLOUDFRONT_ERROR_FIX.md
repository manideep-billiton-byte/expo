# "Failed to Fetch" Error - Complete Diagnosis and Fix

## Summary

Your CloudFront deployment at `https://d36p7i1koir3da.cloudfront.net/` is experiencing "Failed to fetch" errors because **CloudFront is not configured to route API requests to your backend server**.

## Root Cause

### What's Happening:
1. Your frontend is deployed to **S3** and served via **CloudFront**
2. Your backend is deployed to **Elastic Beanstalk** at `expo-project-prod-env.eba-i8rfmfk2.ap-south-1.elasticbeanstalk.com`
3. When the frontend makes a request to `/api/organizations`, CloudFront doesn't know where to send it
4. CloudFront's default behavior is to serve everything from S3
5. Since `/api/organizations` doesn't exist in S3, CloudFront returns `index.html` (due to SPA routing configuration)
6. The frontend receives HTML instead of JSON, causing a parsing error that manifests as "Failed to fetch"

### Evidence from Browser Diagnostics:
```
Response Status: 200 OK
Content-Type: text/html
Body: <!DOCTYPE html>...

Expected:
Response Status: 200 OK
Content-Type: application/json
Body: [{"id":1,"orgName":"..."}]
```

## The Fix

You need to configure CloudFront to have **two origins** and **two behaviors**:

### Current Configuration:
- **Origin 1**: S3 bucket (frontend)
- **Default Behavior**: Serve everything from S3

### Required Configuration:
- **Origin 1**: S3 bucket (frontend)
- **Origin 2**: Elastic Beanstalk (backend API) ← **MISSING**
- **Behavior 1**: `/api/*` → Route to Origin 2 (backend) ← **MISSING**
- **Default Behavior**: `/*` → Route to Origin 1 (S3)

## Step-by-Step Fix (AWS Console)

### 1. Open CloudFront Console
- Go to: https://console.aws.amazon.com/cloudfront
- Distribution ID: **E1U3WEIJ9OZDTY**
- Domain: **d36p7i1koir3da.cloudfront.net**

### 2. Add Backend Origin

**Navigate to**: Origins tab → Create origin

**Configuration**:
```
Origin domain: expo-project-prod-env.eba-i8rfmfk2.ap-south-1.elasticbeanstalk.com
Protocol: HTTP only
HTTP port: 80
HTTPS port: 443
Origin path: (leave empty)
Minimum origin SSL protocol: TLSv1
Origin response timeout: 30 seconds
Origin keep-alive timeout: 5 seconds
```

Click **Create origin**

### 3. Add Cache Behavior for /api/*

**Navigate to**: Behaviors tab → Create behavior

**Configuration**:
```
Path pattern: /api/*
Origin and origin groups: [Select the backend origin you just created]
Viewer protocol policy: Redirect HTTP to HTTPS
Allowed HTTP methods: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
Cache policy: CachingDisabled
Origin request policy: AllViewer
Response headers policy: (none)
```

**Important**: The behavior order matters. CloudFront evaluates behaviors from top to bottom. The `/api/*` behavior should be listed BEFORE the default behavior.

Click **Create behavior**

### 4. Wait for Deployment
- Status will show "In Progress"
- Takes 5-15 minutes
- Check status in the **General** tab
- Wait until status shows "Deployed"

### 5. Test the Fix

**Test API directly**:
```bash
curl https://d36p7i1koir3da.cloudfront.net/api/organizations
```

Expected response: JSON array of organizations

**Test in browser**:
1. Open https://d36p7i1koir3da.cloudfront.net/
2. Open DevTools (F12) → Network tab
3. Try to login
4. Check that `/api/login` returns JSON, not HTML

## Alternative: Automated Fix (Requires boto3)

If you have Python boto3 installed:

```bash
cd /home/billiton/Documents/Billiton/Expo_project/infrastructure
pip3 install boto3  # or use virtual environment
./fix-cloudfront-v2.sh
```

## Verification Checklist

After CloudFront deployment completes:

- [ ] `curl https://d36p7i1koir3da.cloudfront.net/api/organizations` returns JSON
- [ ] Browser console shows no "Failed to fetch" errors
- [ ] Login works successfully
- [ ] Organization management page loads data
- [ ] All API endpoints return JSON (not HTML)

## Troubleshooting

### Issue: Still getting HTML instead of JSON
**Solution**: 
- Clear browser cache or use incognito mode
- Wait for CloudFront deployment to fully complete
- Check that the behavior was created correctly
- Verify behavior order (API behavior should be first)

### Issue: 502 Bad Gateway
**Solution**:
- Check that Elastic Beanstalk environment is running
- Go to: https://console.aws.amazon.com/elasticbeanstalk
- Verify "expo-project-prod-env" is "Healthy"
- Check backend logs: `eb logs` or in EB console

### Issue: CORS errors
**Solution**:
- Backend already has CORS configured for all origins
- If you still see CORS errors, check browser console for specific error
- May need to add CloudFront domain explicitly to CORS config

### Issue: 404 Not Found on API endpoints
**Solution**:
- Verify backend is running and healthy
- Test backend directly: `curl http://expo-project-prod-env.eba-i8rfmfk2.ap-south-1.elasticbeanstalk.com/api/organizations`
- Check that path pattern is exactly `/api/*` (case-sensitive)

## Why This Happened

When you deployed the frontend to CloudFront, the deployment script only configured it for static file hosting (SPA). It didn't set up the API routing because:

1. CloudFront distributions are typically either:
   - **Static hosting** (S3 only) - for simple websites
   - **Full-stack** (S3 + API origin) - for SPAs with backends

2. Your deployment used the static hosting pattern
3. The backend was deployed separately to Elastic Beanstalk
4. The two were never connected at the CloudFront level

## Prevention for Future Deployments

Update your deployment script (`infrastructure/frontend-deploy.sh`) to:
1. Check if backend origin exists
2. Add backend origin if missing
3. Create `/api/*` behavior automatically

Or use a tool like:
- **AWS CDK** - Infrastructure as Code
- **Terraform** - Infrastructure as Code
- **CloudFormation** - AWS native IaC

These tools ensure consistent configuration across deployments.

## Related Files

- CloudFront fix instructions: `infrastructure/CLOUDFRONT_FIX.md`
- Automated fix script: `infrastructure/fix-cloudfront-v2.sh`
- Deployment guide: `DEPLOYMENT.md`
- Backend CORS config: `server/server.js` (lines 56-61)

## Support

If you need help:
1. Check CloudFront distribution status
2. Check Elastic Beanstalk health
3. Review CloudFront access logs (if enabled)
4. Check backend logs: `eb logs`

## Next Steps

After fixing CloudFront:
1. ✅ Test all features in production
2. ✅ Update deployment documentation
3. ✅ Consider setting up CI/CD for automated deployments
4. ✅ Enable CloudFront logging for debugging
5. ✅ Set up monitoring and alerts
