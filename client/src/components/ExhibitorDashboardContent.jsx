import React from 'react';
import { QrCode, UserPlus, BarChart3, Star, Activity, TrendingUp, Users, Clock, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ExhibitorDashboardContent = () => {
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
                        Welcome Back, {exhibitorName}
                    </h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
                        Welcome back! Here's an overview of your expo management.
                    </p>
                </div>
                <div style={{ background: 'rgba(37, 99, 235, 0.08)', padding: '8px 16px', borderRadius: '12px', color: '#2563eb', fontWeight: 600, fontSize: '14px' }}>
                    Good Morning {exhibitorName.split(' ')[0]}....!
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

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                <button style={{ flex: 1, padding: '16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer' }}>
                    <QrCode size={20} color="#2563eb" />
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>Scan Badge</span>
                </button>
                <button style={{ flex: 1, padding: '16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer' }}>
                    <UserPlus size={20} color="#2563eb" />
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>Add Lead</span>
                </button>
                <button style={{ padding: '16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer' }}>
                    <BarChart3 size={20} color="#2563eb" />
                </button>
                <button style={{ padding: '16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer' }}>
                    <Star size={20} color="#2563eb" />
                </button>
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

            {/* Notifications and Recent Leads */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                {/* Notifications */}
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>Notifications</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { text: 'New VIP visitor at your stall', time: '2 mins ago' },
                            { text: 'Lead score updated: Rajesh Kumar', time: '15 mins ago' },
                            { text: 'Upcoming appointment in 30 mins', time: '30 mins ago' }
                        ].map((notif, idx) => (
                            <div key={idx} style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
                                <div style={{ fontSize: '14px', color: '#1e293b', marginBottom: '4px' }}>{notif.text}</div>
                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{notif.time}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Leads */}
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>Recent Leads</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { name: 'Rajesh Kumar', company: 'Infosys', score: 9 },
                            { name: 'Priya Sharma', company: 'TCS Digital', score: 7 },
                            { name: 'Amit Patel', company: 'Wipro Ltd', score: 8 },
                            { name: 'Sneha Reddy', company: 'HCL Tech', score: 6 }
                        ].map((lead, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
                                        {lead.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{lead.name}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{lead.company}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ padding: '4px 12px', background: '#f0fdf4', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#10b981' }}>
                                        Score {lead.score}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <div style={{ padding: '6px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer' }}>
                                            <Activity size={16} color="#64748b" />
                                        </div>
                                        <div style={{ padding: '6px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer' }}>
                                            <CheckCircle2 size={16} color="#64748b" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExhibitorDashboardContent;
