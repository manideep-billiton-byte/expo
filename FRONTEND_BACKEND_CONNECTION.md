# 🔗 Frontend-Backend Connection Architecture

This document explains how the Frontend (React/Vite) and Backend (Node.js/Express) are connected in this Expo Event Management Platform.

---

## 📁 Project Structure Overview

```
Expo_project/
├── client/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── utils/
│   │   │   └── api.js         # 🔑 API connection utility
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.local             # Development environment
│   ├── .env.production        # Production environment
│   └── vite.config.js         # Vite configuration with proxy
│
├── server/                    # Backend (Node.js + Express)
│   ├── controllers/           # API route handlers
│   ├── services/              # Business logic
│   ├── db.js                  # Database connection
│   ├── server.js              # Main Express server
│   └── schema.sql             # Database schema
│
└── infrastructure/            # AWS deployment configs
```

---

## 🔧 Connection Mechanism

### 1. Development Mode (Local)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  React App      │     │  Vite Dev       │     │  Express        │
│  (Browser)      │────▶│  Proxy          │────▶│  Server         │
│  Port: 5173     │     │  /api/* → :5000 │     │  Port: 5000     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**How it works:**
1. Frontend runs on `https://localhost:5173`
2. Backend runs on `http://localhost:5000`
3. Vite **proxy** forwards all `/api/*` requests to backend
4. This avoids CORS issues in development

### 2. Production Mode (AWS)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  React App      │     │  CloudFront     │     │  Elastic        │
│  (Browser)      │────▶│  (CDN)          │────▶│  Beanstalk      │
│  Static Files   │     │  Frontend CDN   │     │  Backend API    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**How it works:**
1. Frontend is built (`npm run build`) and deployed to CloudFront
2. Backend is deployed to AWS Elastic Beanstalk
3. Frontend uses `VITE_API_URL` environment variable to call backend directly

---

## 📄 Key Configuration Files

### 1. Vite Proxy Configuration (`client/vite.config.js`)

```javascript
export default defineConfig(({ mode }) => {
    const isDev = mode === 'development';

    return {
        server: {
            host: '0.0.0.0',
            port: 5173,
            https: true,
            // 🔑 PROXY: Forwards /api/* requests to backend
            proxy: {
                '/api': {
                    target: 'http://localhost:5000',
                    changeOrigin: true,
                    secure: false
                }
            }
        }
    }
});
```

**Explanation:**
- Any request to `/api/*` from the frontend is automatically forwarded to `http://localhost:5000`
- `changeOrigin: true` changes the origin header to match the target
- This only works in development mode (not in production build)

---

### 2. Environment Variables

**Development (`client/.env.local`):**
```bash
# No VITE_API_URL needed - Vite proxy handles it
VITE_ENV=development
```

**Production (`client/.env.production`):**
```bash
VITE_API_URL=https://d3cgzphanxg4ax.cloudfront.net
VITE_ENV=production
```

---

### 3. API Utility (`client/src/utils/api.js`)

```javascript
// Get the base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Get the full API URL for a given endpoint
 * - Development: uses proxy (/api/...)
 * - Production: uses VITE_API_URL environment variable
 */
export const getApiUrl = (endpoint) => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // In production, prepend the API base URL
    if (API_BASE_URL) {
        return `${API_BASE_URL}${cleanEndpoint}`;
    }

    // In development, use relative path (Vite proxy handles it)
    return cleanEndpoint;
};

/**
 * Wrapper for fetch with API URL handling
 */
export const apiFetch = (endpoint, options = {}) => {
    const headers = { ...options.headers };

    // Auto-add JSON Content-Type for non-FormData bodies
    if (options.body && !headers['Content-Type'] && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    return fetch(getApiUrl(endpoint), {
        ...options,
        headers,
    });
};
```

**Explanation:**
- `getApiUrl()`: Constructs the full URL based on environment
- `apiFetch()`: Wrapper around `fetch()` that automatically handles:
  - URL construction
  - JSON Content-Type header
  - FormData detection (for file uploads)

---

## 📝 How Components Make API Calls

### Example 1: Login Component

```javascript
// client/src/components/Login.jsx
import { apiFetch } from '../utils/api';

// Making a POST request
const response = await apiFetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123',
        type: ['exhibitor', 'visitor']
    })
});

const data = await response.json();
if (data.success) {
    // Handle successful login
}
```

### Example 2: Fetching Data

```javascript
// client/src/components/EventManagement.jsx
import { apiFetch } from '../utils/api';

// Making a GET request
const resp = await apiFetch('/api/events');
const events = await resp.json();
```

### Example 3: File Upload

```javascript
// client/src/components/EventManagement.jsx
import { apiFetch } from '../utils/api';

// FormData for file upload
const formData = new FormData();
formData.append('file', selectedFile);

