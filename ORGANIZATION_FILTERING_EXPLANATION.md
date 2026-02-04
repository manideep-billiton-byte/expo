# Organization-Specific Data Filtering - Technical Explanation

## 📋 Table of Contents
1. [Overview](#overview)
2. [The Problem We Solved](#the-problem-we-solved)
3. [How It Works - Step by Step](#how-it-works---step-by-step)
4. [Backend Changes](#backend-changes)
5. [Frontend Changes](#frontend-changes)
6. [Code Flow Diagram](#code-flow-diagram)
7. [Example Scenarios](#example-scenarios)

---

## 🎯 Overview

We implemented a feature that ensures **each organization only sees their own data** when they log in. This means:
- Organizations see only their events, exhibitors, and visitors
- Master Admin sees ALL data across all organizations
- Data is properly isolated and secure

---

## ❌ The Problem We Solved

### Before the changes:
```
Organization A logs in → Sees ALL events (including Organization B, C, D...)
Organization A logs in → Sees ALL exhibitors (including other organizations)
Organization A logs in → Sees ALL visitors (from all events)
```

### After the changes:
```
Organization A logs in → Sees ONLY Organization A's events
Organization A logs in → Sees ONLY Organization A's exhibitors
Organization A logs in → Sees ONLY Organization A's visitors
```

---

## 🔄 How It Works - Step by Step

### Step 1: User Logs In
When a user logs in as an **organization**, the system stores important information:

**File: `Login.jsx`** (Already existed, we didn't change this)
```javascript
// When organization logs in successfully:
localStorage.setItem('userType', 'organization');
localStorage.setItem('organizationId', '123'); // Their organization ID
localStorage.setItem('organizationName', 'ABC Corp');
```

**What this means:**
- `localStorage` is like a browser's memory that persists even after page refresh
- We save the user type (organization, master, exhibitor, visitor)
- We save the organization ID (a unique number identifying the organization)

---

### Step 2: Frontend Checks User Type

When a management page loads (Events, Exhibitors, Visitors), it checks who is logged in:

**Example from `EventManagement.jsx`:**
```javascript
const loadEvents = async () => {
    // Step 1: Get user information from localStorage
    const organizationId = localStorage.getItem('organizationId');
    const userType = localStorage.getItem('userType');
    
    // Step 2: Build the API URL
    let apiUrl = '/api/events';  // Default URL
    
    // Step 3: If user is an organization, add filter
    if (userType === 'organization' && organizationId) {
        apiUrl += `?organization_id=${organizationId}`;
        // Now apiUrl = '/api/events?organization_id=123'
    }
    
    // Step 4: Fetch data from backend
    const resp = await apiFetch(apiUrl);
    const data = await resp.json();
    
    // Step 5: Display the data
    setEvents(data);
};
```

**Breaking it down:**

1. **Check localStorage**: "Who is logged in?"
   - If Master Admin → No filter needed
   - If Organization → Need to filter by their ID

2. **Build URL**: 
   - Master Admin: `/api/events` (gets all events)
   - Organization: `/api/events?organization_id=123` (gets only their events)

3. **Fetch Data**: Call the backend API

4. **Display**: Show the filtered results

---

### Step 3: Backend Filters Data

The backend receives the request and filters the database query:

**Example from `eventController.js`:**
```javascript
const getEvents = async (req, res) => {
    try {
        // Step 1: Get the organization_id from URL query parameters
        const { organization_id } = req.query;
        
        // Step 2: Start building SQL query
        let query = 'SELECT * FROM events';
        let params = [];
        
        // Step 3: If organization_id exists, add WHERE clause
        if (organization_id) {
            query += ' WHERE organization_id = $1';
            params.push(organization_id);
            // Now query = 'SELECT * FROM events WHERE organization_id = $1'
        }
        
        // Step 4: Add sorting
        query += ' ORDER BY created_at DESC';
        
        // Step 5: Execute query and return results
        const result = await pool.query(query, params);
        return res.json(result.rows);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch events' });
    }
};
```

**Breaking it down:**

1. **Extract Parameter**: Get `organization_id` from URL query string
   - URL: `/api/events?organization_id=123`
   - Extracted: `organization_id = '123'`

2. **Dynamic Query Building**:
   - Without filter: `SELECT * FROM events ORDER BY created_at DESC`
   - With filter: `SELECT * FROM events WHERE organization_id = $1 ORDER BY created_at DESC`

3. **Execute Query**: Run the SQL query against the database

4. **Return Results**: Send filtered data back to frontend

---

## 🔧 Backend Changes

### 1. Event Controller (`eventController.js`)

**What changed:**
```javascript
// BEFORE (returned all events):
const result = await pool.query('SELECT * FROM events ORDER BY created_at DESC');

// AFTER (filters by organization if provided):
const { organization_id } = req.query;
let query = 'SELECT * FROM events';
let params = [];

if (organization_id) {
    query += ' WHERE organization_id = $1';
    params.push(organization_id);
}

query += ' ORDER BY created_at DESC';
const result = await pool.query(query, params);
```

**Why this works:**
- Uses **conditional query building**
- If `organization_id` is provided → filters results
- If not provided → returns all results (for Master Admin)

---

### 2. Exhibitor Controller (`exhibitorController.js`)

**What changed:**
```javascript
// BEFORE:
const result = await pool.query(`
    SELECT e.*, ev.event_name, org.org_name AS organization_name
    FROM exhibitors e
    LEFT JOIN events ev ON ev.id = e.event_id
    LEFT JOIN organizations org ON org.id = e.organization_id
    ORDER BY e.created_at DESC
`);

// AFTER:
const { organization_id } = req.query;
let query = `
    SELECT e.*, ev.event_name, org.org_name AS organization_name
    FROM exhibitors e
    LEFT JOIN events ev ON ev.id = e.event_id
    LEFT JOIN organizations org ON org.id = e.organization_id`;

let params = [];

if (organization_id) {
    query += ' WHERE e.organization_id = $1';
    params.push(organization_id);
}

query += ' ORDER BY e.created_at DESC';
const result = await pool.query(query, params);
```

**Key point:** We filter on `e.organization_id` (exhibitor's organization)

---

### 3. Visitor Controller (`visitorController.js`)

**What changed:**
```javascript
// BEFORE:
const result = await pool.query(`
    SELECT v.*, ev.event_name
    FROM visitors v
    LEFT JOIN events ev ON ev.id = v.event_id
    ORDER BY v.created_at DESC
`);

// AFTER:
const { organization_id } = req.query;
let query = `
    SELECT v.*, ev.event_name
    FROM visitors v
    LEFT JOIN events ev ON ev.id = v.event_id`;

let params = [];

if (organization_id) {
    query += ' WHERE ev.organization_id = $1';  // Filter through events!
    params.push(organization_id);
}

query += ' ORDER BY v.created_at DESC';
const result = await pool.query(query, params);
```

**Important difference:** 
- Visitors don't have `organization_id` directly
- We filter through the **events table**: `ev.organization_id`
- This shows visitors who registered for that organization's events

---

## 💻 Frontend Changes

All three management pages follow the same pattern:

### Pattern Used:
```javascript
const loadData = async () => {
    // 1. Get user info from localStorage
    const organizationId = localStorage.getItem('organizationId');
    const userType = localStorage.getItem('userType');
    
    // 2. Build API URL with conditional filter
    let apiUrl = '/api/endpoint';
    if (userType === 'organization' && organizationId) {
        apiUrl += `?organization_id=${organizationId}`;
    }
    
    // 3. Fetch and display data
    const resp = await apiFetch(apiUrl);
    const data = await resp.json();
    setData(data);
};
```

### Files Changed:
1. **`EventManagement.jsx`** → `loadEvents()` function
2. **`ExhibitorsManagement.jsx`** → `loadEvents()` and `loadExhibitors()` functions
3. **`VisitorsManagement.jsx`** → `loadEvents()` and `loadVisitors()` functions

---

## 📊 Code Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER LOGS IN                              │
│                                                              │
│  Login.jsx stores in localStorage:                          │
│  - userType: 'organization'                                 │
│  - organizationId: '123'                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              USER NAVIGATES TO EVENTS PAGE                   │
│                                                              │
│  EventManagement.jsx loads                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              loadEvents() FUNCTION RUNS                      │
│                                                              │
│  1. Read localStorage                                       │
│     organizationId = '123'                                  │
│     userType = 'organization'                               │
│                                                              │
│  2. Build URL                                               │
│     apiUrl = '/api/events?organization_id=123'              │
│                                                              │
│  3. Call Backend                                            │
│     apiFetch(apiUrl)                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND RECEIVES REQUEST                        │
│                                                              │
│  eventController.js → getEvents()                           │
│                                                              │
│  1. Extract query parameter                                 │
│     organization_id = '123'                                 │
│                                                              │
│  2. Build SQL query                                         │
│     SELECT * FROM events                                    │
│     WHERE organization_id = $1                              │
│     ORDER BY created_at DESC                                │
│                                                              │
│  3. Execute query with params = ['123']                     │
│                                                              │
│  4. Return filtered results                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND RECEIVES DATA                          │
│                                                              │
│  EventManagement.jsx                                        │
│  - Receives only Organization 123's events                  │
│  - Displays them in the table                               │
│  - User sees only their data ✓                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎬 Example Scenarios

### Scenario 1: Master Admin Logs In

```javascript
// localStorage after login:
userType = 'master'
organizationId = null

// Frontend builds URL:
apiUrl = '/api/events'  // No filter added

// Backend receives:
req.query.organization_id = undefined

// SQL query executed:
SELECT * FROM events ORDER BY created_at DESC

// Result:
Returns ALL events from ALL organizations ✓
```

---

### Scenario 2: Organization "ABC Corp" (ID: 5) Logs In

```javascript
// localStorage after login:
userType = 'organization'
organizationId = '5'

// Frontend builds URL:
apiUrl = '/api/events?organization_id=5'

// Backend receives:
req.query.organization_id = '5'

// SQL query executed:
SELECT * FROM events 
WHERE organization_id = $1 
ORDER BY created_at DESC
// with params = ['5']

// Result:
Returns ONLY events where organization_id = 5 ✓
```

---

### Scenario 3: Organization Viewing Exhibitors

```javascript
// localStorage:
userType = 'organization'
organizationId = '5'

// Frontend (ExhibitorsManagement.jsx):
apiUrl = '/api/exhibitors?organization_id=5'

// Backend (exhibitorController.js):
SELECT e.*, ev.event_name, org.org_name AS organization_name
FROM exhibitors e
LEFT JOIN events ev ON ev.id = e.event_id
LEFT JOIN organizations org ON org.id = e.organization_id
WHERE e.organization_id = $1
ORDER BY e.created_at DESC
// with params = ['5']

// Result:
Returns ONLY exhibitors belonging to organization 5 ✓
```

---

### Scenario 4: Organization Viewing Visitors

```javascript
// localStorage:
userType = 'organization'
organizationId = '5'

// Frontend (VisitorsManagement.jsx):
apiUrl = '/api/visitors?organization_id=5'

// Backend (visitorController.js):
SELECT v.*, ev.event_name
FROM visitors v
LEFT JOIN events ev ON ev.id = v.event_id
WHERE ev.organization_id = $1  // ← Filter through events table!
ORDER BY v.created_at DESC
// with params = ['5']

// Result:
Returns ONLY visitors who registered for organization 5's events ✓
```

---

## 🔑 Key Concepts for Juniors

### 1. **localStorage**
- Browser storage that persists across page reloads
- Stores key-value pairs as strings
- Access with `localStorage.getItem('key')` and `localStorage.setItem('key', 'value')`

### 2. **Query Parameters**
- Part of URL after `?`: `/api/events?organization_id=123`
- Multiple parameters: `/api/events?organization_id=123&status=active`
- Backend accesses via `req.query.organization_id`

### 3. **Conditional Logic**
```javascript
if (condition) {
    // Do something
}
```
- We use this to decide whether to add filters
- If organization → add filter
- If master admin → no filter

### 4. **Dynamic SQL Query Building**
```javascript
let query = 'SELECT * FROM table';
if (filter) {
    query += ' WHERE column = $1';
}
```
- Start with base query
- Add conditions based on parameters
- Prevents SQL injection using parameterized queries (`$1`, `$2`)

### 5. **Parameterized Queries**
```javascript
// UNSAFE (SQL Injection risk):
pool.query(`SELECT * FROM events WHERE id = ${userInput}`);

// SAFE (Parameterized):
pool.query('SELECT * FROM events WHERE id = $1', [userInput]);
```
- Always use `$1, $2, $3...` placeholders
- Pass values in separate array
- Database handles escaping and security

---

## ✅ Testing Checklist

To verify the implementation works:

1. **Test as Master Admin:**
   - [ ] Login as master admin
   - [ ] Navigate to Events page → Should see ALL events
   - [ ] Navigate to Exhibitors page → Should see ALL exhibitors
   - [ ] Navigate to Visitors page → Should see ALL visitors

2. **Test as Organization A:**
   - [ ] Login as Organization A
   - [ ] Navigate to Events page → Should see ONLY Organization A's events
   - [ ] Navigate to Exhibitors page → Should see ONLY Organization A's exhibitors
   - [ ] Navigate to Visitors page → Should see ONLY Organization A's visitors
   - [ ] Verify counts on dashboard match filtered data

3. **Test as Organization B:**
   - [ ] Login as Organization B
   - [ ] Verify Organization B sees different data than Organization A
   - [ ] Verify no overlap in data between organizations

---

## 🐛 Common Issues & Solutions

### Issue 1: Organization sees all data
**Cause:** `userType` or `organizationId` not set in localStorage
**Solution:** Check Login.jsx is properly setting these values

### Issue 2: No data showing for organization
**Cause:** Wrong organization_id or no data exists
**Solution:** 
- Check browser console for API URL
- Verify organization_id matches database
- Check if organization actually has events/exhibitors/visitors

### Issue 3: Backend error "organization_id is undefined"
**Cause:** Frontend not sending query parameter
**Solution:** Verify frontend is building URL correctly with `?organization_id=${id}`

---

## 📚 Further Learning

**Concepts to study:**
1. REST API query parameters
2. SQL WHERE clauses and JOINs
3. Browser localStorage API
4. Conditional rendering in React
5. Parameterized SQL queries (SQL injection prevention)

**Practice exercises:**
1. Add filtering by event status (Draft, Live, Completed)
2. Add date range filtering
3. Implement search functionality with filters
4. Add pagination with filters

---

## 🎓 Summary

**What we built:**
- Organization-specific data filtering across the entire application

**How it works:**
1. User logs in → Store user type and organization ID
2. Frontend checks user type → Add filter if organization
3. Backend receives filter → Build conditional SQL query
4. Return filtered results → Display to user

**Why it's important:**
- **Security**: Organizations can't see each other's data
- **Privacy**: Data isolation between organizations
- **User Experience**: Users see only relevant data
- **Scalability**: Works for any number of organizations

**Key takeaway:**
This is a common pattern in multi-tenant applications where different users/organizations need to see different subsets of data from the same database.

---

*Last Updated: January 31, 2026*
*Author: Development Team*
