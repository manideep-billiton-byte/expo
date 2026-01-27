# Quick Testing Guide - Exhibitor Event Registration

## 🧪 How to Test the Feature

### Prerequisites
Before testing, ensure you have:
1. ✅ Server running on port 5000
2. ✅ Client running on port 5173 (or your configured port)
3. ✅ Database connection active

---

## Step-by-Step Testing

### 1️⃣ **Prepare Test Data**

Run these SQL commands to set up test data:

```sql
-- Check if you have an organization
SELECT id, org_name, primary_email FROM organizations LIMIT 1;

-- If no organization exists, create one:
INSERT INTO organizations (org_name, primary_email, password_hash)
VALUES ('Test Organization', 'org@test.com', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890');

-- Create an upcoming event (adjust dates to be in the future)
INSERT INTO events (
    organization_id, 
    event_name, 
    description,
    start_date, 
    end_date, 
    city, 
    state,
    venue,
    status
)
VALUES (
    1,  -- Use your organization ID
    'Tech Summit 2026',
    'Annual technology conference showcasing latest innovations',
    '2026-06-15',  -- Future date
    '2026-06-17',  -- Future date
    'Mumbai',
    'Maharashtra',
    'Mumbai Convention Centre',
    'Published'
);

-- Create another upcoming event
INSERT INTO events (
    organization_id, 
    event_name, 
    description,
    start_date, 
    end_date, 
    city, 
    state,
    venue,
    status
)
VALUES (
    1,  -- Use your organization ID
    'Digital Marketing Expo 2026',
    'Explore the future of digital marketing and social media',
    '2026-08-20',  -- Future date
    '2026-08-22',  -- Future date
    'Bangalore',
    'Karnataka',
    'Bangalore International Exhibition Centre',
    'Published'
);

-- Create an exhibitor (if not exists)
INSERT INTO exhibitors (
    organization_id,
    company_name,
    email,
    password_hash,
    contact_person,
    mobile,
    industry,
    access_status
)
VALUES (
    1,  -- Use your organization ID
    'Test Company Pvt Ltd',
    'exhibitor@test.com',
    '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890',  -- Password: test123
    'John Doe',
    '9876543210',
    'Technology',
    'Active'
);
```

---

### 2️⃣ **Login as Exhibitor**

1. Navigate to the exhibitor login page
2. Login with credentials:
   - **Email:** `exhibitor@test.com`
   - **Password:** `test123` (or whatever you set)

3. Verify that `localStorage` contains user data:
   ```javascript
   // Open browser console and run:
   console.log(JSON.parse(localStorage.getItem('user')));
   
   // Should show:
   // {
   //   id: 1,
   //   name: "Test Company Pvt Ltd",
   //   email: "exhibitor@test.com",
   //   organizationId: 1,
   //   ...
   // }
   ```

---

### 3️⃣ **Navigate to Event Management Page**

1. After login, go to the Event Management page
2. You should see:
   - ✅ Page title: "Event Management"
   - ✅ Stats cards (Total Events, Completed, Upcoming, Total Leads)
   - ✅ **"Register New Event"** button in the top-right

---

### 4️⃣ **Test the Registration Flow**

#### **Step A: Open Modal**
1. Click the **"Register New Event"** button
2. Verify:
   - ✅ Modal opens with semi-transparent background
   - ✅ Modal title: "Register for Upcoming Events"
   - ✅ Loading message appears briefly

#### **Step B: View Events**
After loading completes, verify:
- ✅ Both upcoming events are displayed:
  - "Tech Summit 2026"
  - "Digital Marketing Expo 2026"
- ✅ Each event shows:
  - Event name
  - Location (city, state)
  - Date range
  - Description
  - **"Register Now"** button

#### **Step C: Register for Event**
1. Click **"Register Now"** on "Tech Summit 2026"
2. Verify:
   - ✅ Button text changes to "Registering..."
   - ✅ Button becomes disabled (gray)
   - ✅ Modal closes after successful registration
   - ✅ Green success popup appears in top-right corner
   - ✅ Success message: "Successfully registered for Tech Summit 2026!"
   - ✅ Popup auto-dismisses after 3 seconds

---

### 5️⃣ **Verify Database Changes**

Run this query to confirm registration:

```sql
SELECT 
    e.id,
    e.company_name,
    e.email,
    e.event_id,
    ev.event_name,
    e.created_at
FROM exhibitors e
LEFT JOIN events ev ON ev.id = e.event_id
WHERE e.email = 'exhibitor@test.com'
ORDER BY e.created_at DESC;
```

