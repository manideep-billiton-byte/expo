import React, { useEffect, useState } from 'react';
import { CreditCard, Download, Search, MoreHorizontal, TrendingUp, AlertCircle, CheckCircle2, Clock, Filter, Plus, X, ChevronRight, Mail, MapPin, Building2, Calendar, Receipt, DollarSign, ShieldCheck, Share2, FileText, Users, IndianRupee, Copy } from 'lucide-react';

const BillingManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeMainTab, setActiveMainTab] = useState('Overview');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState('Identity');

    const defaultInvoiceData = {
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
    };

    const [invoices, setInvoices] = useState([]);
    const [invoicesLoading, setInvoicesLoading] = useState(false);
    const [orgs, setOrgs] = useState([]);
    const [orgsLoading, setOrgsLoading] = useState(false);
    const [createInvoiceLoading, setCreateInvoiceLoading] = useState(false);

    const [invoiceData, setInvoiceData] = useState({
        ...defaultInvoiceData
    });

    // Plan Modal State
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [planTab, setPlanTab] = useState('Basic Info');
    const [couponResult, setCouponResult] = useState(null);
    const [createPlanLoading, setCreatePlanLoading] = useState(false);
    const [createdPlans, setCreatedPlans] = useState([]);
    const [plans, setPlans] = useState([]); // Store created plans with coupons

    const defaultPlanData = {
        planName: '',
        planType: '',
        description: '',
        validity: '30',
        status: 'Active',
        limits: {
            maxEvents: '', maxLeads: '', whatsapp: '', ocr: '', maxUsers: '', maxExhibitors: '',
            featureAccess: false, advancedAnalytics: false, crmIntegration: false, apiAccess: false, whiteLabel: false
        },
        pricing: {
            monthly: '', annual: '', enableTrial: false, trialDays: '', gracePeriod: '',
            overageLead: '', overageMessage: ''
        }
    };
    const [planData, setPlanData] = useState(defaultPlanData);

    const handleCreatePlans = async () => {
        setCreatePlanLoading(true);
        try {
            const plansToCreate = ['plan1', 'plan2', 'plan3'];
            const createdPlansList = [];

            for (const planName of plansToCreate) {
                // Use default plan data with the plan name
                const planDataToSend = {
                    planName: planName,
                    planType: 'Custom', // Always create as Custom to generate coupons
                    description: `Subscription plan ${planName}`,
                    validity: 30, // Send as integer
                    status: 'Active',
                    limits: {
                        maxEvents: '10',
                        maxLeads: '5000',
                        whatsapp: '10000',
                        ocr: '1000',
                        maxUsers: '25',
                        maxExhibitors: '100',
                        featureAccess: false,
                        advancedAnalytics: false,
                        crmIntegration: false,
                        apiAccess: false,
                        whiteLabel: false
                    },
                    pricing: {
                        monthly: '9999',
                        annual: '99999',
                        enableTrial: false,
                        trialDays: '14',
                        gracePeriod: '7',
                        overageLead: '0.50',
                        overageMessage: '0.25'
                    }
                };

                const res = await fetch(`${API_BASE}/api/create-plan`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(planDataToSend)
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.details || data.error || `Failed to create ${planName}`);

                createdPlansList.push({
                    planName: planName,
                    plan: data.plan,
                    coupon: data.coupon
                });
            }

            setCreatedPlans(createdPlansList);
            setShowPlanModal(true);
            setPlanTab('Basic Info');
        } catch (err) {
            console.error('Create plans failed', err);
            alert(err.message);
        } finally {
            setCreatePlanLoading(false);
        }
    };

    const handleCreatePlan = async () => {
        setCreatePlanLoading(true);
        try {
            // Prepare plan data with proper formatting
            const planDataToSend = {
                planName: planData.planName,
                planType: planData.planType || 'Custom',
                description: planData.description || '',
                validity: parseInt(planData.validity) || 30,
                status: planData.status || 'Active',
                limits: planData.limits || {},
                pricing: planData.pricing || {}
            };

            const res = await fetch(`${API_BASE}/api/create-plan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(planDataToSend)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.details || data.error || 'Failed to create plan');

            if (planDataToSend.planType === 'Custom' && data.coupon) {
                // Show coupon result
                setCreatedPlans([{
                    planName: planDataToSend.planName,
                    plan: data.plan,
                    coupon: data.coupon
                }]);
            } else {
                alert('Plan created successfully!');
                setShowPlanModal(false);
                setPlanData(defaultPlanData);
            }
            // Reload plans to update dashboard
            await loadPlans();
        } catch (err) {
            console.error('Create plan failed', err);
            alert(err.message || 'Failed to create plan');
        } finally {
            setCreatePlanLoading(false);
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('Coupon code copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
            alert('Failed to copy coupon code');
        }
    };

    const API_BASE = import.meta.env.VITE_API_BASE || '';

    const modalTabs = ['Identity', 'Details', 'Payment', 'Review'];
    const mainTabs = ['Overview', 'Plans', 'Invoices', 'Payments', 'Usage'];

    const handleCloseModal = () => {
        setShowModal(false);
        setShowSuccess(false);
        setActiveTab('Identity');
        setInvoiceData({ ...defaultInvoiceData });
    };

    const getOrgName = (orgId) => {
        const found = orgs.find((o) => String(o.id) === String(orgId));
        return found?.org_name || '';
    };

    const loadOrgs = async () => {
        setOrgsLoading(true);
        try {
            const resp = await fetch(`${API_BASE}/api/organizations`);
            let data;
            const txt = await resp.clone().text();
            try { data = JSON.parse(txt); } catch (e) { data = txt; }
            if (!resp.ok) throw new Error((data && data.error) || String(data) || 'Failed to load organizations');
            setOrgs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load organizations', err);
            setOrgs([]);
        } finally {
            setOrgsLoading(false);
        }
    };

    const loadInvoices = async () => {
        setInvoicesLoading(true);
        try {
            const resp = await fetch(`${API_BASE}/api/invoices`);
            let data;
            const txt = await resp.clone().text();
            try { data = JSON.parse(txt); } catch (e) { data = txt; }
            if (!resp.ok) throw new Error((data && data.error) || String(data) || 'Failed to load invoices');

            const mapped = (Array.isArray(data) ? data : []).map((row) => {
                const created = row.created_at ? new Date(row.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
                const due = row.due_date ? new Date(row.due_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
                const amount = row.amount != null ? Number(row.amount) : 0;

                return {
                    id: row.invoice_number ?? String(row.id ?? ''),
                    org: row.organization_name ?? 'Unknown Tenant',
                    plan: row.plan_type ?? '',
                    amount: `₹${amount.toLocaleString('en-IN')}`,
                    rawAmount: amount,
                    status: row.status ?? 'Pending',
                    date: created,
                    due
                };
            });

            setInvoices(mapped);
        } catch (err) {
            console.error('Failed to load invoices', err);
            setInvoices([]);
        } finally {
            setInvoicesLoading(false);
        }
    };

    const loadPlans = async () => {
        try {
            const resp = await fetch(`${API_BASE}/api/plans`);
            let data;
            const txt = await resp.clone().text();
            try { data = JSON.parse(txt); } catch (e) { data = txt; }
            if (!resp.ok) throw new Error((data && data.error) || String(data) || 'Failed to load plans');
            setPlans(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load plans', err);
            setPlans([]);
        }
    };

    useEffect(() => {
        loadOrgs();
        loadInvoices();
        loadPlans();
    }, []);

    const handleOpenModal = () => {
        setShowModal(true);
        setShowSuccess(false);
        setActiveTab('Identity');
        setInvoiceData({ ...defaultInvoiceData });
    };

    const updateLineItem = (idx, patch) => {
        const nextItems = invoiceData.items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
        setInvoiceData({ ...invoiceData, items: nextItems });
    };

    const addLineItem = () => {
        setInvoiceData({
            ...invoiceData,
            items: [...invoiceData.items, { description: '', quantity: 1, price: '' }]
        });
    };

    const handleCreateInvoice = async () => {
        setCreateInvoiceLoading(true);
        try {
            const items = (Array.isArray(invoiceData.items) ? invoiceData.items : []).map((it) => ({
                description: it.description,
                quantity: it.quantity === '' ? 1 : Number(it.quantity ?? 1),
                price: it.price === '' ? 0 : Number(it.price ?? 0)
            }));

            const payload = {
                organizationId: invoiceData.organization || null,
                billingEmail: invoiceData.billingEmail,
                billingAddress: invoiceData.billingAddress,
                taxId: invoiceData.taxId,
                planType: invoiceData.planType,
                amount: invoiceData.amount === '' ? 0 : Number(invoiceData.amount),
                currency: invoiceData.currency,
                dueDate: invoiceData.dueDate,
                paymentMethod: invoiceData.paymentMethod,
                items,
                notes: invoiceData.notes,
                terms: invoiceData.terms
            };

            const resp = await fetch(`${API_BASE}/api/invoices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            let data;
            const txt = await resp.clone().text();
            try { data = JSON.parse(txt); } catch (e) { data = txt; }
            if (!resp.ok) throw new Error((data && data.error) || String(data) || 'Failed to create invoice');

            setShowSuccess(true);
            await loadInvoices();
        } catch (err) {
            console.error('Create invoice failed', err);
            alert('Failed to create invoice: ' + (err.message || err));
        } finally {
            setCreateInvoiceLoading(false);
        }
    };

    // Sample data for recent invoices
    const recentInvoices = invoices.length > 0 ? invoices.slice(0, 4) : [
        { id: 'INV-2024-001', org: 'TechCorp India', amount: '₹25,000', status: 'Paid', due: 'Dec 30, 2024' },
        { id: 'INV-2024-002', org: 'StartupHub', amount: '₹15,000', status: 'Pending', due: 'Jan 02, 2025' },
        { id: 'INV-2024-003', org: 'EventPro Solutions', amount: '₹8,500', status: 'Pending', due: 'Jan 05, 2025' },
        { id: 'INV-2024-004', org: 'Industrial Association', amount: '₹35,000', status: 'Error', due: 'Dec 15, 2024' }
    ];

    // Subscription plans data: combine live DB plans with static fallback
    const subscriptionPlans = plans.length > 0 ? plans.map(p => ({
        plan: p.name || 'Unnamed',
        price: p.pricing?.monthly ? `₹${p.pricing.monthly}/mo` : 'Custom',
        tenants: 0, // Could be derived from usage later
        status: p.status || 'Active'
    })) : [
        { plan: 'Starter', price: '₹2,999/mo', tenants: 45, status: 'Active' },
        { plan: 'Professional', price: '₹9,999/mo', tenants: 120, status: 'Active' },
        { plan: 'Enterprise', price: '₹24,999/mo', tenants: 85, status: 'Active' },
        { plan: 'Government', price: 'Custom', tenants: 18, status: 'Active' }
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Paid': return { color: '#10b981', bg: 'transparent', dotColor: '#10b981' };
            case 'Pending': return { color: '#f59e0b', bg: 'transparent', dotColor: '#f59e0b' };
            case 'Error':
            case 'Overdue': return { color: '#ef4444', bg: 'transparent', dotColor: '#ef4444' };
            case 'Active': return { color: '#10b981', bg: 'transparent', dotColor: '#10b981' };
            default: return { color: '#64748b', bg: 'transparent', dotColor: '#64748b' };
        }
    };

    return (
        <div className="dashboard-container">
            {/* Header Content */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }} className="fade-in">
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Subscription & Billing</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Manage plans, invoices, and payment tracking</p>
                </div>
                <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    cursor: 'pointer'
                }}>
                    <Download size={16} />
                    Export Report
                </button>
            </div>

            {/* Main Tabs */}
            <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid #e5e7eb', marginBottom: '24px' }} className="fade-in">
                {mainTabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveMainTab(tab)}
                        style={{
                            padding: '12px 20px',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: activeMainTab === tab ? '#1e293b' : '#6b7280',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeMainTab === tab ? '2px solid #1e293b' : '2px solid transparent',
                            cursor: 'pointer',
                            marginBottom: '-1px'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Stats Cards - New Design */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }} className="fade-in">
                {/* Monthly Revenue */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #f1f5f9'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>MONTHLY REVENUE</div>
                            <div style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>₹12.4L</div>
                            <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 500 }}>+18% vs last month</div>
                        </div>
                        <div style={{ background: '#e0f2fe', padding: '10px', borderRadius: '10px' }}>
                            <IndianRupee size={20} color="#0ea5e9" />
                        </div>
                    </div>
                </div>

                {/* Active Subscriptions */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #f1f5f9'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>ACTIVE SUBSCRIPTIONS</div>
                            <div style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>248</div>
                            <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 500 }}>+12 this month</div>
                        </div>
                        <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '10px' }}>
                            <FileText size={20} color="#22c55e" />
                        </div>
                    </div>
                </div>

                {/* Pending Invoices */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #f1f5f9'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>PENDING INVOICES</div>
                            <div style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>23</div>
                            <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 500 }}>₹2.8L outstanding</div>
                        </div>
                        <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '10px' }}>
                            <Clock size={20} color="#f59e0b" />
                        </div>
                    </div>
                </div>

                {/* Avg. Revenue/Tenant */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #f1f5f9'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>AVG. REVENUE/TENANT</div>
                            <div style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>₹5,000</div>
                            <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 500 }}>+8% growth</div>
                        </div>
                        <div style={{ background: '#f3e8ff', padding: '10px', borderRadius: '10px' }}>
                            <TrendingUp size={20} color="#a855f7" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Two Column Layout - Recent Invoices & Subscription Plans */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="fade-in">
                {/* Recent Invoices Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #f1f5f9',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 20px',
                        borderBottom: '1px solid #f1f5f9'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Receipt size={18} color="#6b7280" />
                            <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Recent Invoices</span>
                        </div>
                        <button style={{
                            background: 'none',
                            border: 'none',
                            color: '#6b7280',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer'
                        }}>
                            View All
                        </button>
                    </div>

                    {/* Invoice Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#fafafa' }}>
                                <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>INVOICE #</th>
                                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>TENANT</th>
                                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>AMOUNT</th>
                                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>STATUS</th>
                                <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>DUE DATE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentInvoices.map((inv, idx) => (
                                <tr key={idx} style={{ borderTop: '1px solid #f5f5f5' }}>
                                    <td style={{ padding: '12px 20px', fontSize: '13px', color: '#374151', fontWeight: 500 }}>{inv.id}</td>
                                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>{inv.org}</td>
                                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151', fontWeight: 500 }}>{inv.amount}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            color: getStatusStyle(inv.status).color
                                        }}>
                                            <span style={{
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                background: getStatusStyle(inv.status).dotColor
                                            }}></span>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 20px', fontSize: '13px', color: '#6b7280' }}>{inv.due}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Subscription Plans Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #f1f5f9',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 20px',
                        borderBottom: '1px solid #f1f5f9'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CreditCard size={18} color="#6b7280" />
                            <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Subscription Plans</span>
                        </div>
                        <button
                            onClick={() => {
                                setShowPlanModal(true);
                                setPlanTab('Basic Info');
                                setPlanData(defaultPlanData);
                                setCreatedPlans([]);
                                setCouponResult(null);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#0f766e',
                                border: 'none',
                                color: 'white',
                                fontSize: '13px',
                                fontWeight: 500,
                                padding: '8px 14px',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            <Plus size={14} />
                            Add Plan
                        </button>
                    </div>

                    {/* Plans Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#fafafa' }}>
                                <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>PLAN</th>
                                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>PRICE</th>
                                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>TENANTS</th>
                                <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptionPlans.map((plan, idx) => (
                                <tr key={idx} style={{ borderTop: '1px solid #f5f5f5' }}>
                                    <td style={{ padding: '12px 20px', fontSize: '13px', color: '#374151', fontWeight: 500 }}>{plan.plan}</td>
                                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>{plan.price}</td>
                                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>{plan.tenants}</td>
                                    <td style={{ padding: '12px 20px' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            color: getStatusStyle(plan.status).color
                                        }}>
                                            <span style={{
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                background: getStatusStyle(plan.status).dotColor
                                            }}></span>
                                            {plan.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        width: '800px',
                        maxWidth: '95%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        position: 'relative'
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
                                        {modalTabs.map((tab) => (
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
                                                                {orgs.map((o) => (
                                                                    <option key={o.id} value={String(o.id)}>
                                                                        {o.org_name}
                                                                    </option>
                                                                ))}
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
                                                            <option value="Starter">Starter Plan</option>
                                                            <option value="Professional">Professional Plan</option>
                                                            <option value="Enterprise">Enterprise Plan</option>
                                                            <option value="Government">Government Plan</option>
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
                                                                value={item.description}
                                                                onChange={(e) => updateLineItem(idx, { description: e.target.value })}
                                                                style={{ flex: 3, padding: '10px', borderRadius: '10px', border: '1.5px solid #f1f5f9', fontSize: '13px' }}
                                                            />
                                                            <input
                                                                type="number"
                                                                placeholder="Qty"
                                                                value={item.quantity}
                                                                onChange={(e) => updateLineItem(idx, { quantity: e.target.value === '' ? '' : Number(e.target.value) })}
                                                                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid #f1f5f9', fontSize: '13px' }}
                                                            />
                                                            <input
                                                                type="number"
                                                                placeholder="Price"
                                                                value={item.price}
                                                                onChange={(e) => updateLineItem(idx, { price: e.target.value })}
                                                                style={{ flex: 1.5, padding: '10px', borderRadius: '10px', border: '1.5px solid #f1f5f9', fontSize: '13px' }}
                                                            />
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={addLineItem}
                                                        style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                    >
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
                                                            <div style={{ fontWeight: 700, color: '#1e293b' }}>{getOrgName(invoiceData.organization) || 'Not Selected'}</div>
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
                                                        const currentIndex = modalTabs.indexOf(activeTab);
                                                        setActiveTab(modalTabs[currentIndex - 1]);
                                                    }}
                                                    style={{ padding: '12px 24px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
                                                >
                                                    Back
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    const currentIndex = modalTabs.indexOf(activeTab);
                                                    if (currentIndex < modalTabs.length - 1) {
                                                        setActiveTab(modalTabs[currentIndex + 1]);
                                                    } else {
                                                        handleCreateInvoice();
                                                    }
                                                }}
                                                disabled={createInvoiceLoading}
                                                style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                            >
                                                {activeTab === 'Review' ? (createInvoiceLoading ? 'Generating...' : 'Generate & Send') : 'Save & Next'} <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Plan Creation Modal */}
            {showPlanModal && createdPlans.length === 0 && (
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
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '24px',
                        width: '900px',
                        maxWidth: '95%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        position: 'relative',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div>
                                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Create Subscription Plan</h2>
                                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Create a plan and generate coupons for subscriptions</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowPlanModal(false);
                                        setPlanTab('Basic Info');
                                        setPlanData(defaultPlanData);
                                        setCreatedPlans([]);
                                        setCouponResult(null);
                                    }}
                                    style={{ padding: '8px', borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <X size={20} color="#64748b" />
                                </button>
                            </div>

                            <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', marginBottom: '24px' }}>
                                {['Basic Info', 'Limits', 'Pricing'].map((tab) => {
                                    const isActive = planTab === tab;
                                    return (
                                        <div
                                            key={tab}
                                            onClick={() => setPlanTab(tab)}
                                            style={{
                                                padding: '12px 16px',
                                                fontSize: '14px',
                                                fontWeight: 700,
                                                color: isActive ? '#0f766e' : '#64748b',
                                                borderBottom: isActive ? '2.5px solid #0f766e' : '2.5px solid transparent',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {tab}
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ minHeight: '360px' }}>
                                {planTab === 'Basic Info' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Plan Name *</label>
                                                <input
                                                    value={planData.planName}
                                                    onChange={(e) => setPlanData({ ...planData, planName: e.target.value })}
                                                    placeholder="Enter plan name"
                                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Plan Type</label>
                                                <select
                                                    value={planData.planType}
                                                    onChange={(e) => setPlanData({ ...planData, planType: e.target.value })}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px', background: 'white' }}
                                                >
                                                    <option value="">Select plan type</option>
                                                    <option value="Custom">Custom</option>
                                                    <option value="Standard">Standard</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Description</label>
                                            <textarea
                                                value={planData.description}
                                                onChange={(e) => setPlanData({ ...planData, description: e.target.value })}
                                                placeholder="Describe this plan"
                                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px', minHeight: '110px', resize: 'vertical' }}
                                            />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Validity (days)</label>
                                                <input
                                                    type="number"
                                                    value={planData.validity}
                                                    onChange={(e) => setPlanData({ ...planData, validity: e.target.value })}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Status</label>
                                                <select
                                                    value={planData.status}
                                                    onChange={(e) => setPlanData({ ...planData, status: e.target.value })}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px', background: 'white' }}
                                                >
                                                    <option value="Active">Active</option>
                                                    <option value="Inactive">Inactive</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {planTab === 'Limits' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Max Events</label>
                                                <input
                                                    type="number"
                                                    value={planData.limits.maxEvents}
                                                    onChange={(e) => setPlanData({ ...planData, limits: { ...planData.limits, maxEvents: e.target.value } })}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Max Users</label>
                                                <input
                                                    type="number"
                                                    value={planData.limits.maxUsers}
                                                    onChange={(e) => setPlanData({ ...planData, limits: { ...planData.limits, maxUsers: e.target.value } })}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Max Leads</label>
                                                <input
                                                    type="number"
                                                    value={planData.limits.maxLeads}
                                                    onChange={(e) => setPlanData({ ...planData, limits: { ...planData.limits, maxLeads: e.target.value } })}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Max Exhibitors</label>
                                                <input
                                                    type="number"
                                                    value={planData.limits.maxExhibitors}
                                                    onChange={(e) => setPlanData({ ...planData, limits: { ...planData.limits, maxExhibitors: e.target.value } })}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>WhatsApp Messages</label>
                                                <input
                                                    type="number"
                                                    value={planData.limits.whatsapp}
                                                    onChange={(e) => setPlanData({ ...planData, limits: { ...planData.limits, whatsapp: e.target.value } })}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>OCR Credits</label>
                                                <input
                                                    type="number"
                                                    value={planData.limits.ocr}
                                                    onChange={(e) => setPlanData({ ...planData, limits: { ...planData.limits, ocr: e.target.value } })}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {planTab === 'Pricing' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Monthly Price (₹)</label>
                                                <input
                                                    type="number"
                                                    value={planData.pricing.monthly}
                                                    onChange={(e) => setPlanData({ ...planData, pricing: { ...planData.pricing, monthly: e.target.value } })}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Annual Price (₹)</label>
                                                <input
                                                    type="number"
                                                    value={planData.pricing.annual}
                                                    onChange={(e) => setPlanData({ ...planData, pricing: { ...planData.pricing, annual: e.target.value } })}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '8px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                                            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>Trial Settings</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <label style={{ fontSize: '14px', color: '#475569' }}>Enable Trial</label>
                                                    <div
                                                        onClick={() => setPlanData({ ...planData, pricing: { ...planData.pricing, enableTrial: !planData.pricing.enableTrial } })}
                                                        style={{ width: '44px', height: '24px', borderRadius: '12px', background: planData.pricing.enableTrial ? '#0f766e' : '#cbd5e1', position: 'relative', cursor: 'pointer' }}
                                                    >
                                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: planData.pricing.enableTrial ? '22px' : '2px', transition: 'left 0.2s' }} />
                                                    </div>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Trial Days</label>
                                                        <input
                                                            type="number"
                                                            value={planData.pricing.trialDays}
                                                            onChange={(e) => setPlanData({ ...planData, pricing: { ...planData.pricing, trialDays: e.target.value } })}
                                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Grace Period (days)</label>
                                                        <input
                                                            type="number"
                                                            value={planData.pricing.gracePeriod}
                                                            onChange={(e) => setPlanData({ ...planData, pricing: { ...planData.pricing, gracePeriod: e.target.value } })}
                                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '8px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                                            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>Overage Pricing</h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Per Lead (₹)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={planData.pricing.overageLead}
                                                        onChange={(e) => setPlanData({ ...planData, pricing: { ...planData.pricing, overageLead: e.target.value } })}
                                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Per Message (₹)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={planData.pricing.overageMessage}
                                                        onChange={(e) => setPlanData({ ...planData, pricing: { ...planData.pricing, overageMessage: e.target.value } })}
                                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'space-between', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                                <button
                                    onClick={() => {
                                        setShowPlanModal(false);
                                        setPlanTab('Basic Info');
                                        setPlanData(defaultPlanData);
                                        setCreatedPlans([]);
                                        setCouponResult(null);
                                    }}
                                    style={{ padding: '12px 24px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!planData.planName || planData.planName.trim() === '') {
                                            alert('Plan name is required');
                                            return;
                                        }
                                        await handleCreatePlan();
                                    }}
                                    disabled={createPlanLoading}
                                    style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: createPlanLoading ? '#94a3b8' : '#0f766e', color: 'white', fontWeight: 700, fontSize: '14px', cursor: createPlanLoading ? 'not-allowed' : 'pointer' }}
                                >
                                    {createPlanLoading ? 'Creating...' : 'Create Plan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Plan Modal - Show Created Plans with Coupons */}
            {showPlanModal && createdPlans.length > 0 && (
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
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '24px',
                        width: '800px',
                        maxWidth: '95%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <div>
                                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Plans Created Successfully</h2>
                                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Copy the coupon codes to use in organization subscriptions</p>
                                </div>
                                <button
                                    onClick={() => { setShowPlanModal(false); setCreatedPlans([]); setPlanTab('Basic Info'); setPlanData(defaultPlanData); setCouponResult(null); }}
                                    style={{ padding: '8px', borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <X size={20} color="#64748b" />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {createdPlans.map((item, idx) => (
                                    <div key={idx} style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '24px', background: '#fafafa' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                            <div>
                                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0, marginBottom: '4px' }}>{item.planName}</h3>
                                                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Plan ID: {item.plan?.id}</p>
                                            </div>
                                            <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, background: '#dcfce7', color: '#166534' }}>Active</span>
                                        </div>

                                        {/* Show coupon only for Custom plans */}
                                        {item.coupon ? (
                                            <div style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Coupon Code</label>
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                    <div style={{ flex: 1, padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '16px', fontWeight: 700, fontFamily: 'monospace', color: '#1e293b', letterSpacing: '2px' }}>
                                                        {item.coupon?.coupon_code || 'N/A'}
                                                    </div>
                                                    <button
                                                        onClick={() => copyToClipboard(item.coupon?.coupon_code || '')}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#0f766e', border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
                                                    >
                                                        <Copy size={16} />
                                                        Copy
                                                    </button>
                                                </div>
                                                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px', marginBottom: 0 }}>
                                                    Use this coupon code when subscribing an organization to this plan
                                                </p>
                                            </div>
                                        ) : (
                                            <div style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                                <p style={{ fontSize: '14px', color: '#059669', fontWeight: 600, margin: 0 }}>Standard plan created and available in Subscription Plans</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                                <button
                                    onClick={() => { setShowPlanModal(false); setCreatedPlans([]); setPlanTab('Basic Info'); setPlanData(defaultPlanData); setCouponResult(null); }}
                                    style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: '#0f766e', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillingManagement;

