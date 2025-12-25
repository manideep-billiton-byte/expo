import React, { useState } from 'react';
import { Eye, User, Info, Search, Download, MoreHorizontal } from 'lucide-react';

const VisitorsManagement = () => {
    const [activeTab, setActiveTab] = useState('All Visitors');
    const [searchQuery, setSearchQuery] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    const tabs = ['All Visitors', 'Registered', 'Check-In', 'QR & Pass', 'Check-Out'];

    const visitors = [
        { name: 'Arun Verma', contact: { email: 'arun.v***@gmail.com', phone: '+91 9****21045' }, events: '5 attended', lastEvent: 'TechExpo 2024', consent: 'Check-In', date: '1/5/2024', registered: 'Mobile', checkIn: '10:55:23', checkOut: '2:25:13' },
        { name: 'Arun Verma', contact: { email: 'arun.v***@gmail.com', phone: '+91 9****21045' }, events: '5 attended', lastEvent: 'TechExpo 2024', consent: 'Check-In', date: '1/5/2024', registered: 'Mobile', checkIn: '10:55:23', checkOut: '2:25:13' },
        { name: 'Arun Verma', contact: { email: 'arun.v***@gmail.com', phone: '+91 9****21045' }, events: '5 attended', lastEvent: 'TechExpo 2024', consent: 'Check-Out', date: '1/5/2024', registered: 'Mobile', checkIn: '10:55:23', checkOut: '2:25:13' },
        { name: 'Arun Verma', contact: { email: 'arun.v***@gmail.com', phone: '+91 9****21045' }, events: '5 attended', lastEvent: 'TechExpo 2024', consent: 'Check-In', date: '1/5/2024', registered: 'Mobile', checkIn: '10:55:23', checkOut: '2:25:13' },
        { name: 'Arun Verma', contact: { email: 'arun.v***@gmail.com', phone: '+91 9****21045' }, events: '5 attended', lastEvent: 'TechExpo 2024', consent: 'Check-In', date: '1/5/2024', registered: 'Mobile', checkIn: '10:55:23', checkOut: '2:25:13' },
    ];

    const getConsentBadge = (consent) => {
        const statusStyles = {
            'Check-In': 'badge-live',
            'Check-Out': 'badge-draft'
        };
        return statusStyles[consent] || 'badge-draft';
    };

    return (
        <div className="dashboard-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }} className="fade-in">
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>Visitors Management</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Privacy-safe visitor data management across events</p>
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                    <Download size={16} />
                    Export Report
                </button>
            </div>

            {/* Privacy Notice */}
            <div style={{
                background: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '28px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }} className="fade-in">
                <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Info size={18} color="#3b82f6" />
                </div>
                <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b', marginBottom: '4px' }}>Privacy-Safe View</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                        Personal data is masked for privacy compliance. Full details require authorized access and audit logging.
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }} className="fade-in">
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Total Visitors</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>6</div>
                        </div>
                        <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Eye size={20} color="#2563eb" />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Check-In</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>5</div>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Check-Out</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>2</div>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>VIP Guests</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>2</div>
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
                            placeholder="Search Visitor..."
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
                                <th>VISITOR</th>
                                <th>CONTACT (MASKED)</th>
                                <th>EVENTS</th>
                                <th>CONSENT</th>
                                <th>DATE</th>
                                <th>REGISTERED</th>
                                <th>CHECK IN TIME</th>
                                <th>CHECK OUT TIME</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visitors.map((visitor, idx) => (
                                <tr key={idx} className="hover-lift">
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                background: 'rgba(37, 99, 235, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <User size={18} color="#2563eb" />
                                            </div>
                                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{visitor.name}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                                            <span>📧</span>
                                            <span>{visitor.contact.email}</span>
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                            <span>📞</span>
                                            <span>{visitor.contact.phone}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{visitor.events}</div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>Last: {visitor.lastEvent}</div>
                                    </td>
                                    <td>
                                        <span className={`badge ${getConsentBadge(visitor.consent)}`}>
                                            {visitor.consent}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '13px', color: '#64748b' }}>{visitor.date}</td>
                                    <td style={{ color: '#475569' }}>{visitor.registered}</td>
                                    <td style={{ fontSize: '13px', color: '#64748b' }}>{visitor.checkIn}</td>
                                    <td style={{ fontSize: '13px', color: '#64748b' }}>{visitor.checkOut}</td>
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

export default VisitorsManagement;