**Expected Result:**
- You should see **2 rows** for `exhibitor@test.com`:
  1. Original exhibitor record (event_id = NULL or old event)
  2. **New record** with event_id pointing to "Tech Summit 2026"

---

### 6️⃣ **Test Duplicate Registration Prevention**

1. Click **"Register New Event"** again
2. Try to register for "Tech Summit 2026" again
3. Verify:
   - ✅ Error alert appears: "You are already registered for this event"
   - ✅ No new database record is created

---

### 7️⃣ **Test Edge Cases**

#### **Test: No Upcoming Events**
```sql
-- Delete all upcoming events temporarily
DELETE FROM events WHERE start_date >= CURRENT_DATE;
```
1. Click "Register New Event"
2. Verify:
   - ✅ Message: "No upcoming events available from your organization."

#### **Test: Past Events Not Shown**
```sql
-- Create a past event
INSERT INTO events (
    organization_id, event_name, start_date, end_date, city, state
)
VALUES (
    1, 'Past Event', '2024-01-01', '2024-01-03', 'Delhi', 'Delhi'
);
```
1. Click "Register New Event"
2. Verify:
   - ✅ Past event is **NOT** shown in the list
   - ✅ Only future events appear

#### **Test: Different Organization**
```sql
-- Create event for different organization
INSERT INTO events (
    organization_id, event_name, start_date, end_date, city, state
)
VALUES (
    999, 'Other Org Event', '2026-12-01', '2026-12-03', 'Chennai', 'Tamil Nadu'
);
```
1. Click "Register New Event"
2. Verify:
   - ✅ Event from organization 999 is **NOT** shown
   - ✅ Only events from exhibitor's organization appear

---

## 🔍 Debugging Tips

### Check Browser Console
```javascript
// Enable verbose logging
localStorage.setItem('debug', 'true');

// Check user data
console.log('User:', JSON.parse(localStorage.getItem('user')));

// Monitor API calls
// Open Network tab in DevTools
// Filter by "exhibitors"
// Check request/response for:
//   - GET /api/exhibitors/upcoming-events/:orgId
//   - POST /api/exhibitors/register-event
```

### Check Server Logs
```bash
# In server directory
tail -f server.log

# Look for:
# - "Fetching upcoming events for organization: X"
# - "Found N upcoming events for organization X"
# - "Exhibitor registered for event successfully: Y"
```

### Common Issues & Solutions

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| Modal shows "No events" | No future events in DB | Create events with `start_date >= TODAY` |
| "Please log in" alert | No user in localStorage | Login again as exhibitor |
| API returns 404 | Wrong organization ID | Check `userData.organizationId` |
| Registration fails | Already registered | Check for duplicate records in DB |
| Events from other orgs shown | Bug in query | Check `organization_id` filter in SQL |

---

## ✅ Success Criteria

The feature is working correctly if:

- ✅ Modal opens when clicking "Register New Event"
- ✅ Only upcoming events from exhibitor's organization are shown
- ✅ Events show correct details (name, location, dates, description)
- ✅ Registration creates a new exhibitor record with auto-filled data
- ✅ Success popup appears with correct message
- ✅ Duplicate registrations are prevented
- ✅ Past events are not shown
- ✅ Events from other organizations are not shown

---

## 📊 Test Results Template

```
Date: _____________
Tester: _____________

[ ] Login as exhibitor successful
[ ] Event Management page loads
[ ] "Register New Event" button visible
[ ] Modal opens on click
[ ] Upcoming events displayed correctly
[ ] Event details accurate
[ ] "Register Now" button works
[ ] Success popup appears
[ ] Database record created
[ ] Duplicate prevention works
[ ] Past events excluded
[ ] Other org events excluded

Issues Found:
_________________________________
_________________________________
_________________________________

Status: ☐ PASS  ☐ FAIL
```

---

## 🚀 Next Steps After Testing

If all tests pass:
1. ✅ Feature is production-ready
2. ✅ Document any custom configurations
3. ✅ Train users on the feature
4. ✅ Monitor usage and feedback

If tests fail:
1. 🔍 Check browser console for errors
2. 🔍 Check server logs for API errors
3. 🔍 Verify database schema matches expectations
4. 🔍 Review code changes made today
5. 📞 Contact support with error details

---

**Last Updated:** January 23, 2026
**Feature Version:** 1.0
**Status:** ✅ Ready for Testing
