# Postman Collection: Organization Management APIs

Use this guide to set up your Postman collection for the Organization Mobile App.

**Global Variable Suggestion**:
- Create a variable `{{baseUrl}}` = `http://localhost:5000` (or your live info)
- Create a variable `{{orgId}}` (Extract this from the Login response)

---

## 🔐 1. Authentication

### Organization Login
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/login`
- **Body** (JSON):
  ```json
  {
    "email": "org_admin@example.com",
    "password": "your_password",
    "type": "organization"
  }
  ```
- **Test Script (optional)**:
  ```javascript
  // Automatically set orgId variable from response
  var jsonData = pm.response.json();
  if (jsonData.success) {
      pm.environment.set("orgId", jsonData.user.id);
  }
  ```

---

## 📊 2. Dashboard

### Get Dashboard Stats (Global)
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/dashboard`
- **Note**: Currently returns global/static stats (mock data).

### Get Organization Stats (Real-time)
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/organization-dashboard-stats/{{orgId}}`
- **Description**: Returns live counts of Events, Exhibitors, and Visitors for the organization.

---

## 📅 3. Event Management

### List Organization Events
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/events?organization_id={{orgId}}`

### Create Event
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/events`
- **Body** (JSON):
  ```json
  {
    "event_name": "New Tech Expo",
    "organization_id": {{orgId}},
    "start_date": "2026-05-01",
    "end_date": "2026-05-03",
    "location": "Convention Center"
  }
  ```

### Get Event Details
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/events/:id`

---

## 🏢 4. Exhibitor Management

### List Organization Exhibitors
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/exhibitors?organization_id={{orgId}}`

### Create Exhibitor
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/exhibitors`
- **Body** (JSON):
  ```json
  {
    "company_name": "Tech Corp",
    "email": "contact@techcorp.com",
    "mobile": "9876543210",
    "organization_id": {{orgId}},
    "event_id": 42
  }
  ```

### Get Exhibitor Details
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/exhibitors/:id`

---

## 👥 5. Visitor Management

### List Organization Visitors
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/visitors?organization_id={{orgId}}`

### Register Visitor
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/visitors`
- **Body** (JSON):
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "mobile": "9988776655",
    "organization": "Guest Co",
    "designation": "Manager",
    "event": "42", 
    "visitorCategory": "Business"
  }
  ```
  *(Note: `organization_id` is inferred from the Event)*

### Get Visitor by Code (QR Scan)
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/visitors/code/:uniqueCode`

---

## ⚙️ 6. Organization Settings

### Get My Profile
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/organizations/{{orgId}}`

### Update Profile
- **Method**: `PUT`
- **URL**: `{{baseUrl}}/api/organizations/{{orgId}}`
- **Body** (JSON):
  ```json
  {
    "org_name": "Updated Corp Name",
    "contact_phone": "1234567890"
  }
  ```

---

## 🛠️ 7. Utilities

### List Available Plans
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/plans`

### Check GSTIN
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/verify-gstin`
- **Body**: `{ "gstin": "YOUR_GST_NUMBER" }`
