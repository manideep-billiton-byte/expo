# FIX: Exhibitor Event Registration - Organization Linking Issue

## Problem Identified

When checking the database, we found that **all events and exhibitors had `organization_id = null`**. This is why the "Register New Event" modal was showing "No upcoming events available from your organization."

### Root Causes:

1. **Event Creation**: The `createEvent` function was not saving the `organization_id` field
2. **Exhibitor Creation**: The `createExhibitor` function was not saving the `organization_id` field  
3. **Exhibitor Login**: The login response was not including `organization_id`
4. **Frontend**: Was making an extra API call to get organization_id instead of using localStorage

## Changes Made

### 1. Backend - Event Controller (`/server/controllers/eventController.js`)

**Added `organization_id` to event creation:**
```javascript
const insertSql = `INSERT INTO events(
    organization_id, name, event_name, description, ...
) VALUES($1,$2,$3,$4,...) RETURNING *`;

const values = [
    payload.organizationId || payload.organization_id || null,
    eventName,
    ...
];
```

### 2. Backend - Exhibitor Controller (`/server/controllers/exhibitorController.js`)

**A. Added `organization_id` to exhibitor creation:**
```javascript
const insertSql = `INSERT INTO exhibitors(
    organization_id, company_name, gst_number, ...
) VALUES($1,$2,$3,...) RETURNING *`;

const values = [
    p.organizationId || p.organization_id || null,
    p.companyName || p.company_name || null,
    ...
];
```

**B. Added `organization_id` to login response:**
```javascript
return res.json({
    success: true,
    userType: 'exhibitor',
    user: {
        id: exhibitor.id,
        name: exhibitor.company_name,
        email: exhibitor.email,
        eventId: exhibitor.event_id,
        eventName: exhibitor.event_name,
        organizationId: exhibitor.organization_id  // ← NEW
    }
});
```

**C. Improved upcoming events query:**
- Removed restrictive status filter
- Added debug logging
- Now shows all events with `start_date >= CURRENT_DATE`

### 3. Frontend - ExhibitorEventManagement Component

**Simplified to use organizationId from localStorage:**
```javascript
const fetchUpcomingEvents = async () => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const organizationId = userData.organizationId;  // Direct access
    
    const events = await apiFetch(`/api/exhibitors/upcoming-events/${organizationId}`);
    setUpcomingEvents(events);
};
```

## How to Fix Your Existing Data

Since your existing events and exhibitors have `organization_id = null`, you need to update them:

### Option 1: Run the Update Script (Recommended)

```bash
cd /home/billiton/Documents/Billiton/Expo_project/server
node update-organization-links.js
```

This interactive script will:
1. Show all organizations
2. Ask you to select an organization ID (org998 = ID 2)
3. Update all events and exhibitors to link to that organization

### Option 2: Manual SQL Update

If you know the organization ID (org998 has ID = 2):

```sql
-- Update all events to link to org998 (ID = 2)
UPDATE events SET organization_id = 2 WHERE organization_id IS NULL;

-- Update all exhibitors to link to org998 (ID = 2)
UPDATE exhibitors SET organization_id = 2 WHERE organization_id IS NULL;
```

## Testing Steps

After updating the database:

1. **Log out** from the exhibitor account
2. **Log back in** as the exhibitor
   - This will save the `organizationId` in localStorage
3. Navigate to **Event Management** page
4. Click **"Register New Event"** button
5. You should now see your upcoming events!

## What to Expect

The modal will show:
- ✅ All upcoming events from the same organization
- ✅ Events with `start_date >= today`
- ✅ Event details (name, location, dates, description)
- ✅ "Register Now" button for one-click registration
- ✅ Auto-filled exhibitor data on registration
- ✅ Success popup after registration

## Future Event/Exhibitor Creation

From now on, when creating new events or exhibitors:
- **Always include `organizationId` in the request payload**
- The backend will automatically save it to the database
- Events and exhibitors will be properly linked to organizations

## Files Modified

1. `/server/controllers/eventController.js` - Added organization_id to event creation
2. `/server/controllers/exhibitorController.js` - Added organization_id to exhibitor creation and login
3. `/client/src/components/ExhibitorEventManagement.jsx` - Simplified to use localStorage
4. `/server/update-organization-links.js` - NEW: Script to fix existing data

## Debug Logging

The backend now logs:
- Organization ID when fetching upcoming events
- Number of events found
- Event details (id, name, status, date)
- Exhibitor login with organization ID

Check your server terminal for these logs to troubleshoot any issues.
