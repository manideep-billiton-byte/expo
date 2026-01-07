import React from 'react';
import { QrCode, UserPlus, BarChart3, Star, Activity, TrendingUp, Users, Clock, CheckCircle2, Phone, Mail, Calendar, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ExhibitorDashboardContent = ({ onNavigate }) => {
    const visitorData = [
        { time: '9 AM', visitors: 12 },
        { time: '10 AM', visitors: 25 },
        { time: '11 AM', visitors: 38 },
        { time: '12 PM', visitors: 45 },
        { time: '1 PM', visitors: 52 },
        { time: '2 PM', visitors: 58 },
        { time: '3 PM', visitors: 62 },
        { time: '4 PM', visitors: 48 },
        { time: '5 PM', visitors: 35 },
        { time: '6 PM', visitors: 22 }
    ];

    const exhibitorName = localStorage.getItem('exhibitorName') || 'Billiton Service PVT';

    return (
        <div style={{ padding: '0px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>
                        Welcome Back , {exhibitorName}
                    </h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
                        Welcome back! Here's an overview of your expo management.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(37, 99, 235, 0.08)', padding: '8px 16px', borderRadius: '12px', color: '#2563eb', fontWeight: 600, fontSize: '14px' }}>
                        Good Morning {exhibitorName.split(' ')[0]}....!
                    </div>
                    <button onClick={() => onNavigate('scanner')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                        Export
                    </button>
                    <button onClick={() => onNavigate('scanner')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563eb', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: 'white', cursor: 'pointer' }}>
                        <QrCode size={16} />
                        Scan Badge
                    </button>
                </div>
            </div>

            {/* Live Status Card */}
            <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '16px', padding: '24px', color: 'white', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}>
                        <Activity size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Live at Stall A-15</div>
                        <div style={{ fontSize: '24px', fontWeight: 700 }}>23 visitors right now</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}>Hall A, Stall 15</div>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}>Peak: 2-4 PM</div>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {[
                    { label: 'Total Visitors Today', value: '387', change: '+18% vs yesterday', icon: Users },
                    { label: 'Leads Captured', value: '56', change: '+24% vs yesterday', icon: TrendingUp },
                    { label: 'Conversion Rate', value: '14.5%', change: '+3.2% vs yesterday', icon: Activity },
                    { label: 'Avg. Engagement', value: '8.5 min', change: '+12% vs yesterday', icon: Clock }
                ].map((stat, idx) => (
                    <div key={idx} className="card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <stat.icon size={24} color="#2563eb" />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '12px', fontWeight: 600 }}>
                                <TrendingUp size={12} />
                                {stat.change}
                            </div>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>{stat.value}</div>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts and Data Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
                {/* Visitor Traffic Chart */}
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>Today's Visitor Traffic</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={visitorData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Line type="monotone" dataKey="visitors" stroke="#2563eb" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '16px' }}>Hourly visitor count at your stall</p>
                </div>

                {/* Lead Capture Goal */}
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>Lead Capture Goal</h3>
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '14px', color: '#64748b' }}>56 of 100 leads</span>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>56%</span>
                        </div>
                        <div style={{ height: '12px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                            <div style={{ width: '56%', height: '100%', background: 'linear-gradient(90deg, #2563eb, #3b82f6)', borderRadius: '6px' }}></div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>35%</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Scan Leads</div>
                        </div>
                        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>42%</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Warm Leads</div>
                        </div>
                    </div>
                    <button style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', border: 'none' }}>
                        Capture More Leads
                    </button>
                </div>
            </div>

            {/* Quick Actions and Recent Content */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                {/* Quick Actions */}
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { icon: QrCode, label: 'Scan Badge', action: 'scanner' },
                            { icon: UserPlus, label: 'Add Lead', action: 'leads' },
                            { icon: BarChart3, label: 'View Reports', action: 'analytics' },
                            { icon: Star, label: 'Edit Profile', action: 'dashboard' }
                        ].map((item, idx) => (
                            <button key={idx} onClick={() => onNavigate(item.action)} style={{ padding: '16px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>
                                <item.icon size={20} color="#2563eb" />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recent Leads */}
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Recent Leads</h3>
                        <button onClick={() => onNavigate('leads')} style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>View All →</button>
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Latest captured leads</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { name: 'Rajesh Kumar', company: 'Infosys', plan: 'Enterprise', time: '5 mins ago', status: 'online' },
                            { name: 'Priya Sharma', company: 'TCS Digital', plan: 'Cloud', time: '15 mins ago', status: 'offline' },
                            { name: 'Amit Patel', company: 'Wipro Ltd', plan: 'AI/ML', time: '42 mins ago', status: 'offline' },
                            { name: 'Sneha Reddy', company: 'HCL Tech', plan: 'Digital', time: '1 hour ago', status: 'offline' }
                        ].map((lead, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '14px' }}>
                                            {lead.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        {lead.status === 'online' && <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', border: '2px solid white' }}></div>}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{lead.name}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{lead.company}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                        <div style={{ padding: '3px 10px', background: '#eff6ff', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: '#2563eb' }}>
                                            {lead.plan}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{lead.time}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button style={{ padding: '6px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer' }}>
                                            <Phone size={14} color="#64748b" />
                                        </button>
                                        <button style={{ padding: '6px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer' }}>
                                            <Mail size={14} color="#64748b" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Upcoming Organization Events */}
            <div className="card" style={{ padding: '24px', marginTop: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Upcoming Organization Events</h3>
                    <button onClick={() => onNavigate('events')} style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>View All →</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    {[
                        { name: 'Vikram Singh', title: 'Tech Innovation Summit', time: '11:00 AM', status: 'Demo' },
                        { name: 'Anita Desai', title: 'Cognizism', time: '2:30 PM', status: 'Meeting' },
                        { name: 'Vikram Singh', title: 'Tech Innovation Summit', time: '11:00 AM', status: 'Demo' },
                        { name: 'Anita Desai', title: 'Cognizism', time: '2:30 PM', status: 'Meeting' }
                    ].map((event, idx) => (
                        <div key={idx} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: idx % 2 === 0 ? '#dbeafe' : '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600, color: idx % 2 === 0 ? '#2563eb' : '#ec4899' }}>
                                    {event.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{event.name}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{event.title}</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{event.time}</div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>{event.status}</div>
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

export default ExhibitorDashboardContent;
