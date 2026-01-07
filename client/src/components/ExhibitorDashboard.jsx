import React, { useState } from 'react';
import { Building2, Bell, Settings, ChevronDown, Search, LogOut, QrCode, UserPlus, BarChart3, Star, Activity, TrendingUp, Users, Clock, CheckCircle2, Calendar, LayoutDashboard, DollarSign, UserCog } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Scanner from './Scanner';
import LeadManagement from './LeadManagement';
import ExhibitorEventManagement from './ExhibitorEventManagement';
import ExhibitorDashboardContent from './ExhibitorDashboardContent';
import ExhibitorAnalytics from './ExhibitorAnalytics';
import ExhibitorBilling from './ExhibitorBilling';
import ExhibitorUsers from './ExhibitorUsers';

const ExhibitorDashboard = ({ onLogout }) => {
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [currentScreen, setCurrentScreen] = useState('dashboard');
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

    const exhibitorName = localStorage.getItem('exhibitorName') || 'TechCorp Solutions';
    const userEmail = localStorage.getItem('userEmail') || 'exhibitor@techcorp.com';

    // Render content based on current screen
    const renderContent = () => {
        switch (currentScreen) {
            case 'scanner':
                return <Scanner onBack={() => setCurrentScreen('dashboard')} />;
            case 'leads':
                return <LeadManagement />;
            case 'events':
                return <ExhibitorEventManagement />;
            case 'analytics':
                return <ExhibitorAnalytics />;
            case 'billing':
                return <ExhibitorBilling />;
            case 'users':
                return <ExhibitorUsers />;
            case 'dashboard':
            default:
                return <ExhibitorDashboardContent onNavigate={(screen) => setCurrentScreen(screen)} />;
        }
    };

    const navigationTabs = [
        { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { key: 'leads', label: 'Leads', icon: Users },
        { key: 'scanner', label: 'Scanner', icon: QrCode },
        { key: 'events', label: 'Events', icon: Calendar },
        { key: 'analytics', label: 'Analytics', icon: BarChart3 },
        { key: 'billing', label: 'Inventory and Billing', icon: DollarSign },
        { key: 'users', label: 'Users', icon: UserCog }
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Header */}
            <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Logo */}
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

                    {/* Navigation Tabs */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {navigationTabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setCurrentScreen(tab.key)}
                                style={{
                                    padding: '10px 20px',
                                    background: currentScreen === tab.key ? '#eff6ff' : 'transparent',
                                    border: 'none',
                                    borderBottom: currentScreen === tab.key ? '3px solid #2563eb' : '3px solid transparent',
                                    color: currentScreen === tab.key ? '#2563eb' : '#64748b',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Profile Section */}
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
            </div>

            {/* Main Content */}
            <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
                {renderContent()}
            </div>
        </div>
    );
};

export default ExhibitorDashboard;
