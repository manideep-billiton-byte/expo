# 🚀 Local Development Setup Guide

Follow these steps to run the application locally and test organization/event creation.

## 1. Database Setup

```bash
# Create local database (run in terminal)
sudo -u postgres psql -c "CREATE DATABASE expo_db;"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'password';"

# Verify database exists
psql -U postgres -d expo_db -c "\dt"
```

## 2. Start Backend Server

```bash
# Navigate to server directory
cd server

# The server will automatically:
# - Run schema.sql on startup
# - Run all migrations
# - Connect to local database

# Start the server
npm run dev

# Server will run on: http://localhost:5000
```

**Expected output:**
```
Server running on port 5000
Database schema synchronized from schema.sql
Ran migration: 001_create_organization_invites.sql
Ran migration: 002_create_events.sql
...
```

## 3. Start Frontend (New Terminal)

```bash
# In a NEW terminal window
cd client

# Update to use local backend
echo "VITE_API_URL=http://localhost:5000" > .env.local

# Start frontend
npm run dev

# Frontend will run on: http://localhost:5173
```

## 4. Test the Application

1. Open browser: http://localhost:5173
2. Try creating an organization
3. Try creating an event
4. Check the terminal for any errors

## 5. Common Issues & Debugging

###Bug Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Fix:** Make sure PostgreSQL is running
```bash
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Database Schema Not Created
**Fix:** Manually run schema
```bash
cd server
psql -U postgres -d expo_db -f schema.sql
```

### Check Server Logs
Look for errors in the `server` terminal. Common errors:
- Database connection issues
- Missing environment variables  
- SQL syntax errors

### Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red errors
4. Check Network tab for failed API calls

## 6. Debug Organization/Event Creation

If creation fails, check:

**Backend Terminal:**
```
Look for SQL errors or console.error() output
```

**Browser Console:**
```
Check for 400/500 error responses  
Verify request payload format
```

**Database:**
```bash
# Check if data was inserted
psql -U postgres -d expo_db -c "SELECT * FROM organizations;"
psql -U postgres -d expo_db -c "SELECT * FROM events;"
```

## Next Steps

Once everything works locally:
1. Note what fixes were needed
2. Apply same fixes to AWS deployment
3. Redeploy to AWS

## Quick Start (Copy-Paste)

```bash
# Terminal 1 - Backend
cd ~/Documents/Billiton/Expo_project/server
npm run dev

# Terminal 2 - Frontend  
cd ~/Documents/Billiton/Expo_project/client
echo "VITE_API_URL=http://localhost:5000" > .env.local
npm run dev
```

Then open: http://localhost:5173

---

**Need Help?** Share the error message from either:
- Backend terminal output
- Browser console (F12 → Console)
- Network tab (F12 → Network)
