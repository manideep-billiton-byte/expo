# 🎯 Backend Hands-On Exercises

> **Practice tasks for Junior Developer - Complete these to understand the codebase**

---

## 📋 Prerequisites

Before starting:
1. ✅ Read `BACKEND_KT_GUIDE.md`
2. ✅ Have `BACKEND_CHEATSHEET.md` open for reference
3. ✅ Server running with `npm run dev`
4. ✅ Postman or curl installed for testing

---

## 🟢 Exercise 1: Understanding the Codebase (Easy)

### Task 1.1: Explore the Routes
**Objective:** Understand all available API endpoints

```bash
# Run this command:
curl http://localhost:5000/__routes | json_pp
```

**Questions to Answer:**
1. How many routes are registered?
2. Which route handles visitor creation?
3. What HTTP method is used for login?

**Write your answers here:**
```
1. 
2. 
3. 
```

---

### Task 1.2: Trace a Request
**Objective:** Follow the code path for visitor creation

1. Open `server/server.js`
2. Find the route: `app.post('/api/visitors', ...)`
3. Which controller handles this?
4. Open that controller file
5. Find the `createVisitor` function
6. List the main steps in this function:

**Your Answer:**
```
Step 1: 
Step 2: 
Step 3: 
Step 4: 
```

---

### Task 1.3: Database Exploration
**Objective:** Understand the database structure

```bash
# Check the visitors table structure:
curl http://localhost:5000/__columns/visitors | json_pp
```

**Questions:**
1. What columns does the visitors table have?
2. What is the primary key?
3. Which column stores the QR code identifier?

---

## 🟡 Exercise 2: Read Operations (Medium)

### Task 2.1: Create a New GET Endpoint
**Objective:** Add an endpoint to get event count by organization

**Requirements:**
- Endpoint: `GET /api/organizations/:orgId/event-count`
- Response: `{ "organizationId": 5, "eventCount": 12 }`

**Steps:**

1. Create a new function in `organizationController.js`:

```javascript
// Add this function to organizationController.js

const getOrganizationEventCount = async (req, res) => {
    try {
        const { orgId } = req.params;
        
        // TODO: Write your query here
        // Hint: COUNT(*) and WHERE organization_id = $1
        
        const result = await pool.query(
            // Your SQL query here
            [orgId]
        );
        
        return res.status(200).json({
            organizationId: parseInt(orgId),
            eventCount: parseInt(result.rows[0].count)
        });
        
    } catch (error) {
        console.error('getOrganizationEventCount error:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Don't forget to add to module.exports!
```

2. Add to `module.exports` in organizationController.js

3. Register route in `server.js`:
```javascript
app.get('/api/organizations/:orgId/event-count', organizationController.getOrganizationEventCount);
```

4. Test with:
```bash
curl http://localhost:5000/api/organizations/1/event-count
```

**Success Criteria:** 
- ✅ Returns JSON with organizationId and eventCount
- ✅ No server errors
- ✅ Works with different organization IDs

---

### Task 2.2: Add Filtering to Existing Endpoint
**Objective:** Modify `getExhibitors` to support status filtering

Current: `GET /api/exhibitors?eventId=5`
New: `GET /api/exhibitors?eventId=5&status=Active`

**Hint:** Look at how `eventId` filter is implemented and add similar logic for `access_status`

**Your Implementation:**
```javascript
// Modify in exhibitorController.js - getExhibitors function
// Add after the eventId filter logic:

// Your code here...
```

---

## 🟠 Exercise 3: Write Operations (Advanced)

### Task 3.1: Create Exhibitor Notes Endpoint
**Objective:** Add ability to save notes for an exhibitor

**Requirements:**
- Endpoint: `POST /api/exhibitors/:id/notes`
- Body: `{ "note": "This is a VIP exhibitor" }`
- Saves note to a new column in exhibitors table

**Steps:**

1. Create migration file: `server/migrations/011_add_notes_to_exhibitors.sql`
```sql
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS notes TEXT;
```

