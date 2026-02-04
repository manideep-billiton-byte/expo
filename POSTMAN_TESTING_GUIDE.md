# 🚀 How to Test Dashboard API in Postman

Follow these steps to verify the dashboard data endpoint.

## 1. Setup Request

1.  Open **Postman**.
2.  Click **+** to create a new Request.
3.  Set the HTTP Method to **GET**.
4.  Enter the URL:
    ```
    http://localhost:5000/api/dashboard
    ```
    *(Note: Replace `localhost` with your actual server IP if testing from a different device/network)*.

## 2. Send Request

1.  Click the **Send** button (Blue button on the right).
2.  No Headers or Body are required for this specific endpoint as it's currently a public route for testing.

## 3. Verify Response

Status: **200 OK**

**Expected JSON Output:**
```json
{
    "stats": [
        {
            "label": "Active Organisations",
            "value": "248",
            "change": "+12 this month",
            "icon": "Building2",
            "colorClass": "text-blue-500"
        },
        ...
    ],
    "liveEvents": [ ... ],
    "leadStats": { ... }
}
```

## 4. Troubleshooting

- **Error: Connection Refused**: Ensure your backend server is running (`npm start` in `server/` directory).
- **Error: 404 Not Found**: Check if the URL is correct (`/api/dashboard`).
- **Error: Network Error**: If testing from a real mobile device or simulator, `localhost` refers to the device itself. Use your computer's local IP address (e.g., `http://192.168.1.5:5000/api/dashboard`).
