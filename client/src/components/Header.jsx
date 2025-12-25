import React from 'react';
import { Search, Bell, Settings, User, ChevronDown } from 'lucide-react';

const Header = () => {
    return (
        <div className="header">
            <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                <span style={{ fontWeight: 700, fontSize: '18px', color: '#1e3a8a' }}>EventHub</span>
            </div>

            <div className="search-bar" style={{ position: 'relative', width: '400px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                    type="text"
                    placeholder="Search tenants, events, exhibitors..."
                    style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '13px' }}
                />
            </div>

            <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ position: 'relative' }}>
                    <Bell size={20} color="#64748b" />
                    <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '10px', width: '14px', height: '14px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
                </div>
                <Settings size={20} color="#64748b" />
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
    );
};

export default Header;
