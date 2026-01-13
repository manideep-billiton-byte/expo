import React, { useState, useRef, useEffect } from 'react';
import {
    Search, Bell, Settings as SettingsIcon, ChevronDown,
    ChevronUp, ChevronLeft, ChevronRight, Building2, Users, Calendar, Image, Eye,
    CreditCard, MessageSquare, Receipt, Cpu, LineChart,
    ShieldCheck, UserCheck, LifeBuoy, LogOut, Printer
} from 'lucide-react';

const NavItem = ({ icon: Icon, label, active = false, onClick }) => (
    <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick} style={{ cursor: 'pointer' }}>
        <Icon size={14} />
        <span>{label}</span>
    </div>
);

const Header = ({ activeScreen = 'dashboard', onNavigate, isNavCollapsed, onToggleNav, onLogout, userType = 'master' }) => {
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const profileDropdownRef = useRef(null);
    const navRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    // Check if more content is scrollable
    const checkScrollArrows = () => {
        if (navRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
        }
    };

    // Scroll handler for arrow buttons
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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Check scroll arrows on mount and resize
    useEffect(() => {
        checkScrollArrows();
        window.addEventListener('resize', checkScrollArrows);
        return () => window.removeEventListener('resize', checkScrollArrows);
    }, [isNavCollapsed]);

    // Master admin navigation items
    const masterItems = [
        { icon: Building2, label: 'Control Room', screen: 'dashboard' },
        { icon: Building2, label: 'Organization', screen: 'tenants' },
        { icon: Users, label: 'Users', screen: 'users' },
        { icon: Calendar, label: 'Events', screen: 'events' },
        { icon: Image, label: 'Exhibitors', screen: 'exhibitors' },
        { icon: Eye, label: 'Visitors', screen: 'visitors' },
        { icon: CreditCard, label: 'Billing', screen: 'billing' },
        { icon: MessageSquare, label: 'Communication', screen: 'communication' },
        { icon: LineChart, label: 'Analytics', screen: 'analytics' },
        { icon: ShieldCheck, label: 'Compliance', screen: 'compliance' },
        { icon: LifeBuoy, label: 'Support', screen: 'support' },
        { icon: Printer, label: 'Scan & Print', screen: 'scan-print' },
    ];

    // Organization navigation items (limited)
    const organizationItems = [
        { icon: Building2, label: 'Dashboard', screen: 'dashboard' },
        { icon: Users, label: 'Users', screen: 'users' },
        { icon: Calendar, label: 'Events', screen: 'events' },
        { icon: Image, label: 'Exhibitors', screen: 'exhibitors' },
        { icon: Eye, label: 'Visitors', screen: 'visitors' },
        { icon: CreditCard, label: 'Billing', screen: 'billing' },
        { icon: Printer, label: 'Scan & Print', screen: 'scan-print' },
    ];

    // Exhibitor navigation items
    const exhibitorItems = [
        { icon: Building2, label: 'Dashboard', screen: 'dashboard' },
        { icon: Users, label: 'Leads', screen: 'leads' },
        { icon: Cpu, label: 'Scanner', screen: 'scanner' },
        { icon: Calendar, label: 'Events', screen: 'events' },
        { icon: LineChart, label: 'Analytics', screen: 'analytics' },
        { icon: CreditCard, label: 'Inventory and Billing', screen: 'billing' },
        { icon: Users, label: 'Users', screen: 'users' },
    ];

    const items = userType === 'exhibitor' ? exhibitorItems : (userType === 'organization' ? organizationItems : masterItems);

    const userEmail = localStorage.getItem('userEmail') || 'admin@eventhub.com';
    const organizationName = localStorage.getItem('organizationName');
    const exhibitorName = localStorage.getItem('exhibitorName');
    const displayName = userType === 'exhibitor' ? (exhibitorName || 'Exhibitor') : (userType === 'organization' ? (organizationName || 'Organization') : 'Master Admin');

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    return (
        <div className="header-wrapper">
            <div className="header-main">
                <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '24px' }}>
                    <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', marginRight: isMobile ? '0' : '8px' }}>
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
                            fontSize: isMobile ? '14px' : '16px',
                            position: 'relative',
                            letterSpacing: '-2px'
                        }}>
                            <span style={{ position: 'relative', zIndex: 1 }}>E</span>
                            <span style={{ position: 'absolute', right: '6px', fontSize: isMobile ? '12px' : '14px' }}>H</span>
                        </div>
                        <div style={{ display: isMobile ? 'none' : 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontWeight: 800, fontSize: '18px', color: '#1e3a8a', lineHeight: 1 }}>EventHub</span>
                            <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 500, letterSpacing: '0.02em' }}>Manage. Exhibit. Attend.</span>
                        </div>
                    </div>
                    {!isMobile && (
                        <div
                            onClick={onToggleNav}
                            style={{
                                background: '#f8fafc',
                                padding: '6px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                color: '#64748b',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            {isNavCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                        </div>
                    )}
                    {/* search moved to center for better alignment */}
                </div>

                {!isMobile && (
                    <div className="header-center" style={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
                        <div className="search-bar" style={{ position: 'relative', width: '420px', maxWidth: '60%' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                placeholder="Search tenants, events, exhibitors..."
                                style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px' }}
                            />
                        </div>
                    </div>
                )}

                <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '24px' }}>
                    {!isMobile && (
                        <>
                            <div style={{ position: 'relative', cursor: 'pointer' }}>
                                <Bell size={20} color="#64748b" />
                                <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>3</div>
                            </div>
                            <SettingsIcon size={20} color="#64748b" style={{ cursor: 'pointer' }} />
                            <div style={{ cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('support')} title="Support">
                                <LifeBuoy size={18} color="#64748b" />
                            </div>
                        </>
                    )}
                    <div style={{ position: 'relative' }} ref={profileDropdownRef}>
                        <div
                            style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', cursor: 'pointer' }}
                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                        >
                            {!isMobile && (
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{displayName}</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{userEmail}</div>
                                </div>
                            )}
                            <div style={{ width: isMobile ? '32px' : '36px', height: isMobile ? '32px' : '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: isMobile ? '12px' : '14px' }}>
                                {userType === 'exhibitor' ? 'EXH' : (userType === 'organization' ? 'ORG' : 'MA')}
                            </div>
                            {!isMobile && <ChevronDown size={16} color="#94a3b8" style={{ transition: 'transform 0.2s', transform: showProfileDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />}
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
                                zIndex: 1000,
                                overflow: 'hidden'
                            }}>
                                <div style={{ padding: '8px 0' }}>
                                    <div
                                        onClick={() => {
                                            if (onLogout) {
                                                onLogout();
                                            }
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
                                            fontWeight: 500,
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                    >
                                        <LogOut size={16} />
                                        <span>Logout</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {!isNavCollapsed && (
                <div style={{ position: 'relative' }}>
                    {/* Left scroll arrow - mobile only */}
                    {isMobile && showLeftArrow && (
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
                        className="top-nav-bar fade-in"
                        onScroll={checkScrollArrows}
                    >
                        {items.map((item, idx) => (
                            <NavItem
                                key={idx}
                                icon={item.icon}
                                label={item.label}
                                active={activeScreen === item.screen}
                                onClick={() => onNavigate && onNavigate(item.screen)}
                            />
                        ))}
                    </div>

                    {/* Right scroll arrow - mobile only */}
                    {isMobile && showRightArrow && (
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
                </div>
            )}
        </div>
    );
};

export default Header;
