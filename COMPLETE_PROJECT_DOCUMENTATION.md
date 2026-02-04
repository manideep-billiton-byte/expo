# EventHub - Complete Project Documentation
## Comprehensive Guide for Developers

**Version:** 1.0  
**Last Updated:** February 4, 2026  
**Author:** Billiton Event Management Team

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Database Schema](#4-database-schema)
5. [API Documentation](#5-api-documentation)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Backend Architecture](#7-backend-architecture)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Key Features Implementation](#9-key-features-implementation)
10. [Deployment Guide](#10-deployment-guide)
11. [Development Workflow](#11-development-workflow)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Project Overview

### 1.1 What is EventHub?

EventHub is a comprehensive event management platform designed for organizing exhibitions, managing exhibitors, capturing visitor leads, and facilitating business connections. It provides a complete solution for event organizers, exhibitors, and visitors.

### 1.2 Core Capabilities

- **Multi-tenant Architecture**: Support multiple organizations and events
- **User Management**: Four distinct user roles (Master Admin, Organization, Exhibitor, Visitor)
- **QR Code System**: Fast check-in and lead capture
- **Lead Management**: Capture, track, and export leads
- **Analytics Dashboard**: Real-time event metrics
- **Stall Management**: Interactive stall selection and assignment
- **Email/SMS Notifications**: Automated communication system

### 1.3 Business Use Cases

1. **Event Organizers**: Create and manage multiple events
2. **Exhibitors**: Capture leads through QR scanning and business card OCR
3. **Visitors**: Register for events and receive QR codes
4. **Administrators**: Monitor system-wide analytics and manage organizations

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  (React SPA - Vite + React Router + Tailwind CSS)      │
└─────────────────────────────────────────────────────────┘
                          ↓ HTTPS
┌─────────────────────────────────────────────────────────┐
│                 CloudFront CDN (Production)              │
│              S3 Static Hosting (Frontend)                │
└─────────────────────────────────────────────────────────┘
                          ↓ REST API
┌─────────────────────────────────────────────────────────┐
│              Application Layer (Backend)                 │
│    Node.js + Express.js (Elastic Beanstalk/EC2)        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Controllers  │  │   Services   │  │  Middleware  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Data Layer                             │
│         PostgreSQL (AWS RDS - Production)                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              External Services                           │
│  AWS SES (Email) | AWS SNS (SMS) | S3 (QR Storage)     │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Request Flow

1. **User Request** → CloudFront CDN
2. **Static Assets** → Served from S3
3. **API Calls** → Routed to Backend (Elastic Beanstalk)
4. **Authentication** → JWT validation
5. **Business Logic** → Controllers → Services
6. **Database** → PostgreSQL queries
7. **Response** → JSON back to client

### 2.3 Multi-Tenant Architecture

```
Master Admin
    ├── Organization 1
    │   ├── Event 1
    │   │   ├── Exhibitors
    │   │   └── Visitors
    │   └── Event 2
    └── Organization 2
        └── Event 3
```

**Key Principle**: All data is filtered by `organization_id` to ensure tenant isolation.

---

## 3. Technology Stack

### 3.1 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.x | UI framework |
| **Vite** | 5.x | Build tool & dev server |
| **React Router** | 6.x | Client-side routing |
| **Tailwind CSS** | 3.x | Styling framework |
| **html5-qrcode** | 2.x | QR code scanning |
| **qrcode** | 1.x | QR code generation |
| **Tesseract.js** | 5.x | OCR for business cards |
| **Axios** | 1.x | HTTP client |

### 3.2 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Express** | 5.x | Web framework |
| **PostgreSQL** | 15+ | Database |
| **pg** | 8.x | PostgreSQL client |
| **dotenv** | 16.x | Environment variables |
| **@aws-sdk/client-s3** | 3.x | S3 file storage |
| **@aws-sdk/client-ses** | 3.x | Email service |
| **@aws-sdk/client-sns** | 3.x | SMS service |
| **qrcode** | 1.x | QR generation |

### 3.3 AWS Services

| Service | Purpose |
|---------|---------|
| **RDS (PostgreSQL)** | Production database |
| **Elastic Beanstalk** | Backend hosting |
| **S3** | Frontend hosting & QR storage |
| **CloudFront** | CDN for frontend |
| **SES** | Email notifications |
| **SNS** | SMS notifications |
| **Route 53** | DNS management (optional) |

---

## 4. Database Schema

### 4.1 Core Tables

#### 4.1.1 Organizations Table
```sql
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    gstin VARCHAR(15),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Stores organization/tenant information  
**Key Fields**: 
- `id`: Primary key for tenant isolation
- `status`: active/suspended/inactive

#### 4.1.2 Events Table
```sql
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    event_name VARCHAR(255),
    description TEXT,
    event_type VARCHAR(100),
    event_mode VARCHAR(50),
    industry VARCHAR(100),
    organizer_name VARCHAR(255),
    contact_person VARCHAR(255),
    organizer_email VARCHAR(255),
    organizer_mobile VARCHAR(20),
    venue VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    start_date DATE,
    end_date DATE,
    registration JSONB,
    lead_capture JSONB,
    communication JSONB,
    qr_token VARCHAR(255) UNIQUE,
    qr_image_path TEXT,
    registration_link TEXT,
    status VARCHAR(50) DEFAULT 'Draft',
    enable_stalls BOOLEAN DEFAULT false,
    stall_config JSONB,
    stall_types JSONB,
    ground_layout_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Stores event information  
**Key Fields**:
- `organization_id`: Links to organization (tenant isolation)
- `qr_token`: Unique token for registration links
- `stall_config`: JSON configuration for stall layout
- `registration_link`: Public registration URL

#### 4.1.3 Exhibitors Table
```sql
CREATE TABLE exhibitors (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    event_id INTEGER REFERENCES events(id),
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    stall_number VARCHAR(50),
    category VARCHAR(100),
    products_services TEXT,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Stores exhibitor information  
**Key Fields**:
- `organization_id` + `event_id`: Multi-level filtering
- `stall_number`: Assigned stall location

#### 4.1.4 Visitors Table
```sql
CREATE TABLE visitors (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    event_id INTEGER REFERENCES events(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    company VARCHAR(255),
    designation VARCHAR(100),
    city VARCHAR(100),
    unique_code VARCHAR(50) UNIQUE,
    qr_code_path TEXT,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'registered'
);
```

**Purpose**: Stores visitor registrations  
**Key Fields**:
- `unique_code`: Generated QR code identifier
- `qr_code_path`: Path to QR image

#### 4.1.5 Leads Table
```sql
CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    event_id INTEGER REFERENCES events(id),
    exhibitor_id INTEGER REFERENCES exhibitors(id),
    visitor_id INTEGER REFERENCES visitors(id),
    visitor_name VARCHAR(255),
    visitor_email VARCHAR(255),
    visitor_phone VARCHAR(20),
    visitor_company VARCHAR(255),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'new',
    captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Stores captured leads  
**Key Relationships**: Links exhibitors to visitors

### 4.2 Data Relationships

```
organizations (1) ──→ (N) events
organizations (1) ──→ (N) exhibitors
events (1) ──→ (N) exhibitors
events (1) ──→ (N) visitors
exhibitors (1) ──→ (N) leads
visitors (1) ──→ (N) leads
```

---

## 5. API Documentation

### 5.1 Authentication Endpoints

#### POST /api/login
**Purpose**: Unified login for all user types  
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "userType": "organization" // or "exhibitor", "visitor", "master"
}
```
**Response**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Organization Name",
    "userType": "organization"
  }
}
```

### 5.2 Organization Endpoints

#### GET /api/organizations
**Purpose**: Get all organizations (Master Admin only)  
**Response**:
```json
[
  {
    "id": 1,
    "name": "Acme Corp",
    "email": "admin@acme.com",
    "status": "active",
    "created_at": "2026-01-15T10:00:00Z"
  }
]
```

#### POST /api/create-organization
**Purpose**: Create new organization  
**Request Body**:
```json
{
  "name": "New Org",
  "email": "contact@neworg.com",
  "password": "securepass",
  "contact_person": "John Doe",
  "phone": "+1234567890"
}
```

### 5.3 Event Endpoints

#### GET /api/events?organization_id=1
**Purpose**: Get events for an organization  
**Query Params**: `organization_id` (required for filtering)

#### POST /api/events
**Purpose**: Create new event  
**Request Body**:
```json
{
  "organizationId": 1,
  "eventName": "Tech Expo 2026",
  "description": "Annual technology exhibition",
  "startDate": "2026-03-15",
  "endDate": "2026-03-17",
  "venue": "Convention Center",
  "city": "Mumbai",
  "organizerEmail": "organizer@example.com",
  "enableStalls": true,
  "stallConfig": {
    "totalStalls": 100,
    "rows": 10,
    "columns": 10
  },
  "stallTypes": [
    {
      "name": "Premium",
      "price": 50000,
      "limit": 20
    }
  ]
}
```

**Response**: Event object with generated QR code and registration link

### 5.4 Lead Endpoints

#### POST /api/leads
**Purpose**: Capture a new lead  
**Request Body**:
```json
{
  "organization_id": 1,
  "event_id": 5,
  "exhibitor_id": 10,
  "visitor_id": 25,
  "notes": "Interested in product demo"
}
```

#### GET /api/leads?exhibitor_id=10
**Purpose**: Get leads for an exhibitor  
**Query Params**: `exhibitor_id`, `event_id`, `organization_id`

---

## 6. Frontend Architecture

### 6.1 Component Structure

```
src/
├── components/
│   ├── Dashboard.jsx           # Main dashboard
│   ├── Login.jsx               # Login page
│   ├── EventManagement.jsx     # Event CRUD
│   ├── ExhibitorManagement.jsx # Exhibitor CRUD
│   ├── VisitorManagement.jsx   # Visitor CRUD
│   ├── LeadManagement.jsx      # Lead capture
│   ├── QRScanner.jsx           # QR scanning
│   ├── StallSelector.jsx       # Stall selection UI
│   └── Analytics.jsx           # Analytics dashboard
├── utils/
│   ├── api.js                  # API client
│   └── auth.js                 # Auth helpers
├── App.jsx                     # Root component
└── Index.jsx                   # Entry point
```

### 6.2 Routing Structure

```javascript
<Routes>
  <Route path="/" element={<Login />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/events" element={<EventManagement />} />
  <Route path="/exhibitors" element={<ExhibitorManagement />} />
  <Route path="/visitors" element={<VisitorManagement />} />
  <Route path="/leads" element={<LeadManagement />} />
  <Route path="/scan" element={<QRScanner />} />
</Routes>
```

### 6.3 State Management

**Approach**: React Context + Local State  
**Key Contexts**:
- `AuthContext`: User authentication state
- `EventContext`: Current event data
- `OrganizationContext`: Current organization data

---

## 7. Backend Architecture

### 7.1 Project Structure

```
server/
├── controllers/
│   ├── authController.js       # Authentication logic
│   ├── eventController.js      # Event operations
│   ├── exhibitorController.js  # Exhibitor operations
│   ├── visitorController.js    # Visitor operations
│   └── leadController.js       # Lead operations
├── services/
│   ├── notificationService.js  # Email/SMS
│   ├── qrStorageService.js     # QR generation & S3
│   └── gstService.js           # GST verification
├── migrations/
│   └── *.sql                   # Database migrations
├── db.js                       # Database connection
└── server.js                   # Express app
```

### 7.2 Middleware Stack

1. **CORS**: Allow cross-origin requests
2. **Body Parser**: Parse JSON requests
3. **Static Files**: Serve uploads
4. **Error Handler**: Centralized error handling

### 7.3 Database Connection

```javascript
// db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = pool;
```

---

## 8. Authentication & Authorization

### 8.1 User Types

| Type | Login Endpoint | Access Level |
|------|---------------|--------------|
| Master Admin | `/api/login` | Full system access |
| Organization | `/api/organization-login` | Organization events |
| Exhibitor | `/api/exhibitor-login` | Assigned event leads |
| Visitor | `/api/visitor-login` | Personal QR code |

### 8.2 Session Management

**Method**: Session-based (stored in memory)  
**Storage**: `req.session.user`  
**Validation**: Check session on protected routes

---

## 9. Key Features Implementation

### 9.1 QR Code System

#### Generation (Server-side)
```javascript
const QRCode = require('qrcode');

const generateQR = async (registrationLink, eventId) => {
  const qrBuffer = await QRCode.toBuffer(registrationLink, {
    width: 300,
    errorCorrectionLevel: 'H'
  });
  
  // Upload to S3 or save locally
  const path = await uploadToS3(qrBuffer, eventId);
  
  // Return base64 for email embedding
  const base64 = qrBuffer.toString('base64');
  
  return { path, base64 };
};
```

#### Scanning (Client-side)
```javascript
import { Html5QrcodeScanner } from 'html5-qrcode';

const scanner = new Html5QrcodeScanner("reader", {
  fps: 10,
  qrbox: 250
});

scanner.render(onScanSuccess, onScanError);
```

### 9.2 Email Notifications

**Service**: AWS SES  
**Implementation**:
```javascript
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const sendEmail = async ({ to, subject, html }) => {
  const client = new SESClient({ region: 'ap-south-1' });
  
  const command = new SendEmailCommand({
    Source: process.env.SES_FROM_EMAIL,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: { Html: { Data: html } }
    }
  });
  
  await client.send(command);
};
```

**QR Code Embedding**: Uses base64 data URI for inline display

### 9.3 Stall Management

**Interactive Grid**: Visual stall selection  
**Configuration**: Stored as JSONB in database  
**Features**:
- Drag-and-drop stall assignment
- Color-coded stall types
- Real-time availability

---

## 10. Deployment Guide

### 10.1 Local Development

```bash
# 1. Clone repository
git clone <repo-url>
cd Expo_project

# 2. Install dependencies
cd server && npm install
cd ../client && npm install

# 3. Setup database
createdb expo_db
psql expo_db < server/schema.sql

# 4. Configure environment
cp server/.env.example server/.env
# Edit .env with your credentials

# 5. Start servers
cd server && npm start
cd client && npm run dev
```

### 10.2 AWS Production Deployment

**Prerequisites**:
- AWS account configured
- AWS CLI installed
- EB CLI installed

**Steps**:
```bash
# 1. Deploy backend
cd server
eb init
eb create expo-prod
eb deploy

# 2. Deploy frontend
cd client
npm run build
aws s3 sync dist/ s3://your-bucket/
aws cloudfront create-invalidation --distribution-id XXX --paths "/*"
```

### 10.3 Environment Variables

**Production .env**:
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
CLOUDFRONT_DOMAIN=d2ux36xl31uki3.cloudfront.net
S3_QR_BUCKET=expo-project-prod-frontend
AWS_REGION=ap-south-1
SES_FROM_EMAIL=noreply@yourdomain.com
```

---

## 11. Development Workflow

### 11.1 Git Workflow

```bash
# Feature development
git checkout -b feature/new-feature
# Make changes
git commit -m "Add new feature"
git push origin feature/new-feature
# Create pull request
```

### 11.2 Database Migrations

```bash
# Create migration
touch server/migrations/005_add_new_column.sql

# Apply migration
psql expo_db < server/migrations/005_add_new_column.sql
```

### 11.3 Testing

**Manual Testing**: Use Postman collection  
**Test Accounts**: Create test organizations/events  
**QR Testing**: Use test QR generator scripts

---

## 12. Troubleshooting

### 12.1 Common Issues

**Issue**: QR codes not displaying in emails  
**Solution**: Ensure base64 embedding is enabled, check S3 permissions

**Issue**: Camera not working  
**Solution**: Ensure HTTPS is enabled (required for camera access)

**Issue**: CORS errors  
**Solution**: Check backend CORS configuration matches frontend URL

### 12.2 Logs

**Backend**: `server/server.log`  
**AWS**: CloudWatch logs  
**Database**: PostgreSQL logs

---

## Appendix

### A. Useful Commands

```bash
# Check database
psql expo_db -c "SELECT * FROM organizations;"

# Test email
node server/test-qr-email-diagnostic.js

# View logs
tail -f server/server.log
```

### B. Contact & Support

For questions: Contact development team  
For bugs: Create GitHub issue  
For deployment: See deployment documentation

---

**End of Documentation**
