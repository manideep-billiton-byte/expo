# QR Code Not Showing in Email - Troubleshooting Guide

## ⚠️ MOST LIKELY ISSUE: Server Not Restarted

Your code is correct, but the running server might be using **old code** that doesn't have the QR email fixes.

### ✅ SOLUTION: Restart the Server

```bash
# 1. Stop the current server
# Press Ctrl+C in the terminal running "npm start"

# 2. Start the server again
cd /home/billiton/Documents/event_management_hub/all_work/Expo_project/server
npm start
```

---

## 🔍 Verification Steps

### Step 1: Check if Server is Running Latest Code

The server should show this when starting:
```
Server running on port 5000
DB: Connected to PRODUCTION database
```

### Step 2: Create a Test Event

After restarting, create a new event through your dashboard:
1. Go to EventHub Dashboard
2. Create Event
3. Fill in event details
4. **IMPORTANT**: Enter a valid organizer email
5. Submit

### Step 3: Check Your Email

Within 1-2 minutes, you should receive an email with:
- ✅ Event details
- ✅ **QR CODE IMAGE** (this should now be visible!)
- ✅ Registration link

---

## 🧪 Alternative: Test Without Creating Event

Run this diagnostic test:

```bash
cd /home/billiton/Documents/event_management_hub/all_work/Expo_project/server
node test-qr-email-diagnostic.js
```

This will:
1. Generate a test QR code
2. Send an email with the QR code
3. Show you if base64 embedding is working

**Check your email** (deepak@btsind.com) for the test email.

---

## 📧 Email Client Issues

If server is restarted and QR still doesn't show:

### Gmail Web
- ✅ Should work fine
- If not: Click "Show Images" at top of email

### Gmail Mobile App
- ✅ Should work fine
- Images load automatically

### Outlook
- May block external images
- Solution: Click "Download pictures" or "Show images"

### Apple Mail
- ✅ Should work fine
- Images load automatically

---

## 🔧 Debug Checklist

Run through this checklist:

```
□ Server restarted with latest code
□ Created NEW event (after restart)
□ Used valid email address
□ Checked email inbox (not spam)
□ Tried viewing email in Gmail web
□ Clicked "Show images" if prompted
□ Ran diagnostic test: node test-qr-email-diagnostic.js
□ Checked server logs for errors
```

---

## 📊 What Should Happen

### When You Create an Event:

1. **Server generates QR code** ✅
   ```
   QR code generated for event 123
   Path: https://d2ux36xl31uki3.cloudfront.net/qr/event_123.png
   ```

2. **Server converts to Base64** ✅
   ```
   Base64 length: 4944 characters
   ```

3. **Server sends email** ✅
   ```
   Email sent via AWS SES: 01090...
   ```

4. **You receive email with QR code** ✅
   - QR code should be visible
   - No broken image icon
   - Can scan with phone

---

## 🚨 If Still Not Working

### Check Server Logs

```bash
# View recent logs
tail -50 server/server.log

# Watch logs in real-time
tail -f server/server.log | grep -i "qr\|email"
```

Look for:
- ✅ "QR code generated for event..."
- ✅ "Email sent via AWS SES..."
- ❌ Any error messages

### Check Database

```bash
node -e "const pool = require('./db'); pool.query('SELECT id, qr_image_path FROM events ORDER BY id DESC LIMIT 1').then(r => { console.log(r.rows); pool.end(); });"
```

Should show:
```javascript
{
  id: 123,
  qr_image_path: 'https://d2ux36xl31uki3.cloudfront.net/qr/event_123.png'
}
```

### View Email Source

In Gmail:
1. Open the email
2. Click three dots (⋮)
3. Click "Show original"
4. Search for: `data:image/png;base64,`

You should see:
```html
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." width="200">
```

If you see this, the QR **IS** in the email, but your email client might be blocking it.

---

## 💡 Quick Fix Summary

**99% of the time, the issue is:**

1. **Server not restarted** after code changes
   - Solution: Restart server

2. **Email client blocking images**
   - Solution: Click "Show images" or view in Gmail web

3. **Testing with old events**
   - Solution: Create a NEW event after restart

---

## ✅ Expected Result

After restarting server and creating a new event, you should see:

![QR Code in Email]
- Black and white QR code
- 200x200 pixels
- Scannable with phone camera
- Links to registration page

---

## 📞 Still Having Issues?

If QR code still doesn't show after:
- ✅ Restarting server
- ✅ Creating new event
- ✅ Checking Gmail web
- ✅ Running diagnostic test

Then run this command and share the output:

```bash
cd /home/billiton/Documents/event_management_hub/all_work/Expo_project/server
node test-qr-email-diagnostic.js 2>&1 | tee qr-debug.log
cat qr-debug.log
```

---

**TL;DR**: Restart your server, create a new event, check your email in Gmail web. The QR code should now be visible! 🎉
