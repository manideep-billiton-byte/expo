import React, { useState } from 'react';
import { Calendar, TrendingUp, FileText, Send, Search, Download, Plus, MoreHorizontal } from 'lucide-react';

const EventManagement = () => {
    const [activeTab, setActiveTab] = useState('All Events');
    const [searchQuery, setSearchQuery] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    const tabs = ['All Events', 'Active', 'Pending', 'Upcoming', 'Cancelled'];

    const events = [
        { id: 'HC456789', name: 'Tech Summit 2025', email: 'admin@techevents.com', status: 'Live', venue: 'Hyderabad - KPHB', exhibitors: '1233', visitors: '1500', createdDate: '2/20/2024', lastDate: '12/17/2024' },
        { id: 'HC456789', name: 'TechEvents Inc.', email: 'admin@techevents.com', status: 'Draft', venue: 'Kakinada , Sarjanapuram', exhibitors: '2933', visitors: '1500', createdDate: '2/20/2024', lastDate: '12/17/2024' },
        { id: 'HC456789', name: 'TechEvents Inc.', email: 'admin@techevents.com', status: 'Completed', venue: 'Jaggampeta, Bus stand', exhibitors: '1333', visitors: '1500', createdDate: '2/20/2024', lastDate: '12/17/2024' },
        { id: 'HC456789', name: 'TechEvents Inc.', email: 'admin@techevents.com', status: 'Upcoming', venue: 'Visakhapatnam', exhibitors: '3433', visitors: '1500', createdDate: '2/20/2024', lastDate: '12/17/2024' },
        { id: 'HC456789', name: 'ABC Events', email: 'admin@techevents.com', status: 'Live', venue: 'Hyderabad', exhibitors: '1322', visitors: '1500', createdDate: '2/20/2024', lastDate: '12/17/2024' },
        { id: 'HC456789', name: 'TechEvents Inc.', email: 'admin@techevents.com', status: 'Draft', venue: 'Kakinada Town', exhibitors: '1343', visitors: '1500', createdDate: '2/20/2024', lastDate: '12/17/2024' },
    ];

    const getStatusBadge = (status) => {
        const statusStyles = {
            'Live': 'badge-live',
            'Draft': 'badge-draft',
            'Completed': 'badge-done',
            'Upcoming': 'badge-upcoming'
        };
        return statusStyles[status] || 'badge-draft';
    };

    return (
        <div className="dashboard-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }} className="fade-in">
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>Event Management</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Manage all events across tenants</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                        <Download size={16} />
                        Export
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563eb', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: 'white', cursor: 'pointer' }}>
                        <Plus size={16} />
                        Add Event
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }} className="fade-in">
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Total Events</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>06</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Right now</div>
                        </div>
                        <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Calendar size={20} color="#2563eb" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
                        <TrendingUp size={14} />
                        +12%
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Live Now</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>03</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Currently running</div>
                        </div>
                        <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Send size={20} color="#06b6d4" />
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
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Upcoming</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>01</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Right Now</div>
                        </div>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <FileText size={20} color="#3b82f6" />
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
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Completed</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>02</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Right Now</div>
                        </div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <FileText size={20} color="#10b981" />
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
                            placeholder="Search Events..."
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
                                <th>EVENT ID</th>
                                <th>EVENT NAME</th>
                                <th>STATUS</th>
                                <th>VENUE</th>
                                <th>EXHIBITORS</th>
                                <th>VISITORS</th>
                                <th>CREATED DATE</th>
                                <th>LAST DATE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((event, idx) => (
                                <tr key={idx} className="hover-lift">
                                    <td style={{ fontWeight: 600, color: '#475569' }}>{event.id}</td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{event.name}</div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{event.email}</div>
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(event.status)}`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td style={{ color: '#475569' }}>{event.venue}</td>
                                    <td style={{ fontWeight: 600 }}>{event.exhibitors}</td>
                                    <td style={{ fontWeight: 600 }}>{event.visitors}</td>
                                    <td style={{ fontSize: '13px', color: '#64748b' }}>{event.createdDate}</td>
                                    <td style={{ fontSize: '13px', color: '#64748b' }}>{event.lastDate}</td>
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

export default EventManagement;
