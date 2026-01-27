# 🎓 Backend Knowledge Transfer (KT) Guide

**Project:** EventHub - Expo Event Management Platform  
**Backend Technology:** Node.js + Express.js + PostgreSQL  
**Last Updated:** January 27, 2026

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Folder Structure](#3-folder-structure)
4. [Database Schema](#4-database-schema)
5. [API Endpoints](#5-api-endpoints)
6. [Controllers Deep Dive](#6-controllers-deep-dive)
7. [Services Layer](#7-services-layer)
8. [Authentication Flow](#8-authentication-flow)
9. [Development Setup](#9-development-setup)
10. [Deployment Architecture](#10-deployment-architecture)
11. [Common Tasks & Patterns](#11-common-tasks--patterns)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Project Overview

EventHub is an **Event Management Platform** that allows:
- **Master Admin**: Manage organizations, view analytics
- **Organizations**: Create events, manage exhibitors and visitors
- **Exhibitors**: Register for events, capture leads
- **Visitors**: Register for events, get QR codes for entry

### User Hierarchy
```
Master Admin (Super Admin)
    └── Organizations (Tenants)
            ├── Events
            │     ├── Exhibitors
            │     └── Visitors
            └── Invoices
```

---

## 2. Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Runtime | Node.js | 18+ |
| Framework | Express.js | 5.x |
| Database | PostgreSQL | 14+ |
| ORM/Driver | pg (node-postgres) | 8.x |
| Authentication | bcryptjs | Password hashing |
| File Upload | multer | 2.x |
| Email | AWS SES | via @aws-sdk |
| SMS | AWS SNS | via @aws-sdk |
| QR Codes | qrcode | 1.5.x |
| UUID | uuid | 13.x |

### Key NPM Packages

```json
{
  "@aws-sdk/client-s3": "S3 file storage (QR codes in production)",
  "@aws-sdk/client-ses": "Email sending via AWS Simple Email Service",
  "@aws-sdk/client-sns": "SMS sending via AWS Simple Notification Service",
  "bcryptjs": "Password hashing",
  "cors": "Cross-Origin Resource Sharing",
  "dotenv": "Environment variables",
  "express": "Web framework",
  "multer": "File upload handling",
  "pg": "PostgreSQL driver",
  "qrcode": "QR code generation",
  "uuid": "Unique ID generation"
}
```

---

## 3. Folder Structure

```
server/
├── 📄 server.js              # Main entry point - Express app setup & routes
├── 📄 db.js                  # Database connection pool (PostgreSQL)
├── 📄 schema.sql             # Full database schema (tables, indexes, constraints)
├── 📄 package.json           # NPM dependencies & scripts
├── 📄 .env                   # Environment variables (DO NOT COMMIT)
├── 📄 .env.example           # Example environment file
├── 📄 Procfile               # AWS Elastic Beanstalk startup command
│
├── 📁 controllers/           # Request handlers (business logic)
│   ├── organizationController.js  # Organization CRUD, invites, login
│   ├── eventController.js         # Event CRUD, QR generation
│   ├── exhibitorController.js     # Exhibitor CRUD, login, registration
│   ├── visitorController.js       # Visitor CRUD, login, QR scanning
│   ├── invoiceController.js       # Invoice management
│   ├── leadController.js          # Lead capture management
│   ├── scannedVisitorsController.js # QR/OCR scan records
│   └── uploadController.js        # File upload handling
│
├── 📁 services/              # Reusable business services
│   ├── notificationService.js     # Email & SMS via AWS SES/SNS
│   ├── gstService.js              # GST number verification
│   └── qrStorageService.js        # QR code generation & S3 upload
│
├── 📁 migrations/            # Database migrations (incremental schema changes)
│   ├── 001_create_organization_invites.sql
│   ├── 002_create_events.sql
│   ├── ...
│   └── create_exhibitor_scanned_visitors.js
│
├── 📁 uploads/               # Local file storage (development)
│   └── qrs/                  # QR code images
│
├── 📁 utils/                 # Utility functions
│   └── (helper functions)
│
└── 📁 scripts/               # Utility scripts
```

---

## 4. Database Schema

### Entity Relationship Diagram (ERD)

```
┌─────────────────┐       ┌─────────────────┐
│  organizations  │──1:N──│     events      │
│  (Tenants)      │       │                 │
└─────────────────┘       └─────────────────┘
         │                       │ 1
         │                       │
         │ 1:N                   │ N
         ▼                       ▼
┌─────────────────┐       ┌─────────────────┐
│     users       │       │   exhibitors    │
│ (Org employees) │       │                 │
└─────────────────┘       └─────────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         │                                               │
         ▼                                               ▼
┌─────────────────┐                             ┌─────────────────┐
│    visitors     │                             │     leads       │
│                 │                             │ (captured data) │
└─────────────────┘                             └─────────────────┘
         │
         ▼
┌─────────────────┐
│    invoices     │
└─────────────────┘
```

### Main Tables

#### `organizations` (Tenants)
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| org_name | TEXT | Organization name |
| primary_email | TEXT | Login email |
| password_hash | TEXT | Hashed password |
| gst_number | TEXT | GST registration |
| plan | TEXT | Subscription plan (Free/Basic/Pro) |
| status | TEXT | Active/Inactive |
| created_at | TIMESTAMPTZ | Creation timestamp |

#### `events`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| organization_id | BIGINT | FK → organizations |
| event_name | TEXT | Event title |
| start_date, end_date | DATE | Event duration |
| venue, city, state | TEXT | Location |
| qr_token | TEXT | Unique token for registration |
| registration_link | TEXT | Public registration URL |
| status | TEXT | Draft/Active/Completed |

#### `exhibitors`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| organization_id | BIGINT | FK → organizations |
| event_id | BIGINT | FK → events |
| company_name | TEXT | Exhibitor company |
| email | TEXT | Login email |
| password_hash | TEXT | Hashed password |
| stall_number | TEXT | Assigned stall |
| access_status | TEXT | Active/Inactive |

#### `visitors`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| event_id | BIGINT | FK → events |
| first_name, last_name | TEXT | Visitor name |
| email | TEXT | Contact email |
| mobile | TEXT | Contact phone |
| unique_code | TEXT | VIS-XXXXXXXX format |
| password_hash | TEXT | Optional password |

---

## 5. API Endpoints

### Authentication

| Method | Endpoint | Description | Controller |
|--------|----------|-------------|------------|
| POST | `/api/login` | Unified login (org/exhibitor/visitor) | server.js |
| POST | `/api/org-login` | Organization login | organizationController |
| POST | `/api/exhibitor-login` | Exhibitor login | exhibitorController |
| POST | `/api/visitor-login` | Visitor login | visitorController |

### Organizations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/organizations` | List all organizations |
| POST | `/api/organizations` | Create organization directly |
| POST | `/api/send-invite` | Send organization invite email |
| GET | `/api/validate-invite/:token` | Validate invite token |
| POST | `/api/register-organization/:token` | Complete registration |

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List events (supports ?organizationId=X) |
| POST | `/api/events` | Create new event |
| GET | `/api/event-by-token/:token` | Get event by QR token |

### Exhibitors

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exhibitors` | List exhibitors (supports ?eventId=X) |
| POST | `/api/exhibitors` | Create exhibitor |
| GET | `/api/exhibitors/upcoming-events/:orgId` | Get upcoming events for registration |
| POST | `/api/exhibitors/register-for-event` | One-click event registration |

### Visitors

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/visitors` | List visitors (supports ?eventId=X) |
| POST | `/api/visitors` | Register as visitor |
| GET | `/api/visitors/code/:code` | Get visitor by QR code |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Dashboard stats (mock data) |
| GET/POST | `/api/invoices` | Invoice management |
| GET/POST/PUT/DELETE | `/api/leads` | Lead management |
| POST | `/api/scanned-visitors` | Save QR scan record |
| POST | `/api/verify-gstin` | Verify GST number |
| POST | `/api/upload/ground-layout` | Upload floor plan |

---

## 6. Controllers Deep Dive

### Pattern: Controller Function Structure

```javascript
// Each controller function follows this pattern:
const functionName = async (req, res) => {
    try {
        // 1. Extract and validate input
        const { field1, field2 } = req.body;
        
        if (!field1) {
            return res.status(400).json({ error: 'field1 is required' });
        }
        
        // 2. Business logic / Database operation
        const result = await pool.query(
            'SELECT * FROM table WHERE field = $1',
            [field1]
        );
        
        // 3. Return response
        return res.status(200).json({
            success: true,
            data: result.rows
        });
        
    } catch (error) {
        // 4. Error handling
        console.error('FunctionName error:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { functionName };
```

### Key Controllers

#### `organizationController.js` (1005 lines)
- **inviteOrganization**: Send email invite to new organization
- **validateInvite**: Check if invite token is valid
- **createOrganizationFromInvite**: Complete registration from invite
- **createOrganization**: Direct creation (admin only)
- **loginOrganization**: Authenticate organization user
- **createUser**: Create organization employee
- **createPlan / getPlans**: Subscription plan management
- **verifyCoupon / getCoupons**: Discount handling

#### `eventController.js` (300 lines)
- **getEvents**: List events with optional `organizationId` filter
- **createEvent**: Create event with automatic QR code generation
- **getEventByToken**: Public endpoint for registration page

#### `exhibitorController.js` (332 lines)
- **getExhibitors**: List with `eventId` or `organizationId` filter
- **createExhibitor**: Register exhibitor with password hashing
- **loginExhibitor**: Authentication
- **getUpcomingEventsByOrganization**: For one-click registration
- **registerExhibitorForEvent**: Copy exhibitor data to new event

#### `visitorController.js` (319 lines)
- **getVisitors**: List with `eventId` filter
- **createVisitor**: Register with unique code generation (VIS-XXXXXXXX)
- **loginVisitor**: Authentication
- **getVisitorByCode**: QR code scanning (validates event ID)

---

## 7. Services Layer

### `notificationService.js` - Email & SMS

```javascript
// Send Email via AWS SES
await sendEmail({
    to: 'recipient@example.com',
    subject: 'Welcome!',
    text: 'Plain text version',
    html: '<h1>HTML version</h1>'
});

// Send SMS via AWS SNS
await sendSMS({
    to: '+919876543210',  // Must include country code
    body: 'Your OTP is 123456'
});

// Send Email with Attachments (QR codes)
await sendEmailWithAttachments({
    to: 'recipient@example.com',
    subject: 'Your Event Registration',
    html: '<h1>Welcome!</h1>',
    attachments: [
        { filename: 'qr.png', content: Buffer, contentType: 'image/png' }
    ]
});
```

### `qrStorageService.js` - QR Code Generation

```javascript
// Generate and store QR code (auto-detects environment)
const { path, fullUrl } = await generateAndStoreQR(
    'https://example.com/register?token=abc123',
    eventId
);

// Development: Saves to /uploads/qrs/event-{id}.png
// Production: Uploads to S3, returns CloudFront URL
```

### `gstService.js` - GST Verification

```javascript
// Verify GST number
const result = await verifyGSTIN('36AAACH7409R116');

// Returns:
{
    success: true,
    data: {
        gstin: '36AAACH7409R116',
        tradeName: 'Company Name',
        legalName: 'Legal Company Name',
        address: 'Full Address',
        state: 'Telangana',
        status: 'Active'
    }
}
```

---

## 8. Authentication Flow

### Password Hashing (bcryptjs)
```javascript
const bcrypt = require('bcryptjs');

// When creating user:
const password_hash = await bcrypt.hash(password, 10);

// When logging in:
const isValid = await bcrypt.compare(inputPassword, storedHash);
```

### Unified Login (`/api/login`)
```javascript
// Supports type: 'organization' | 'exhibitor' | 'visitor'
// Auto-detects if type not provided
{
    "email": "user@example.com",
    "password": "secret123",
    "type": "organization"  // Optional
}
```

### Session Management
Currently using **stateless** approach - no JWT/sessions. Frontend stores user data in localStorage/context.

> **TODO for Junior Dev**: Consider implementing JWT tokens for better security.

---

## 9. Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (local or AWS RDS)
- Git

### Step-by-Step Setup

```bash
# 1. Clone repository
cd /path/to/Expo_project/server

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your settings

# 4. Configure database (db.js)
# Option 1: LOCAL - Uncomment local config, comment server config
# Option 2: SERVER - Comment local config, uncomment server config

# 5. Start development server
npm run dev      # Uses nodemon for auto-reload

# 6. Production start
npm start        # Uses node directly
```

### Environment Variables (.env)
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
PGSSLMODE=require

# Server
PORT=5000
NODE_ENV=development

# AWS (for production email/SMS)
AWS_REGION=ap-south-1
SES_FROM_EMAIL=noreply@example.com

# QR Storage (production)
S3_QR_BUCKET=your-bucket-name
CLOUDFRONT_DOMAIN=your-domain.cloudfront.net
```

---

## 10. Deployment Architecture

### AWS Infrastructure

```
┌─────────────────────────────────────────────────────────────┐
│                        AWS Cloud                            │
│  ┌─────────────────┐      ┌─────────────────────────────┐   │
│  │   CloudFront    │      │     CloudFront (Backend)    │   │
│  │   (Frontend)    │      │   d3xxxxxxx.cloudfront.net  │   │
│  │ HTTPS Endpoint  │      │                             │   │
│  └────────┬────────┘      └───────────────┬─────────────┘   │
│           │                               │                 │
│           ▼                               ▼                 │
│  ┌─────────────────┐      ┌─────────────────────────────┐   │
│  │   S3 Bucket     │      │    Elastic Beanstalk        │   │
│  │ (React Build)   │      │    (Node.js Server)         │   │
│  └─────────────────┘      └───────────────┬─────────────┘   │
│                                           │                 │
│                                           ▼                 │
│                           ┌─────────────────────────────┐   │
│                           │        AWS RDS              │   │
│                           │     (PostgreSQL)            │   │
│                           └─────────────────────────────┘   │
│                                                             │
│  ┌─────────────────┐      ┌─────────────────────────────┐   │
│  │    AWS SES      │      │        AWS SNS              │   │
│  │    (Email)      │      │        (SMS)                │   │
│  └─────────────────┘      └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Deployment Files
- `Procfile`: Tells Elastic Beanstalk how to start the app
- `.ebignore`: Files to exclude from deployment
- `.elasticbeanstalk/`: EB CLI configuration

---

## 11. Common Tasks & Patterns

### Adding a New API Endpoint

```javascript
// 1. Create controller function in appropriate controller file
// controllers/newController.js

const pool = require('../db');

const myNewFunction = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM table WHERE id = $1', [id]);
        return res.json({ data: result.rows });
    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { myNewFunction };

// 2. Register route in server.js
const newController = require('./controllers/newController');
app.get('/api/new-endpoint/:id', newController.myNewFunction);
```

### Adding a New Database Column

```sql
-- Create migration file: migrations/XXX_add_new_column.sql

ALTER TABLE tablename ADD COLUMN IF NOT EXISTS new_column TEXT;

-- Also update schema.sql for fresh installs
```

### Query Patterns

```javascript
// SELECT with parameters (prevents SQL injection)
const result = await pool.query(
    'SELECT * FROM users WHERE email = $1 AND status = $2',
    [email, 'active']
);

// INSERT returning the new row
const result = await pool.query(
    `INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *`,
    [name, email]
);
const newUser = result.rows[0];

// UPDATE
await pool.query(
    'UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2',
    [name, id]
);

// DELETE
await pool.query('DELETE FROM users WHERE id = $1', [id]);

// Conditional filters
let query = 'SELECT * FROM events WHERE 1=1';
const params = [];

if (organizationId) {
    params.push(organizationId);
    query += ` AND organization_id = $${params.length}`;
}

const result = await pool.query(query, params);
```

---

## 12. Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "relation does not exist" | Run schema.sql or missing migration |
| CORS errors | Check `cors()` middleware in server.js |
| "Failed to fetch" | Check if backend is running, correct URL |
| Password mismatch | Ensure using bcrypt.compare, not === |
| QR not generating | Check qrcode package, uploads/ permissions |
| Email not sending | Check AWS SES credentials, verified sender |

### Debug Commands

```bash
# Check all registered routes
curl http://localhost:5000/__routes

# Check database tables
node list-tables.js

# Check specific table columns
curl http://localhost:5000/__columns/users

# View server logs
tail -f server.log
```

### Useful SQL for Debugging

```sql
-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Count records in each table
SELECT 
    (SELECT COUNT(*) FROM organizations) as orgs,
    (SELECT COUNT(*) FROM events) as events,
    (SELECT COUNT(*) FROM exhibitors) as exhibitors,
    (SELECT COUNT(*) FROM visitors) as visitors;

-- Find recent registrations
SELECT * FROM visitors ORDER BY created_at DESC LIMIT 10;
```

---

## 📝 KT Session Agenda (Suggested 2-3 Hours)

### Session 1: Overview (45 min)
1. ✅ Project purpose and user roles
2. ✅ Technology stack walkthrough
3. ✅ Folder structure explanation
4. ✅ Database schema overview

### Session 2: Code Deep Dive (1 hour)
1. ✅ Walk through `server.js` (entry point)
2. ✅ Explain controller pattern with example
3. ✅ Show service layer usage
4. ✅ Demonstrate adding a new endpoint

### Session 3: Practice (45 min)
1. ✅ Junior creates a simple new endpoint
2. ✅ Test with Postman/curl
3. ✅ Review deployment process
4. ✅ Q&A session

---

## 📞 Quick Reference Contacts

| Question About | Ask |
|----------------|-----|
| Database schema | Check schema.sql |
| API format | Check server.js routes |
| Business logic | Check controllers/ |
| AWS services | Check services/ |
| Deployment | Check MANUAL_DEPLOYMENT.md |

---

*Document created for KT session. Keep this updated as the project evolves.*
