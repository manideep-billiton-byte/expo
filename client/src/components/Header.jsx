import {
    Search, Bell, Settings as SettingsIcon, ChevronDown,
    ChevronUp, Building2, Users, Calendar, Image, Eye,
    CreditCard, MessageSquare, Receipt, Cpu, LineChart,
    ShieldCheck, UserCheck, LifeBuoy
} from 'lucide-react';

const NavItem = ({ icon: Icon, label, active = false, onClick }) => (
    <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick} style={{ cursor: 'pointer' }}>
        <Icon size={14} />
        <span>{label}</span>
    </div>
);

const Header = ({ activeScreen = 'dashboard', onNavigate, isNavCollapsed, onToggleNav }) => {
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
        { icon: SettingsIcon, label: 'Config', screen: 'config' },
        { icon: UserCheck, label: 'RBAC', screen: 'rbac' },
        { icon: LifeBuoy, label: 'Support', screen: 'support' },
    ];

    return (
        <div className="header-wrapper">
            <div className="header-main">
                <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
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
                    <div className="search-bar" style={{ position: 'relative', width: '300px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search everything..."
                            style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '13px' }}
                        />
                    </div>
                </div>

                <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ position: 'relative', cursor: 'pointer' }}>
                        <Bell size={20} color="#64748b" />
                        <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '10px', width: '14px', height: '14px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
                    </div>
                    <SettingsIcon size={20} color="#64748b" style={{ cursor: 'pointer' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>Master Admin</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>admin@eventhub.com</div>
                        </div>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '14px' }}>
                            MA
                        </div>
                    </div>
                </div>
            </div>

            {!isNavCollapsed && (
                <div className="top-nav-bar fade-in">
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
            )}
        </div>
    );
};

export default Header;
