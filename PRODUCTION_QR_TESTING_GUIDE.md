# Testing QR Email on Production Server (AWS)

## 🎯 Goal
Test if QR codes are appearing in emails on the **production server** (AWS Elastic Beanstalk).

---

## 📋 Prerequisites

Before testing on production:

1. ✅ QR code fixes are in the code (already done)
2. ✅ S3 bucket configured for public access (already done)
3. ✅ Code needs to be deployed to production
4. ✅ Production environment variables set

---

## 🚀 Step 1: Deploy to Production

### Option A: Quick Deploy (Recommended)

```bash
cd /home/billiton/Documents/event_management_hub/all_work/Expo_project/server

# Deploy to Elastic Beanstalk
eb deploy

# Wait for deployment (2-3 minutes)
# Watch status:
eb status
```

### Option B: Use Existing Workflow

```bash
cd /home/billiton/Documents/event_management_hub/all_work/Expo_project

# Follow the deployment workflow
# This will deploy both frontend and backend
```

---

## 🧪 Step 2: Test on Production

### Method 1: Create Event via Dashboard (Easiest)

1. **Open Production URL**:
   ```
   https://d2ux36xl31uki3.cloudfront.net
   ```

2. **Login** as organization:
   - Email: `karnakata@gmail.com` (or your org email)
   - Password: (your org password)

3. **Create a New Event**:
   - Go to "Create Event"
   - Fill in event details
   - **IMPORTANT**: Use email: `deepak@btsind.com` for organizer
   - Submit

4. **Check Email**:
   - Within 1-2 minutes
   - Look for: "🎉 Event Created: [Event Name]"
   - **QR code should be visible in the email**

---

### Method 2: SSH to Production Server

```bash
# SSH to production
eb ssh

# Once connected to server:
cd /var/app/current

# Run diagnostic test
node test-qr-email-diagnostic.js

# Check output for:
# ✅ QR Code Generated Successfully!
# ✅ Email Sent Successfully!

# Exit SSH
exit
```

**Then check email**: `deepak@btsind.com`

---

### Method 3: Test via Production API

```bash
# Get your EB URL first
EB_URL=$(eb status | grep "CNAME" | awk '{print $2}')
echo "Production URL: https://$EB_URL"

# Create test event via API
curl -X POST "https://$EB_URL/api/events" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "3",
    "eventName": "QR Test - Production",
    "description": "Testing QR in production",
    "startDate": "2026-03-15",
    "endDate": "2026-03-17",
    "venue": "Test Venue",
    "city": "Mumbai",
    "organizerEmail": "deepak@btsind.com",
    "organizerName": "Test Organizer"
  }'

# Check email: deepak@btsind.com
```

---

## 🔍 Step 3: Verify QR Code in Email

When you receive the email, check:

1. **Email Subject**: "🎉 Event Created: [Event Name]"

2. **QR Code Section**:
   - Should see a black and white QR code
   - 200x200 pixels
   - No broken image icon
   - No blank space

3. **Test Scanning**:
   - Open email on phone
   - Use camera to scan QR code
   - Should redirect to registration page

---

## 📊 Step 4: Check Production Logs

If QR code doesn't appear, check logs:

```bash
# View recent logs
eb logs

# Stream live logs
eb logs --stream

# Look for:
# ✅ "QR code generated for event..."
# ✅ "Email sent via AWS SES..."
# ❌ Any error messages
```

---

## 🔧 Troubleshooting Production

### Issue: Deployment Failed

```bash
# Check deployment status
eb status

# Check health
eb health

# View detailed logs
eb logs
```

### Issue: QR Code Still Not Showing

```bash
# 1. Verify environment variables
eb printenv

# Should show:
# CLOUDFRONT_DOMAIN=d2ux36xl31uki3.cloudfront.net
# S3_QR_BUCKET=expo-project-prod-frontend

# 2. If missing, set them:
eb setenv CLOUDFRONT_DOMAIN=d2ux36xl31uki3.cloudfront.net
eb setenv S3_QR_BUCKET=expo-project-prod-frontend

# 3. Restart application
eb restart
```

### Issue: Email Not Received

```bash
# Check SES sending limits
aws ses get-send-quota --region ap-south-1

# Check if email is verified
aws ses list-verified-email-addresses --region ap-south-1

# Check SES logs in CloudWatch
aws logs tail /aws/elasticbeanstalk/your-env-name/var/log/nodejs/nodejs.log
```

---

## ✅ Expected Results

### Successful Deployment:

```
Uploading: [##################################################] 100% Done...
Environment update completed successfully.
```

### Successful Email:

```
Subject: 🎉 Event Created: QR Test - Production
Body:
  - Event details ✅
  - QR code image visible ✅
  - Registration link ✅
```

### Production Logs:

```
QR code generated for event 123
Path: https://d2ux36xl31uki3.cloudfront.net/qr/event_123.png
Base64 length: 4944 characters
Email sent via AWS SES: 01090...
```

---

## 🎯 Quick Test Commands

```bash
# 1. Deploy to production
cd /home/billiton/Documents/event_management_hub/all_work/Expo_project/server
eb deploy

# 2. Wait for deployment
eb status

# 3. SSH and test
eb ssh
cd /var/app/current
node test-qr-email-diagnostic.js
exit

# 4. Check email
# Go to: https://mail.google.com
# Look for email from: deepak@btsind.com
```

---

## 📧 Email Checklist

After testing, verify:

- [ ] Email received within 2 minutes
- [ ] Subject line correct
- [ ] Event details visible
- [ ] **QR code image visible** (not broken)
- [ ] QR code scannable with phone
- [ ] Registration link works
- [ ] Email looks professional

---

## 🚨 If Still Not Working

1. **Check deployment succeeded**:
   ```bash
   eb status
   # Should show: Health: Green
   ```

2. **Verify code is deployed**:
   ```bash
   eb ssh
   grep -n "qrBase64" /var/app/current/controllers/eventController.js
   exit
   ```

3. **Check environment variables**:
   ```bash
   eb printenv | grep -E "CLOUDFRONT|S3_QR"
   ```

4. **View application logs**:
   ```bash
   eb logs --stream
   # Create an event and watch logs in real-time
   ```

---

## 💡 Pro Tips

1. **Always deploy before testing production**
   - Local changes don't affect production
   - Must run `eb deploy` to update

2. **Use diagnostic script on production**
   - SSH to server
   - Run `node test-qr-email-diagnostic.js`
   - Faster than creating real events

3. **Check email in Gmail web**
   - Most reliable for testing
   - Shows images by default
   - Easy to view source

4. **Monitor logs during testing**
   - Run `eb logs --stream` in one terminal
   - Create event in another
   - See real-time feedback

---

## 📞 Need Help?

If QR code still doesn't show after:
- ✅ Deploying to production
- ✅ Creating new event
- ✅ Checking Gmail web
- ✅ Verifying environment variables

Run this and share output:

```bash
eb ssh << 'EOF'
cd /var/app/current
echo "=== Testing QR Email on Production ==="
node test-qr-email-diagnostic.js 2>&1
echo "=== Environment Variables ==="
env | grep -E "CLOUDFRONT|S3_QR|NODE_ENV"
EOF
```

---

**Ready to test?** Start with **Method 1** (Dashboard) - it's the easiest! 🚀
