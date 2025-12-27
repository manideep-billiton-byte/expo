import React, { useState } from 'react';
import { CreditCard, Download, Search, MoreHorizontal, TrendingUp, AlertCircle, CheckCircle2, Clock, Filter, Plus, X, ChevronRight, Mail, MapPin, Building2, Calendar, Receipt, DollarSign, ShieldCheck, Share2 } from 'lucide-react';

const BillingManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [activeFilter, setActiveFilter] = useState('All');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalStep, setModalStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState('Identity');

    const [invoiceData, setInvoiceData] = useState({
        organization: '',
        billingEmail: '',
        billingAddress: '',
        taxId: '',
        planType: '',
        amount: '',
        currency: 'INR',
        dueDate: '',
        paymentMethod: '',
        items: [{ description: '', quantity: 1, price: '' }],
        notes: '',
        terms: false
    });

    const tabs = ['Identity', 'Details', 'Payment', 'Review'];

    const handleCloseModal = () => {
        setShowModal(false);
        setModalStep(1);
        setShowSuccess(false);
        setActiveTab('Identity');
    };

    const stats = [
        { label: 'Total Outstanding', value: '₹1,24,500', icon: AlertCircle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
        { label: 'Active Plans', value: '42', icon: CheckCircle2, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
        { label: 'Revenue (MTD)', value: '₹8,92,000', icon: TrendingUp, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
        { label: 'Pending Invoices', value: '12', icon: Clock, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    ];

    const invoices = [
        { id: 'INV-2024-001', org: 'TechEvents Inc.', plan: 'Enterprise', amount: '₹45,000', status: 'Paid', date: 'Mar 20, 2024', due: 'Mar 25, 2024' },
        { id: 'INV-2024-002', org: 'Global Connect', plan: 'Professional', amount: '₹25,000', status: 'Pending', date: 'Mar 18, 2024', due: 'Mar 23, 2024' },
        { id: 'INV-2024-003', org: 'Health Expo', plan: 'Basic', amount: '₹12,000', status: 'Paid', date: 'Mar 15, 2024', due: 'Mar 20, 2024' },
        { id: 'INV-2024-004', org: 'Edu Summit', plan: 'Enterprise', amount: '₹45,000', status: 'Overdue', date: 'Mar 10, 2024', due: 'Mar 15, 2024' },
        { id: 'INV-2024-005', org: 'Real Estate Plus', plan: 'Professional', amount: '₹25,000', status: 'Paid', date: 'Mar 08, 2024', due: 'Mar 13, 2024' },
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Paid': return { color: '#10b981', bg: '#dcfce7' };
            case 'Pending': return { color: '#f59e0b', bg: '#fef3c7' };
            case 'Overdue': return { color: '#ef4444', bg: '#fee2e2' };
            default: return { color: '#64748b', bg: '#f1f5f9' };
        }
    };

    return (
        <div className="dashboard-container">
            {/* Header Content */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }} className="fade-in">
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>Billing & Subscriptions</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Manage organization plans, invoices and revenue tracking</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                        <Download size={16} />
                        Export Data
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563eb', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: 'white', cursor: 'pointer' }}
                    >
                        <Plus size={16} />
                        Create Invoice
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }} className="fade-in">
                {stats.map((stat, idx) => (
                    <div key={idx} className="card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>{stat.label}</div>
                                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>{stat.value}</div>
                            </div>
                            <div style={{ background: stat.bg, padding: '12px', borderRadius: '12px' }}>
                                <stat.icon size={22} color={stat.color} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Billing Table Card */}
            <div className="card fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['All', 'Paid', 'Pending', 'Overdue'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    border: '1px solid',
                                    borderColor: activeFilter === filter ? '#2563eb' : '#e2e8f0',
                                    background: activeFilter === filter ? '#2563eb' : 'white',
                                    color: activeFilter === filter ? 'white' : '#64748b',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                    <div style={{ position: 'relative', width: '280px' }}>
                        <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search invoices or organizations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px 8px 36px',
                                border: '1.5px solid #e2e8f0',
                                borderRadius: '10px',
                                fontSize: '13px',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>INVOICE ID</th>
                                <th>ORGANIZATION</th>
                                <th>PLAN TYPE</th>
                                <th>AMOUNT</th>
                                <th>STATUS</th>
                                <th>DATE</th>
                                <th>DUE DATE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((inv, idx) => (
                                <tr key={idx} className="hover-lift">
                                    <td style={{ fontWeight: 700, color: '#1e3a8a' }}>{inv.id}</td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{inv.org}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <CreditCard size={14} color="#64748b" />
                                            <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>{inv.plan}</span>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 700, color: '#1e293b' }}>{inv.amount}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            color: getStatusStyle(inv.status).color,
                                            background: getStatusStyle(inv.status).bg
                                        }}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '13px', color: '#64748b' }}>{inv.date}</td>
                                    <td style={{ fontSize: '13px', color: '#64748b' }}>{inv.due}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button title="Download Invoice" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                                <Download size={16} color="#64748b" />
                                            </button>
                                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                                <MoreHorizontal size={16} color="#64748b" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                        Showing 1 to 5 of 42 entries
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button style={{ padding: '6px 10px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '6px', fontSize: '12px', color: '#64748b' }}>Prev</button>
                        <button style={{ padding: '6px 12px', background: '#2563eb', border: 'none', borderRadius: '6px', fontSize: '12px', color: 'white', fontWeight: 600 }}>1</button>
                        <button style={{ padding: '6px 12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', color: '#64748b' }}>2</button>
                        <button style={{ padding: '6px 10px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '6px', fontSize: '12px', color: '#64748b' }}>Next</button>
                    </div>
                </div>
            </div>

            {/* Modal Overlay */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }} onClick={handleCloseModal}>
                    <div style={{
                        background: 'white',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '850px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        animation: 'fadeIn 0.3s ease-out'
                    }} onClick={e => e.stopPropagation()}>

                        <div style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <div>
                                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Create New Invoice</h2>
                                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Complete all steps to generate a professional invoice</p>
                                </div>
                                <button onClick={handleCloseModal} style={{ padding: '8px', borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={20} color="#64748b" />
                                </button>
                            </div>

                            {showSuccess ? (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <div style={{ width: '80px', height: '80px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                        <CheckCircle2 size={40} color="#10b981" />
                                    </div>
                                    <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '12px' }}>Invoice Created!</h2>
                                    <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '40px', maxWidth: '400px', margin: '0 auto 40px' }}>The invoice has been successfully generated and sent to the organization.</p>

                                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                                        <button onClick={handleCloseModal} style={{ padding: '12px 32px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Close</button>
                                        <button style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <Download size={18} /> View PDF
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Modal Tabs */}
                                    <div style={{ display: 'flex', background: '#f8fafc', padding: '6px', borderRadius: '14px', marginBottom: '32px' }}>
                                        {tabs.map((tab) => (
                                            <div
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                style={{
                                                    flex: 1,
                                                    textAlign: 'center',
                                                    padding: '10px 0',
                                                    borderRadius: '10px',
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    background: activeTab === tab ? 'white' : 'transparent',
                                                    color: activeTab === tab ? '#2563eb' : '#64748b',
                                                    boxShadow: activeTab === tab ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none'
                                                }}
                                            >
                                                {tab}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Tab Content */}
                                    <div style={{ minHeight: '350px' }}>
                                        {activeTab === 'Identity' && (
                                            <div className="fade-in">
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Organization *</label>
                                                        <div style={{ position: 'relative' }}>
                                                            <Building2 size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                                            <select
                                                                value={invoiceData.organization}
                                                                onChange={(e) => setInvoiceData({ ...invoiceData, organization: e.target.value })}
                                                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px', appearance: 'none' }}
                                                            >
                                                                <option value="">Select Organization</option>
                                                                <option value="TechEvents Inc.">TechEvents Inc.</option>
                                                                <option value="Global Connect">Global Connect</option>
                                                                <option value="Health Expo">Health Expo</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Billing Email *</label>
                                                        <div style={{ position: 'relative' }}>
                                                            <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                                            <input
                                                                type="email"
                                                                placeholder="billing@organization.com"
                                                                value={invoiceData.billingEmail}
                                                                onChange={(e) => setInvoiceData({ ...invoiceData, billingEmail: e.target.value })}
                                                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                                                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Billing Address</label>
                                                    <div style={{ position: 'relative' }}>
                                                        <MapPin size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                                                        <textarea
                                                            placeholder="Enter full billing address"
                                                            value={invoiceData.billingAddress}
                                                            onChange={(e) => setInvoiceData({ ...invoiceData, billingAddress: e.target.value })}
                                                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px', minHeight: '100px', resize: 'none' }}
                                                        />
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Tax ID / GSTIN</label>
                                                    <div style={{ position: 'relative' }}>
                                                        <Receipt size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                                        <input
                                                            type="text"
                                                            placeholder="Enter Tax Identification Number"
                                                            value={invoiceData.taxId}
                                                            onChange={(e) => setInvoiceData({ ...invoiceData, taxId: e.target.value })}
                                                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'Details' && (
                                            <div className="fade-in">
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Plan / Service Type *</label>
                                                        <select
                                                            value={invoiceData.planType}
                                                            onChange={(e) => setInvoiceData({ ...invoiceData, planType: e.target.value })}
                                                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                                                        >
                                                            <option value="">Select Category</option>
                                                            <option value="Enterprise">Enterprise Plan</option>
                                                            <option value="Professional">Professional Plan</option>
                                                            <option value="Basic">Basic Plan</option>
                                                            <option value="Custom">Custom Service</option>
                                                        </select>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Amount *</label>
                                                        <div style={{ position: 'relative' }}>
                                                            <DollarSign size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                                            <input
                                                                type="number"
                                                                placeholder="0.00"
                                                                value={invoiceData.amount}
                                                                onChange={(e) => setInvoiceData({ ...invoiceData, amount: e.target.value })}
                                                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                                                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Line Items</label>
                                                    {invoiceData.items.map((item, idx) => (
                                                        <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                            <input
                                                                placeholder="Description"
                                                                style={{ flex: 3, padding: '10px', borderRadius: '10px', border: '1.5px solid #f1f5f9', fontSize: '13px' }}
                                                            />
                                                            <input
                                                                type="number"
                                                                placeholder="Qty"
                                                                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid #f1f5f9', fontSize: '13px' }}
                                                            />
                                                            <input
                                                                type="number"
                                                                placeholder="Price"
                                                                style={{ flex: 1.5, padding: '10px', borderRadius: '10px', border: '1.5px solid #f1f5f9', fontSize: '13px' }}
                                                            />
                                                        </div>
                                                    ))}
                                                    <button style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Plus size={14} /> Add Another Item
                                                    </button>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Notes for Client</label>
                                                    <textarea
                                                        placeholder="Additional information or instructions..."
                                                        value={invoiceData.notes}
                                                        onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px', minHeight: '80px', resize: 'none' }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'Payment' && (
                                            <div className="fade-in">
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Due Date *</label>
                                                        <div style={{ position: 'relative' }}>
                                                            <Calendar size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                                            <input
                                                                type="date"
                                                                value={invoiceData.dueDate}
                                                                onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                                                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Payment Method Preference</label>
                                                        <div style={{ position: 'relative' }}>
                                                            <CreditCard size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                                            <select
                                                                value={invoiceData.paymentMethod}
                                                                onChange={(e) => setInvoiceData({ ...invoiceData, paymentMethod: e.target.value })}
                                                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px', appearance: 'none' }}
                                                            >
                                                                <option value="">Any Method</option>
                                                                <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                                                                <option value="Card">Credit/Debit Card</option>
                                                                <option value="UPI">UPI</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                                                    <h4 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <ShieldCheck size={18} color="#2563eb" /> Compliance & Terms
                                                    </h4>
                                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={invoiceData.terms}
                                                            onChange={(e) => setInvoiceData({ ...invoiceData, terms: e.target.checked })}
                                                            style={{ marginTop: '4px' }}
                                                        />
                                                        <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                                                            I confirm that all financial details provided are accurate according to company policy. The invoice will be generated with a unique ID and tracked for tax compliance.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'Review' && (
                                            <div className="fade-in">
                                                <div style={{ border: '1.5px solid #f1f5f9', borderRadius: '16px', padding: '24px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                                                        <div>
                                                            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Organization</div>
                                                            <div style={{ fontWeight: 700, color: '#1e293b' }}>{invoiceData.organization || 'Not Selected'}</div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Due Date</div>
                                                            <div style={{ fontWeight: 700, color: '#1e293b' }}>{invoiceData.dueDate || 'Immediate'}</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ marginBottom: '24px' }}>
                                                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '12px' }}>Billing Summary</div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                            <span style={{ fontSize: '14px', color: '#64748b' }}>{invoiceData.planType || 'Selected Service'}</span>
                                                            <span style={{ fontWeight: 600 }}>₹{invoiceData.amount || '0'}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                            <span style={{ fontSize: '14px', color: '#64748b' }}>Tax (18% GST)</span>
                                                            <span style={{ fontWeight: 600 }}>₹{(Number(invoiceData.amount) * 0.18).toFixed(2)}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '2px solid #f1f5f9' }}>
                                                            <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Total Amount</span>
                                                            <span style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb' }}>₹{(Number(invoiceData.amount) * 1.18).toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Modal Footer */}
                                    <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                                        <button
                                            onClick={handleCloseModal}
                                            style={{ padding: '12px 24px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
                                        >
                                            Discard
                                        </button>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            {activeTab !== 'Identity' && (
                                                <button
                                                    onClick={() => {
                                                        const currentIndex = tabs.indexOf(activeTab);
                                                        setActiveTab(tabs[currentIndex - 1]);
                                                    }}
                                                    style={{ padding: '12px 24px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
                                                >
                                                    Back
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    const currentIndex = tabs.indexOf(activeTab);
                                                    if (currentIndex < tabs.length - 1) {
                                                        setActiveTab(tabs[currentIndex + 1]);
                                                    } else {
                                                        setShowSuccess(true);
                                                    }
                                                }}
                                                style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                            >
                                                {activeTab === 'Review' ? 'Generate & Send' : 'Save & Next'} <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '40px', paddingBottom: '24px' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Master Administrator Billing Portal • Powered By Billiton</p>
            </div>
        </div>
    );
};

export default BillingManagement;
