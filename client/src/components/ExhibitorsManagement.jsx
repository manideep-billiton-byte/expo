import React, { useState } from 'react';
import { Image, TrendingUp, Users, UserCheck, Search, Download, Plus, MoreHorizontal } from 'lucide-react';

const ExhibitorsManagement = () => {
    const [activeTab, setActiveTab] = useState('All Exhibitors');
    const [searchQuery, setSearchQuery] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    const tabs = ['All Exhibitors', 'Active', 'Pending', 'Stalls', 'Leads'];

    const exhibitors = [
        { id: 'HC456789', company: 'ABC Company', email: 'admin@techevents.com', status: 'Active', event: 'ABC Event', tenant: 'XYZ ORG', leads: '1233', staff: '1500', lastActive: '2/20/2024', lastDate: '12/17/2024' },
        { id: 'HC456789', company: 'ABC Company', email: 'admin@techevents.com', status: 'Active', event: 'ABC Event', tenant: 'XYZ ORG', leads: '1233', staff: '1500', lastActive: '2/20/2024', lastDate: '12/17/2024' },
        { id: 'HC456789', company: 'ABC Company', email: 'admin@techevents.com', status: 'Inactive', event: 'ABC Event', tenant: 'XYZ ORG', leads: '1233', staff: '1500', lastActive: '2/20/2024', lastDate: '12/17/2024' },
        { id: 'HC456789', company: 'ABC Company', email: 'admin@techevents.com', status: 'Active', event: 'ABC Event', tenant: 'XYZ ORG', leads: '1233', staff: '1500', lastActive: '2/20/2024', lastDate: '12/17/2024' },
        { id: 'HC456789', company: 'ABC Company', email: 'admin@techevents.com', status: 'Inactive', event: 'ABC Event', tenant: 'XYZ ORG', leads: '1233', staff: '1500', lastActive: '2/20/2024', lastDate: '12/17/2024' },
        { id: 'HC456789', company: 'ABC Company', email: 'admin@techevents.com', status: 'Active', event: 'ABC Event', tenant: 'XYZ ORG', leads: '1233', staff: '1500', lastActive: '2/20/2024', lastDate: '12/17/2024' },
    ];

    const getStatusBadge = (status) => {
        const statusStyles = {
            'Active': 'badge-live',
            'Inactive': 'badge-draft'
        };
        return statusStyles[status] || 'badge-draft';
    };

    return (
        <div className="dashboard-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }} className="fade-in">
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>Exhibitors Management</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Manage exhibitors, their staff and lead capture</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                        <Download size={16} />
                        Export
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563eb', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: 'white', cursor: 'pointer' }}>
                        <Plus size={16} />
                        Add Exhibitors
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }} className="fade-in">
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Total Exhibitors</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>11</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Right Now</div>
                        </div>
                        <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Image size={20} color="#06b6d4" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
                        <TrendingUp size={14} />
                        +80%
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Active</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>03</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Currently Running</div>
                        </div>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Image size={20} color="#3b82f6" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
                        <TrendingUp size={14} />
                        +8.4%
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Total Leads</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>233</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Right Now</div>
                        </div>
                        <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Users size={20} color="#2563eb" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
                        <TrendingUp size={14} />
                        +8.4%
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Staff Members</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>23</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Right Now</div>
                        </div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <UserCheck size={20} color="#10b981" />
                        </div>
                    </div>
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
                            placeholder="Search Exhibitors..."
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
                                <th>EXHIBITOR ID</th>
                                <th>COMPANY</th>
                                <th>STATUS</th>
                                <th>EVENT</th>
                                <th>TENANT</th>
                                <th>LEADS</th>
                                <th>STAFF</th>
                                <th>LAST ACTIVE</th>
                                <th>LAST DATE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exhibitors.map((exhibitor, idx) => (
                                <tr key={idx} className="hover-lift">
                                    <td style={{ fontWeight: 600, color: '#475569' }}>{exhibitor.id}</td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{exhibitor.company}</div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{exhibitor.email}</div>
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(exhibitor.status)}`}>
                                            {exhibitor.status}
                                        </span>
                                    </td>
                                    <td style={{ color: '#475569' }}>{exhibitor.event}</td>
                                    <td style={{ color: '#475569' }}>{exhibitor.tenant}</td>
                                    <td style={{ fontWeight: 600 }}>{exhibitor.leads}</td>
                                    <td style={{ fontWeight: 600 }}>{exhibitor.staff}</td>
                                    <td style={{ fontSize: '13px', color: '#64748b' }}>{exhibitor.lastActive}</td>
                                    <td style={{ fontSize: '13px', color: '#64748b' }}>{exhibitor.lastDate}</td>
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

export default ExhibitorsManagement;
