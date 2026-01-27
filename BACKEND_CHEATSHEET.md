# 🚀 Backend Quick Reference Cheat Sheet

> **One-page daily reference for EventHub Backend Development**

---

## 📁 Key Files Location

| Need to... | Go to... |
|-----------|----------|
| Add/modify API routes | `server/server.js` |
| Organization logic | `server/controllers/organizationController.js` |
| Event logic | `server/controllers/eventController.js` |
| Exhibitor logic | `server/controllers/exhibitorController.js` |
| Visitor logic | `server/controllers/visitorController.js` |
| Email/SMS | `server/services/notificationService.js` |
| QR codes | `server/services/qrStorageService.js` |
| Database schema | `server/schema.sql` |
| DB connection | `server/db.js` |

---

## 🔧 Common Commands

```bash
# Start development (auto-reload)
npm run dev

# Start production
npm start

# Check server is running
curl http://localhost:5000/api/dashboard
```

---

## 🗃️ Database Query Patterns

```javascript
const pool = require('../db');

// SELECT
const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [userId]
);
const user = result.rows[0];

// INSERT (with RETURNING)
const result = await pool.query(
    `INSERT INTO users (name, email) 
     VALUES ($1, $2) RETURNING *`,
    [name, email]
);

// UPDATE
await pool.query(
    `UPDATE users SET name = $1, updated_at = NOW() 
     WHERE id = $2`,
    [name, id]
);

// DELETE
await pool.query('DELETE FROM users WHERE id = $1', [id]);
```

---

## 🔐 Password Handling

```javascript
const bcrypt = require('bcryptjs');

// Create hash (when registering)
const hash = await bcrypt.hash(password, 10);

// Verify (when logging in)
const isValid = await bcrypt.compare(inputPassword, storedHash);
```

---

## 📡 Controller Pattern

```javascript
const myFunction = async (req, res) => {
    try {
        // 1. Get input
        const { id } = req.params;
        const { name } = req.body;
        
        // 2. Validate
        if (!name) {
            return res.status(400).json({ error: 'Name required' });
        }
        
        // 3. Database operation
        const result = await pool.query('...', [id]);
        
        // 4. Return success
        return res.status(200).json({ data: result.rows });
        
    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { myFunction };
```

---

## 🛣️ Adding New Route

```javascript
// In server.js:
const myController = require('./controllers/myController');

// GET
app.get('/api/items/:id', myController.getItem);

// POST
app.post('/api/items', myController.createItem);

// PUT
app.put('/api/items/:id', myController.updateItem);

// DELETE
app.delete('/api/items/:id', myController.deleteItem);
```

---

## 📧 Send Email

```javascript
const { sendEmail } = require('../services/notificationService');

await sendEmail({
    to: 'user@example.com',
    subject: 'Hello',
    html: '<h1>Welcome!</h1>'
});
```

---

## 📱 Send SMS

```javascript
const { sendSMS } = require('../services/notificationService');

await sendSMS({
    to: '+919876543210',  // Include country code!
    body: 'Your OTP: 123456'
});
```

---

## 🏷️ HTTP Status Codes

| Code | When to Use |
|------|-------------|
| 200 | Success (GET, PUT) |
| 201 | Created (POST) |
| 400 | Bad request (validation failed) |
| 401 | Unauthorized (login failed) |
| 404 | Not found |
| 500 | Server error (catch block) |

---

## 🔍 Debug Endpoints

```bash
# List all routes
curl http://localhost:5000/__routes

# Check table columns
curl http://localhost:5000/__columns/exhibitors
```

---

## 📊 Main Tables

| Table | Primary Key | Main Relations |
|-------|-------------|----------------|
| organizations | id | → events, exhibitors, invoices |
| events | id | → organization_id, exhibitors, visitors |
| exhibitors | id | → organization_id, event_id |
| visitors | id | → event_id |
| invoices | id | → organization_id |
| leads | id | → exhibitor_id |

---

## ⚠️ Golden Rules

1. ✅ **Always use `$1, $2`** for query params (prevent SQL injection)
2. ✅ **Always hash passwords** with bcrypt
3. ✅ **Always wrap in try/catch**
4. ✅ **Always validate input** before database
5. ❌ **Never commit `.env`** file
6. ❌ **Never log passwords** or sensitive data

---

*Keep this handy! Print it out or bookmark it.*
