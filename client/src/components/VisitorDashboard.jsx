import React, { useState, useEffect, useRef } from 'react';
import {
    Building2, Bell, Settings, ChevronDown, LogOut, Calendar, MapPin, Clock, Star,
    TrendingUp, Image, Download, Search, Filter, Grid, List, QrCode, User, Home,
    ArrowRight, CheckCircle, Users, Briefcase, Phone, Mail, Copy, Share2, Printer,
    ChevronRight, Award, Zap, Activity
} from 'lucide-react';
import tomAvatar from '../assets/images/tom.jpg';

const VisitorDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [eventsFilter, setEventsFilter] = useState('upcoming');
    const [stallsFilter, setStallsFilter] = useState('all');
    const [qrTab, setQrTab] = useState('myPass');
    const profileDropdownRef = useRef(null);

    const visitorName = localStorage.getItem('visitorName') || 'Rajesh Kumar';
    const userEmail = localStorage.getItem('userEmail') || 'rajesh.kumar@email.com';
    const visitorId = localStorage.getItem('visitorId') || 'VIS-2024-00156';
    const uniqueCode = localStorage.getItem('uniqueCode') || 'VIS-2024-00156';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Navigation tabs
    const navTabs = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'events', label: 'Events', icon: Calendar },
        { id: 'stalls', label: 'Stalls', icon: Building2 },
        { id: 'myqr', label: 'My QR', icon: QrCode },
        { id: 'profile', label: 'Profile', icon: User }
    ];

    // Stats data
    const stats = [
        { label: 'Events Visited', value: '2', icon: Calendar, change: '+12%', changeType: 'positive' },
        { label: 'Stalls Visited', value: '8', icon: Building2, change: '+8%', changeType: 'positive' },
        { label: 'Upcoming', value: '4', icon: Clock, change: null },
        { label: 'Brochures', value: '12', icon: Download, change: '-5%', changeType: 'negative' },
        { label: 'Leads', value: '5', icon: Users, change: '+3%', changeType: 'positive' },
        { label: 'Hours', value: '18h', icon: Clock, change: null }
    ];

    // Events data
    const events = [
        {
            id: 1,
            name: 'Healthcare Innovation Fair',
            category: 'Healthcare',
            description: 'Medical, technology and healthcare solutions exhibition with live demonstrations.',
            date: '10 Jan 2025 - 12 Jan 2025',
            location: 'BKC, Mumbai',
            registered: 890,
            capacity: 1500,
            status: 'Registered',
            image: '🏥'
        },
        {
            id: 2,
            name: 'AI & Robotics World 2025',
            category: 'Technology',
            description: 'Experience the future with AI and robotics innovations from around the globe.',
            date: '3 Feb 2025 - 8 Feb 2025',
            location: 'Whitefield, Bangalore',
            registered: 3200,
            capacity: 4000,
            status: 'Open',
            image: '🤖'
        },
        {
            id: 3,
            name: 'Smart City Solutions Expo',
            category: 'Urban Tech',
            description: 'Urban technology solutions for modern cities including IoT, mobility, and infrastructure.',
            date: '1 Mar 2025 - 3 Mar 2025',
            location: 'GIFT City, Gujarat',
            registered: 730,
            capacity: 2000,
            status: 'Open',
            image: '🏙️'
        }
    ];

    // Stalls data
    const stalls = [
        { id: 1, name: 'TechVision AI Lab', company: 'TechVision Solutions Pvt Ltd', category: 'Artificial Intelligence', location: 'Hall A, Booth 101', rating: 5, visitedDate: '15 Mar' },
        { id: 2, name: 'CloudNine Infrastructure', company: 'CloudNine Technologies', category: 'Cloud Computing', location: 'Hall A, Booth 205', rating: 4, visitedDate: '15 Mar' },
        { id: 3, name: 'GreenPower India', company: 'GreenPower Renewable Energy', category: 'Renewable Energy', location: 'Hall B, Booth 312', rating: 5, visitedDate: '20 Apr' },
        { id: 4, name: 'EV Motors India', company: 'Electric Vehicle Motors Ltd', category: 'Electric Vehicles', location: 'Hall B, Booth 401', rating: 4, visitedDate: '20 Apr' },
        { id: 5, name: 'DataSec Solutions', company: 'DataSec Cybersecurity', category: 'Cybersecurity', location: 'Hall C, Booth 156', rating: 5, visitedDate: '16 Mar' },
        { id: 6, name: 'BlockChain India', company: 'Blockchain Technologies Pvt Ltd', category: 'Blockchain', location: 'Hall A, Booth 189', rating: 4, visitedDate: '16 Mar' }
    ];

    // Recent activity
    const recentActivity = [
        { icon: Calendar, text: 'Registered for Event', detail: 'Healthcare Innovation Fair 2025', time: '3d ago', color: '#3b82f6' },
        { icon: Building2, text: 'Visited GreenPower India', detail: 'Solar installation consultation', time: '6 days ago', color: '#10b981' },
        { icon: CheckCircle, text: 'Event Check-in', detail: 'Checked in at Green Energy Summit', time: '2 weeks ago', color: '#8b5cf6' }
    ];

    const getCategoryColor = (category) => {
        const colors = {
            'Artificial Intelligence': '#8b5cf6',
            'Cloud Computing': '#3b82f6',
            'Renewable Energy': '#10b981',
            'Electric Vehicles': '#f59e0b',
            'Cybersecurity': '#ef4444',
            'Blockchain': '#6366f1',
            'Healthcare': '#ec4899',
            'Technology': '#06b6d4',
            'Urban Tech': '#84cc16'
        };
        return colors[category] || '#64748b';
    };

    // Render Dashboard Page
    const renderDashboard = () => (
        <div style={{ padding: '24px 32px' }}>
            {/* Welcome Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                borderRadius: '20px',
                padding: '28px 32px',
                color: 'white',
                marginBottom: '28px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', right: '20%', top: '50%', transform: 'translateY(-50%)', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <img
                        src={tomAvatar}
                        alt="Profile"
                        style={{ width: '64px', height: '64px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)', objectFit: 'cover' }}
                    />
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                                ⭐ Premium Visitor
                            </span>
                        </div>
                        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 4px 0' }}>
                            Welcome back, {visitorName.split(' ')[0]}! 👋
                        </h1>
                        <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>
                            Here's what's happening with your event activities
                        </p>
                    </div>
                </div>
                <button style={{
                    background: 'white',
                    color: '#0d9488',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }} onClick={() => setActiveTab('myqr')}>
                    View My Pass <ArrowRight size={16} />
                </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', marginBottom: '28px' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '16px',
                        border: '1px solid #f1f5f9',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                    }}>
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            background: '#f0fdfa',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 12px'
                        }}>
                            <stat.icon size={22} color="#0d9488" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '26px', fontWeight: 800, color: '#1e293b' }}>{stat.value}</span>
                            {stat.change && (
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: stat.changeType === 'positive' ? '#10b981' : '#ef4444',
                                    background: stat.changeType === 'positive' ? '#ecfdf5' : '#fef2f2',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                }}>
                                    {stat.change}
                                </span>
                            )}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                {[
                    { icon: Calendar, label: 'Browse Events', desc: 'Explore upcoming', color: '#3b82f6', bg: '#eff6ff' },
                    { icon: Building2, label: 'Find Stalls', desc: 'Connect with exhibitors', color: '#0d9488', bg: '#f0fdfa' },
                    { icon: Activity, label: 'My Activity', desc: 'View your progress', color: '#8b5cf6', bg: '#f5f3ff' },
                    { icon: Download, label: 'Downloads', desc: 'Access materials', color: '#f59e0b', bg: '#fefce8' }
                ].map((action, idx) => (
                    <div key={idx} style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '16px',
                        border: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }} onClick={() => idx === 0 ? setActiveTab('events') : idx === 1 ? setActiveTab('stalls') : null}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: action.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '12px'
                        }}>
                            <action.icon size={24} color={action.color} />
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{action.label}</div>
                        <div style={{ fontSize: '13px', color: '#94a3b8' }}>{action.desc}</div>
                    </div>
                ))}
            </div>

            {/* Recent Activity & Upcoming Events */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Recent Activity */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={18} color="#64748b" /> Recent Activity
                        </h3>
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>8 items</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {recentActivity.map((activity, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: `${activity.color}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <activity.icon size={18} color={activity.color} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{activity.text}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{activity.detail}</div>
                                </div>
                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{activity.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Events */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={18} color="#64748b" /> Upcoming Events
                        </h3>
                        <span style={{ fontSize: '13px', color: '#0d9488', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setActiveTab('events')}>
                            View All <ArrowRight size={14} />
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {events.slice(0, 3).map((event, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '28px'
                                }}>
                                    {event.image}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <span style={{
                                            background: event.status === 'Registered' ? '#0d948815' : '#10b98115',
                                            color: event.status === 'Registered' ? '#0d9488' : '#10b981',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '10px',
                                            fontWeight: 600
                                        }}>
                                            {event.status === 'Registered' ? '✓ Registered' : 'Open'}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{event.name}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {event.date.split(' - ')[0]}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {event.location}</span>
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#0d9488', marginTop: '4px' }}>
                                        👥 {event.registered.toLocaleString()} registered
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // Render Events Page
    const renderEvents = () => (
        <div style={{ padding: '24px 32px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={22} color="#0d9488" />
                </div>
                <span style={{ background: '#ecfdf5', color: '#10b981', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>4 Upcoming</span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px 0' }}>Events</h1>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0' }}>Discover and register for upcoming exhibitions and trade shows</p>

            {/* Search and Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search events by name or location..."
                        style={{ width: '100%', padding: '12px 14px 12px 44px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
                    />
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', color: '#64748b' }}>
                    <Filter size={16} /> All Categories <ChevronDown size={16} />
                </button>
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '4px' }}>
                    <button style={{ padding: '8px 12px', background: '#0d9488', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><Grid size={18} /></button>
                    <button style={{ padding: '8px 12px', background: 'transparent', color: '#64748b', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><List size={18} /></button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {[
                    { id: 'upcoming', label: 'Upcoming (4)', icon: Calendar },
                    { id: 'registered', label: 'Registered (3)', icon: CheckCircle },
                    { id: 'visited', label: 'Visited (2)', icon: MapPin }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setEventsFilter(tab.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            background: eventsFilter === tab.id ? '#0d9488' : 'white',
                            color: eventsFilter === tab.id ? 'white' : '#64748b',
                            border: eventsFilter === tab.id ? 'none' : '1px solid #e2e8f0',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 500
                        }}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Events Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {events.map((event, idx) => (
                    <div key={idx} style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                        <div style={{
                            height: '160px',
                            background: `linear-gradient(135deg, ${getCategoryColor(event.category)}20 0%, ${getCategoryColor(event.category)}40 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                        }}>
                            <span style={{ fontSize: '64px' }}>{event.image}</span>
                            <span style={{
                                position: 'absolute',
                                top: '12px',
                                left: '12px',
                                background: getCategoryColor(event.category),
                                color: 'white',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 600
                            }}>{event.category}</span>
                            {event.status === 'Registered' && (
                                <span style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    background: '#10b981',
                                    color: 'white',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>✓ Registered</span>
                            )}
                        </div>
                        <div style={{ padding: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '0 0 8px 0' }}>{event.name}</h3>
                            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>{event.description}</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                                    <Calendar size={14} color="#0d9488" /> {event.date}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                                    <MapPin size={14} color="#0d9488" /> {event.location}
                                </div>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '12px', color: '#0d9488', fontWeight: 500 }}>👥 {event.registered.toLocaleString()} registered</span>
                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{Math.round(event.registered / event.capacity * 100)}% full</span>
                                </div>
                                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px' }}>
                                    <div style={{ height: '100%', width: `${event.registered / event.capacity * 100}%`, background: '#0d9488', borderRadius: '3px' }} />
                                </div>
                            </div>
                            <button style={{
                                width: '100%',
                                padding: '12px',
                                background: event.status === 'Registered' ? 'white' : '#0d9488',
                                color: event.status === 'Registered' ? '#64748b' : 'white',
                                border: event.status === 'Registered' ? '1px solid #e2e8f0' : 'none',
                                borderRadius: '10px',
                                fontWeight: 600,
                                fontSize: '14px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}>
                                {event.status === 'Registered' ? (
                                    <><CheckCircle size={16} /> Already Registered</>
                                ) : (
                                    <>Register Now <ArrowRight size={16} /></>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Render Stalls Page
    const renderStalls = () => (
        <div style={{ padding: '24px 32px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={22} color="#0d9488" />
                </div>
                <span style={{ background: '#ecfdf5', color: '#10b981', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>8 Visited</span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px 0' }}>Visited Stalls</h1>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0' }}>Exhibitors you've connected with at events</p>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                    { label: 'Total Visited', value: '8', icon: Building2, color: '#0d9488' },
                    { label: 'Events', value: '2', icon: Calendar, color: '#3b82f6' },
                    { label: 'Categories', value: '8', icon: Zap, color: '#f59e0b' },
                    { label: 'Avg Rating', value: '4.5', icon: Star, color: '#8b5cf6' }
                ].map((stat, idx) => (
                    <div key={idx} style={{
                        background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}25 100%)`,
                        padding: '20px',
                        borderRadius: '16px'
                    }}>
                        <stat.icon size={24} color={stat.color} style={{ marginBottom: '8px' }} />
                        <div style={{ fontSize: '28px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Search and Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search stalls or organizations..."
                        style={{ width: '100%', padding: '12px 14px 12px 44px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
                    />
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', color: '#64748b' }}>
                    <Filter size={16} /> All Categories <ChevronDown size={16} />
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', color: '#64748b' }}>
                    <Calendar size={16} /> All Events <ChevronDown size={16} />
                </button>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {['All Stalls', 'By Event', 'By Category'].map((tab, idx) => (
                    <button
                        key={idx}
                        onClick={() => setStallsFilter(idx === 0 ? 'all' : idx === 1 ? 'event' : 'category')}
                        style={{
                            padding: '10px 16px',
                            background: (stallsFilter === 'all' && idx === 0) || (stallsFilter === 'event' && idx === 1) || (stallsFilter === 'category' && idx === 2) ? '#1e293b' : 'white',
                            color: (stallsFilter === 'all' && idx === 0) || (stallsFilter === 'event' && idx === 1) || (stallsFilter === 'category' && idx === 2) ? 'white' : '#64748b',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 500
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Stalls Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {stalls.map((stall, idx) => (
                    <div key={idx} style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '16px',
                        border: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '12px',
                            background: `linear-gradient(135deg, ${getCategoryColor(stall.category)}30 0%, ${getCategoryColor(stall.category)}50 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '20px',
                            color: getCategoryColor(stall.category)
                        }}>
                            {stall.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{stall.name}</div>
                            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>{stall.company}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{
                                    background: `${getCategoryColor(stall.category)}15`,
                                    color: getCategoryColor(stall.category),
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 600
                                }}>{stall.category}</span>
                                <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <MapPin size={12} /> {stall.location}
                                </span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} /> Visited {stall.visitedDate}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Star size={16} fill="#fbbf24" color="#fbbf24" />
                            <span style={{ fontSize: '14px', fontWeight: 600 }}>{stall.rating}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Render My QR / Digital Pass Page
    const renderMyQR = () => (
        <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ maxWidth: '440px', width: '100%' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <QrCode size={20} color="white" />
                    </div>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>Digital Pass</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>EventHub Pro</div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                    {[
                        { id: 'myPass', label: 'My Pass', icon: QrCode },
                        { id: 'events', label: 'Events (1)', icon: Calendar }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setQrTab(tab.id)}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '10px 16px',
                                background: qrTab === tab.id ? 'white' : 'transparent',
                                color: qrTab === tab.id ? '#1e293b' : '#64748b',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 500,
                                boxShadow: qrTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Pass Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    borderRadius: '20px',
                    padding: '24px',
                    color: 'white',
                    marginBottom: '24px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Award size={16} />
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>PREMIUM ACCESS</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>NFC</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                        <img
                            src={tomAvatar}
                            alt="Profile"
                            style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', objectFit: 'cover' }}
                        />
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: 700 }}>{visitorName}</div>
                            <div style={{ fontSize: '13px', color: '#94a3b8' }}>{userEmail}</div>
                            <div style={{ marginTop: '4px' }}>
                                <span style={{ background: '#0d9488', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>⭐ VERIFIED</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: '10px', color: '#94a3b8' }}>VISITOR ID</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'monospace' }}>{uniqueCode}</div>
                        </div>
                        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' }}>
                            <Copy size={16} color="#94a3b8" />
                        </button>
                    </div>
                </div>

                {/* QR Code Section */}
                <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '24px',
                    textAlign: 'center',
                    border: '1px solid #f1f5f9',
                    marginBottom: '24px'
                }}>
                    <div style={{
                        width: '180px',
                        height: '180px',
                        background: '#f8fafc',
                        margin: '0 auto 16px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px dashed #e2e8f0'
                    }}>
                        <QrCode size={120} color="#1e293b" />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <span style={{ background: '#f0fdfa', color: '#0d9488', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>✓ READY TO SCAN</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                        Present this QR code at any event checkpoint for instant verification
                    </p>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    {[
                        { value: '1', label: 'ATTENDED', color: '#64748b' },
                        { value: '2', label: 'UPCOMING', color: '#0d9488' },
                        { value: '12', label: 'STALLS', color: '#64748b' }
                    ].map((stat, idx) => (
                        <div key={idx} style={{
                            background: 'white',
                            padding: '16px',
                            borderRadius: '12px',
                            textAlign: 'center',
                            border: idx === 1 ? '2px solid #0d9488' : '1px solid #f1f5f9'
                        }}>
                            <div style={{ fontSize: '24px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    <button style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '16px',
                        background: '#0d9488',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '13px'
                    }}>
                        <Download size={20} /> Download
                    </button>
                    <button style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '16px',
                        background: 'white',
                        color: '#64748b',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: '13px'
                    }}>
                        <Share2 size={20} /> Share
                    </button>
                    <button style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '16px',
                        background: 'white',
                        color: '#64748b',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: '13px'
                    }}>
                        <Printer size={20} /> Print
                    </button>
                </div>

                {/* Quick Links */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
                    {[
                        { icon: Download, label: 'Session Timeline' },
                        { icon: CheckCircle, label: 'Scanned & Verified' },
                        { icon: Calendar, label: 'All Events' }
                    ].map((link, idx) => (
                        <button key={idx} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748b',
                            fontSize: '11px'
                        }}>
                            <link.icon size={18} />
                            {link.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    // Render Profile Page
    const renderProfile = () => (
        <div style={{ padding: '24px 32px' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: '0 0 24px 0' }}>My Profile</h1>

                <div style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                        <img
                            src={tomAvatar}
                            alt="Profile"
                            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #0d9488' }}
                        />
                        <div>
                            <div style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>{visitorName}</div>
                            <div style={{ fontSize: '14px', color: '#64748b' }}>Premium Visitor</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {[
                            { icon: Mail, label: 'Email', value: userEmail },
                            { icon: Phone, label: 'Phone', value: localStorage.getItem('visitorMobile') || '+91 98765 43210' },
                            { icon: Briefcase, label: 'Organization', value: 'TechCorp Solutions' },
                            { icon: User, label: 'Designation', value: 'Product Manager' },
                            { icon: QrCode, label: 'Visitor ID', value: uniqueCode }
                        ].map((field, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px',
                                    background: '#f0fdfa',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <field.icon size={20} color="#0d9488" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '2px' }}>{field.label}</div>
                                    <div style={{ fontSize: '15px', fontWeight: 500, color: '#1e293b' }}>{field.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Header */}
            <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '12px 32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                            color: 'white',
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '18px'
                        }}>E</div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '18px', color: '#1e293b' }}>ExpoOS</div>
                            <div style={{ fontSize: '10px', color: '#94a3b8' }}>Visitor Portal</div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {navTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 16px',
                                    background: activeTab === tab.id ? '#f0fdfa' : 'transparent',
                                    color: activeTab === tab.id ? '#0d9488' : '#64748b',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: activeTab === tab.id ? 600 : 500,
                                    transition: 'all 0.2s'
                                }}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Profile */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ position: 'relative', cursor: 'pointer' }}>
                            <Bell size={20} color="#64748b" />
                            <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>3</div>
                        </div>
                        <div style={{ position: 'relative' }} ref={profileDropdownRef}>
                            <div
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                            >
                                <img
                                    src={tomAvatar}
                                    alt="Profile"
                                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{visitorName}</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Premium</div>
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
                                        onClick={() => { setActiveTab('profile'); setShowProfileDropdown(false); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', color: '#475569', fontSize: '14px', fontWeight: 500, borderBottom: '1px solid #f1f5f9' }}
                                    >
                                        <User size={16} />
                                        <span>My Profile</span>
                                    </div>
                                    <div
                                        onClick={() => { setActiveTab('myqr'); setShowProfileDropdown(false); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', color: '#475569', fontSize: '14px', fontWeight: 500, borderBottom: '1px solid #f1f5f9' }}
                                    >
                                        <QrCode size={16} />
                                        <span>My QR Code</span>
                                    </div>
                                    <div
                                        onClick={() => { if (onLogout) onLogout(); setShowProfileDropdown(false); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', color: '#ef4444', fontSize: '14px', fontWeight: 500 }}
                                    >
                                        <LogOut size={16} />
                                        <span>Logout</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'events' && renderEvents()}
                {activeTab === 'stalls' && renderStalls()}
                {activeTab === 'myqr' && renderMyQR()}
                {activeTab === 'profile' && renderProfile()}
            </div>
        </div>
    );
};

export default VisitorDashboard;
