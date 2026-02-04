# 📊 "Active Tenants" Dashboard Data - Code Explanation

## Where "Active Tenants" Comes From

Let me break down the code step by step:

---

## 🔍 Step-by-Step Code Explanation

### Step 1: Load Dashboard Data (Lines 59-101)

```javascript
const loadDashboardData = async () => {
    setDashboardLoading(true);
    setDashboardError('');
    try {
        // Helper function to parse API responses
        const parseResp = async (resp) => {
            const txt = await resp.clone().text();
            try { return JSON.parse(txt); } catch (e) { return txt; }
        };

        // 🔑 STEP 1: Make 4 API calls in parallel
        const [orgsResp, eventsResp, exhibitorsResp, visitorsResp] = await Promise.all([
            apiFetch('/api/organizations'),    // ← Get all organizations
            apiFetch('/api/events'),            // ← Get all events
            apiFetch('/api/exhibitors'),        // ← Get all exhibitors
            apiFetch('/api/visitors')           // ← Get all visitors
        ]);

        // 🔑 STEP 2: Parse all responses
        const [orgsData, eventsData, exhibitorsData, visitorsData] = await Promise.all([
            parseResp(orgsResp),
            parseResp(eventsResp),
            parseResp(exhibitorsResp),
            parseResp(visitorsResp)
        ]);

        // 🔑 STEP 3: Store data in state
        setDashboardOrgs(Array.isArray(orgsData) ? orgsData : []);
        setDashboardEvents(Array.isArray(eventsData) ? eventsData : []);
        setDashboardExhibitors(Array.isArray(exhibitorsData) ? exhibitorsData : []);
        setDashboardVisitors(Array.isArray(visitorsData) ? visitorsData : []);
    } catch (err) {
        console.error('Failed to load dashboard data', err);
    } finally {
        setDashboardLoading(false);
    }
};
```

---

### Step 2: Calculate "Active Tenants" Count (Line 167)

```javascript
// 🎯 THIS IS WHERE "ACTIVE TENANTS" COMES FROM!
const activeTenantsCount = dashboardOrgs.length;
```

**Explanation:**
- `dashboardOrgs` = Array of all organizations from `/api/organizations`
- `.length` = Count how many organizations exist
- **Result:** Number of organizations = "Active Tenants"

---

### Step 3: Display in UI (Line 197)

```javascript
<StatsCard 
    label="Active Tenants" 
    value={String(activeTenantsCount)}    // ← Shows the count
    change={dashboardLoading ? 'Loading...' : undefined} 
    icon={Building2} 
    colorClass="text-blue-500" 
/>
```

---

## 📊 Complete Data Flow

```
┌────────────────────────────────────────────────────────────┐
│  STEP 1: API Call                                          │
├────────────────────────────────────────────────────────────┤
│  apiFetch('/api/organizations')                            │
│  ↓                                                          │
│  Returns: [                                                │
│    { id: 1, org_name: "ABC Org", ... },                    │
│    { id: 2, org_name: "XYZ Org", ... },                    │
│    { id: 3, org_name: "123 Org", ... },                    │
│    ...                                                      │
│  ]                                                          │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│  STEP 2: Store in State                                    │
├────────────────────────────────────────────────────────────┤
│  setDashboardOrgs(orgsData)                                │
│  ↓                                                          │
│  dashboardOrgs = [org1, org2, org3, ...]                   │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│  STEP 3: Calculate Count                                   │
├────────────────────────────────────────────────────────────┤
│  const activeTenantsCount = dashboardOrgs.length           │
│  ↓                                                          │
│  activeTenantsCount = 248  (example)                       │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│  STEP 4: Display in UI                                     │
├────────────────────────────────────────────────────────────┤
│  <StatsCard                                                │
│    label="Active Tenants"                                  │
│    value="248"                                             │
│  />                                                         │
└────────────────────────────────────────────────────────────┘
```

---

## 🎯 All Dashboard Stats Explained

Here's where EACH stat comes from:

