# 📱 Mobile App Development - Organization Page APIs

## Overview
This document lists all APIs required to build the **Organization Page/Dashboard** in the mobile app.

---

## 🔐 Authentication APIs

### 1. Organization Login
**Endpoint:** `POST /api/organization-login`

**Description:** Login for organization users to access their dashboard.

**Request:**
```json
{
  "email": "org@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "organization": {
    "id": 1,
    "orgName": "ABC Organization",
    "email": "org@example.com",
    "type": "organization"
  }
}
```

**Mobile Implementation:**
```javascript
// React Native / Flutter example
const loginOrganization = async (email, password) => {
  const response = await fetch(`${API_BASE}/api/organization-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  if (data.success) {
    // Store organization ID and details
    await AsyncStorage.setItem('organizationId', data.organization.id.toString());
    await AsyncStorage.setItem('userType', 'organization');
    return data.organization;
  }
  throw new Error(data.error);
};
```

---

## 📊 Organization Dashboard APIs

### 2. Get Organization Details
**Endpoint:** `GET /api/organizations`

**Description:** Get list of all organizations (or filter by ID).

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
    "features": ["events", "exhibitors", "leads"],
    "created_at": "2025-01-15T10:00:00Z"
  }
]
```

**Mobile Implementation:**
```javascript
const getOrganizationDetails = async (organizationId) => {
  const response = await fetch(`${API_BASE}/api/organizations`);
  const organizations = await response.json();
  
  // Filter by organization ID
  return organizations.find(org => org.id === organizationId);
};
```

---

### 3. Get Organization Events
**Endpoint:** `GET /api/events?organization_id={organizationId}`

**Description:** Get all events created by the organization.

**Response:**
```json
[
  {
    "id": 5,
    "organization_id": 1,
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
    "organizer_email": "events@abc.com",
    "status": "Published",
    "qr_token": "abc123-uuid",
    "registration_link": "https://app.com?action=register&eventId=5",
    "qr_image_path": "/qr/event_5_qr.png",
    "created_at": "2025-01-15T10:00:00Z"
  }
]
```

**Mobile Implementation:**
```javascript
const getOrganizationEvents = async (organizationId) => {
  const response = await fetch(
    `${API_BASE}/api/events?organization_id=${organizationId}`
  );
  return response.json();
};
```

---

### 4. Get Organization Exhibitors
**Endpoint:** `GET /api/exhibitors?organization_id={organizationId}`

**Description:** Get all exhibitors registered under the organization.

**Response:**
```json
[
  {
    "id": 1,
    "organization_id": 1,
    "event_id": 5,
    "company_name": "Tech Solutions Pvt Ltd",
    "email": "john@techsolutions.com",
    "mobile": "+919876543210",
    "stall_number": "A-12",
    "stall_category": "Premium",
    "access_status": "Active",
    "event_name": "Tech Summit 2025",
    "created_at": "2025-01-20T10:00:00Z"
  }
]
```

**Mobile Implementation:**
```javascript
const getOrganizationExhibitors = async (organizationId) => {
  const response = await fetch(
    `${API_BASE}/api/exhibitors?organization_id=${organizationId}`
  );
  return response.json();
};
```

---

### 5. Get Organization Visitors
**Endpoint:** `GET /api/visitors?organization_id={organizationId}`

