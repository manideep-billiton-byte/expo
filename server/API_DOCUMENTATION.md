# 📱 Expo Event Management Platform - API Documentation

## Base URL
```
Production: https://d36p7i1koir3da.cloudfront.net
Development: http://localhost:5000
```

---

# Table of Contents
1. [Authentication APIs](#1-authentication-apis)
2. [Exhibitor APIs](#2-exhibitor-apis)
3. [Visitor APIs](#3-visitor-apis)
4. [Event APIs](#4-event-apis)
5. [Lead Management APIs](#5-lead-management-apis)
6. [Scanned Visitors APIs](#6-scanned-visitors-apis)
7. [Organization APIs](#7-organization-apis)
8. [Invoice APIs](#8-invoice-apis)
9. [Utility APIs](#9-utility-apis)

---

# 1. Authentication APIs

## 1.1 Unified Login
**Endpoint:** `POST /api/login`

**Description:** Universal login endpoint that automatically determines user type (organization, exhibitor, or visitor).

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "type": ["exhibitor", "visitor"]  // Optional: specify which type(s) to try
}
```

**Response (Success - Exhibitor):**
```json
{
  "success": true,
  "userType": "exhibitor",
  "user": {
    "id": 1,
    "name": "Company Name",
    "email": "exhibitor@example.com",
    "eventId": 5,
    "eventName": "Tech Summit 2025",
    "organizationId": 2
  }
}
```

**Response (Success - Visitor):**
```json
{
  "success": true,
  "userType": "visitor",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "visitor@example.com",
    "mobile": "+919876543210",
    "eventId": 5,
    "uniqueCode": "VIS-ABCD1234"
  }
}
```

**Response (Success - Organization):**
```json
{
  "success": true,
  "userType": "organization",
  "user": {
    "id": 1,
    "name": "Organization Name",
    "email": "org@example.com"
  }
}
```

**Error Responses:**
- `400`: Email and password are required
- `401`: Invalid email or password

---

## 1.2 Exhibitor Login
**Endpoint:** `POST /api/exhibitor-login`

**Description:** Direct login for exhibitors only.

**Request Body:**
```json
{
  "email": "exhibitor@company.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "userType": "exhibitor",
  "user": {
    "id": 1,
    "name": "Company Name",
    "email": "exhibitor@company.com",
    "eventId": 5,
    "eventName": "Tech Summit 2025",
    "organizationId": 2
  }
}
```

**Error Responses:**
- `400`: Email and password are required
- `401`: Invalid email or password
- `401`: No password set for this exhibitor. Please contact administrator.

---

## 1.3 Visitor Login
**Endpoint:** `POST /api/visitor-login`

**Description:** Login for visitors. Supports both password and phone number authentication.

**Request Body:**
```json
{
  "email": "visitor@example.com",
  "password": "password123"  // Can be password OR phone number
}
```

**Response:**
```json
{
  "success": true,
  "userType": "visitor",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "visitor@example.com",
    "mobile": "+919876543210",
    "eventId": 5,
    "uniqueCode": "VIS-ABCD1234"
  }
}
```

**Note:** Visitors can authenticate using either:
- Their password (bcrypt hashed)
- Their phone number (last 10 digits matching)

---

# 2. Exhibitor APIs

## 2.1 Get All Exhibitors
**Endpoint:** `GET /api/exhibitors`

**Description:** Retrieve all exhibitors with event and organization details.

**Response:**
```json
[
  {
    "id": 1,
    "organization_id": 2,
    "event_id": 5,
    "company_name": "Tech Solutions Pvt Ltd",
    "gst_number": "27AABCT1234A1ZD",
    "address": "123 Business Park, Mumbai",
    "industry": "Technology",
    "logo_url": "/uploads/logo-123.png",
    "contact_person": "John Smith",
    "email": "john@techsolutions.com",
    "mobile": "+919876543210",
    "stall_number": "A-12",
    "stall_category": "Premium",
    "access_status": "Active",
    "lead_capture": {},
    "communication": {},
    "created_at": "2025-01-28T10:00:00Z",
    "updated_at": "2025-01-28T10:00:00Z",
    "event_name": "Tech Summit 2025",
    "organization_name": "ABC Organization"
  }
]
```

---

## 2.2 Create Exhibitor
**Endpoint:** `POST /api/exhibitors`

**Description:** Register a new exhibitor.

**Request Body:**
```json
{
  "organizationId": 2,
  "companyName": "Tech Solutions Pvt Ltd",
  "gstNumber": "27AABCT1234A1ZD",
  "address": "123 Business Park, Mumbai",
  "industry": "Technology",
  "contactPerson": "John Smith",
  "email": "john@techsolutions.com",
  "mobile": "+919876543210",
  "password": "optional-password",  // If not provided, auto-generates: emailprefix@123
  "eventId": 5,
  "stallNumber": "A-12",
  "stallCategory": "Premium",
  "accessStatus": "Active",
  "leadCapture": {
    "enableQR": true,
    "enableOCR": true
  },
  "communication": {
    "email": true,
    "sms": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "exhibitor": {
    "id": 1,
    "organization_id": 2,
    "company_name": "Tech Solutions Pvt Ltd",
    "email": "john@techsolutions.com",
    ...
  },
  "credentials": {  // Only if password was auto-generated
    "email": "john@techsolutions.com",
    "password": "john@123",
    "note": "Please save these credentials. Password can be changed after first login."
  }
}
```

---

## 2.3 Get Upcoming Events for Organization
**Endpoint:** `GET /api/exhibitors/upcoming-events/:organizationId`

**Description:** Get all upcoming events for organization (for exhibitor to register to new events).

**Parameters:**
- `organizationId` (path): Organization ID

**Response:**
```json
[
  {
    "id": 5,
    "event_name": "Tech Summit 2025",
    "description": "Annual technology conference",
    "event_type": "Conference",
    "event_mode": "Hybrid",
    "industry": "Technology",
    "start_date": "2025-02-15",
    "end_date": "2025-02-17",
    "venue": "Expo Center",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "organizer_name": "ABC Organization",
    "contact_person": "Jane Doe",
    "organizer_email": "events@abc.com",
    "organizer_mobile": "+919876543210",
    "status": "Published",
    "created_at": "2025-01-15T10:00:00Z"
  }
]
```

---

## 2.4 Register Exhibitor for Event
**Endpoint:** `POST /api/exhibitors/register-event`

**Description:** One-click registration for exhibitor to new event (auto-fills data from existing registration).

**Request Body:**
```json
{
  "exhibitorId": 1,
  "eventId": 10
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully registered for the event!",
  "registration": {
    "id": 5,
    "organization_id": 2,
    "company_name": "Tech Solutions Pvt Ltd",
    "event_id": 10,
    ...
  },
  "eventName": "Digital Marketing Expo 2025"
}
```

**Error Responses:**
- `400`: Exhibitor ID and Event ID are required
- `400`: You are already registered for this event
- `404`: Exhibitor not found
- `404`: Event not found
- `403`: Cannot register for events from different organizations

---

# 3. Visitor APIs

## 3.1 Get All Visitors
**Endpoint:** `GET /api/visitors`

**Description:** Retrieve all visitors with event details.

**Response:**
```json
[
  {
    "id": 1,
    "event_id": 5,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@email.com",
    "mobile": "+919876543210",
    "gender": "Male",
    "age_group": "25-35",
    "organization": "ABC Company",
    "designation": "Manager",
    "visitor_category": "VIP",
    "valid_dates": "2025-02-15,2025-02-16",
    "communication": {
      "email": true,
      "sms": true,
      "whatsapp": false
    },
    "created_at": "2025-01-28T10:00:00Z",
    "updated_at": "2025-01-28T10:00:00Z",
    "event_name": "Tech Summit 2025"
  }
]
```

---

## 3.2 Create Visitor
**Endpoint:** `POST /api/visitors`

**Description:** Register a new visitor.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@email.com",
  "mobile": "+919876543210",
  "gender": "Male",
  "age": "25-35",
  "organization": "ABC Company",
  "designation": "Manager",
  "password": "optional-password",  // If not provided, auto-generates: emailprefix@123
  "eventId": 5,
  "visitorCategory": "VIP",
  "validDates": "2025-02-15,2025-02-16",
  "communication": {
    "email": true,
    "sms": true,
    "whatsapp": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "visitor": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@email.com",
    "unique_code": "VIS-ABCD1234",
    ...
  },
  "uniqueCode": "VIS-ABCD1234",
  "credentials": {  // Only if password was auto-generated
    "email": "john.doe@email.com",
    "password": "john.doe@123",
    "note": "Please save these credentials. Password can be changed after first login."
  }
}
```

**Note:** A confirmation email is sent to the visitor with their unique code.

---

## 3.3 Get Visitor by Unique Code (QR Scan)
**Endpoint:** `GET /api/visitors/code/:uniqueCode`

**Description:** Look up visitor by their unique code (used for QR code scanning).

**Parameters:**
- `uniqueCode` (path): Visitor's unique code (e.g., VIS-ABCD1234)
- `eventId` (query, optional): Event ID for validation

**Response (Success):**
```json
{
  "success": true,
  "visitor": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@email.com",
    "mobile": "+919876543210",
    "gender": "Male",
    "age_group": "25-35",
    "organization": "ABC Company",
    "designation": "Manager",
    "visitor_category": "VIP",
    "event_id": 5,
    "unique_code": "VIS-ABCD1234",
    "created_at": "2025-01-28T10:00:00Z",
    "event_name": "Tech Summit 2025",
    "organization_id": 2
  }
}
```

**Error Responses:**
- `400`: Unique code is required
- `404`: Visitor not found
- `403`: Event mismatch (when scanned at wrong event)

**Event Mismatch Error:**
```json
{
  "error": "Event mismatch",
  "message": "Invalid QR code for this event. This visitor is registered for \"Tech Summit 2025\".",
  "visitorEventId": 5,
  "visitorEventName": "Tech Summit 2025",
  "scannedEventId": 10,
  "code": "EVENT_MISMATCH"
}
```

---

# 4. Event APIs

## 4.1 Get All Events
**Endpoint:** `GET /api/events`

**Description:** Retrieve all events.

**Response:**
```json
[
  {
    "id": 5,
    "organization_id": 2,
    "name": "Tech Summit 2025",
    "event_name": "Tech Summit 2025",
    "description": "Annual technology conference",
    "event_type": "Conference",
    "event_mode": "Hybrid",
    "industry": "Technology",
    "start_date": "2025-02-15",
    "end_date": "2025-02-17",
    "venue": "Expo Center",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "organizer_name": "ABC Organization",
    "contact_person": "Jane Doe",
    "organizer_email": "events@abc.com",
    "organizer_mobile": "+919876543210",
    "registration": {},
    "lead_capture": {},
    "communication": {},
    "qr_token": "abc123-uuid-token",
    "registration_link": "https://app.com?action=register&eventId=5&token=abc123",
    "qr_image_path": "/qr/event_5_qr.png",
    "status": "Published",
    "enable_stalls": true,
    "stall_config": {},
    "stall_types": [],
    "ground_layout_url": "/uploads/ground-layout-123.pdf",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
]
```

---

## 4.2 Create Event
**Endpoint:** `POST /api/events`

**Description:** Create a new event.

**Request Body:**
```json
{
  "organizationId": 2,
  "eventName": "Tech Summit 2025",
  "description": "Annual technology conference",
  "eventType": "Conference",
  "eventMode": "Hybrid",
  "industry": "Technology",
  "startDate": "2025-02-15",
  "endDate": "2025-02-17",
  "venue": "Expo Center",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "organizerName": "ABC Organization",
  "contactPerson": "Jane Doe",
  "organizerEmail": "events@abc.com",
  "organizerMobile": "+919876543210",
  "registration": {},
  "leadCapture": {},
  "communication": {},
  "status": "Published",
  "enableStalls": true,
  "stallConfig": {},
  "stallTypes": [],
  "groundLayoutUrl": null
}
```

**Response:**
```json
{
  "id": 5,
  "organization_id": 2,
  "event_name": "Tech Summit 2025",
  "qr_token": "abc123-uuid-token",
  "registration_link": "https://app.com?action=register&eventId=5&token=abc123",
  "qr_image_path": "/qr/event_5_qr.png",
  "qrImageUrl": "https://d36p7i1koir3da.cloudfront.net/qr/event_5_qr.png",
  "emailStatus": {
    "sent": true,
    "email": "events@abc.com"
  },
  ...
}
```

---

## 4.3 Get Event by Token
**Endpoint:** `GET /api/events/by-token/:token`

**Description:** Get event details using QR token (for registration pages).

**Parameters:**
- `token` (path): Event's QR token

**Response:**
```json
{
  "id": 5,
  "event_name": "Tech Summit 2025",
  "name": "Tech Summit 2025",
  "start_date": "2025-02-15",
  "end_date": "2025-02-17",
  "venue": "Expo Center",
  "city": "Mumbai",
  "state": "Maharashtra",
  "qr_image_path": "/qr/event_5_qr.png",
  "qr_image_url": "https://d36p7i1koir3da.cloudfront.net/qr/event_5_qr.png"
}
```

---

## 4.4 Update Event Ground Layout
**Endpoint:** `PUT /api/events/:id/ground-layout`

**Description:** Update the ground layout URL for an event.

**Request Body:**
```json
{
  "groundLayoutUrl": "/uploads/ground-layout-456.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ground layout updated successfully",
  "event": { ... }
}
```

---

# 5. Lead Management APIs

## 5.1 Get Leads
**Endpoint:** `GET /api/leads`

**Description:** Get all leads, optionally filtered by exhibitor.

**Query Parameters:**
- `exhibitorId` (optional): Filter leads by exhibitor ID

**Response:**
```json
[
  {
    "id": 1,
    "exhibitor_id": 5,
    "event_id": 10,
    "organization_id": 2,
    "name": "John Doe",
    "email": "john@company.com",
    "phone": "+919876543210",
    "company": "ABC Corporation",
    "designation": "Manager",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "industry": "Technology",
    "source": "QR Scan",
    "notes": "Interested in premium product",
    "rating": 5,
    "status": "New",
    "follow_up_date": "2025-02-01",
    "additional_data": {},
    "scanned_at": "2025-01-28T10:00:00Z",
    "exhibitor_name": "Tech Solutions",
    "event_name": "Tech Summit 2025"
  }
]
```

---

## 5.2 Create Lead
**Endpoint:** `POST /api/leads`

**Description:** Create a new lead from QR scan or manual entry.

**Request Body:**
```json
{
  "exhibitorId": 5,
  "eventId": 10,
  "organizationId": 2,
  "name": "John Doe",
  "email": "john@company.com",
  "phone": "+919876543210",
  "company": "ABC Corporation",
  "designation": "Manager",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "industry": "Technology",
  "source": "QR Scan",
  "notes": "Interested in premium product",
  "rating": 5,
  "status": "New",
  "followUpDate": "2025-02-01",
  "additionalData": {}
}
```

**Response:**
```json
{
  "success": true,
  "lead": {
    "id": 1,
    "exhibitor_id": 5,
    "name": "John Doe",
    "source": "QR Scan",
    "status": "New",
    ...
  }
}
```

---

## 5.3 Update Lead
**Endpoint:** `PUT /api/leads/:id`

**Description:** Update an existing lead.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@company.com",
  "phone": "+919876543210",
  "company": "ABC Corporation",
  "designation": "Senior Manager",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "industry": "Technology",
  "notes": "Very interested, follow up next week",
  "rating": 5,
  "status": "Hot",
  "followUpDate": "2025-02-01",
  "additionalData": {}
}
```

**Response:**
```json
{
  "success": true,
  "lead": { ... }
}
```

---

## 5.4 Delete Lead
**Endpoint:** `DELETE /api/leads/:id`

**Description:** Delete a lead.

**Response:**
```json
{
  "success": true,
  "message": "Lead deleted successfully"
}
```

---

# 6. Scanned Visitors APIs

## 6.1 Save Scanned Visitor
**Endpoint:** `POST /api/scanned-visitors`

**Description:** Save a QR or OCR scan result.

**Request Body:**
```json
{
  "exhibitorId": 5,
  "eventId": 10,
  "visitorId": 1,  // Optional: if from QR scan
  "scanType": "QR_SCAN",  // Required: "QR_SCAN" or "OCR"
  "visitorName": "John Doe",
  "visitorEmail": "john@company.com",
  "visitorPhone": "+919876543210",
  "visitorCompany": "ABC Corporation",
  "visitorDesignation": "Manager",
  "visitorUniqueCode": "VIS-ABCD1234",  // For QR scans
  "ocrRawText": null,  // For OCR scans: raw extracted text
  "notes": "Met at booth A-12",
  "interestLevel": "High"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Scan saved successfully",
  "scan": {
    "id": 1,
    "exhibitor_id": 5,
    "scan_type": "QR_SCAN",
    "visitor_name": "John Doe",
    "scanned_at": "2025-01-28T10:00:00Z",
    ...
  }
}
```

**Error Responses:**
- `400`: Invalid scan_type. Must be QR_SCAN or OCR

---

## 6.2 Get Scanned Visitors
**Endpoint:** `GET /api/scanned-visitors`

**Description:** Get all scanned visitors with filters.

**Query Parameters:**
- `exhibitorId` (optional): Filter by exhibitor
- `scanType` (optional): Filter by scan type (QR_SCAN or OCR)
- `eventId` (optional): Filter by event

**Response:**
```json
{
  "success": true,
  "count": 25,
  "scans": [
    {
      "id": 1,
      "exhibitor_id": 5,
      "event_id": 10,
      "visitor_id": 1,
      "scan_type": "QR_SCAN",
      "visitor_name": "John Doe",
      "visitor_email": "john@company.com",
      "visitor_phone": "+919876543210",
      "visitor_company": "ABC Corporation",
      "visitor_designation": "Manager",
      "visitor_unique_code": "VIS-ABCD1234",
      "ocr_raw_text": null,
      "notes": "Met at booth A-12",
      "interest_level": "High",
      "lead_status": null,
      "follow_up_date": null,
      "scanned_at": "2025-01-28T10:00:00Z",
      "exhibitor_company": "Tech Solutions",
      "event_name": "Tech Summit 2025"
    }
  ]
}
```

---

## 6.3 Get Scan Statistics
**Endpoint:** `GET /api/scanned-visitors/stats`

**Description:** Get scanning statistics for an exhibitor.

**Query Parameters:**
- `exhibitorId` (optional): Filter by exhibitor

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_scans": "100",
    "qr_scans": "75",
    "ocr_scans": "25",
    "unique_visitors": "90",
    "today_scans": "15"
  }
}
```

---

## 6.4 Update Scanned Visitor
**Endpoint:** `PUT /api/scanned-visitors/:id`

**Description:** Update a scanned visitor record (add notes, change status, etc.).

**Request Body:**
```json
{
  "visitorName": "John Doe",
  "visitorEmail": "john@company.com",
  "visitorPhone": "+919876543210",
  "visitorCompany": "ABC Corporation",
  "visitorDesignation": "Senior Manager",
  "notes": "Very interested in premium package",
  "leadStatus": "Qualified",
  "interestLevel": "Hot",
  "followUpDate": "2025-02-01"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Scan updated successfully",
  "scan": { ... }
}
```

---

## 6.5 Delete Scanned Visitor
**Endpoint:** `DELETE /api/scanned-visitors/:id`

**Description:** Delete a scanned visitor record.

**Response:**
```json
{
  "success": true,
  "message": "Scan deleted successfully"
}
```

---

# 7. Organization APIs

## 7.1 Get All Organizations
**Endpoint:** `GET /api/organizations`

**Description:** Retrieve all organizations.

**Response:**
```json
[
  {
    "id": 1,
    "org_name": "ABC Organization",
    "trade_name": "ABC",
    "tenant_type": "Enterprise",
    "industry": "Technology",
    "size": "500-1000",
    "primary_email": "info@abc.com",
    "primary_mobile": "+919876543210",
    "state": "Maharashtra",
    "city": "Mumbai",
    "address": "123 Business Park",
    "contact_name": "John Smith",
    "contact_email": "john@abc.com",
    "contact_phone": "+919876543211",
    "website": "https://abc.com",
    "gst_number": "27AABCT1234A1ZD",
    "pan_number": "AABCT1234A",
    "status": "Active",
    "plan": "Premium",
    "is_verified": true,
    "created_at": "2025-01-15T10:00:00Z"
  }
]
```

---

## 7.2 Create Organization
**Endpoint:** `POST /api/create-organization`

**Description:** Create a new organization directly.

**Request Body:**
```json
{
  "orgName": "ABC Organization",
  "tradeName": "ABC",
  "tenantType": "Enterprise",
  "industry": "Technology",
  "size": "500-1000",
  "email": "info@abc.com",
  "mobile": "+919876543210",
  "password": "optional-password",
  "state": "Maharashtra",
  "district": "Mumbai",
  "town": "Mumbai",
  "address": "123 Business Park",
  "contactName": "John Smith",
  "contactEmail": "john@abc.com",
  "contactPhone": "+919876543211",
  "altPhone": "+919876543212",
  "website": "https://abc.com",
  "gstNumber": "27AABCT1234A1ZD",
  "panNumber": "AABCT1234A",
  "isVerified": true,
  "features": ["events", "exhibitors", "leads"],
  "plan": "Premium"
}
```

**Response:**
```json
{
  "success": true,
  "organization": { ... },
  "emailSent": true,
  "smsSent": true,
  "credentials": {
    "email": "info@abc.com",
    "password": "info@123",
    "note": "Please save these credentials. Password can be changed after first login."
  }
}
```

---

## 7.3 Organization Login
**Endpoint:** `POST /api/organization-login`

**Description:** Login for organizations.

**Request Body:**
```json
{
  "email": "info@abc.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "organization": {
    "id": 1,
    "orgName": "ABC Organization",
    "email": "info@abc.com",
    "type": "organization"
  }
}
```

---

## 7.4 Send Organization Invite
**Endpoint:** `POST /api/send-invite`

**Description:** Send invitation to create an organization.

**Request Body:**
```json
{
  "email": "neworg@example.com",
  "mobile": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invite sent successfully",
  "invite": {
    "id": 1,
    "email": "neworg@example.com",
    "mobile": "+919876543210",
    "invite_token": "uuid-token",
    "status": "PENDING",
    "expires_at": "2025-01-30T10:00:00Z"
  },
  "emailSent": true,
  "smsSent": true
}
```

---

## 7.5 Verify GSTIN
**Endpoint:** `POST /api/verify-gstin`

**Description:** Verify a GSTIN number.

**Request Body:**
```json
{
  "gstin": "27AABCT1234A1ZD"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gstin": "27AABCT1234A1ZD",
    "legalName": "ABC Company",
    "tradeName": "ABC",
    "address": "123 Business Park, Mumbai",
    "status": "Active"
  }
}
```

---

# 8. Invoice APIs

## 8.1 Get All Invoices
**Endpoint:** `GET /api/invoices`

**Description:** Retrieve all invoices.

**Response:**
```json
[
  {
    "id": 1,
    "invoice_number": "INV-1706437200000",
    "organization_id": 2,
    "billing_email": "billing@abc.com",
    "billing_address": "123 Business Park, Mumbai",
    "tax_id": "27AABCT1234A1ZD",
    "plan_type": "Premium",
    "amount": 25000.00,
    "currency": "INR",
    "due_date": "2025-02-15",
    "payment_method": "Bank Transfer",
    "items": [
      {
        "description": "Premium Plan - Annual",
        "quantity": 1,
        "price": 25000
      }
    ],
    "notes": "Thank you for your business",
    "terms_accepted": true,
    "status": "Pending",
    "created_at": "2025-01-28T10:00:00Z",
    "organization_name": "ABC Organization"
  }
]
```

---

## 8.2 Create Invoice
**Endpoint:** `POST /api/invoices`

**Description:** Create a new invoice.

**Request Body:**
```json
{
  "organizationId": 2,
  "billingEmail": "billing@abc.com",
  "billingAddress": "123 Business Park, Mumbai",
  "taxId": "27AABCT1234A1ZD",
  "planType": "Premium",
  "amount": 25000.00,
  "currency": "INR",
  "dueDate": "2025-02-15",
  "paymentMethod": "Bank Transfer",
  "items": [
    {
      "description": "Premium Plan - Annual",
      "quantity": 1,
      "price": 25000
    }
  ],
  "notes": "Thank you for your business",
  "terms": true,
  "status": "Pending"
}
```

**Response:**
```json
{
  "id": 1,
  "invoice_number": "INV-1706437200000",
  "organization_id": 2,
  "amount": 25000.00,
  "status": "Pending",
  ...
}
```

---

# 9. Utility APIs

## 9.1 Dashboard Data
**Endpoint:** `GET /api/dashboard`

**Description:** Get dashboard statistics (mock data).

**Response:**
```json
{
  "stats": [
    { "label": "Active Tenants", "value": "248", "change": "+12 this month" },
    { "label": "Active Events", "value": "42", "change": "8 ongoing" },
    { "label": "Total Exhibitors", "value": "1,847", "change": "+150 this week" },
    { "label": "Registered Visitors", "value": "24,582", "change": "+2,340 today" },
    { "label": "Leads Captured", "value": "18,429", "change": "+842 today" }
  ],
  "liveEvents": [...],
  "leadStats": {...}
}
```

---

## 9.2 Upload Ground Layout
**Endpoint:** `POST /api/upload/ground-layout`

**Description:** Upload a ground layout file (image or PDF).

**Request:**
- Content-Type: `multipart/form-data`
- Field: `file` (JPG, PNG, or PDF, max 10MB)

**Response:**
```json
{
  "success": true,
  "filename": "ground-layout-1706437200000-123456789.pdf",
  "originalName": "my-layout.pdf",
  "url": "/uploads/ground-layout-1706437200000-123456789.pdf",
  "size": 1048576
}
```

---

## 9.3 Plans
**Endpoint:** `GET /api/plans`

**Description:** Get all available plans.

---

## 9.4 Create Plan
**Endpoint:** `POST /api/create-plan`

**Description:** Create a new subscription plan.

---

## 9.5 Coupons
**Endpoint:** `GET /api/coupons`

**Description:** Get all coupons.

---

## 9.6 Verify Coupon
**Endpoint:** `POST /api/verify-coupon`

**Description:** Verify a coupon code.

---

# Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message",
  "details": "Detailed error description (development only)",
  "code": "ERROR_CODE"
}
```

## Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication failed |
| 403 | Forbidden - Access denied |
| 404 | Not Found |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

---

# Mobile App Workflow Summary

## For Exhibitor App:

1. **Login:** `POST /api/login` with `type: ["exhibitor"]`
2. **Get Events:** `GET /api/exhibitors/upcoming-events/:organizationId`
3. **Scan Visitor QR:** `GET /api/visitors/code/:uniqueCode?eventId=X`
4. **Save Scan:** `POST /api/scanned-visitors`
5. **View Scans:** `GET /api/scanned-visitors?exhibitorId=X`
6. **Get Stats:** `GET /api/scanned-visitors/stats?exhibitorId=X`
7. **Manage Leads:** `GET/POST/PUT/DELETE /api/leads`

## For Visitor App:

1. **Login:** `POST /api/login` with `type: ["visitor"]`
2. **Register:** `POST /api/visitors`
3. **View Profile:** Uses data from login response

---

*Documentation generated on: 2026-01-28*
*API Version: 1.0*
