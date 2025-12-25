const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mock Data (will be replaced by DB queries)
const dashboardData = {
    stats: [
        { label: "Active Tenants", value: "248", change: "+12 this month", icon: "Building2", colorClass: "text-blue-500" },
        { label: "Active Events", value: "42", change: "8 ongoing", icon: "Calendar", colorClass: "text-emerald-500" },
        { label: "Total Exhibitors", value: "1,847", change: "+150 this week", icon: "ImageIcon", colorClass: "text-purple-500" },
        { label: "Registered Visitors", value: "24,582", change: "+2,340 today", icon: "Users", colorClass: "text-blue-400" },
        { label: "Leads Captured", value: "18,429", change: "+842 today", icon: "MousePointer2", colorClass: "text-orange-500" },
        { label: "Messages Sent", value: "45,621", change: "+1,234 today", icon: "MessageSquare", colorClass: "text-cyan-500" },
        { label: "Revenue (MTD)", value: "₹12.4L", change: "+15% vs last month", icon: "IndianRupee", colorClass: "text-emerald-600" },
        { label: "Active Users", value: "892", change: "Online now", icon: "UserCheck", colorClass: "text-teal-500" }
    ],
    liveEvents: [
        { name: 'Tech Summit 2025', org: 'ABC - ORG', leads: '2,847', exhibitors: '156', visitors: '12,450', status: 'Done' },
        { name: 'Digital Marketing Expo', org: 'XYZ - ORG', leads: '1,532', exhibitors: '89', visitors: '8,780', status: 'Live' },
        { name: 'Healthcare Innovation Summit', org: '123 - ORG', leads: '945', exhibitors: '67', visitors: '4,230', status: 'Upcoming' }
    ],
    leadStats: {
        sources: [
            { type: 'Visitor Qr', count: '2,134', status: 'Good', color: '#10b981' },
            { type: 'Stall Qr', count: '1,456', status: 'Good', color: '#10b981' },
            { type: 'Ocr', count: '822', status: 'Warning', color: '#f59e0b' },
            { type: 'Manual', count: '2,134', status: 'Good', color: '#10b981' }
        ],
        totals: [
            { label: 'QR Scan', value: '1,00,000' },
            { label: 'OCR / Card', value: '5,00,000' },
            { label: 'Manual', value: '10,000' }
        ],
        conversionRate: "88.5%"
    }
};

// API Routes
app.get('/api/dashboard', (req, res) => {
    res.json(dashboardData);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