```javascript
// Line 167-170 in Index.jsx
const activeTenantsCount = dashboardOrgs.length;           // ← Organizations count
const activeEventsCount = dashboardEvents.length;          // ← Events count
const totalExhibitorsCount = dashboardExhibitors.length;   // ← Exhibitors count
const totalVisitorsCount = dashboardVisitors.length;       // ← Visitors count
```

### Stats Breakdown:

| Stat Card | Value Comes From | API Endpoint | Calculation |
|-----------|------------------|--------------|-------------|
| **Active Tenants** | `dashboardOrgs.length` | `GET /api/organizations` | Count of all organizations |
| **Active Events** | `dashboardEvents.length` | `GET /api/events` | Count of all events |
| **Total Exhibitors** | `dashboardExhibitors.length` | `GET /api/exhibitors` | Count of all exhibitors |
| **Registered Visitors** | `dashboardVisitors.length` | `GET /api/visitors` | Count of all visitors |
| **Leads Captured** | `"18,429"` | ❌ Hardcoded | Static mock data |
| **Messages Sent** | `"45,621"` | ❌ Hardcoded | Static mock data |
| **Revenue (MTD)** | `"₹12.4L"` | ❌ Hardcoded | Static mock data |
| **Active Users** | `"892"` | ❌ Hardcoded | Static mock data |

---

## 🔄 When Does This Load?

```javascript
// Line 108-112
useEffect(() => {
    if (activeScreen === 'dashboard' && userType !== 'exhibitor') {
        loadDashboardData();  // ← Loads when dashboard is active
    }
}, [activeScreen, userType]);
```

**Triggers:**
1. ✅ When user navigates to dashboard screen
2. ✅ When component first mounts (if dashboard is default)
3. ✅ Only for non-exhibitor users (master/organization)

---

## 📱 For Mobile App - How to Get "Active Tenants"

```javascript
// Mobile App Implementation
const getActiveTenants = async () => {
  // 1. Call the organizations API
  const response = await fetch(`${API_BASE}/api/organizations`);
  const organizations = await response.json();
  
  // 2. Count the organizations
  const activeTenantsCount = organizations.length;
  
  // 3. Display in UI
  return activeTenantsCount;
};

// Example Usage
const Dashboard = () => {
  const [activeTenants, setActiveTenants] = useState(0);
  
  useEffect(() => {
    const loadData = async () => {
      const count = await getActiveTenants();
      setActiveTenants(count);
    };
    loadData();
  }, []);
  
  return (
    <View>
      <Text>Active Tenants: {activeTenants}</Text>
    </View>
  );
};
```

---

## 🎨 Visual Representation

```
API Response from /api/organizations:
┌─────────────────────────────────────┐
│ [                                   │
│   { id: 1, org_name: "ABC Org" },   │  ← Organization 1
│   { id: 2, org_name: "XYZ Org" },   │  ← Organization 2
│   { id: 3, org_name: "123 Org" },   │  ← Organization 3
│   ...                               │
│   { id: 248, org_name: "..." }      │  ← Organization 248
│ ]                                   │
└─────────────────────────────────────┘
           ↓
    .length = 248
           ↓
┌─────────────────────────────────────┐
│  Dashboard UI                       │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │ 🏢 Active Tenants           │    │
│  │                             │    │
│  │        248                  │    │  ← Displayed here!
│  │                             │    │
│  │ +12 this month              │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

---

## 🔑 Key Takeaways

1. **"Active Tenants"** = Total count of organizations in the database
2. **Data Source**: `GET /api/organizations` endpoint
3. **Calculation**: Simple `.length` on the array
4. **Real-time**: Fetched fresh every time dashboard loads
5. **Not hardcoded**: Unlike "Leads Captured" which is static mock data

---

## 💡 For Organization-Specific Dashboard

If you want to show stats for a **specific organization** (not all):

```javascript
// Filter data by organization ID
const organizationId = localStorage.getItem('organizationId');

const myEvents = dashboardEvents.filter(e => 
  e.organization_id === parseInt(organizationId)
);

const myExhibitors = dashboardExhibitors.filter(e => 
  e.organization_id === parseInt(organizationId)
);

// Then display
const myEventsCount = myEvents.length;
const myExhibitorsCount = myExhibitors.length;
```

---

*Code Explanation - Last Updated: 2026-01-28*
