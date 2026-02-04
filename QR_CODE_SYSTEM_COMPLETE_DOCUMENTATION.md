# QR Code System - Complete Technical Documentation
## EventHub Platform

**Version:** 2.0  
**Last Updated:** February 4, 2026  
**Author:** Billiton Event Management Team

---

## Table of Contents

1. [Overview](#1-overview)
2. [QR Code Architecture](#2-qr-code-architecture)
3. [QR Code Generation Flow](#3-qr-code-generation-flow)
4. [Local Environment Setup](#4-local-environment-setup)
5. [Production Environment Setup](#5-production-environment-setup)
6. [Code Implementation](#6-code-implementation)
7. [Email Integration](#7-email-integration)
8. [QR Code Scanning](#8-qr-code-scanning)
9. [Storage Mechanisms](#9-storage-mechanisms)
10. [Troubleshooting Guide](#10-troubleshooting-guide)
11. [Testing & Verification](#11-testing--verification)
12. [Best Practices](#12-best-practices)

---

## 1. Overview

### 1.1 What is the QR Code System?

The EventHub QR Code System is a comprehensive solution for generating, storing, distributing, and scanning QR codes for event registration and visitor management.

### 1.2 Use Cases

1. **Event Registration**: Generate unique QR codes for event registration links
2. **Visitor Check-in**: Generate QR codes for registered visitors
3. **Lead Capture**: Exhibitors scan visitor QR codes to capture leads
4. **Email Distribution**: QR codes embedded in registration emails

### 1.3 Key Features

- ✅ **Automatic Generation**: QR codes generated on event creation
- ✅ **Dual Storage**: Local files (dev) and AWS S3 (production)
- ✅ **Email Embedding**: Base64 inline embedding for reliability
- ✅ **CDN Distribution**: CloudFront for fast global access
- ✅ **High Availability**: Multiple fallback mechanisms
- ✅ **Scalable**: Handles thousands of QR codes

---

## 2. QR Code Architecture

### 2.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    EVENT CREATION                            │
│                         ↓                                    │
│              Generate Registration Link                      │
│                         ↓                                    │
│              Generate QR Code (PNG Buffer)                   │
│                         ↓                                    │
│                    ┌────────────┐                           │
│                    │ Environment │                           │
│                    │   Check     │                           │
│                    └────────────┘                           │
│                         ↓                                    │
│          ┌──────────────┴──────────────┐                    │
│          ↓                              ↓                    │
│    LOCAL (Development)          PRODUCTION (AWS)            │
│          ↓                              ↓                    │
│   Save to /uploads/qrs/         Upload to S3 Bucket         │
│   event-{id}.png                qr/event_{id}.png           │
│          ↓                              ↓                    │
│   URL: localhost:5000/          URL: CloudFront CDN         │
│   uploads/qrs/event-{id}.png    /qr/event_{id}.png         │
│          ↓                              ↓                    │
│          └──────────────┬──────────────┘                    │
│                         ↓                                    │
│              Convert to Base64 String                        │
│                         ↓                                    │
│              Store in Database                               │
│              (qr_image_path column)                          │
│                         ↓                                    │
│              Embed in Email                                  │
│              (Base64 + URL fallback)                         │
│                         ↓                                    │
│              Send to Organizer                               │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
User Creates Event
    ↓
Backend Generates UUID Token
    ↓
Create Registration Link
    ↓
Generate QR Code (PNG)
    ↓
Store QR Code (Local/S3)
    ↓
Convert to Base64
    ↓
Update Database
    ↓
Send Email with QR Code
    ↓
User Receives Email
    ↓
QR Code Displayed (Base64 or URL)
    ↓
User Scans QR Code
    ↓
Redirects to Registration Page
```

### 2.3 Component Interaction

```
┌──────────────────┐
│  Event Creation  │
│   (Frontend)     │
└────────┬─────────┘
         ↓ POST /api/events
┌────────┴─────────┐
│ Event Controller │
│   (Backend)      │
└────────┬─────────┘
         ↓ generateAndStoreQR()
┌────────┴─────────┐
│ QR Storage       │
│   Service        │
└────────┬─────────┘
         ↓
┌────────┴─────────┐     ┌──────────────┐
│  Local Storage   │ OR  │  AWS S3      │
│  /uploads/qrs/   │     │  Bucket      │
└────────┬─────────┘     └──────┬───────┘
         └────────┬──────────────┘
                  ↓
         ┌────────┴─────────┐
         │   Database       │
         │ (qr_image_path)  │
         └────────┬─────────┘
                  ↓
         ┌────────┴─────────┐
         │ Email Service    │
         │ (AWS SES)        │
         └──────────────────┘
```

---

## 3. QR Code Generation Flow

### 3.1 Step-by-Step Process

#### Step 1: Event Creation Trigger
```javascript
// User creates event via frontend
POST /api/events
{
  "organizationId": 1,
  "eventName": "Tech Expo 2026",
  "organizerEmail": "organizer@example.com",
  ...
}
```

#### Step 2: Generate Unique Token
```javascript
// Backend generates UUID token
const { v4: uuidv4 } = require('uuid');
const token = uuidv4();
// Example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

#### Step 3: Create Registration Link
```javascript
const base = process.env.INVITE_LINK_BASE || 'https://d2ux36xl31uki3.cloudfront.net';
const registration_link = `${base}?action=register&eventId=${eventName}&token=${token}`;
// Example: https://d2ux36xl31uki3.cloudfront.net?action=register&eventId=TechExpo&token=a1b2c3d4...
```

#### Step 4: Generate QR Code Image
```javascript
const QRCode = require('qrcode');

const qrBuffer = await QRCode.toBuffer(registration_link, {
  type: 'png',
  width: 300,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  },
  errorCorrectionLevel: 'H' // High error correction
});
```

#### Step 5: Store QR Code
```javascript
// Environment-based storage
if (process.env.NODE_ENV === 'production') {
  // Upload to S3
  await uploadToS3(qrBuffer, eventId);
} else {
  // Save locally
  saveToLocal(qrBuffer, eventId);
}
```

#### Step 6: Convert to Base64
```javascript
const base64Data = qrBuffer.toString('base64');
// Used for email embedding
```

#### Step 7: Update Database
```javascript
await pool.query(
  'UPDATE events SET qr_image_path = $1 WHERE id = $2',
  [qrImagePath, eventId]
);
```

#### Step 8: Send Email
```javascript
const htmlContent = `
  <img src="data:image/png;base64,${base64Data}" alt="QR Code" />
`;
await sendEmail({ to: organizerEmail, html: htmlContent });
```

### 3.2 Timing Breakdown

| Step | Operation | Time | Notes |
|------|-----------|------|-------|
| 1 | Event creation | ~50ms | Database insert |
| 2 | Token generation | ~1ms | UUID v4 |
| 3 | Link creation | ~1ms | String concatenation |
| 4 | QR generation | ~100ms | Image rendering |
| 5 | Storage (local) | ~10ms | File write |
| 5 | Storage (S3) | ~200ms | Network upload |
| 6 | Base64 conversion | ~5ms | Buffer encoding |
| 7 | Database update | ~20ms | SQL update |
| 8 | Email sending | ~500ms | AWS SES |
| **Total (Local)** | | **~687ms** | < 1 second |
| **Total (Production)** | | **~877ms** | < 1 second |

---

## 4. Local Environment Setup

### 4.1 Prerequisites

```bash
# Required software
- Node.js 18+
- PostgreSQL 15+
- npm or yarn
```

### 4.2 Environment Configuration

**File: `server/.env`**
```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/expo_db

# API Base URL (for QR code URLs)
API_BASE_URL=http://localhost:5000

# Email (optional for local testing)
SES_FROM_EMAIL=test@example.com
```

### 4.3 Directory Structure

```bash
server/
├── uploads/              # Local QR storage
│   └── qrs/             # QR code images
│       ├── event-1.png
│       ├── event-2.png
│       └── ...
├── services/
│   └── qrStorageService.js  # QR generation logic
└── controllers/
    └── eventController.js   # Event creation logic
```

### 4.4 Local Storage Implementation

```javascript
// File: server/services/qrStorageService.js

const saveQRLocally = (qrBuffer, eventId) => {
  const uploadDir = path.join(process.cwd(), 'uploads', 'qrs');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const fileName = `event-${eventId}.png`;
  const filePath = path.join(uploadDir, fileName);
  
  // Write the file
  fs.writeFileSync(filePath, qrBuffer);
  
  console.log(`QR code saved locally: ${filePath}`);
  
  // Return relative path for database
  return `/uploads/qrs/${fileName}`;
};
```

### 4.5 Serving Local QR Codes

```javascript
// File: server/server.js

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// QR codes accessible at:
// http://localhost:5000/uploads/qrs/event-1.png
```

### 4.6 Local Testing

```bash
# 1. Start the server
cd server
npm start

# 2. Create an event
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": 1,
    "eventName": "Test Event",
    "organizerEmail": "test@example.com"
  }'

# 3. Check the uploads directory
ls -la server/uploads/qrs/

# 4. Access QR code in browser
# http://localhost:5000/uploads/qrs/event-{id}.png
```

---

## 5. Production Environment Setup

### 5.1 AWS Services Required

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **S3** | QR code storage | Bucket: `expo-project-prod-frontend` |
| **CloudFront** | CDN distribution | Domain: `d2ux36xl31uki3.cloudfront.net` |
| **SES** | Email delivery | Region: `ap-south-1` |
| **IAM** | Access credentials | S3 + SES permissions |

### 5.2 Environment Configuration

**File: `server/.env` (Production)**
```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# Database (AWS RDS)
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/expo_db

# AWS Configuration
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# CloudFront & S3
CLOUDFRONT_DOMAIN=d2ux36xl31uki3.cloudfront.net
S3_QR_BUCKET=expo-project-prod-frontend

# Email
SES_FROM_EMAIL=noreply@yourdomain.com

# Registration Link Base
INVITE_LINK_BASE=https://d2ux36xl31uki3.cloudfront.net
```

### 5.3 S3 Bucket Configuration

#### Bucket Structure
```
expo-project-prod-frontend/
├── index.html              # Frontend files
├── assets/                 # Frontend assets
└── qr/                     # QR codes folder
    ├── event_1.png
    ├── event_2.png
    └── ...
```

#### Bucket Policy (Public Read for QR Codes)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadQRCodes",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::expo-project-prod-frontend/qr/*"
    }
  ]
}
```

#### Apply Bucket Policy
```bash
# Save policy to file
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadQRCodes",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::expo-project-prod-frontend/qr/*"
    }
  ]
}
EOF

# Apply policy
aws s3api put-bucket-policy \
  --bucket expo-project-prod-frontend \
  --policy file://bucket-policy.json \
  --region ap-south-1
```

#### Disable Block Public Access
```bash
aws s3api put-public-access-block \
  --bucket expo-project-prod-frontend \
  --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
  --region ap-south-1
```

### 5.4 CloudFront Configuration

**Distribution Settings:**
- **Origin**: S3 bucket `expo-project-prod-frontend`
- **Origin Path**: `/` (root)
- **Viewer Protocol**: Redirect HTTP to HTTPS
- **Allowed HTTP Methods**: GET, HEAD
- **Cache Behavior**: 
  - Default TTL: 86400 (1 day)
  - Max TTL: 31536000 (1 year)
  - Min TTL: 0

**QR Code URLs:**
```
https://d2ux36xl31uki3.cloudfront.net/qr/event_1.png
https://d2ux36xl31uki3.cloudfront.net/qr/event_2.png
```

### 5.5 Production Storage Implementation

```javascript
// File: server/services/qrStorageService.js

const uploadQRToS3 = async (qrBuffer, eventId) => {
  const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
  
  const client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  
  const bucketName = process.env.S3_QR_BUCKET;
  const fileName = `qr/event_${eventId}.png`;
  
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: qrBuffer,
    ContentType: 'image/png',
    CacheControl: 'max-age=31536000' // 1 year
  };
  
  const command = new PutObjectCommand(params);
  await client.send(command);
  
  // Return CloudFront URL
  const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
  const qrUrl = `https://${cloudFrontDomain}/${fileName}`;
  
  console.log(`✅ QR code uploaded to S3: ${qrUrl}`);
  return qrUrl;
};
```

### 5.6 IAM Permissions Required

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::expo-project-prod-frontend/qr/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## 6. Code Implementation

### 6.1 QR Storage Service (Complete)

**File: `server/services/qrStorageService.js`**

```javascript
/**
 * QR Code Storage Service
 * Handles QR code generation and storage for events
 * - Local: Saves to /uploads/qrs/ directory
 * - Production: Uploads to S3 and serves via CloudFront
 */

const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// S3 client for production uploads
let s3Client = null;

const getS3Client = () => {
  if (!s3Client && process.env.NODE_ENV === 'production') {
    const config = {
      region: process.env.AWS_REGION || 'ap-south-1'
    };
    
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      };
    }
    
    s3Client = new S3Client(config);
  }
  return s3Client;
};

/**
 * Generate QR code buffer from a URL
 * @param {string} url - The URL to encode in the QR code
 * @returns {Promise<Buffer>} - PNG buffer of the QR code
 */
const generateQRBuffer = async (url) => {
  const qrBuffer = await QRCode.toBuffer(url, {
    type: 'png',
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'H' // High error correction for better scanning
  });
  return qrBuffer;
};

/**
 * Save QR code locally (for development)
 * @param {Buffer} qrBuffer - The QR code PNG buffer
 * @param {number} eventId - The event ID
 * @returns {string} - The relative path to the saved QR code
 */
const saveQRLocally = (qrBuffer, eventId) => {
  const uploadDir = path.join(process.cwd(), 'uploads', 'qrs');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const fileName = `event-${eventId}.png`;
  const filePath = path.join(uploadDir, fileName);
  
  // Write the file
  fs.writeFileSync(filePath, qrBuffer);
  
  console.log(`QR code saved locally: ${filePath}`);
  
  // Return the relative path for database storage
  return `/uploads/qrs/${fileName}`;
};

/**
 * Upload QR code to S3 (for production)
 * @param {Buffer} qrBuffer - The QR code PNG buffer
 * @param {number} eventId - The event ID
 * @returns {Promise<string>} - The full CloudFront URL to the QR code
 */
const uploadQRToS3 = async (qrBuffer, eventId) => {
  const client = getS3Client();
  
  if (!client) {
    console.error('S3 client not available, falling back to local storage');
    return saveQRLocally(qrBuffer, eventId);
  }
  
  const bucketName = process.env.S3_QR_BUCKET || 'expo-project-prod-frontend';
  const fileName = `qr/event_${eventId}.png`;
  
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: qrBuffer,
    ContentType: 'image/png',
    CacheControl: 'max-age=31536000' // Cache for 1 year (QR codes don't change)
  };
  
  try {
    const command = new PutObjectCommand(params);
    await client.send(command);
    
    // Return CloudFront URL
    const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN || 'd2ux36xl31uki3.cloudfront.net';
    const qrUrl = `https://${cloudFrontDomain}/${fileName}`;
    
    console.log(`✅ QR code uploaded to S3: ${qrUrl}`);
    return qrUrl;
  } catch (error) {
    console.error('❌ Error uploading QR to S3:', error.message);
    // Fall back to local storage
    return saveQRLocally(qrBuffer, eventId);
  }
};

/**
 * Generate and store QR code for an event
 * Automatically chooses local or S3 storage based on environment
 * @param {string} registrationUrl - The URL to encode in the QR code
 * @param {number} eventId - The event ID
 * @returns {Promise<{path: string, fullUrl: string, base64: string}>}
 */
const generateAndStoreQR = async (registrationUrl, eventId) => {
  try {
    // Generate QR code buffer
    const qrBuffer = await generateQRBuffer(registrationUrl);
    
    // Convert buffer to base64 for inline embedding in emails
    const base64Data = qrBuffer.toString('base64');
    
    let qrPath;
    let fullUrl;
    
    if (process.env.NODE_ENV === 'production') {
      // Production: Upload to S3 and get CloudFront URL
      qrPath = await uploadQRToS3(qrBuffer, eventId);
      fullUrl = qrPath; // In production, the path IS the full URL
    } else {
      // Development: Save locally
      qrPath = saveQRLocally(qrBuffer, eventId);
      // Construct full URL for local development
      const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
      fullUrl = `${baseUrl}${qrPath}`;
    }
    
    console.log(`QR code generated for event ${eventId}:`);
    console.log(`  Path: ${qrPath}`);
    console.log(`  Full URL: ${fullUrl}`);
    
    return { path: qrPath, fullUrl, base64: base64Data };
  } catch (error) {
    console.error('Error generating/storing QR code:', error);
    throw error;
  }
};

/**
 * Get the full URL for a stored QR code path
 * @param {string} qrPath - The stored QR path from database
 * @returns {string} - The full URL to access the QR code
 */
const getQRFullUrl = (qrPath) => {
  if (!qrPath) return null;
  
  // If the path is already a full URL (production), return as-is
  if (qrPath.startsWith('http://') || qrPath.startsWith('https://')) {
    return qrPath;
  }
  
  // Otherwise, construct the full URL (development)
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
  return `${baseUrl}${qrPath}`;
};

module.exports = {
  generateQRBuffer,
  saveQRLocally,
  uploadQRToS3,
  generateAndStoreQR,
  getQRFullUrl
};
```

### 6.2 Event Controller Integration

**File: `server/controllers/eventController.js`** (Relevant excerpt)

```javascript
const { generateAndStoreQR, getQRFullUrl } = require('../services/qrStorageService');

const createEvent = async (req, res) => {
  try {
    // 1. Generate unique token
    const token = uuidv4();
    
    // 2. Create registration link
    const base = process.env.INVITE_LINK_BASE || 'https://d2ux36xl31uki3.cloudfront.net';
    const registration_link = `${base}?action=register&eventId=${eventName}&token=${token}`;
    
    // 3. Insert event into database (without QR initially)
    const result = await pool.query(insertSql, values);
    let created = result.rows[0];
    
    // 4. Generate and store QR code
    let qrImagePath = null;
    let qrImageUrl = null;
    let qrBase64 = null;
    
    try {
      const qrResult = await generateAndStoreQR(registration_link, created.id);
      qrImagePath = qrResult.path;
      qrImageUrl = qrResult.fullUrl;
      qrBase64 = qrResult.base64; // For email embedding
      
      // 5. Update event with QR image path
      await pool.query(
        'UPDATE events SET qr_image_path = $1 WHERE id = $2',
        [qrImagePath, created.id]
      );
      created.qr_image_path = qrImagePath;
      
      console.log(`QR code stored for event ${created.id}: ${qrImagePath}`);
    } catch (qrError) {
      console.error('Failed to generate/store QR code:', qrError);
    }
    
    // 6. Send email with QR code
    if (organizerEmail) {
      const htmlContent = createEmailTemplate(qrBase64, qrImageUrl, eventData);
      await sendEmail({ to: organizerEmail, html: htmlContent });
    }
    
    // 7. Return response
    return res.status(201).json({
      ...created,
      qrImageUrl: qrImageUrl
    });
  } catch (err) {
    console.error('createEvent error:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
};
```

---

## 7. Email Integration

### 7.1 Email Template with QR Code

```javascript
const createEmailTemplate = (qrBase64, qrImageUrl, eventData) => {
  // Prefer base64 for reliability, fallback to URL
  const qrSrc = qrBase64 
    ? `data:image/png;base64,${qrBase64}` 
    : qrImageUrl;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    .qr-section {
      background: #f0fdf4;
      border: 2px solid #10b981;
      padding: 30px;
      border-radius: 12px;
      text-align: center;
    }
    .qr-code-img {
      background: white;
      padding: 20px;
      border-radius: 12px;
      display: inline-block;
    }
  </style>
</head>
<body>
  <div class="qr-section">
    <h3>📱 Scan to Register</h3>
    <p>Share this QR code with your attendees</p>
    <div class="qr-code-img">
      <img src="${qrSrc}" alt="Event QR Code" width="200">
    </div>
  </div>
</body>
</html>
  `;
};
```

### 7.2 Email Embedding Methods

#### Method 1: Base64 Inline (Primary - Always Works)
```html
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." />
```

**Advantages:**
- ✅ Embedded directly in email HTML
- ✅ No external dependencies
- ✅ Works even if S3 is down
- ✅ No CORS issues
- ✅ Displays in all email clients

**Disadvantages:**
- ⚠️ Increases email size (~5KB per QR code)

#### Method 2: External URL (Fallback)
```html
<img src="https://d2ux36xl31uki3.cloudfront.net/qr/event_1.png" />
```

**Advantages:**
- ✅ Smaller email size
- ✅ Cached by CDN
- ✅ Can be updated without resending email

**Disadvantages:**
- ❌ Requires S3 public access
- ❌ Can break if object deleted
- ❌ Some email clients block external images

### 7.3 Dual Method Implementation

```javascript
// ALWAYS prefer Base64 for emails
const qrSrc = qrBase64 ? `data:image/png;base64,${qrBase64}` : qrImageUrl;

return qrSrc ? `
  <div class="qr-section">
    <img src="${qrSrc}" alt="Event QR Code" width="200">
  </div>
` : '';
```

**Logic:**
1. If `qrBase64` exists → Use base64 (primary)
2. Else if `qrImageUrl` exists → Use external URL (fallback)
3. Else → Don't show QR section

---

## 8. QR Code Scanning

### 8.1 Frontend Scanner Implementation

**File: `client/src/components/QRScanner.jsx`**

```javascript
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';

const QRScanner = () => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      false
    );
    
    scanner.render(onScanSuccess, onScanError);
    
    return () => {
      scanner.clear();
    };
  }, []);
  
  const onScanSuccess = (decodedText, decodedResult) => {
    console.log(`QR Code scanned: ${decodedText}`);
    
    // Extract token from URL
    const url = new URL(decodedText);
    const token = url.searchParams.get('token');
    
    // Redirect to registration page
    window.location.href = decodedText;
  };
  
  const onScanError = (error) => {
    // Handle scan errors silently
    console.warn(`QR scan error: ${error}`);
  };
  
  return (
    <div>
      <h2>Scan QR Code</h2>
      <div id="qr-reader"></div>
    </div>
  );
};

export default QRScanner;
```

### 8.2 QR Code Content Format

**Encoded URL:**
```
https://d2ux36xl31uki3.cloudfront.net?action=register&eventId=TechExpo2026&eventName=Tech%20Expo%202026&eventDate=2026-03-15&token=a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**URL Parameters:**
- `action`: `register` (action type)
- `eventId`: Event identifier
- `eventName`: Event name (URL encoded)
- `eventDate`: Event start date
- `token`: Unique registration token (UUID)

### 8.3 Registration Flow

```
User Scans QR Code
    ↓
QR Scanner Decodes URL
    ↓
Extract Token from URL
    ↓
Redirect to Registration Page
    ↓
Frontend Loads with Token
    ↓
Fetch Event Details by Token
    ↓
Display Registration Form
    ↓
User Fills Form
    ↓
Submit Registration
    ↓
Generate Visitor QR Code
    ↓
Send Confirmation Email
```

---

## 9. Storage Mechanisms

### 9.1 Local Storage (Development)

**Directory Structure:**
```
server/
└── uploads/
    └── qrs/
        ├── event-1.png
        ├── event-2.png
        ├── event-3.png
        └── ...
```

**File Naming Convention:**
```
event-{eventId}.png
```

**Access URL:**
```
http://localhost:5000/uploads/qrs/event-{eventId}.png
```

**Storage Code:**
```javascript
const uploadDir = path.join(process.cwd(), 'uploads', 'qrs');
fs.mkdirSync(uploadDir, { recursive: true });
const filePath = path.join(uploadDir, `event-${eventId}.png`);
fs.writeFileSync(filePath, qrBuffer);
```

### 9.2 S3 Storage (Production)

**Bucket Structure:**
```
s3://expo-project-prod-frontend/
└── qr/
    ├── event_1.png
    ├── event_2.png
    ├── event_3.png
    └── ...
```

**File Naming Convention:**
```
qr/event_{eventId}.png
```

**Access URL:**
```
https://d2ux36xl31uki3.cloudfront.net/qr/event_{eventId}.png
```

**Upload Code:**
```javascript
const params = {
  Bucket: 'expo-project-prod-frontend',
  Key: `qr/event_${eventId}.png`,
  Body: qrBuffer,
  ContentType: 'image/png',
  CacheControl: 'max-age=31536000'
};
await s3Client.send(new PutObjectCommand(params));
```

### 9.3 Database Storage

**Table: `events`**
```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  qr_token VARCHAR(255) UNIQUE,      -- UUID token
  qr_image_path TEXT,                 -- Path or URL to QR image
  registration_link TEXT,             -- Full registration URL
  ...
);
```

**Example Data:**
```sql
-- Local Development
qr_token: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
qr_image_path: '/uploads/qrs/event-1.png'
registration_link: 'http://localhost:5173?action=register&token=a1b2...'

-- Production
qr_token: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
qr_image_path: 'https://d2ux36xl31uki3.cloudfront.net/qr/event_1.png'
registration_link: 'https://d2ux36xl31uki3.cloudfront.net?action=register&token=a1b2...'
```

### 9.4 Comparison Table

| Aspect | Local Storage | S3 Storage |
|--------|---------------|------------|
| **Location** | Server filesystem | AWS S3 Bucket |
| **Access** | HTTP server | CloudFront CDN |
| **Scalability** | Limited by disk | Unlimited |
| **Reliability** | Single point of failure | 99.999999999% durability |
| **Speed** | Fast (local) | Fast (CDN cached) |
| **Cost** | Free (disk space) | ~$0.023/GB/month |
| **Backup** | Manual | Automatic (S3 versioning) |
| **Global Access** | No | Yes (CloudFront) |

---

## 10. Troubleshooting Guide

### 10.1 Common Issues

#### Issue 1: QR Code Not Generating

**Symptoms:**
- Event created but no QR code
- `qr_image_path` is NULL in database

**Diagnosis:**
```bash
# Check server logs
tail -f server/server.log | grep "QR"

# Check if qrcode library is installed
npm list qrcode
```

**Solutions:**
```bash
# Install qrcode library
npm install qrcode

# Restart server
npm start
```

#### Issue 2: 403 Forbidden on QR URL (Production)

**Symptoms:**
- QR code generates successfully
- URL returns 403 Forbidden
- Email shows broken image

**Diagnosis:**
```bash
# Test QR URL
curl -I https://d2ux36xl31uki3.cloudfront.net/qr/event_1.png

# Check S3 bucket policy
aws s3api get-bucket-policy --bucket expo-project-prod-frontend
```

**Solutions:**
```bash
# Apply public read policy
cd server
./configure-s3-public-access.sh

# Disable Block Public Access
aws s3api put-public-access-block \
  --bucket expo-project-prod-frontend \
  --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

#### Issue 3: QR Code Not Displaying in Email

**Symptoms:**
- QR code generated
- Email received
- QR code section is blank

**Diagnosis:**
```javascript
// Check if base64 is being generated
console.log('Base64 length:', qrBase64 ? qrBase64.length : 0);

// Check email HTML source
// Look for: <img src="data:image/png;base64,..."
```

**Solutions:**
1. Verify base64 conversion:
```javascript
const base64Data = qrBuffer.toString('base64');
console.log('Base64:', base64Data.substring(0, 50) + '...');
```

2. Check email template:
```javascript
const qrSrc = qrBase64 ? `data:image/png;base64,${qrBase64}` : qrImageUrl;
```

3. Test with diagnostic script:
```bash
node server/test-qr-email-diagnostic.js
```

#### Issue 4: Local QR Files Not Accessible

**Symptoms:**
- QR code saved to `/uploads/qrs/`
- 404 error when accessing URL

**Diagnosis:**
```bash
# Check if file exists
ls -la server/uploads/qrs/

# Check server static file serving
curl http://localhost:5000/uploads/qrs/event-1.png
```

**Solutions:**
```javascript
// Ensure static middleware is configured
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

#### Issue 5: S3 Upload Fails

**Symptoms:**
- Error: "Access Denied" or "Invalid credentials"
- QR code falls back to local storage

**Diagnosis:**
```bash
# Check AWS credentials
aws sts get-caller-identity

# Check environment variables
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY
```

**Solutions:**
```bash
# Configure AWS credentials
aws configure

# Or set in .env file
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=ap-south-1
```

### 10.2 Debugging Checklist

```
□ QR code library installed (qrcode)
□ Environment variables set correctly
□ Database connection working
□ AWS credentials configured (production)
□ S3 bucket exists and accessible
□ S3 bucket policy allows public read
□ CloudFront distribution configured
□ Email service (SES) configured
□ Static file serving enabled (local)
□ Server logs checked for errors
```

### 10.3 Diagnostic Commands

```bash
# Test QR generation locally
node -e "const QRCode = require('qrcode'); QRCode.toFile('test.png', 'https://example.com', () => console.log('Success'));"

# Test S3 upload
aws s3 cp test.png s3://expo-project-prod-frontend/qr/test.png

# Test S3 public access
curl -I https://d2ux36xl31uki3.cloudfront.net/qr/test.png

# Test email sending
node server/test-qr-email-diagnostic.js

# Check database
psql expo_db -c "SELECT id, qr_token, qr_image_path FROM events WHERE id = 1;"
```

---

## 11. Testing & Verification

### 11.1 Unit Testing

**Test QR Generation:**
```javascript
// test/qr-generation.test.js
const { generateQRBuffer } = require('../services/qrStorageService');

describe('QR Code Generation', () => {
  it('should generate QR code buffer', async () => {
    const url = 'https://example.com';
    const buffer = await generateQRBuffer(url);
    
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });
  
  it('should generate PNG format', async () => {
    const buffer = await generateQRBuffer('https://example.com');
    const header = buffer.toString('hex', 0, 8);
    
    // PNG header: 89504e470d0a1a0a
    expect(header).toBe('89504e470d0a1a0a');
  });
});
```

### 11.2 Integration Testing

**Test Event Creation with QR:**
```javascript
// test/event-creation.test.js
const request = require('supertest');
const app = require('../server');

describe('Event Creation', () => {
  it('should create event with QR code', async () => {
    const response = await request(app)
      .post('/api/events')
      .send({
        organizationId: 1,
        eventName: 'Test Event',
        organizerEmail: 'test@example.com'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.qr_image_path).toBeDefined();
    expect(response.body.qr_token).toBeDefined();
    expect(response.body.registration_link).toBeDefined();
  });
});
```

### 11.3 Manual Testing

**Local Environment:**
```bash
# 1. Start server
npm start

# 2. Create event
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": 1,
    "eventName": "Test Event",
    "organizerEmail": "your-email@example.com"
  }'

# 3. Check uploads directory
ls -la server/uploads/qrs/

# 4. Open QR code in browser
xdg-open http://localhost:5000/uploads/qrs/event-1.png

# 5. Check email inbox
# Look for email with QR code
```

**Production Environment:**
```bash
# 1. Create event via dashboard
# https://d2ux36xl31uki3.cloudfront.net

# 2. Check S3 bucket
aws s3 ls s3://expo-project-prod-frontend/qr/

# 3. Test QR URL
curl -I https://d2ux36xl31uki3.cloudfront.net/qr/event_1.png

# 4. Check email
# Verify QR code displays correctly

# 5. Scan QR code
# Use phone camera to scan and verify redirect
```

### 11.4 Diagnostic Scripts

**Test QR Email (Complete Flow):**
```bash
cd server
node test-qr-email-diagnostic.js
```

**Output:**
```
🔍 QR CODE EMAIL DIAGNOSTIC TEST

1️⃣ ENVIRONMENT CONFIGURATION:
   NODE_ENV: production
   CLOUDFRONT_DOMAIN: d2ux36xl31uki3.cloudfront.net
   S3_QR_BUCKET: expo-project-prod-frontend
   AWS_REGION: ap-south-1
   AWS_ACCESS_KEY_ID: ✅ SET
   SES_FROM_EMAIL: noreply@example.com

2️⃣ GENERATING TEST QR CODE:
   ✅ QR Code Generated Successfully!
   Path: https://d2ux36xl31uki3.cloudfront.net/qr/event_999999.png
   Base64 Length: 4944 characters

3️⃣ SENDING TEST EMAIL:
   ✅ Email Sent Successfully!
   Recipient: test@example.com
```

---

## 12. Best Practices

### 12.1 Development Best Practices

1. **Always Use Base64 for Emails**
   ```javascript
   // ✅ Good: Base64 primary, URL fallback
   const qrSrc = qrBase64 ? `data:image/png;base64,${qrBase64}` : qrImageUrl;
   
   // ❌ Bad: URL only
   const qrSrc = qrImageUrl;
   ```

2. **Handle Errors Gracefully**
   ```javascript
   try {
     const qrResult = await generateAndStoreQR(url, eventId);
   } catch (error) {
     console.error('QR generation failed:', error);
     // Continue event creation even if QR fails
   }
   ```

3. **Log Everything**
   ```javascript
   console.log(`✅ QR code uploaded: ${qrUrl}`);
   console.log(`📧 Email sent to: ${email}`);
   console.error(`❌ S3 upload failed: ${error.message}`);
   ```

4. **Use Environment Variables**
   ```javascript
   // ✅ Good: Configurable
   const bucket = process.env.S3_QR_BUCKET;
   
   // ❌ Bad: Hardcoded
   const bucket = 'expo-project-prod-frontend';
   ```

### 12.2 Production Best Practices

1. **Enable S3 Versioning**
   ```bash
   aws s3api put-bucket-versioning \
     --bucket expo-project-prod-frontend \
     --versioning-configuration Status=Enabled
   ```

2. **Set Appropriate Cache Headers**
   ```javascript
   CacheControl: 'max-age=31536000' // 1 year for QR codes
   ```

3. **Use CloudFront for Distribution**
   - Faster global access
   - Reduced S3 costs
   - HTTPS by default

4. **Monitor S3 Costs**
   ```bash
   # Check S3 storage usage
   aws s3 ls s3://expo-project-prod-frontend/qr/ --summarize --human-readable --recursive
   ```

5. **Implement Cleanup for Old QR Codes**
   ```javascript
   // Delete QR codes for deleted events
   const deleteQR = async (qrPath) => {
     if (qrPath.startsWith('https://')) {
       // Delete from S3
       const key = qrPath.split('.net/')[1];
       await s3Client.send(new DeleteObjectCommand({
         Bucket: process.env.S3_QR_BUCKET,
         Key: key
       }));
     } else {
       // Delete local file
       fs.unlinkSync(path.join(process.cwd(), qrPath));
     }
   };
   ```

### 12.3 Security Best Practices

1. **Use Unique Tokens**
   ```javascript
   const token = uuidv4(); // Cryptographically secure
   ```

2. **Validate QR Scans**
   ```javascript
   // Verify token exists in database
   const event = await pool.query(
     'SELECT * FROM events WHERE qr_token = $1',
     [token]
   );
   if (!event.rows.length) {
     throw new Error('Invalid QR code');
   }
   ```

3. **Secure S3 Bucket**
   - Only allow public read for `/qr/*` folder
   - Block public write access
   - Enable logging

4. **Use HTTPS Only**
   ```javascript
   // Force HTTPS in production
   if (process.env.NODE_ENV === 'production' && req.protocol !== 'https') {
     return res.redirect(`https://${req.hostname}${req.url}`);
   }
   ```

### 12.4 Performance Best Practices

1. **Generate QR Asynchronously**
   ```javascript
   // Don't block event creation
   generateAndStoreQR(url, eventId)
     .then(result => updateDatabase(result))
     .catch(error => console.error(error));
   ```

2. **Use Appropriate QR Size**
   ```javascript
   // 300x300 is optimal for scanning and file size
   width: 300 // ~3-5KB file size
   ```

3. **Enable Compression**
   ```javascript
   // PNG is already compressed, but ensure optimal settings
   errorCorrectionLevel: 'H' // High correction, slightly larger but more reliable
   ```

4. **Cache QR Codes**
   ```javascript
   // CloudFront caching
   CacheControl: 'max-age=31536000'
   
   // Browser caching
   res.setHeader('Cache-Control', 'public, max-age=31536000');
   ```

---

## Appendix A: Environment Variables Reference

### Local Development (.env)
```bash
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/expo_db
API_BASE_URL=http://localhost:5000
SES_FROM_EMAIL=test@example.com
```

### Production (.env)
```bash
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/expo_db
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLOUDFRONT_DOMAIN=d2ux36xl31uki3.cloudfront.net
S3_QR_BUCKET=expo-project-prod-frontend
SES_FROM_EMAIL=noreply@yourdomain.com
INVITE_LINK_BASE=https://d2ux36xl31uki3.cloudfront.net
```

---

## Appendix B: Useful Commands

```bash
# Local Development
npm start                                    # Start server
ls -la server/uploads/qrs/                  # List QR codes
xdg-open server/uploads/qrs/event-1.png    # View QR code

# Production
aws s3 ls s3://expo-project-prod-frontend/qr/  # List S3 QR codes
aws s3 cp s3://expo-project-prod-frontend/qr/event_1.png ./  # Download QR
curl -I https://d2ux36xl31uki3.cloudfront.net/qr/event_1.png  # Test access

# Testing
node server/test-qr-email-diagnostic.js     # Test QR email
curl -X POST http://localhost:5000/api/events  # Create test event

# Debugging
tail -f server/server.log | grep "QR"       # Watch QR logs
psql expo_db -c "SELECT id, qr_token, qr_image_path FROM events;"  # Check DB
```

---

## Appendix C: QR Code Specifications

| Property | Value | Notes |
|----------|-------|-------|
| **Format** | PNG | Lossless compression |
| **Size** | 300x300 pixels | Optimal for scanning |
| **File Size** | 3-5 KB | Depends on content |
| **Color** | Black on white | Standard QR colors |
| **Error Correction** | High (H) | 30% damage tolerance |
| **Margin** | 2 modules | White border around QR |
| **Encoding** | UTF-8 | Supports international characters |

---

**End of Documentation**

For questions or issues, refer to the troubleshooting section or contact the development team.

---

**Document Version:** 2.0  
**Last Updated:** February 4, 2026  
**Maintained By:** Billiton Event Management Team
