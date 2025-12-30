import React, { useState } from 'react';
import { Building2, Bell, Settings, ChevronDown, LogOut, Calendar, MapPin, Clock, Star, TrendingUp, Image } from 'lucide-react';

const VisitorDashboard = ({ onLogout }) => {
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

    const visitorName = localStorage.getItem('visitorName') || 'Umesh Kumar';
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
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{visitorName}</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{userEmail}</div>
                                </div>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '14px' }}>
                                    {visitorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
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
                        <div style={{ fontSize: '14px', color: '#64748b' }}>Good Morning {visitorName.split(' ')[0]}....!</div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '12px 32px' }}>
                <div style={{ display: 'flex', gap: '32px' }}>
                    {['Dashboard', 'Events', 'Stalls', 'My QR', 'Profile'].map((item, idx) => (
                        <div
                            key={idx}
                            style={{
                                padding: '8px 0',
                                fontSize: '14px',
                                fontWeight: idx === 0 ? 600 : 500,
                                color: idx === 0 ? '#2563eb' : '#64748b',
                                borderBottom: idx === 0 ? '2px solid #2563eb' : 'none',
                                cursor: 'pointer'
                            }}
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Welcome Banner */}
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px 0' }}>Welcome Back, {visitorName}</h1>
                    <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>Here's what's happening with your event activities.</p>
                </div>

                {/* Upcoming Event Banner */}
                <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '16px', padding: '24px', color: 'white', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Upcoming Event</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Billiton Event Management - Fest (1st Jan 2k26)</div>
                        <button style={{ padding: '10px 24px', background: 'white', color: '#10b981', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', border: 'none', marginTop: '12px' }}>
                            Register Now
                        </button>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', justifyContent: 'flex-end' }}>
                            <MapPin size={16} />
                            <span>Hyderabad</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                            <Clock size={16} />
                            <span>Start: 12PM-4PM</span>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '20px', marginBottom: '32px' }}>
                    {[
                        { label: 'Events Visited', value: '2', icon: Calendar },
                        { label: 'Stalls Visited', value: '8', icon: Building2 },
                        { label: 'Upcoming', value: '4', icon: Clock },
                        { label: 'Brochures', value: '12', icon: Image },
                        { label: 'Call Back', value: '5', icon: TrendingUp },
                        { label: 'Hours', value: '18h', icon: Clock }
                    ].map((stat, idx) => (
                        <div key={idx} style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                            <stat.icon size={24} color="#2563eb" style={{ marginBottom: '12px' }} />
                            <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>{stat.value}</div>
                            <div style={{ fontSize: '14px', color: '#64748b' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Main Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '32px' }}>
                    {/* Recent Activity */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>Recent Activity</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { text: 'Registered for Event: Healthcare Innovation Fair 2025', date: '20 Dec 2024' },
                                { text: 'Visited GreenPower India: Solar installation consultation', date: '20 Apr 2024' },
                                { text: 'Event Check-in: Checked in at Green Energy Summit', date: '20 Apr 2024' },
                                { text: 'Visited BlockChain India: Discussed DeFi solutions', date: '16 Mar 2024' }
                            ].map((activity, idx) => (
                                <div key={idx} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '14px', color: '#1e293b', marginBottom: '4px' }}>{activity.text}</div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{activity.date}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>Upcoming Events</h3>
                            <span style={{ fontSize: '14px', color: '#2563eb', cursor: 'pointer', fontWeight: 500 }}>View All</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { name: 'Healthcare Innovation Fair', date: '10 Jan 2025', location: 'BKC, Mumbai', status: 'Registered', image: '🏥' },
                                { name: 'AI & Robotics World 2025', date: '5 Feb 2025', location: 'Whitefield, Bangalore', status: 'Open', image: '🤖' },
                                { name: 'Smart City Solutions Expo', date: '1 Mar 2025', location: 'GIFT City, Gujarat', status: 'Open', image: '🏙️' }
                            ].map((event, idx) => (
                                <div key={idx} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'flex', gap: '12px' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                                        {event.image}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{event.name}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{event.date} • {event.location}</div>
                                        <span style={{ padding: '4px 8px', background: event.status === 'Registered' ? '#dbeafe' : '#f0fdf4', color: event.status === 'Registered' ? '#2563eb' : '#10b981', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                                            {event.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recently Visited Stalls */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>Recently Visited Stalls</h3>
                        <span style={{ fontSize: '14px', color: '#2563eb', cursor: 'pointer', fontWeight: 500 }}>View All</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { name: 'TechVision AI Lab', company: 'TechVision Solutions Pvt Ltd.', rating: 5, date: '15 Mar', category: 'Artificial Intelligence' },
                                { name: 'CloudNine Infrastructure', company: 'CloudNine Technologies.', rating: 4, date: '15 Mar', category: 'Cloud Computing' },
                                { name: 'GreenPower India', company: 'GreenPower Renewable Energy.', rating: 5, date: '20 Apr', category: 'Renewable Energy' },
                                { name: 'EV Motors India', company: 'Electric Vehicle Motors Ltd.', rating: 4, date: '20 Apr', category: 'Electric Vehicles' },
                                { name: 'DataSec Solutions', company: 'DataSec Cybersecurity.', rating: 5, date: '16 Mar', category: 'Cybersecurity' }
                            ].map((stall, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '20px' }}>
                                            {stall.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{stall.name}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{stall.company}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Star size={16} fill="#fbbf24" color="#fbbf24" />
                                            <span style={{ fontSize: '14px', fontWeight: 600 }}>{stall.rating}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { label: 'Artificial Intelligence', date: '15 Mar' },
                                { label: 'Cloud Computing', date: '15 Mar' },
                                { label: 'Renewable Energy', date: '20 Apr' },
                                { label: 'Electric Vehicles', date: '20 Apr' },
                                { label: 'Cybersecurity', date: '16 Mar' }
                            ].map((tag, idx) => (
                                <div key={idx} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b' }}>{tag.label}</span>
                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{tag.date}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisitorDashboard;