2. Add function to `exhibitorController.js`:
```javascript
const addExhibitorNote = async (req, res) => {
    // TODO: Implement this
    // 1. Get exhibitor ID from params
    // 2. Get note from body
    // 3. Validate both exist
    // 4. Update exhibitors table
    // 5. Return updated exhibitor
};
```

3. Register route in server.js

4. Test with:
```bash
curl -X POST http://localhost:5000/api/exhibitors/1/notes \
  -H "Content-Type: application/json" \
  -d '{"note": "VIP customer"}'
```

---

### Task 3.2: Implement Soft Delete
**Objective:** Instead of deleting visitors, mark them as deleted

**Requirements:**
- Add `is_deleted` column to visitors table
- Modify `getVisitors` to exclude deleted visitors
- Create `DELETE /api/visitors/:id` that sets `is_deleted = true`

**Your Implementation:**
```javascript
// Write your code here
```

---

## 🔴 Exercise 4: Integration Challenge (Expert)

### Task 4.1: Build Complete CRUD for Event Categories
**Objective:** Create a new feature to manage event categories

**Requirements:**
1. Create new table `event_categories`:
   - id (BIGSERIAL PRIMARY KEY)
   - name (TEXT NOT NULL)
   - description (TEXT)
   - organization_id (BIGINT, FK to organizations)
   - created_at (TIMESTAMPTZ)

2. Create `categoryController.js` with:
   - getCategories (with organization filter)
   - createCategory
   - updateCategory
   - deleteCategory

3. Register all routes in server.js

4. Test all endpoints with Postman

**Deliverables:**
- [ ] Migration file created
- [ ] Controller file created
- [ ] All 4 endpoints working
- [ ] Proper error handling
- [ ] Input validation

---

### Task 4.2: Add Email Notification
**Objective:** Send email when new exhibitor registers

**Requirements:**
1. Modify `createExhibitor` function
2. After successful creation, send welcome email
3. Use `notificationService.sendEmail()`
4. Email should include:
   - Exhibitor company name
   - Event name they registered for
   - Stall number assigned

**Your Implementation:**
```javascript
// Add after successful exhibitor creation in createExhibitor:

// Your code here...
```

---

## 📝 Exercise Completion Checklist

| Exercise | Status | Reviewed By | Notes |
|----------|--------|-------------|-------|
| 1.1 Explore Routes | ⬜ | | |
| 1.2 Trace Request | ⬜ | | |
| 1.3 Database Exploration | ⬜ | | |
| 2.1 GET Event Count | ⬜ | | |
| 2.2 Add Filtering | ⬜ | | |
| 3.1 Exhibitor Notes | ⬜ | | |
| 3.2 Soft Delete | ⬜ | | |
| 4.1 Event Categories | ⬜ | | |
| 4.2 Email Notification | ⬜ | | |

---

## 🆘 Stuck? Here's Help

### Common Mistakes
1. **Forgot RETURNING \* in INSERT** - You won't get the created row back
2. **Wrong parameter index** - `$1`, `$2` must match array order
3. **Didn't add to module.exports** - Route won't find the function
4. **Forgot async/await** - Query won't complete before response

### Debug Tips
```javascript
// Add this to see what's coming in:
console.log('Request body:', req.body);
console.log('Request params:', req.params);
console.log('Request query:', req.query);

// Add this to see query results:
console.log('Query result:', result.rows);
```

### Need More Help?
1. Check `BACKEND_CHEATSHEET.md`
2. Look at similar functions in the same controller
3. Check `server.log` for error messages
4. Ask your senior developer!

---

## 🏆 Bonus Challenges

If you finished all exercises, try these:

1. **Add pagination** to getExhibitors (limit, offset)
2. **Add search** by company name to exhibitors
3. **Add rate limiting** to login endpoints
4. **Create API tests** using Jest or Mocha
5. **Add request logging** middleware

---

*Complete these exercises in order. Don't skip ahead! Each builds on the previous.*

*Good luck! 🍀*
