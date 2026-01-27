# QR Code Storage Implementation - Complete

## ✅ Implementation Summary

The QR code storage system has been successfully implemented as requested. QR codes are now:
1. **Generated** when an event is created
2. **Stored** in the database (path) and filesystem/S3 (file)
3. **Embedded in emails** via URL (no attachments)

## 📁 Files Created/Modified

### New Files:
1. **`server/migrations/010_add_qr_image_path_to_events.sql`**
   - Adds `qr_image_path` column to events table

2. **`server/services/qrStorageService.js`**
   - Handles QR generation and storage
   - Supports both local (dev) and S3 (prod) storage
   - Automatically falls back to local if S3 fails

3. **`server/test-qr-storage.js`**
   - Test script for QR storage functionality

### Modified Files:
1. **`server/controllers/eventController.js`**
   - Complete rewrite to use new QR storage service
   - Generates QR and stores path in database
   - Embeds QR in email via URL (not attachment)
   - Returns `qrImageUrl` in API response

## 🗄️ Database Schema

```sql
ALTER TABLE events
ADD COLUMN IF NOT EXISTS qr_image_path TEXT;
```

**Storage Format:**
- **Local**: `/uploads/qrs/event-{id}.png`
- **Production**: `https://d36p7i1koir3da.cloudfront.net/qrs/event-{id}.png`

## 🔧 How It Works

### 1. Event Creation Flow

```javascript
// 1. Create event in database
const event = await createEventInDB(eventData);

// 2. Generate and store QR code
const { path, fullUrl } = await generateAndStoreQR(registrationLink, event.id);
// path: "/uploads/qrs/event-40.png" (for DB)
// fullUrl: "http://localhost:5000/uploads/qrs/event-40.png" (for email)

// 3. Update event with QR path
await updateEvent(event.id, { qr_image_path: path });

// 4. Send email with QR embedded via URL
await sendEmail({
  html: `<img src="${fullUrl}" alt="QR Code" />`
});
```

### 2. Local Development (Current)

- **Storage**: `/server/uploads/qrs/event-{id}.png`
- **Access**: `http://localhost:5000/uploads/qrs/event-{id}.png`
- **Database**: `/uploads/qrs/event-{id}.png`

### 3. Production (After Deploy)

- **Storage**: S3 bucket `expo-project-prod-frontend/qrs/`
- **Access**: `https://d36p7i1koir3da.cloudfront.net/qrs/event-{id}.png`
- **Database**: Full CloudFront URL

**Note**: Currently falls back to local storage because IAM user lacks S3 permissions. This is fine for development.

## 📧 Email Template

The email now embeds the QR code via URL instead of attachment:

```html
<div class="qr-section">
  <h3>📱 Scan to Register</h3>
  <img src="${qrImageUrl}" alt="Event Registration QR Code" width="200">
  <p>Attendees can scan this code to register instantly.</p>
</div>
```

**Benefits:**
- ✅ No attachment size limits
- ✅ Faster email delivery
- ✅ Better email client compatibility
- ✅ QR code is always accessible (not lost if email deleted)

## ✅ Test Results

### Test Event Created:
- **Event ID**: 40
- **Event Name**: "Curl Test Event"
- **Organizer Email**: projects@btsind.com
- **QR Path (DB)**: `/uploads/qrs/event-40.png`
- **QR URL**: `http://localhost:5000/uploads/qrs/event-40.png`
- **File Size**: 5.9 KB
- **Email Status**: ✅ Sent successfully (Message ID: 0109019be99cacec-012cf39a-de84-45c3-8183-0d716d13f890-000000)

### Verification:
```bash
# File exists
$ ls -lh uploads/qrs/event-40.png
-rw-rw-r-- 1 billiton billiton 5.9K Jan 23 12:18 uploads/qrs/event-40.png

# Accessible via HTTP
$ curl -I http://localhost:5000/uploads/qrs/event-40.png
HTTP/1.1 200 OK
Content-Type: image/png
```

## 🚀 Production Deployment

### Prerequisites:
1. **S3 Bucket**: `expo-project-prod-frontend` (already exists)
2. **IAM Permissions**: Add S3 PutObject permission to `ses-user`
3. **CloudFront**: Already configured to serve from S3

### Required IAM Policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::expo-project-prod-frontend/qrs/*"
    }
  ]
}
```

### Environment Variables:
```bash
# Already set in .env
NODE_ENV=production
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIAXCY5L7WVKK5ZBRUK
AWS_SECRET_ACCESS_KEY=***
CLOUDFRONT_DOMAIN=d36p7i1koir3da.cloudfront.net

# Optional (defaults to expo-project-prod-frontend)
S3_QR_BUCKET=expo-project-prod-frontend
```

### Deploy Steps:
1. **Update IAM permissions** (add S3 PutObject to ses-user)
2. **Deploy backend** to Elastic Beanstalk
3. **Test** by creating an event
4. **Verify** QR is uploaded to S3 and accessible via CloudFront

## 📊 API Response Format

```json
{
  "id": "40",
  "name": "Curl Test Event",
  "qr_image_path": "/uploads/qrs/event-40.png",
  "qrImageUrl": "http://localhost:5000/uploads/qrs/event-40.png",
  "registration_link": "https://...",
  "emailStatus": {
    "sent": true,
    "email": "projects@btsind.com"
  }
}
```

## 🔍 Troubleshooting

### QR not generated
- Check server logs for errors
- Verify `uploads/qrs/` directory exists and is writable
- Run test: `node test-qr-storage.js`

### Email not sent
- Verify organizer email is in AWS SES verified list
- Check AWS SES is not in sandbox mode
- See `CLOUDFRONT_ERROR_FIX.md` for email troubleshooting

### QR not accessible
- Local: Verify `app.use('/uploads', express.static('uploads'))` in server.js
- Production: Verify S3 bucket policy allows public read
- Check CloudFront distribution serves `/qrs/*` from S3

## 📝 Next Steps

1. ✅ **Local Testing**: Complete (working)
2. ⏳ **Add S3 Permissions**: Update IAM policy for ses-user
3. ⏳ **Deploy to Production**: Test S3 upload
4. ⏳ **Verify Email**: Check projects@btsind.com inbox for QR code email

## 🎯 Success Criteria

- [x] QR code generated on event creation
- [x] QR path stored in database
- [x] QR file saved to filesystem
- [x] QR accessible via HTTP
- [x] Email sent with QR embedded via URL
- [x] No attachments in email
- [ ] Production: QR uploaded to S3
- [ ] Production: QR accessible via CloudFront

## 📧 Check Your Email

**Email sent to**: projects@btsind.com  
**Subject**: Event Created: Curl Test Event - Registration Link  
**Contains**:
- Event details
- Registration link
- **QR code image** (embedded via URL)
- Tips for sharing

**Please check the inbox and confirm the QR code is visible in the email!**
