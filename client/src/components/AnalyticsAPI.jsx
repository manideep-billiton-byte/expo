import React, { useState } from 'react';
import { Zap, Calendar, Users, TrendingUp, Activity, Database, Wifi } from 'lucide-react';

const AnalyticsAPI = () => {
    const [activeTab, setActiveTab] = useState('Overview');

    const tabs = ['Overview', 'Event Analytics', 'Visitor Analytics', 'API Management', 'Webhooks'];

    return (
        <div className="dashboard-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }} className="fade-in">
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>Analytics & API</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Platform metrics, API management, and integrations</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563eb', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: 'white', cursor: 'pointer' }}>
                        Export Report
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }} className="fade-in">
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>TOTAL API CALLS</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>2.4M</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>+8.2% this month</div>
                        </div>
                        <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Zap size={20} color="#06b6d4" />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>ACTIVE EVENTS</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>42</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>8 ongoing</div>
                        </div>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Calendar size={20} color="#3b82f6" />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>UNIQUE VISITORS</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>24,582</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>+2,340 today</div>
                        </div>
                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Users size={20} color="#22c55e" />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>CONVERSION RATE</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>34.2%</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>+2.3% this week</div>
                        </div>
                        <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <TrendingUp size={20} color="#8b5cf6" />
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

                {/* Charts Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                    {/* Visitor Trends Chart */}
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Activity size={18} color="#2563eb" />
                            Visitor Trends
                        </h3>
                        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', height: '280px', position: 'relative' }}>
                            {/* Simple area chart representation */}
                            <svg width="100%" height="100%" viewBox="0 0 500 250" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.3 }} />
                                        <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.05 }} />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M 0,150 L 50,120 L 100,130 L 150,90 L 200,100 L 250,80 L 300,85 L 350,70 L 400,60 L 450,55 L 500,50 L 500,250 L 0,250 Z"
                                    fill="url(#areaGradient)"
                                />
                                <path
                                    d="M 0,150 L 50,120 L 100,130 L 150,90 L 200,100 L 250,80 L 300,85 L 350,70 L 400,60 L 450,55 L 500,50"
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="3"
                                />
                            </svg>
                            <div style={{ position: 'absolute', bottom: '12px', left: '24px', right: '24px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
                                <span>Jan</span>
                                <span>Feb</span>
                                <span>Mar</span>
                                <span>Apr</span>
                                <span>May</span>
                                <span>Jun</span>
                            </div>
                        </div>
                    </div>

                    {/* Event Performance Chart */}
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={18} color="#2563eb" />
                            Event Performance
                        </h3>
                        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', height: '280px' }}>
                            {/* Bar chart representation */}
                            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '200px', gap: '8px' }}>
                                {[
                                    { name: 'Tech Expo', visitors: 5500, leads: 3200 },
                                    { name: 'HDPE Summit', visitors: 4200, leads: 2800 },
                                    { name: 'Industry 4.0', visitors: 3800, leads: 2200 },
                                    { name: 'Green Summit', visitors: 4800, leads: 2600 },
                                    { name: 'Startup Fest', visitors: 3200, leads: 1800 }
                                ].map((event, idx) => (
                                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ width: '100%', display: 'flex', gap: '4px', alignItems: 'flex-end', height: '180px' }}>
                                            <div style={{
                                                flex: 1,
                                                background: '#3b82f6',
                                                borderRadius: '4px 4px 0 0',
                                                height: `${(event.visitors / 6000) * 100}%`,
                                                minHeight: '20px'
                                            }} />
                                            <div style={{
                                                flex: 1,
                                                background: '#22c55e',
                                                borderRadius: '4px 4px 0 0',
                                                height: `${(event.leads / 6000) * 100}%`,
                                                minHeight: '20px'
                                            }} />
                                        </div>
                                        <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', marginTop: '8px' }}>
                                            {event.name.split(' ')[0]}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px', fontSize: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px' }} />
                                    <span style={{ color: '#64748b' }}>Visitors</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '2px' }} />
                                    <span style={{ color: '#64748b' }}>Leads</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Health */}
                <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Database size={18} color="#2563eb" />
                        System Health
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                        {[
                            { label: 'API Uptime', value: '99.99%', icon: Zap, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
                            { label: 'Database', value: 'Healthy', icon: Database, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
                            { label: 'Response Time', value: '45ms', icon: Activity, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
                            { label: 'Active Connections', value: '1,234', icon: Wifi, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' }
                        ].map((metric, idx) => {
                            const Icon = metric.icon;
                            return (
                                <div key={idx} style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <div style={{ background: metric.bg, padding: '8px', borderRadius: '8px' }}>
                                            <Icon size={18} color={metric.color} />
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{metric.label}</div>
                                    </div>
                                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>{metric.value}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '32px', paddingBottom: '24px' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Powered By Billiton</p>
            </div>
        </div>
    );
};

export default AnalyticsAPI;