**Description:** Get all visitors registered for organization's events.

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
    "unique_code": "VIS-ABCD1234",
    "visitor_category": "VIP",
    "event_name": "Tech Summit 2025",
    "created_at": "2025-01-28T10:00:00Z"
  }
]
```

---

## 📈 Organization Statistics APIs

### 6. Dashboard Statistics
**Endpoint:** `GET /api/dashboard`

**Description:** Get overall platform statistics (can be filtered for organization).

**Response:**
```json
{
  "stats": [
    { "label": "Active Events", "value": "42", "change": "8 ongoing" },
    { "label": "Total Exhibitors", "value": "1,847", "change": "+150 this week" },
    { "label": "Registered Visitors", "value": "24,582", "change": "+2,340 today" },
    { "label": "Leads Captured", "value": "18,429", "change": "+842 today" }
  ]
}
```

---

## 🎫 Event Management APIs

### 7. Create Event
**Endpoint:** `POST /api/events`

**Description:** Create a new event for the organization.

**Request:**
```json
{
  "organizationId": 1,
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
  "status": "Published"
}
```

**Response:**
```json
{
  "id": 5,
  "organization_id": 1,
  "event_name": "Tech Summit 2025",
  "qr_token": "abc123-uuid-token",
  "registration_link": "https://app.com?action=register&eventId=5",
  "qr_image_path": "/qr/event_5_qr.png",
  "qrImageUrl": "https://cdn.cloudfront.net/qr/event_5_qr.png",
  "emailStatus": {
    "sent": true,
    "email": "events@abc.com"
  }
}
```

**Mobile Implementation:**
```javascript
const createEvent = async (eventData) => {
  const organizationId = await AsyncStorage.getItem('organizationId');
  
  const response = await fetch(`${API_BASE}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...eventData,
      organizationId: parseInt(organizationId)
    })
  });
  
  return response.json();
};
```

---

## 👥 Exhibitor Management APIs

### 8. Create Exhibitor
**Endpoint:** `POST /api/exhibitors`

**Description:** Add a new exhibitor to an event.

**Request:**
```json
{
  "organizationId": 1,
  "eventId": 5,
  "companyName": "Tech Solutions Pvt Ltd",
  "email": "john@techsolutions.com",
  "mobile": "+919876543210",
  "contactPerson": "John Smith",
  "stallNumber": "A-12",
  "stallCategory": "Premium"
}
```

**Response:**
```json
{
  "success": true,
  "exhibitor": {
    "id": 1,
    "organization_id": 1,
    "company_name": "Tech Solutions Pvt Ltd",
    "email": "john@techsolutions.com"
  },
  "credentials": {
    "email": "john@techsolutions.com",
    "password": "john@123",
    "note": "Auto-generated password"
  }
}
```

---

## 📊 Analytics & Reports APIs

### 9. Get Leads by Organization
**Endpoint:** `GET /api/leads?organization_id={organizationId}`

**Description:** Get all leads captured across organization's events.

**Response:**
```json
[
  {
    "id": 1,
    "exhibitor_id": 5,
    "event_id": 10,
    "organization_id": 1,
    "name": "John Doe",
    "email": "john@company.com",
    "phone": "+919876543210",
    "company": "ABC Corporation",
    "source": "QR Scan",
    "status": "New",
    "scanned_at": "2025-01-28T10:00:00Z",
    "exhibitor_name": "Tech Solutions",
    "event_name": "Tech Summit 2025"
  }
]
```

---

### 10. Get Scanned Visitors Statistics
**Endpoint:** `GET /api/scanned-visitors/stats?organization_id={organizationId}`

**Description:** Get scanning statistics for organization's exhibitors.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_scans": "500",
    "qr_scans": "375",
    "ocr_scans": "125",
    "unique_visitors": "450",
    "today_scans": "75"
  }
}
```

---

## 🏢 Organization Profile Management

### 11. Update Organization Profile
**Endpoint:** `PUT /api/organizations/{id}`

**Description:** Update organization details.

**Request:**
```json
{
  "orgName": "ABC Organization",
  "tradeName": "ABC",
  "industry": "Technology",
  "size": "500-1000",
  "website": "https://abc.com",
  "address": "123 Business Park, Mumbai",
  "contactName": "John Smith",
  "contactEmail": "john@abc.com",
  "contactPhone": "+919876543211"
}
```

---

## 📱 Mobile App Organization Dashboard Layout

### Recommended Sections:

```
┌─────────────────────────────────────────┐
│  Organization Dashboard                 │
├─────────────────────────────────────────┤
│                                         │
│  📊 Quick Stats                         │
│  ├─ Active Events: 5                    │
│  ├─ Total Exhibitors: 45                │
│  ├─ Registered Visitors: 1,234          │
│  └─ Leads Captured: 890                 │
│                                         │
│  📅 Upcoming Events                     │
│  ├─ Tech Summit 2025 (Feb 15-17)        │
│  ├─ Digital Expo (Mar 10-12)            │
│  └─ [View All Events]                   │
│                                         │
│  👥 Recent Exhibitors                   │
│  ├─ Tech Solutions (A-12)               │
│  ├─ Innovation Hub (B-05)               │
│  └─ [Manage Exhibitors]                 │
│                                         │
│  🎫 Recent Visitors                     │
│  ├─ John Doe (VIS-ABC123)               │
│  ├─ Jane Smith (VIS-XYZ789)             │
│  └─ [View All Visitors]                 │
│                                         │
│  📈 Analytics                           │
│  └─ [View Detailed Reports]             │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔄 API Call Sequence for Organization Dashboard

