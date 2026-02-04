# Organization App API Documentation

This document outlines all API endpoints required for the **Organization Mobile App**. Use these endpoints to build the dashboard and management features.

## 🌐 Base Configuration

**Base URL**: `[YOUR_API_DOMAIN]/api`  
**Headers**:
- `Content-Type`: `application/json`

---

## 🔐 Authentication

### 1. Unified Login
Logs in an organization user.

- **Endpoint**: `POST /api/login`
- **Body**:
  ```json
  {
    "email": "org@example.com",
    "password": "password123",
    "type": "organization"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "userType": "organization",
    "user": {
      "id": 123,
      "name": "Acme Corp",
      "email": "org@example.com"
    }
  }
  ```
> **Important**: Store the `user.id` (Organization ID) locally. You will need to send this as `organization_id` in subsequent GET requests to filter data.

---

## 📊 Dashboard

### 2. Get Dashboard Statistics (Global)
Fetches summary statistics for the dashboard (static mock data).

- **Endpoint**: `GET /api/dashboard`
- **Query Params**: None
- **Response**: Returns stats for Active Events, Exhibitors, Visitors, Revenue, etc.

### 2.1 Get Organization Stats (Real-time)
Fetches real-time counts for a specific organization.

- **Endpoint**: `GET /api/organization-dashboard-stats/:id`
- **Params**: `id` - The Organization ID
- **Response**:
  ```json
  {
    "success": true,
    "stats": {
      "totalEvents": 5,
      "totalExhibitors": 12,
      "totalVisitors": 450
    }
  }
  ```

---

## 📅 Event Management

### 3. List Organization Events
Fetches all events created by the logged-in organization.

- **Endpoint**: `GET /api/events`
- **Query Params**:
  - `organization_id`: `[ID]` (Required to filter for specific org)
- **Example**: `GET /api/events?organization_id=123`

### 4. Create New Event
- **Endpoint**: `POST /api/events`
- **Body**: Standard event object (ensure `organization_id` is included if not inferred from session/token)

### 5. Get Event Details
- **Endpoint**: `GET /api/events/:id`

---

## 🏢 Exhibitor Management

### 6. List Organization Exhibitors
Fetches all exhibitors associated with the organization.

- **Endpoint**: `GET /api/exhibitors`
- **Query Params**:
  - `organization_id`: `[ID]` (Required to filter)
- **Example**: `GET /api/exhibitors?organization_id=123`

### 7. Create Exhibitor
- **Endpoint**: `POST /api/exhibitors`
- **Body**:
  ```json
  {
    "company_name": "Tech Sol",
    "email": "contact@techsol.com",
    "organization_id": 123,
    "event_id": 45  // Optional, if assigning to event immediately
    // ...other fields
  }
  ```

### 8. Get Exhibitor Details
- **Endpoint**: `GET /api/exhibitors/:id`

---

## 👥 Visitor Management

### 9. List Scoped Visitors
Fetches visitors registered for the organization's events.

- **Endpoint**: `GET /api/visitors`
- **Query Params**:
  - `organization_id`: `[ID]` (Required to filter)
- **Example**: `GET /api/visitors?organization_id=123`

### 10. Register Visitor
- **Endpoint**: `POST /api/visitors`
- **Body**: Standard visitor object. `organization_id` is inferred from the `event_id` they are assigned to.

---

## ⚙️ Organization Profile

### 11. Get Organization Profile
- **Endpoint**: `GET /api/organizations/:id`

### 12. Update Organization Profile
- **Endpoint**: `PUT /api/organizations/:id`
- **Body**: JSON object with fields to update (e.g., `org_name`, `contact_phone`, etc.)

---

## 🛠️ Other Utilities

### 13. List Plans
- **Endpoint**: `GET /api/plans`

### 14. List Coupons
- **Endpoint**: `GET /api/coupons`

### 15. Verify GSTIN
- **Endpoint**: `POST /api/verify-gstin`
- **Body**: `{ "gstin": "29ABCDE1234F1Z5" }`

---

## 📱 Mobile Implementation Notes

1.  **Filtering**: Always append `?organization_id=[LOGGED_IN_ID]` to `events`, `exhibitors`, and `visitors` GET requests.
2.  **Creation**: When creating entities (Events, Exhibitors), ensure the `organization_id` is included in the POST body.
3.  **Data Isolation**: This filtering ensures the organization user only sees their own data on the mobile app, matching the web dashboard behavior.
