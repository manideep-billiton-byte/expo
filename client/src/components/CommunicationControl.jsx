import React, { useState } from 'react';
import { Send, MessageSquare, Mail, Smartphone, TrendingUp, TrendingDown, MoreHorizontal, Plus } from 'lucide-react';

const CommunicationControl = () => {
    const [activeTab, setActiveTab] = useState('Overview');

    const tabs = ['Overview', 'WhatsApp', 'Email', 'SMS', 'Templates', 'Logs'];

    const channelStatus = [
        { name: 'WhatsApp Business API', status: 'Active', meta: 'Meta • 24281991' },
        { name: 'Email Service', status: 'Active', meta: 'AWS SES' },
        { name: 'SMS Gateway', status: 'Active', meta: 'Twilio' }
    ];

    const messageTemplates = [
        { template: 'Welcome Message', channel: 'WhatsApp', category: 'Onboarding', status: 'Active' },
        { template: 'Event Reminder', channel: 'WhatsApp', category: 'Notification', status: 'Active' },
        { template: 'Lead Captured', channel: 'Email', category: 'Transactional', status: 'Active' },
        { template: 'Registration Confirmed', channel: 'SMS', category: 'Transactional', status: 'Active' }
    ];

    const recentMessages = [
        { recipient: '+91 98745 43210', channel: 'WhatsApp', template: 'Welcome Message', status: 'Delivered', time: '2 min ago' },
        { recipient: 'user@example.com', channel: 'Email', template: 'Event Reminder', status: 'Delivered', time: '5 min ago' }
    ];

    return (
        <div className="dashboard-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }} className="fade-in">
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>Communication Control</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Manage messaging channels, templates, and delivery</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }} className="fade-in">
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>MESSAGES TODAY</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>4,521</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>+12% vs yesterday</div>
                        </div>
                        <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Send size={20} color="#06b6d4" />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>WHATSAPP DELIVERED</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>98.5%</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Excellent rate</div>
                        </div>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <MessageSquare size={20} color="#3b82f6" />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>EMAIL OPEN RATE</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>42%</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>+1.5% this week</div>
                        </div>
                        <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Mail size={20} color="#2563eb" />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>SMS DELIVERED</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>95.2%</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Good rate</div>
                        </div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Smartphone size={20} color="#10b981" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
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

                {/* Channel Status */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MessageSquare size={18} color="#2563eb" />
                            Channel Status
                        </h3>
                    </div>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {channelStatus.map((channel, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{channel.name}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{channel.meta}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span className="badge badge-live">{channel.status}</span>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                        <MoreHorizontal size={18} color="#64748b" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Message Templates */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Send size={18} color="#2563eb" />
                            Message Templates
                        </h3>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#2563eb', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'white', cursor: 'pointer' }}>
                            <Plus size={16} />
                            Add Template
                        </button>
                    </div>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>TEMPLATE</th>
                                    <th>CHANNEL</th>
                                    <th>CATEGORY</th>
                                    <th>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {messageTemplates.map((template, idx) => (
                                    <tr key={idx} className="hover-lift">
                                        <td style={{ fontWeight: 600, color: '#1e293b' }}>{template.template}</td>
                                        <td>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                background: template.channel === 'WhatsApp' ? 'rgba(34, 197, 94, 0.1)' : template.channel === 'Email' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                                                color: template.channel === 'WhatsApp' ? '#22c55e' : template.channel === 'Email' ? '#3b82f6' : '#fbbf24'
                                            }}>
                                                {template.channel}
                                            </span>
                                        </td>
                                        <td style={{ color: '#475569' }}>{template.category}</td>
                                        <td>
                                            <span className="badge badge-live">{template.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Messages */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Send size={18} color="#2563eb" />
                            Recent Messages
                        </h3>
                    </div>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>RECIPIENT</th>
                                    <th>CHANNEL</th>
                                    <th>TEMPLATE</th>
                                    <th>STATUS</th>
                                    <th>TIME</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentMessages.map((message, idx) => (
                                    <tr key={idx} className="hover-lift">
                                        <td style={{ fontWeight: 600, color: '#1e293b' }}>{message.recipient}</td>
                                        <td>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                background: message.channel === 'WhatsApp' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                                color: message.channel === 'WhatsApp' ? '#22c55e' : '#3b82f6'
                                            }}>
                                                {message.channel}
                                            </span>
                                        </td>
                                        <td style={{ color: '#475569' }}>{message.template}</td>
                                        <td>
                                            <span className="badge badge-live">{message.status}</span>
                                        </td>
                                        <td style={{ fontSize: '13px', color: '#64748b' }}>{message.time}</td>
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

export default CommunicationControl;
