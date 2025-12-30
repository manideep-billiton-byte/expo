import React, { useState } from 'react';
import { Building2, Bell, Settings, ChevronDown, Search, LogOut, QrCode, UserPlus, BarChart3, Star, Activity, TrendingUp, Users, Clock, CheckCircle2, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ExhibitorDashboard = ({ onLogout }) => {
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const profileDropdownRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
    const userEmail = localStorage.getItem('userEmail') || 'billiton@eventhub.com';

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Header */}
            <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                                color: 'white',
                                width: '38px',
                                height: '32px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '16px'
                            }}>E</div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '18px', color: '#1e3a8a' }}>EventHub</div>
                                <div style={{ fontSize: '9px', color: '#94a3b8' }}>Manage. Exhibit. Attend.</div>
                            </div>
                        </div>
                        <div style={{ position: 'relative', width: '420px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                placeholder="Search tenants, events, exhibitors..."
                                style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px' }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ position: 'relative', cursor: 'pointer' }}>
                            <Bell size={20} color="#64748b" />
                            <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>5</div>
                        </div>
                        <Settings size={20} color="#64748b" style={{ cursor: 'pointer' }} />
                        <div style={{ position: 'relative' }} ref={profileDropdownRef}>
                            <div
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                            >
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{exhibitorName}</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{userEmail}</div>
                                </div>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '14px' }}>
                                    {exhibitorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </div>
                                <ChevronDown size={16} color="#94a3b8" />
                            </div>
                            {showProfileDropdown && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '8px',
                                    background: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                                    border: '1px solid #e2e8f0',
                                    minWidth: '180px',
                                    zIndex: 1000
                                }}>
                                    <div
                                        onClick={() => {
                                            if (onLogout) onLogout();
                                            setShowProfileDropdown(false);
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '10px 16px',
                                            cursor: 'pointer',
                                            color: '#ef4444',
                                            fontSize: '14px',
                                            fontWeight: 500
                                        }}
                                    >
                                        <LogOut size={16} />
                                        <span>Logout</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>Good Morning {exhibitorName.split(' ')[0]}....!</div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button style={{ padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', color: '#64748b', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>Export</button>
                        <button style={{ padding: '8px 16px', background: '#2563eb', borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <QrCode size={16} />
                            Scan Badge
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Welcome Banner */}
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px 0' }}>Welcome Back, {exhibitorName}</h1>
                    <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>Welcome back! Here's an overview of your expo management.</p>
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
                        <div key={idx} style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
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
                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>Today's Visitor Traffic</h3>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={visitorData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                                    <YAxis stroke="#94a3b8" fontSize={12} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="visitors" stroke="#2563eb" strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '16px' }}>Hourly visitor count at your stall</p>
                    </div>

                    {/* Lead Capture Goal */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
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
                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
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
                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
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
                                            <div style={{ padding: '6px', background: '#f1f5f9', borderRadius: '6px', cursor: 'pointer' }}>
                                                <Activity size={16} color="#64748b" />
                                            </div>
                                            <div style={{ padding: '6px', background: '#f1f5f9', borderRadius: '6px', cursor: 'pointer' }}>
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
        </div>
    );
};

export default ExhibitorDashboard;



