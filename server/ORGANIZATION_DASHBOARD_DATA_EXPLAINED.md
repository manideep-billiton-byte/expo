# 📊 Organization Dashboard Data - Explained

## Where Dashboard Data Comes From

The dashboard data for an organization comes from **multiple sources** that are combined together:

---

## 🎯 Current Implementation

### 1. General Dashboard Endpoint
**Endpoint:** `GET /api/dashboard`

**Location:** `server/server.js` (lines 69-103)

**Returns:** Mock/static data for overall platform statistics

```javascript
{
  "stats": [
    { "label": "Active Tenants", "value": "248", "change": "+12 this month" },
    { "label": "Active Events", "value": "42", "change": "8 ongoing" },
    { "label": "Total Exhibitors", "value": "1,847", "change": "+150 this week" },
    { "label": "Registered Visitors", "value": "24,582", "change": "+2,340 today" },
    { "label": "Leads Captured", "value": "18,429", "change": "+842 today" }
  ],
  "liveEvents": [...],
  "leadStats": {...}
}
```

**⚠️ Note:** This is **platform-wide** data, not organization-specific!

---

## 📊 Organization-Specific Dashboard Data

For an **organization's dashboard**, you need to combine data from multiple endpoints:

### Data Sources:

```
┌─────────────────────────────────────────────────────────────┐
│         ORGANIZATION DASHBOARD DATA SOURCES                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Organization Profile                                    │
│     GET /api/organizations                                  │
│     → Organization details (name, email, plan, etc.)        │
│                                                             │
│  2. Organization Events                                     │
│     GET /api/events?organization_id={id}                    │
│     → Count of events, upcoming events, live events         │
│                                                             │
│  3. Organization Exhibitors                                 │
│     GET /api/exhibitors?organization_id={id}                │
│     → Total exhibitors across all events                    │
│                                                             │
│  4. Organization Visitors                                   │
│     GET /api/visitors?organization_id={id}                  │
│     → Total registered visitors                             │
│                                                             │
│  5. Organization Leads                                      │
│     GET /api/leads?organization_id={id}                     │
│     → Total leads captured by exhibitors                    │
│                                                             │
│  6. Scan Statistics                                         │
│     GET /api/scanned-visitors/stats?organization_id={id}    │
│     → QR scans, OCR scans, unique visitors                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 How to Build Organization Dashboard

### Step-by-Step Process:

```javascript
// Mobile App Implementation
const buildOrganizationDashboard = async (organizationId) => {
  
  // 1. Fetch all data in parallel (faster!)
  const [
    organizations,
    events,
    exhibitors,
    visitors,
    leads,
    scanStats
  ] = await Promise.all([
    fetch(`${API}/api/organizations`).then(r => r.json()),
    fetch(`${API}/api/events?organization_id=${organizationId}`).then(r => r.json()),
    fetch(`${API}/api/exhibitors?organization_id=${organizationId}`).then(r => r.json()),
    fetch(`${API}/api/visitors?organization_id=${organizationId}`).then(r => r.json()),
    fetch(`${API}/api/leads?organization_id=${organizationId}`).then(r => r.json()),
    fetch(`${API}/api/scanned-visitors/stats?organization_id=${organizationId}`).then(r => r.json())
  ]);

  // 2. Find this organization's data
  const organization = organizations.find(org => org.id === organizationId);

  // 3. Calculate statistics
  const stats = {
    totalEvents: events.length,
    activeEvents: events.filter(e => e.status === 'Published' || e.status === 'Live').length,
    upcomingEvents: events.filter(e => new Date(e.start_date) > new Date()).length,
    totalExhibitors: exhibitors.length,
    totalVisitors: visitors.length,
    totalLeads: leads.length,
    totalScans: scanStats.stats?.total_scans || 0,
    qrScans: scanStats.stats?.qr_scans || 0,
    ocrScans: scanStats.stats?.ocr_scans || 0
  };

  // 4. Build dashboard object
  return {
    organization,
    stats,
    events,
    exhibitors: exhibitors.slice(0, 5), // Recent 5
    visitors: visitors.slice(0, 5),     // Recent 5
    leads: leads.slice(0, 10),          // Recent 10
    scanStats: scanStats.stats
  };
};
```

---

## 📱 Complete Mobile Implementation

### React Native Example:

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://d3cgzphanxg4ax.cloudfront.net';

const OrganizationDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const orgId = await AsyncStorage.getItem('organizationId');
      
      // Fetch all data in parallel
      const [orgs, events, exhibitors, visitors, leads, scanStats] = 
        await Promise.all([
          fetch(`${API_BASE}/api/organizations`).then(r => r.json()),
          fetch(`${API_BASE}/api/events?organization_id=${orgId}`).then(r => r.json()),
          fetch(`${API_BASE}/api/exhibitors?organization_id=${orgId}`).then(r => r.json()),
          fetch(`${API_BASE}/api/visitors?organization_id=${orgId}`).then(r => r.json()),
          fetch(`${API_BASE}/api/leads?organization_id=${orgId}`).then(r => r.json()),
          fetch(`${API_BASE}/api/scanned-visitors/stats?organization_id=${orgId}`).then(r => r.json())
        ]);

      const organization = orgs.find(o => o.id === parseInt(orgId));

      // Calculate stats
      const now = new Date();
      const activeEvents = events.filter(e => 
        e.status === 'Published' || e.status === 'Live'
      );
      const upcomingEvents = events.filter(e => 
        new Date(e.start_date) > now
      );

      setDashboard({
        organization,
        stats: {
          totalEvents: events.length,
          activeEvents: activeEvents.length,
          upcomingEvents: upcomingEvents.length,
          totalExhibitors: exhibitors.length,
          totalVisitors: visitors.length,
          totalLeads: leads.length,
          totalScans: scanStats.stats?.total_scans || '0',
          qrScans: scanStats.stats?.qr_scans || '0',
          ocrScans: scanStats.stats?.ocr_scans || '0'
        },
        recentEvents: events.slice(0, 5),
        recentExhibitors: exhibitors.slice(0, 5),
        recentVisitors: visitors.slice(0, 5),
        recentLeads: leads.slice(0, 10)
      });

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <ScrollView style={{ padding: 16 }}>
      {/* Organization Header */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
          {dashboard?.organization?.org_name}
        </Text>
        <Text style={{ color: '#666' }}>
          {dashboard?.organization?.primary_email}
        </Text>
      </View>

      {/* Statistics Cards */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Quick Stats
        </Text>
        
        <StatCard 
          label="Total Events" 
          value={dashboard?.stats.totalEvents} 
          change={`${dashboard?.stats.activeEvents} active`}
        />
        <StatCard 
          label="Total Exhibitors" 
          value={dashboard?.stats.totalExhibitors} 
        />
        <StatCard 
          label="Registered Visitors" 
          value={dashboard?.stats.totalVisitors} 
        />
        <StatCard 
          label="Leads Captured" 
          value={dashboard?.stats.totalLeads} 
        />
        <StatCard 
          label="Total Scans" 
          value={dashboard?.stats.totalScans} 
          change={`${dashboard?.stats.qrScans} QR, ${dashboard?.stats.ocrScans} OCR`}
        />
      </View>

      {/* Recent Events */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Recent Events
        </Text>
        {dashboard?.recentEvents.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </View>

      {/* Recent Exhibitors */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Recent Exhibitors
        </Text>
        {dashboard?.recentExhibitors.map(exhibitor => (
          <ExhibitorCard key={exhibitor.id} exhibitor={exhibitor} />
        ))}
      </View>
    </ScrollView>
  );
};

// Helper Components
const StatCard = ({ label, value, change }) => (
  <View style={{ 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 8, 
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  }}>
    <Text style={{ fontSize: 14, color: '#666' }}>{label}</Text>
    <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>
      {value}
    </Text>
    {change && (
      <Text style={{ fontSize: 12, color: '#10b981', marginTop: 4 }}>
        {change}
      </Text>
    )}
  </View>
);

const EventCard = ({ event }) => (
  <View style={{ 
    backgroundColor: '#f8fafc', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 8 
  }}>
    <Text style={{ fontSize: 16, fontWeight: '600' }}>
      {event.event_name}
    </Text>
    <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
      {event.start_date} - {event.end_date}
    </Text>
    <Text style={{ fontSize: 12, color: '#10b981', marginTop: 4 }}>
      {event.status}
    </Text>
  </View>
);

const ExhibitorCard = ({ exhibitor }) => (
  <View style={{ 
    backgroundColor: '#f8fafc', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 8 
  }}>
    <Text style={{ fontSize: 16, fontWeight: '600' }}>
      {exhibitor.company_name}
    </Text>
    <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
      Stall: {exhibitor.stall_number} | {exhibitor.stall_category}
    </Text>
  </View>
);

export default OrganizationDashboard;
```

