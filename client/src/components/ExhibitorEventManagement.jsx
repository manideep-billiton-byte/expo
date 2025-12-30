import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, Users, BarChart3, TrendingUp, Search, Download, Plus, MapPin, ChevronRight, MoreHorizontal } from 'lucide-react';

const ExhibitorEventManagement = () => {
    const [activeTab, setActiveTab] = useState('All');

    const events = [
        { name: 'Tech Innovation Summit 2024', status: 'Completed', location: 'Mumbai Convention Centre', date: 'Feb 20-22, 2024', leads: 156, visitors: 943, rating: 4.8, roi: '+285%' },
        { name: 'Digital Marketing Expo', status: 'Completed', location: 'Mumbai Convention Centre', date: 'Feb 20-22, 2024', leads: 98, visitors: 567, rating: 4.5, roi: '+210%' },
        { name: 'Startup India Conference', status: 'Completed', location: 'Delhi Trade Fair Ground', date: 'Jan 10-12, 2024', leads: 124, visitors: 789, rating: 4.6, roi: '+245%' },
        { name: 'AI & ML World Congress', status: 'Upcoming', location: 'Hyderabad Tech Park', date: 'Apr 5-7, 2024', leads: 0, visitors: 0, rating: 0, roi: '-' },
        { name: 'Cloud Computing Summit', status: 'Upcoming', location: 'Chennai Trade Centre', date: 'May 12-14, 2024', leads: 0, visitors: 0, rating: 0, roi: '-' },
    ];

    return (
        <div style={{ padding: '0px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>Event Management</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Track your exhibition history and upcoming events</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563eb', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: 'white', cursor: 'pointer' }}>
                        <Plus size={16} />
                        Register New Event
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {[
                    { label: 'Total Events', value: '12', icon: Calendar, color: '#2563eb' },
                    { label: 'Completed', value: '10', icon: CheckCircle2, color: '#10b981' },
                    { label: 'Upcoming', value: '2', icon: Clock, color: '#f59e0b' },
                    { label: 'Total Leads', value: '1,245', icon: Users, color: '#0ea5e9' }
                ].map((stat, idx) => (
                    <div key={idx} className="card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{stat.label}</div>
                                <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', marginTop: '4px' }}>{stat.value}</div>
                            </div>
                            <div style={{ background: `${stat.color}15`, padding: '10px', borderRadius: '10px' }}>
                                <stat.icon size={20} color={stat.color} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '10px' }}>
                            <TrendingUp size={20} color="#10b981" />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Performance Overview</h3>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                    {[
                        { label: 'Average Leads per Event', value: '124', change: '+18%' },
                        { label: 'Average Visitors', value: '766', change: '+22%' },
                        { label: 'Average Rating', value: '4.6', change: '+0.3' },
                        { label: 'Total Revenue', value: '₹24,50,000', change: '+45%' }
                    ].map((item, idx) => (
                        <div key={idx} style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>{item.label}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>{item.value}</div>
                                <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, background: '#f0fdf4', padding: '2px 8px', borderRadius: '6px' }}>{item.change}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Events History</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['All', 'Completed', 'Upcoming'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '6px 16px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    background: activeTab === tab ? '#f1f5f9' : 'white',
                                    color: activeTab === tab ? '#1e293b' : '#64748b',
                                    border: '1px solid #e2e8f0',
                                    cursor: 'pointer'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {events.filter(e => activeTab === 'All' || e.status === activeTab).map((event, idx) => (
                        <div key={idx} style={{ padding: '20px', border: '1px solid #f1f5f9', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', border: '1px solid #e2e8f0' }}>
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: 700, fontSize: '16px', color: '#1e293b' }}>{event.name}</span>
                                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, background: event.status === 'Completed' ? '#f0fdf4' : '#fff7ed', color: event.status === 'Completed' ? '#10b981' : '#f59e0b' }}>{event.status}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {event.location}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {event.date}</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>{event.leads}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>Leads</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>{event.visitors}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>Visitors</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>★ {event.rating}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>Rating</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>{event.roi}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>ROI</div>
                                </div>
                                <button style={{ padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    View Details <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '32px', paddingBottom: '24px' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Powered By Billiton</p>
            </div>
        </div>
    );
};

export default ExhibitorEventManagement;
