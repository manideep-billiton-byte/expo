import React, { useState, useRef, useEffect } from 'react';
import { Building2, Bell, Settings, ChevronDown, ChevronLeft, ChevronRight, Search, LogOut, QrCode, UserPlus, BarChart3, Star, Activity, TrendingUp, Users, Clock, CheckCircle2, Calendar, LayoutDashboard, DollarSign, UserCog } from 'lucide-react';
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
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const profileDropdownRef = useRef(null);
    const navRef = useRef(null);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Check scroll arrows
    const checkScrollArrows = () => {
        if (navRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
        }
    };

    // Scroll navigation
    const scrollNav = (direction) => {
        if (navRef.current) {
            const scrollAmount = 150;
            navRef.current.scrollBy({
                left: direction === 'right' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });
            setTimeout(checkScrollArrows, 300);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Check scroll on mount
    useEffect(() => {
        setTimeout(checkScrollArrows, 100);
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
        { key: 'billing', label: 'Billing', icon: DollarSign },
        { key: 'users', label: 'Users', icon: UserCog }
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Header */}
            <div style={{
                background: 'white',
                borderBottom: '1px solid #e2e8f0',
                padding: isMobile ? '12px 16px' : '16px 32px',
                position: 'sticky',
                top: 0,
                zIndex: 90
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                            color: 'white',
                            width: isMobile ? '32px' : '38px',
                            height: isMobile ? '28px' : '32px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: isMobile ? '14px' : '16px'
                        }}>E</div>
                        {!isMobile && (
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '18px', color: '#1e3a8a' }}>EventHub</div>
                                <div style={{ fontSize: '9px', color: '#94a3b8' }}>Manage. Exhibit. Attend.</div>
                            </div>
                        )}
                    </div>

                    {/* Desktop Navigation Tabs - Hidden on Mobile */}
                    {!isMobile && (
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
                    )}

                    {/* Profile Section */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '24px' }}>
                        {!isMobile && (
                            <>
                                <div style={{ position: 'relative', cursor: 'pointer' }}>
                                    <Bell size={20} color="#64748b" />
                                    <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>5</div>
                                </div>
                                <Settings size={20} color="#64748b" style={{ cursor: 'pointer' }} />
                            </>
                        )}
                        <div style={{ position: 'relative' }} ref={profileDropdownRef}>
                            <div
                                style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', cursor: 'pointer' }}
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                            >
                                {!isMobile && (
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{exhibitorName}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{userEmail}</div>
                                    </div>
                                )}
                                <div style={{ width: isMobile ? '32px' : '36px', height: isMobile ? '32px' : '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: isMobile ? '12px' : '14px' }}>
                                    {exhibitorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </div>
                                {!isMobile && <ChevronDown size={16} color="#94a3b8" />}
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

            {/* Mobile Navigation Bar with Scroll Arrows */}
            {isMobile && (
                <div style={{
                    background: 'white',
                    borderBottom: '1px solid #e2e8f0',
                    position: 'relative'
                }}>
                    {/* Left scroll arrow */}
                    {showLeftArrow && (
                        <button
                            onClick={() => scrollNav('left')}
                            aria-label="Scroll left"
                            style={{
                                position: 'absolute',
                                left: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 10,
                                background: 'linear-gradient(to right, white 60%, transparent)',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px 12px 8px 4px',
                                display: 'flex',
                                alignItems: 'center',
                                height: '100%'
                            }}
                        >
                            <ChevronLeft size={20} color="#2563eb" />
                        </button>
                    )}

                    {/* Navigation items */}
                    <div
                        ref={navRef}
                        onScroll={checkScrollArrows}
                        style={{
                            display: 'flex',
                            gap: '6px',
                            padding: '8px 12px',
                            overflowX: 'auto',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch'
                        }}
                    >
                        {navigationTabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setCurrentScreen(tab.key)}
                                style={{
                                    padding: '8px 14px',
                                    background: currentScreen === tab.key ? '#2563eb' : 'transparent',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: currentScreen === tab.key ? 'white' : '#64748b',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                    minHeight: '44px'
                                }}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Right scroll arrow */}
                    {showRightArrow && (
                        <button
                            onClick={() => scrollNav('right')}
                            aria-label="Scroll right"
                            style={{
                                position: 'absolute',
                                right: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 10,
                                background: 'linear-gradient(to left, white 60%, transparent)',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px 4px 8px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                height: '100%'
                            }}
                        >
                            <ChevronRight size={20} color="#2563eb" />
                        </button>
                    )}

                    {/* Hide scrollbar */}
                    <style>{`
                        div::-webkit-scrollbar { display: none; }
                    `}</style>
                </div>
            )}

            {/* Main Content */}
            <div style={{ padding: isMobile ? '16px' : '32px', maxWidth: '1400px', margin: '0 auto' }}>
                {renderContent()}
            </div>
        </div>
    );
};

export default ExhibitorDashboard;