---

## 📊 Data Flow Diagram

```
┌──────────────────┐
│  Mobile App      │
│  (Organization   │
│   Dashboard)     │
└────────┬─────────┘
         │
         │ 1. Get organizationId from storage
         │
         ▼
┌────────────────────────────────────────────────────────┐
│  Parallel API Calls (6 requests simultaneously)        │
├────────────────────────────────────────────────────────┤
│  1. GET /api/organizations                             │
│  2. GET /api/events?organization_id=X                  │
│  3. GET /api/exhibitors?organization_id=X              │
│  4. GET /api/visitors?organization_id=X                │
│  5. GET /api/leads?organization_id=X                   │
│  6. GET /api/scanned-visitors/stats?organization_id=X  │
└────────┬───────────────────────────────────────────────┘
         │
         │ 2. Combine all responses
         │
         ▼
┌────────────────────────────────────────────────────────┐
│  Calculate Statistics                                  │
│  - Total events, active events, upcoming events        │
│  - Total exhibitors, visitors, leads                   │
│  - Scan statistics (QR, OCR)                           │
│  - Recent items (last 5-10)                            │
└────────┬───────────────────────────────────────────────┘
         │
         │ 3. Build dashboard object
         │
         ▼
┌────────────────────────────────────────────────────────┐
│  Display Dashboard UI                                  │
│  - Organization header                                 │
│  - Statistics cards                                    │
│  - Recent events list                                  │
│  - Recent exhibitors list                              │
│  - Recent visitors list                                │
└────────────────────────────────────────────────────────┘
```

---

## 🎯 Summary

### Dashboard Data Sources:

| Data | Endpoint | What It Provides |
|------|----------|------------------|
| **Organization Info** | `GET /api/organizations` | Name, email, plan, status |
| **Events** | `GET /api/events?organization_id=X` | All events for this org |
| **Exhibitors** | `GET /api/exhibitors?organization_id=X` | All exhibitors |
| **Visitors** | `GET /api/visitors?organization_id=X` | All visitors |
| **Leads** | `GET /api/leads?organization_id=X` | All leads captured |
| **Scan Stats** | `GET /api/scanned-visitors/stats?organization_id=X` | QR/OCR statistics |

### Key Points:

1. ✅ **No single "organization dashboard" endpoint** - you combine multiple endpoints
2. ✅ **Use parallel API calls** with `Promise.all()` for better performance
3. ✅ **Filter by organization_id** to get organization-specific data
4. ✅ **Calculate statistics** on the client side from the raw data
5. ✅ **Cache data** to reduce API calls (use React Query or similar)

---

*Dashboard Data Guide - Last Updated: 2026-01-28*