const resp = await apiFetch('/api/upload/ground-layout', {
    method: 'POST',
    body: formData  // No Content-Type header - browser sets it automatically
});
```

---

## 🔄 Request Flow Diagram

### Development Flow:
```
User Action → React Component → apiFetch('/api/events')
                                      │
                                      ▼
                            getApiUrl('/api/events')
                                      │
                            Returns: '/api/events' (relative)
                                      │
                                      ▼
                            fetch('/api/events')
                                      │
                            Vite Proxy intercepts
                                      │
                                      ▼
                            http://localhost:5000/api/events
                                      │
                            Express Server handles
                                      │
                                      ▼
                            Response → Component → UI Update
```

### Production Flow:
```
User Action → React Component → apiFetch('/api/events')
                                      │
                                      ▼
                            getApiUrl('/api/events')
                                      │
                            Returns: 'https://backend.cloudfront.net/api/events'
                                      │
                                      ▼
                            fetch('https://backend.cloudfront.net/api/events')
                                      │
                            Direct HTTP request to backend
                                      │
                                      ▼
                            Response → Component → UI Update
```

---

## 🌐 Backend CORS Configuration

The backend (`server/server.js`) is configured to accept requests from any origin:

```javascript
app.use(cors({
    origin: '*',                              // Accept all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: false
}));
```

---

## 🗄️ Database Connection

The backend connects to PostgreSQL database:

**Local Development (`server/db.js`):**
```javascript
const dbConfig = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password@123',
    database: 'event_platform',
    ssl: false
};
```

**Production (AWS RDS):**
```javascript
const dbConfig = {
    connectionString: 'postgresql://postgres:EventPass123!@expo-project-prod-db.xxx.rds.amazonaws.com:5432/expo_db',
    ssl: { rejectUnauthorized: false }
};
```

---

## 📊 Complete Architecture Diagram

```
                              ┌──────────────────────────────────────────┐
                              │              AWS Cloud                    │
                              │                                           │
┌─────────────┐               │  ┌─────────────┐    ┌─────────────────┐  │
│   Mobile    │───HTTPS──────▶│  │ CloudFront  │    │ Elastic         │  │
│   Browser   │               │  │ (Frontend)  │    │ Beanstalk       │  │
└─────────────┘               │  │             │    │ (Backend API)   │  │
                              │  │ React App   │    │                 │  │
┌─────────────┐               │  │ Static      │    │ Express.js      │  │
│   Desktop   │───HTTPS──────▶│  │ Files       │    │ Node.js         │  │
│   Browser   │               │  └─────────────┘    └────────┬────────┘  │
└─────────────┘               │                              │           │
                              │                              │           │
                              │                     ┌────────▼────────┐  │
                              │                     │   AWS RDS       │  │
                              │                     │   PostgreSQL    │  │
                              │                     │   Database      │  │
                              │                     └─────────────────┘  │
                              │                                          │
                              │  ┌─────────────┐    ┌─────────────────┐  │
                              │  │ AWS SES     │    │ AWS S3          │  │
                              │  │ Email       │    │ File Storage    │  │
                              │  │ Service     │    │ (QR Codes)      │  │
                              │  └─────────────┘    └─────────────────┘  │
                              │                                          │
                              └──────────────────────────────────────────┘
```

---

## 🚀 Running the Project

### Development Mode:

**Terminal 1 - Start Backend:**
```bash
cd server
npm install
node server.js
# Server running on http://localhost:5000
```

**Terminal 2 - Start Frontend:**
```bash
cd client
npm install
npm run dev
# App running on https://localhost:5173
```

### Production Build:

```bash
# Build frontend
cd client
npm run build
# Output in client/dist/

# Deploy to AWS
# Frontend: Upload dist/ to S3 + CloudFront
# Backend: Deploy server/ to Elastic Beanstalk
```

---

## 🔑 Key Takeaways

1. **Development**: Vite proxy handles API routing - no CORS issues
2. **Production**: Environment variable `VITE_API_URL` points to backend
3. **API Utility**: `apiFetch()` abstracts away environment differences
4. **All components** use `apiFetch()` for consistent API calls
5. **Backend CORS** is configured to accept requests from any origin
6. **Database** connection switches between local PostgreSQL and AWS RDS

---

## 📱 For Mobile Developers

If you're building a mobile app (React Native/Flutter):

1. **Use the same API endpoints** documented in `API_DOCUMENTATION.md`
2. **Base URL**: Use the production backend URL directly:
   ```
   https://d3cgzphanxg4ax.cloudfront.net
   ```
3. **No proxy needed** - mobile apps can call APIs directly
4. **Headers**: Always include `Content-Type: application/json` for POST/PUT requests

Example (React Native):
```javascript
const API_BASE = 'https://d3cgzphanxg4ax.cloudfront.net';

const login = async (email, password) => {
    const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            password,
            type: ['exhibitor']
        })
    });
    return response.json();
};
```

---

*Last Updated: 2026-01-28*
