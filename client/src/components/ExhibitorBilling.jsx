import React, { useState } from 'react';
import { Download, Plus, FileText, Calendar, CheckCircle2, Clock, Building2, Search, ChevronDown } from 'lucide-react';

const ExhibitorBilling = () => {
    const [activeTab, setActiveTab] = useState('Invoices');

    const invoices = [
        {
            number: 'INV-2024-001',
            type: 'Stall Booking - Premium (A-12)',
            inventory: 'Event Fee',
            event: 'Tech Innovation Summit 2024',
            amount: '₹45,000',
            dueDate: 'Mar 15, 2024',
            status: 'Paid'
        },
        {
            number: 'INV-2024-001',
            type: 'Stall Booking - Premium (A-12)',
            inventory: 'Event Fee',
            event: 'Tech Innovation Summit 2024',
            amount: '₹45,000',
            dueDate: 'Mar 15, 2024',
            status: 'Paid'
        },
        {
            number: 'INV-2024-002',
            type: 'Stall Equipments',
            inventory: 'Counter Decor',
            event: 'Digital Marketing Expo',
            amount: '₹45,000',
            dueDate: 'Mar 15, 2024',
            status: 'Paid'
        },
        {
            number: 'INV-2024-019',
            type: 'Stall Equipments',
            inventory: 'Counter Decor',
            event: 'Digital Marketing Expo',
            amount: '₹45,000',
            dueDate: 'Mar 15, 2024',
            status: 'Paid'
        },
        {
            number: 'INV-2024-001',
            type: 'Stall Booking - Premium (A-12)',
            inventory: 'Event Fee',
            event: 'Tech Innovation Summit 2024',
            amount: '₹45,000',
            dueDate: 'Mar 15, 2024',
            status: 'Paid'
        }
    ];

    return (
        <div style={{ padding: '0px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>Inventory &Billing Management</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Audit and billing</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                        <Download size={16} />
                        Export
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563eb', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: 'white', cursor: 'pointer' }}>
                        <Plus size={16} />
                        Add Billing
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {[
                    { label: 'Total Spent', value: '₹2,17,000', subtitle: 'This year', icon: '₹', bgColor: '#dbeafe', iconColor: '#2563eb' },
                    { label: 'Pending', value: '₹95,000', subtitle: '2 invoices', icon: '⏱️', bgColor: '#fef3c7', iconColor: '#f59e0b' },
                    { label: 'Paid', value: '₹1,22,000', subtitle: '2 invoices', icon: '✓', bgColor: '#d1fae5', iconColor: '#10b981' },
                    { label: 'Saved', value: '₹28,000', subtitle: 'Early bird discounts', icon: '📊', bgColor: '#e0f2fe', iconColor: '#0ea5e9' }
                ].map((stat, idx) => (
                    <div key={idx} className="card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>{stat.label}</div>
                                <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>{stat.value}</div>
                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{stat.subtitle}</div>
                            </div>
                            <div style={{ background: stat.bgColor, padding: '10px', borderRadius: '10px', fontSize: '20px' }}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ padding: '0px' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                        {['Invoices', 'Transactions', 'Payment Methods'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    background: activeTab === tab ? '#eff6ff' : 'transparent',
                                    color: activeTab === tab ? '#2563eb' : '#64748b',
                                    border: activeTab === tab ? '1px solid #bfdbfe' : '1px solid transparent',
                                    cursor: 'pointer'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>All Invoices</h3>
                        <div style={{ position: 'relative', width: '280px' }}>
                            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Search invoices..."
                                style={{ width: '100%', padding: '10px 14px 10px 44px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px' }}
                            />
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>INVOICE</th>
                                    <th>INVENTORY</th>
                                    <th>EVENT</th>
                                    <th>AMOUNT</th>
                                    <th>DUE DATE</th>
                                    <th>STATUS</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((invoice, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <FileText size={18} color="#2563eb" />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>{invoice.number}</div>
                                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{invoice.type}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600, fontSize: '13px', color: '#475569' }}>{invoice.inventory}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Building2 size={16} color="#2563eb" />
                                                <span style={{ fontSize: '13px', color: '#475569' }}>{invoice.event}</span>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>{invoice.amount}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={14} color="#94a3b8" />
                                                <span style={{ fontSize: '13px', color: '#64748b' }}>{invoice.dueDate}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                background: '#ecfdf5',
                                                color: '#10b981'
                                            }}>
                                                ● {invoice.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}>...</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '32px', paddingBottom: '24px' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Powered By Billiton</p>
            </div>
        </div>
    );
};

export default ExhibitorBilling;
