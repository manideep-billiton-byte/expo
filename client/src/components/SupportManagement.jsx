import React, { useState } from 'react';
import { Headphones, Clock, CheckCircle2, TrendingUp, Search, Plus, Eye } from 'lucide-react';

const SupportManagement = () => {
    const [activeTab, setActiveTab] = useState('All Tickets');
    const [searchQuery, setSearchQuery] = useState('');

    const tabs = ['All Tickets', 'Open', 'In Progress', 'Resolved', 'Knowledge Base'];

    const supportTickets = [
        {
            id: 'TKT-001',
            subject: 'Unable to access event dashboard',
            issue: 'Login Issue',
            organization: 'TechCorp India',
            tenant: 'Tech Corp',
            priority: 'Critical',
            status: 'Active',
            created: '2 hours ago'
        },
        {
            id: 'TKT-002',
            subject: 'WhatsApp integration not working',
            issue: 'Integration',
            organization: 'StartupHub',
            tenant: 'Startup',
            priority: 'High',
            status: 'Pending',
            created: '4 hours ago'
        },
        {
            id: 'TKT-003',
            subject: 'Invoice generation query',
            issue: 'Billing',
            organization: 'EventPro Solutions',
            tenant: 'Event Pro',
            priority: 'Low',
            status: 'Active',
            created: '1 day ago'
        },
        {
            id: 'TKT-004',
            subject: 'Feature request: Bulk visitor import',
            issue: 'Feature Request',
            organization: 'Industrial Assoc.',
            tenant: 'Ind Assoc',
            priority: 'Medium',
            status: 'Pending',
            created: '2 days ago'
        },
        {
            id: 'TKT-005',
            subject: 'QR scanner not reading codes',
            issue: 'Technical',
            organization: 'MSME Connect',
            tenant: 'MSME',
            priority: 'High',
            status: 'Completed',
            created: '3 days ago'
        }
    ];

    const getPriorityBadge = (priority) => {
        const styles = {
            'Critical': { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
            'High': { bg: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' },
            'Medium': { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
            'Low': { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }
        };
        const style = styles[priority] || styles['Medium'];
        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                background: style.bg,
                color: style.color
            }}>
                {priority}
            </span>
        );
    };

    const getStatusBadge = (status) => {
        if (status === 'Active') return 'badge-live';
        if (status === 'Completed') return 'badge-live';
        return 'badge-draft';
    };

    return (
        <div className="dashboard-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }} className="fade-in">
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>Support Management</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Manage support tickets, incidents, and knowledge base</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563eb', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: 'white', cursor: 'pointer' }}>
                        <Plus size={16} />
                        New Ticket
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }} className="fade-in">
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>OPEN TICKETS</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>23</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>5 critical</div>
                        </div>
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Headphones size={20} color="#ef4444" />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>AVG. RESOLUTION</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>4.2h</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>-10% this week</div>
                        </div>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Clock size={20} color="#3b82f6" />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>SLA COMPLIANCE</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>94.5%</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Target 95%</div>
                        </div>
                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <CheckCircle2 size={20} color="#22c55e" />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>RESOLVED TODAY</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>18</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>+4 from yesterday</div>
                        </div>
                        <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <TrendingUp size={20} color="#06b6d4" />
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
                            placeholder="Search tickets..."
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
                            <option>ALL</option>
                            <option>Critical</option>
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
                        </select>
                    </div>
                </div>

                {/* Support Tickets Table */}
                <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Headphones size={18} color="#2563eb" />
                        Support Tickets
                        <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>5 Tickets</span>
                    </h3>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>TICKET #</th>
                                    <th>SUBJECT</th>
                                    <th>ORGANIZATION</th>
                                    <th>PRIORITY</th>
                                    <th>STATUS</th>
                                    <th>CREATED</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {supportTickets.map((ticket, idx) => (
                                    <tr key={idx} className="hover-lift">
                                        <td style={{ fontWeight: 600, color: '#475569' }}>{ticket.id}</td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{ticket.subject}</div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{ticket.issue}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{ticket.organization}</div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{ticket.tenant}</div>
                                        </td>
                                        <td>{getPriorityBadge(ticket.priority)}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '13px', color: '#64748b' }}>{ticket.created}</td>
                                        <td>
                                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                                <Eye size={18} color="#64748b" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '32px', paddingBottom: '24px' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Powered By Billiton</p>
            </div>
        </div>
    );
};

export default SupportManagement;
