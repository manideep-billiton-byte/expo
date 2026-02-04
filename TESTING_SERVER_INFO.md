# 🧪 EXPO PROJECT - TESTING SERVER

## ⚡ TESTING SERVER IS NOW LIVE!

---

## 🔗 Testing Server URL

```
https://splurgy-ontogenetic-quintin.ngrok-free.dev
```

**Started:** 2026-01-28 15:11 IST

---

## 🚀 Quick Test

Open in browser or run:
```bash
curl https://splurgy-ontogenetic-quintin.ngrok-free.dev/api/dashboard
```

---

## 📋 API Endpoints for Testing

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Unified login (exhibitor/visitor/org) |
| POST | `/api/exhibitor-login` | Exhibitor only login |
| POST | `/api/visitor-login` | Visitor only login |
| POST | `/api/organization-login` | Organization login |

**Example - Login:**
```bash
curl -X POST https://splurgy-ontogenetic-quintin.ngrok-free.dev/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "type": ["exhibitor"]}'
```

---

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Get all events |
| POST | `/api/events` | Create new event |
| GET | `/api/events/by-token/:token` | Get event by QR token |

**Example - Get Events:**
```bash
curl https://splurgy-ontogenetic-quintin.ngrok-free.dev/api/events
```

---

### Exhibitors

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exhibitors` | Get all exhibitors |
| POST | `/api/exhibitors` | Create exhibitor |
| GET | `/api/exhibitors/upcoming-events/:orgId` | Get upcoming events |
| POST | `/api/exhibitors/register-event` | Register for event |

**Example - Get Exhibitors:**
```bash
curl https://splurgy-ontogenetic-quintin.ngrok-free.dev/api/exhibitors
```

---

### Visitors

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/visitors` | Get all visitors |
| POST | `/api/visitors` | Create visitor |
| GET | `/api/visitors/code/:uniqueCode` | Get visitor by QR code |

**Example - Get Visitor by Code:**
```bash
curl https://splurgy-ontogenetic-quintin.ngrok-free.dev/api/visitors/code/VIS-ABCD1234
```

---

### Leads

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | Get all leads |
| GET | `/api/leads?exhibitorId=X` | Get leads for exhibitor |
| POST | `/api/leads` | Create lead |
| PUT | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead |

---

### Scanned Visitors (QR/OCR)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scanned-visitors` | Save scan result |
| GET | `/api/scanned-visitors` | Get all scans |
| GET | `/api/scanned-visitors/stats` | Get scan statistics |
| PUT | `/api/scanned-visitors/:id` | Update scan |
| DELETE | `/api/scanned-visitors/:id` | Delete scan |

**Example - Save QR Scan:**
```bash
curl -X POST https://splurgy-ontogenetic-quintin.ngrok-free.dev/api/scanned-visitors \
  -H "Content-Type: application/json" \
  -d '{
    "exhibitorId": 1,
    "eventId": 1,
    "scanType": "QR_SCAN",
    "visitorName": "Test User",
    "visitorEmail": "test@example.com"
  }'
```

---

### Organizations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/organizations` | Get all organizations |
| POST | `/api/create-organization` | Create organization |
| POST | `/api/send-invite` | Send organization invite |
| POST | `/api/verify-gstin` | Verify GSTIN number |

---

## 🛠️ Testing with Postman

1. Import the collection from: `postman_collection.json`
2. Set the base URL variable to: `https://splurgy-ontogenetic-quintin.ngrok-free.dev`
3. Run tests!

---

## ⚠️ IMPORTANT NOTES

1. **Database**: This testing server uses the **PRODUCTION database**
   - Any data created/modified will affect production
   - Be careful with DELETE operations
   - Use test data with identifiable names (e.g., "TEST-...")

2. **URL Expiry**: The ngrok URL changes each time the server restarts
   - Current URL was generated on: 2026-01-28
   - If it stops working, a new URL needs to be generated

3. **Rate Limits**: ngrok free tier has some rate limits
   - Avoid rapid repeated requests
   - Wait a few seconds between tests

---

## 🔧 ngrok Inspector

View all requests/responses in real-time:
```
http://localhost:4040
```

---

## 📞 Contact

If the testing server goes down or you need a new URL, contact the development team.

---

## 🛑 To Stop Testing Server

```bash
# Find and kill the processes
pkill -f "ngrok http 5001"
pkill -f "node server.js"
```

Or use Ctrl+C if running the start script.

---

*Testing Server Documentation - Last Updated: 2026-01-28*
