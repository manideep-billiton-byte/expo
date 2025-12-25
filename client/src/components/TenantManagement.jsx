import React, { useState } from 'react';
import { Building2, Search, Download, Plus, MoreHorizontal } from 'lucide-react';

const TenantManagement = () => {
    const [activeTab, setActiveTab] = useState('All Tenants');
    const [searchQuery, setSearchQuery] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    const tabs = ['All Tenants', 'Active', 'Pending', 'Suspended', 'Plans'];

    const tenants = [
        { id: 'EM456789', name: 'TechEvents Inc.', email: 'admin@techevents.com', status: 'Active', plan: 'Started', events: '13', exhibitors: '1500', createdDate: '2/20/2024', lastDate: '12/17/2024' },
        { id: 'EM456789', name: 'TechEvents Inc.', email: 'admin@techevents.com', status: 'Active', plan: 'Started', events: '13', exhibitors: '1500', createdDate: '2/20/2024', lastDate: '12/17/2024' },
        { id: 'EM456789', name: 'TechEvents Inc.', email: 'admin@techevents.com', status: 'Inactive', plan: 'Advanced', events: '13', exhibitors: '1500', createdDate: '2/20/2024', lastDate: '12/17/2024' },
        { id: 'EM456789', name: 'TechEvents Inc.', email: 'admin@techevents.com', status: 'Suspended', plan: 'Started', events: '13', exhibitors: '1500', createdDate: '2/20/2024', lastDate: '12/17/2024' },
        { id: 'EM456789', name: 'TechEvents Inc.', email: 'admin@techevents.com', status: 'Active', plan: 'Started', events: '13', exhibitors: '1500', createdDate: '2/20/2024', lastDate: '12/17/2024' },
        { id: 'EM456789', name: 'TechEvents Inc.', email: 'admin@techevents.com', status: 'Active', plan: 'Started', events: '13', exhibitors: '1500', createdDate: '2/20/2024', lastDate: '12/17/2024' },
        { id: 'EM456789', name: 'TechEvents Inc.', email: 'admin@techevents.com', status: 'Suspended', plan: 'Started', events: '13', exhibitors: '1500', createdDate: '2/20/2024', lastDate: '12/17/2024' },
        { id: 'EM456789', name: 'TechEvents Inc.', email: 'admin@techevents.com', status: 'Active', plan: 'Started', events: '13', exhibitors: '1500', createdDate: '2/20/2024', lastDate: '12/17/2024' },
        { id: 'EM456789', name: 'TechEvents Inc.', email: 'admin@techevents.com', status: 'Inactive', plan: 'Started', events: '13', exhibitors: '1500', createdDate: '2/20/2024', lastDate: '12/17/2024' },
    ];

    const getStatusBadge = (status) => {
        const statusStyles = {
            'Active': 'badge-live',
            'Inactive': 'badge-draft',
            'Suspended': 'badge-upcoming'
        };
        return statusStyles[status] || 'badge-draft';
    };

    return (
        <div className="dashboard-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }} className="fade-in">
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>Tenant Management</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Manage all platform tenants, their subscriptions and access</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                        <Download size={16} />
                        Export
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563eb', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: 'white', cursor: 'pointer' }}>
                        <Plus size={16} />
                        Add Tenant
                    </button>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="card fade-in">
                {/* Tabs */}
                <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #f1f5f9', marginBottom: '24px' }}>
                    {tabs.map((tab) => (
                        <div
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '12px 20px',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: activeTab === tab ? '#2563eb' : '#64748b',
                                borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab}
                        </div>
                    ))}
                </div>

                {/* Search and Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ position: 'relative', width: '320px' }}>
                        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search tenants..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px 10px 44px',
                                border: '1.5px solid #e2e8f0',
                                borderRadius: '10px',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>Show</span>
                        <select
                            value={entriesPerPage}
                            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                            style={{
                                padding: '8px 12px',
                                border: '1.5px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#475569',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>entries</span>
                    </div>
                </div>

                {/* Table */}
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>TENANT ID</th>
                                <th>TENANT NAME</th>
                                <th>STATUS</th>
                                <th>PLAN</th>
                                <th>EVENTS</th>
                                <th>EXHIBITORS</th>
                                <th>CREATED DATE</th>
                                <th>LAST DATE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tenants.map((tenant, idx) => (
                                <tr key={idx} className="hover-lift">
                                    <td style={{ fontWeight: 600, color: '#475569' }}>{tenant.id}</td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{tenant.name}</div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{tenant.email}</div>
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(tenant.status)}`}>
                                            {tenant.status}
                                        </span>
                                    </td>
                                    <td style={{ color: '#475569' }}>{tenant.plan}</td>
                                    <td style={{ fontWeight: 600 }}>{tenant.events}</td>
                                    <td style={{ fontWeight: 600 }}>{tenant.exhibitors}</td>
                                    <td style={{ fontSize: '13px', color: '#64748b' }}>{tenant.createdDate}</td>
                                    <td style={{ fontSize: '13px', color: '#64748b' }}>{tenant.lastDate}</td>
                                    <td>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                            <MoreHorizontal size={18} color="#64748b" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                        Showing 1 to 9 of 9 entries
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ padding: '8px 12px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '6px', fontSize: '13px', color: '#64748b', cursor: 'pointer' }}>«</button>
                        <button style={{ padding: '8px 12px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '6px', fontSize: '13px', color: '#64748b', cursor: 'pointer' }}>‹</button>
                        <button style={{ padding: '8px 14px', border: '1px solid #2563eb', background: '#2563eb', borderRadius: '6px', fontSize: '13px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>1</button>
                        <button style={{ padding: '8px 12px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '6px', fontSize: '13px', color: '#64748b', cursor: 'pointer' }}>›</button>
                        <button style={{ padding: '8px 12px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '6px', fontSize: '13px', color: '#64748b', cursor: 'pointer' }}>»</button>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '32px', paddingBottom: '24px' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Powered By Billiton</p>
            </div>
        </div>
    );
};

export default TenantManagement;