### On Dashboard Load:

```javascript
// 1. Get organization details
const orgId = await AsyncStorage.getItem('organizationId');
const organization = await getOrganizationDetails(orgId);

// 2. Get organization events
const events = await getOrganizationEvents(orgId);

// 3. Get organization exhibitors
const exhibitors = await getOrganizationExhibitors(orgId);

// 4. Get organization visitors
const visitors = await getOrganizationVisitors(orgId);

// 5. Get statistics
const stats = await getDashboardStats();

// 6. Get leads
const leads = await getLeads(orgId);

// Update UI with all data
setDashboardData({
  organization,
  events,
  exhibitors,
  visitors,
  stats,
  leads
});
```

---

## 🎨 Complete Mobile Implementation Example

```javascript
// OrganizationDashboard.js (React Native)
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://d3cgzphanxg4ax.cloudfront.net';

const OrganizationDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    organization: null,
    events: [],
    exhibitors: [],
    visitors: [],
    stats: null
  });

  const loadDashboard = async () => {
    try {
      const orgId = await AsyncStorage.getItem('organizationId');
      
      // Parallel API calls for better performance
      const [org, events, exhibitors, visitors, stats] = await Promise.all([
        fetch(`${API_BASE}/api/organizations`).then(r => r.json()),
        fetch(`${API_BASE}/api/events?organization_id=${orgId}`).then(r => r.json()),
        fetch(`${API_BASE}/api/exhibitors?organization_id=${orgId}`).then(r => r.json()),
        fetch(`${API_BASE}/api/visitors?organization_id=${orgId}`).then(r => r.json()),
        fetch(`${API_BASE}/api/dashboard`).then(r => r.json())
      ]);

      setDashboardData({
        organization: org.find(o => o.id === parseInt(orgId)),
        events,
        exhibitors,
        visitors,
        stats
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Dashboard UI */}
      <View>
        <Text>Organization: {dashboardData.organization?.org_name}</Text>
        <Text>Active Events: {dashboardData.events.length}</Text>
        <Text>Total Exhibitors: {dashboardData.exhibitors.length}</Text>
        <Text>Registered Visitors: {dashboardData.visitors.length}</Text>
      </View>
    </ScrollView>
  );
};

export default OrganizationDashboard;
```

---

## 📋 Summary: Required APIs for Organization Page

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| **Login** | POST | `/api/organization-login` | Authenticate organization |
| **Get Org Details** | GET | `/api/organizations` | Organization profile |
| **Get Events** | GET | `/api/events?organization_id=X` | List events |
| **Create Event** | POST | `/api/events` | Add new event |
| **Get Exhibitors** | GET | `/api/exhibitors?organization_id=X` | List exhibitors |
| **Create Exhibitor** | POST | `/api/exhibitors` | Add exhibitor |
| **Get Visitors** | GET | `/api/visitors?organization_id=X` | List visitors |
| **Get Leads** | GET | `/api/leads?organization_id=X` | View leads |
| **Get Stats** | GET | `/api/dashboard` | Dashboard statistics |
| **Scan Stats** | GET | `/api/scanned-visitors/stats` | Scanning analytics |

---

*API Documentation for Mobile Development - Last Updated: 2026-01-28*
