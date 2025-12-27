import React from 'react';
import {
    Building2, Users, Calendar, Image, Eye, CreditCard,
    MessageSquare, Receipt, Cpu, LineChart, ShieldCheck,
    Settings, UserCheck, LifeBuoy
} from 'lucide-react';

const NavItem = ({ icon: Icon, label, active = false, onClick }) => (
    <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick} style={{ cursor: 'pointer' }}>
        <Icon size={18} />
        <span>{label}</span>
    </div>
);

const Navigation = ({ activeScreen = 'dashboard', onNavigate }) => {
    const items = [
        { icon: Building2, label: 'Control Room', screen: 'dashboard' },
        { icon: Building2, label: 'Organizations', screen: 'tenants' },
        { icon: Users, label: 'Users', screen: 'users' },
        { icon: Calendar, label: 'Events', screen: 'events' },
        { icon: Image, label: 'Exhibitors', screen: 'exhibitors' },
        { icon: Eye, label: 'Visitors', screen: 'visitors' },
        { icon: CreditCard, label: 'Billing', screen: 'billing' },
        { icon: MessageSquare, label: 'Communication', screen: 'communication' },
        { icon: Receipt, label: 'GST', screen: 'gst' },
        { icon: Cpu, label: 'API', screen: 'api' },
        { icon: LineChart, label: 'Analytics', screen: 'analytics' },
        { icon: ShieldCheck, label: 'Compliance', screen: 'compliance' },
        { icon: Settings, label: 'Config', screen: 'config' },
        { icon: UserCheck, label: 'RBAC', screen: 'rbac' },
        { icon: LifeBuoy, label: 'Support', screen: 'support' },
    ];

    return (
        <div className="sidebar-nav">
            <div className="sidebar-logo">
                <div style={{
                    background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                    color: 'white',
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '18px'
                }}>E</div>
                <span style={{ fontWeight: 800, fontSize: '20px', color: '#1e3a8a' }}>EventHub</span>
            </div>

            <div className="nav-list">
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
        </div>
    );
};

export default Navigation;
