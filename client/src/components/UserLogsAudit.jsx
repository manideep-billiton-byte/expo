import React, { useState } from 'react';
import { FileText, Activity, LogIn, Database, Search, Download, RefreshCw } from 'lucide-react';

const UserLogsAudit = () => {
    const [activeTab, setActiveTab] = useState('All Logs');
    const [searchQuery, setSearchQuery] = useState('');

    const tabs = ['All Logs', 'User Sessions', 'Data Changes', 'System Events', 'Security'];

    const activityTimeline = [
        {
            action: 'Login',
            description: 'Successful login',
            timestamp: '2024-12-30 09:22',
            ip: '192.168.1.105',
            status: 'Active',
            module: 'Authentication',
            actor: 'John Admin',
            role: 'Super Admin'
        },
        {
            action: 'Viewed Dashboard',
            description: 'Accessed main dashboard',
            timestamp: '2024-12-30 09:24',
            ip: '192.168.1.105',
            status: 'Active',
            module: 'Control Room',
            actor: 'John Admin',
            role: 'Super Admin'
        },
        {
            action: 'Created Event',
            description: 'Created "Tech Summit 2025"',
            timestamp: '2024-12-30 10:15',
            ip: '197.168.1.105',
            status: 'Active',
            module: 'Events',
            actor: 'John Admin',
            role: 'Super Admin'
        },
        {
            action: 'Updated User',
            description: 'Changed role for user "sarah@example.com"',
            timestamp: '2024-12-30 11:08',
            ip: '197.168.1.105',
            status: 'Active',
            module: 'Users',
            actor: 'John Admin',
            role: 'Super Admin'
        }
    ];

    const getActionIcon = (action) => {
        if (action === 'Login') return <LogIn size={16} color="#22c55e" />;
        if (action === 'Viewed Dashboard') return <Activity size={16} color="#3b82f6" />;
        if (action === 'Created Event') return <FileText size={16} color="#f59e0b" />;
        if (action === 'Updated User') return <Database size={16} color="#8b5cf6" />;
        return <Activity size={16} color="#64748b" />;
    };

    const getActionColor = (action) => {
        if (action === 'Login') return '#dcfce7';
        if (action === 'Viewed Dashboard') return '#dbeafe';
        if (action === 'Created Event') return '#fef3c7';
        if (action === 'Updated User') return '#ede9fe';
        return '#f1f5f9';
    };

    return (
        <div className="dashboard-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }} className="fade-in">
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>User Logs & Audit</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Track all user activities, login events, and system changes</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                        <Download size={16} />
                        Export Logs
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }} className="fade-in">
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>TOTAL LOGS TODAY</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>2,847</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>-18% this hour</div>
                        </div>
                        <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <FileText size={20} color="#06b6d4" />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>ACTIVE SESSIONS</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>892</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Users online now</div>
                        </div>
                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Activity size={20} color="#22c55e" />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>LOGIN EVENTS</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>456</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>+32 this hour</div>
                        </div>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <LogIn size={20} color="#3b82f6" />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>DATA CHANGES</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>1,245</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>CRUD operations</div>
                        </div>
                        <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Database size={20} color="#fbbf24" />
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
                            placeholder="Search logs..."
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
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <select style={{ padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontWeight: 500, color: '#475569', outline: 'none', cursor: 'pointer', background: 'white' }}>
                            <option>All Actors</option>
                            <option>John Admin</option>
                            <option>Sarah Manager</option>
                        </select>
                        <select style={{ padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontWeight: 500, color: '#475569', outline: 'none', cursor: 'pointer', background: 'white' }}>
                            <option>All Modules</option>
                            <option>Authentication</option>
                            <option>Events</option>
                            <option>Users</option>
                        </select>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                            <Download size={16} />
                            Export
                        </button>
                    </div>
                </div>

                {/* Activity Timeline */}
                <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={18} color="#2563eb" />
                        Activity Timeline
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {activityTimeline.map((activity, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: getActionColor(activity.action),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {getActionIcon(activity.action)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{activity.action}</div>
                                            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{activity.description}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span className="badge badge-live">{activity.status}</span>
                                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{activity.actor}</span>
                                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{activity.role}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                                        <span>📅 {activity.timestamp}</span>
                                        <span>🌐 {activity.ip}</span>
                                        <span>📦 {activity.module}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '32px', paddingBottom: '24px' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Powered By Billiton</p>
            </div>
        </div>
    );
};

export default UserLogsAudit;
