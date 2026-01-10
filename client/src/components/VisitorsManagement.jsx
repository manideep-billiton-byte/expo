import React, { useEffect, useState } from 'react';
import { Eye, User, Info, Search, Download, MoreHorizontal, Plus, X, Check, ChevronRight, Mail, MessageSquare, Send, Smartphone, Calendar, MapPin, Building2, Download as DownloadIcon, Share2, Copy } from 'lucide-react';
import { apiFetch } from '../utils/api';

const VisitorsManagement = () => {
    const [activeTab, setActiveTab] = useState('All Visitors');
    const [searchQuery, setSearchQuery] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [modalStep, setModalStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);

    const defaultVisitorData = {
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        gender: '',
        age: '',
        organization: '',
        designation: '',
        event: '',
        visitorCategory: '',
        validDates: '',
        communication: {
            whatsapp: true,
            email: true,
            sms: false
        }
    };

    const [visitors, setVisitors] = useState([]);
    const [visitorsLoading, setVisitorsLoading] = useState(false);
    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(false);
    const [createVisitorLoading, setCreateVisitorLoading] = useState(false);

    const [visitorData, setVisitorData] = useState({
        ...defaultVisitorData
    });

    const handleOpenModal = () => {
        setModalStep(1);
        setShowSuccess(false);
        setVisitorData({ ...defaultVisitorData });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalStep(1);
        setShowSuccess(false);
        setVisitorData({ ...defaultVisitorData });
    };

    const maskEmail = (email) => {
        if (!email) return '';
        const atIndex = email.indexOf('@');
        if (atIndex <= 1) return email;
        const name = email.slice(0, atIndex);
        const domain = email.slice(atIndex);
        return `${name[0]}${'*'.repeat(Math.max(1, name.length - 2))}${name[name.length - 1]}${domain}`;
    };

    const maskPhone = (phone) => {
        if (!phone) return '';
        const digits = String(phone);
        if (digits.length <= 4) return digits;
        return `${digits.slice(0, 3)}${'*'.repeat(Math.max(1, digits.length - 6))}${digits.slice(-3)}`;
    };

    const loadEvents = async () => {
        setEventsLoading(true);
        try {
            const resp = await apiFetch('/api/events');
            let data;
            const txt = await resp.clone().text();
            try { data = JSON.parse(txt); } catch (e) { data = txt; }
            if (!resp.ok) throw new Error((data && data.error) || String(data) || 'Failed to load events');
            setEvents(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load events', err);
            setEvents([]);
        } finally {
            setEventsLoading(false);
        }
    };

    const loadVisitors = async () => {
        setVisitorsLoading(true);
        try {
            const resp = await apiFetch('/api/visitors');
            let data;
            const txt = await resp.clone().text();
            try { data = JSON.parse(txt); } catch (e) { data = txt; }
            if (!resp.ok) throw new Error((data && data.error) || String(data) || 'Failed to load visitors');

            const mapped = (Array.isArray(data) ? data : []).map((row) => {
                const created = row.created_at ? new Date(row.created_at) : null;
                return {
                    name: `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim(),
                    contact: {
                        email: maskEmail(row.email ?? ''),
                        phone: maskPhone(row.mobile ?? '')
                    },
                    events: '-',
                    lastEvent: row.event_name ?? '',
                    consent: 'Check-In',
                    date: created ? created.toLocaleDateString() : '',
                    registered: 'Mobile',
                    checkIn: '',
                    checkOut: ''
                };
            });

            setVisitors(mapped);
        } catch (err) {
            console.error('Failed to load visitors', err);
            setVisitors([]);
        } finally {
            setVisitorsLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
        loadVisitors();
    }, []);

    const handleCreateVisitor = async () => {
        setCreateVisitorLoading(true);
        try {
            const payload = {
                firstName: visitorData.firstName,
                lastName: visitorData.lastName,
                email: visitorData.email,
                mobile: visitorData.mobile,
                gender: visitorData.gender,
                age: visitorData.age,
                organization: visitorData.organization,
                designation: visitorData.designation,
                eventId: visitorData.event || null,
                visitorCategory: visitorData.visitorCategory,
                validDates: visitorData.validDates,
                communication: visitorData.communication
            };

            const resp = await apiFetch('/api/visitors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            let data;
            const txt = await resp.clone().text();
            try { data = JSON.parse(txt); } catch (e) { data = txt; }
            if (!resp.ok) throw new Error((data && data.error) || String(data) || 'Failed to register visitor');

            setShowSuccess(true);
            if (data && data.credentials) {
                alert(`Visitor registered successfully!\n\nLogin Credentials:\nEmail: ${data.credentials.email}\nPassword: ${data.credentials.password}\n\n${data.credentials.note || ''}`);
            }
            await loadVisitors();
        } catch (err) {
            console.error('Register visitor failed', err);
            alert('Failed to register visitor: ' + (err.message || err));
        } finally {
            setCreateVisitorLoading(false);
        }
    };

    const tabs = ['All Visitors', 'Registered', 'Check-In', 'QR & Pass', 'Check-Out'];

    const getConsentBadge = (consent) => {
        const statusStyles = {
            'Check-In': 'badge-live',
            'Check-Out': 'badge-draft'
        };
        return statusStyles[consent] || 'badge-draft';
    };

    return (
        <div className="dashboard-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }} className="fade-in">
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>Visitors Management</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Privacy-safe visitor data management across events</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                        <Download size={16} />
                        Export Report
                    </button>
                    <button
                        onClick={handleOpenModal}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563eb', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: 'white', cursor: 'pointer' }}
                    >
                        <Plus size={16} />
                        Register Visitor
                    </button>
                </div>
            </div>

            {/* Privacy Notice */}
            <div style={{
                background: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '28px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }} className="fade-in">
                <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Info size={18} color="#3b82f6" />
                </div>
                <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b', marginBottom: '4px' }}>Privacy-Safe View</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                        Personal data is masked for privacy compliance. Full details require authorized access and audit logging.
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }} className="fade-in">
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Total Visitors</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>6</div>
                        </div>
                        <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Eye size={20} color="#2563eb" />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Check-In</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>5</div>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Check-Out</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>2</div>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>VIP Guests</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>2</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="card fade-in">
                {/* Tabs */}
                <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #f1f5f9', marginBottom: '24px' }}>
                    {tabs.map((tab) => (
                        <div
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '12px 20px',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: activeTab === tab ? '#2563eb' : '#64748b',
                                borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab}
                        </div>
                    ))}
                </div>

                {/* Search and Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ position: 'relative', width: '320px' }}>
                        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search Visitor..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px 10px 44px',
                                border: '1.5px solid #e2e8f0',
                                borderRadius: '10px',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>Show</span>
                        <select
                            value={entriesPerPage}
                            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                            style={{
                                padding: '8px 12px',
                                border: '1.5px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#475569',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>entries</span>
                    </div>
                </div>

                {/* Table */}
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>VISITOR</th>
                                <th>CONTACT (MASKED)</th>
                                <th>EVENTS</th>
                                <th>CONSENT</th>
                                <th>DATE</th>
                                <th>REGISTERED</th>
                                <th>CHECK IN TIME</th>
                                <th>CHECK OUT TIME</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visitors.map((visitor, idx) => (
                                <tr key={idx} className="hover-lift">
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                background: 'rgba(37, 99, 235, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <User size={18} color="#2563eb" />
                                            </div>
                                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{visitor.name}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                                            <span>📧</span>
                                            <span>{visitor.contact.email}</span>
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                            <span>📞</span>
                                            <span>{visitor.contact.phone}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{visitor.events}</div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>Last: {visitor.lastEvent}</div>
                                    </td>
                                    <td>
                                        <span className={`badge ${getConsentBadge(visitor.consent)}`}>
                                            {visitor.consent}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '13px', color: '#64748b' }}>{visitor.date}</td>
                                    <td style={{ color: '#475569' }}>{visitor.registered}</td>
                                    <td style={{ fontSize: '13px', color: '#64748b' }}>{visitor.checkIn}</td>
                                    <td style={{ fontSize: '13px', color: '#64748b' }}>{visitor.checkOut}</td>
                                    <td>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                            <MoreHorizontal size={18} color="#64748b" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                        Showing 1 to 9 of 9 entries
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ padding: '8px 12px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '6px', fontSize: '13px', color: '#64748b', cursor: 'pointer' }}>«</button>
                        <button style={{ padding: '8px 12px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '6px', fontSize: '13px', color: '#64748b', cursor: 'pointer' }}>‹</button>
                        <button style={{ padding: '8px 14px', border: '1px solid #2563eb', background: '#2563eb', borderRadius: '6px', fontSize: '13px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>1</button>
                        <button style={{ padding: '8px 12px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '6px', fontSize: '13px', color: '#64748b', cursor: 'pointer' }}>›</button>
                        <button style={{ padding: '8px 12px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '6px', fontSize: '13px', color: '#64748b', cursor: 'pointer' }}>»</button>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '32px', paddingBottom: '24px' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Powered By Billiton</p>
            </div>

            {/* Register Visitor Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        background: 'white', borderRadius: '24px', padding: '40px',
                        width: '800px', maxWidth: '95%', maxHeight: '90vh',
                        overflowY: 'auto', position: 'relative',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                        animation: 'fadeIn 0.2s ease-out'
                    }} onClick={e => e.stopPropagation()}>

                        {showSuccess ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <div style={{ width: '80px', height: '80px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                    <Check size={40} color="#10b981" />
                                </div>
                                <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '12px' }}>Visitor Registered!</h2>
                                <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '40px' }}>Registration completed successfully. Visitor pass has been generated.</p>

                                <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '32px', maxWidth: '400px', margin: '0 auto 40px', border: '1.5px solid #e2e8f0' }}>
                                    <div style={{ background: 'white', padding: '16px', borderRadius: '12px', marginBottom: '20px', display: 'inline-block' }}>
                                        {/* Placeholder for QR Code */}
                                        <div style={{ width: '160px', height: '160px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Smartphone size={60} color="#94a3b8" />
                                        </div>
                                    </div>
                                    <h3 style={{ fontWeight: 700, fontSize: '18px', color: '#1e293b', marginBottom: '4px' }}>{visitorData.firstName} {visitorData.lastName}</h3>
                                    <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>ID: VIS-2024-001</p>

                                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                        <button style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'white', border: '1.5px solid #e2e8f0', color: '#475569', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <DownloadIcon size={16} /> PNG
                                        </button>
                                        <button style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'white', border: '1.5px solid #e2e8f0', color: '#475569', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <DownloadIcon size={16} /> PDF
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                                    <button onClick={handleCloseModal} style={{ padding: '12px 32px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Close</button>
                                    <button style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <Share2 size={18} /> Share Pass
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <button onClick={handleCloseModal} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                    <X size={24} />
                                </button>

                                <div style={{ marginBottom: '32px' }}>
                                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Register New Visitor</h2>
                                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Complete all steps to generate visitor pass</p>
                                </div>

                                {/* Tabs Navigation */}
                                <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', marginBottom: '40px' }}>
                                    {['Basic Info', 'Event & Pass', 'Communication'].map((tabName, idx) => {
                                        const stepNum = idx + 1;
                                        const isActive = modalStep === stepNum;
                                        const isCompleted = modalStep > stepNum;
                                        return (
                                            <div
                                                key={tabName}
                                                onClick={() => setModalStep(stepNum)}
                                                style={{
                                                    padding: '12px 16px',
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    color: isActive ? '#0d89a4' : (isCompleted ? '#0d89a4' : '#64748b'),
                                                    borderBottom: isActive ? '2.5px solid #0d89a4' : '2.5px solid transparent',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    flex: 1,
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <div style={{
                                                    width: '20px', height: '20px', borderRadius: '50%',
                                                    background: (isActive || isCompleted) ? '#0d89a4' : '#f1f5f9',
                                                    color: (isActive || isCompleted) ? 'white' : '#94a3b8',
                                                    fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    {isCompleted ? <Check size={12} /> : stepNum}
                                                </div>
                                                {tabName}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div>
                                    {modalStep === 1 && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'left' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>First Name *</label>
                                                <input
                                                    type="text" placeholder="Enter first name"
                                                    value={visitorData.firstName}
                                                    onChange={e => setVisitorData({ ...visitorData, firstName: e.target.value })}
                                                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Last Name *</label>
                                                <input
                                                    type="text" placeholder="Enter last name"
                                                    value={visitorData.lastName}
                                                    onChange={e => setVisitorData({ ...visitorData, lastName: e.target.value })}
                                                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Email ID *</label>
                                                <input
                                                    type="email" placeholder="Enter email"
                                                    value={visitorData.email}
                                                    onChange={e => setVisitorData({ ...visitorData, email: e.target.value })}
                                                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Mobile Number *</label>
                                                <input
                                                    type="tel" placeholder="+91 XXXXX XXXXX"
                                                    value={visitorData.mobile}
                                                    onChange={e => setVisitorData({ ...visitorData, mobile: e.target.value })}
                                                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Gender</label>
                                                <select
                                                    value={visitorData.gender}
                                                    onChange={e => setVisitorData({ ...visitorData, gender: e.target.value })}
                                                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: 'white' }}
                                                >
                                                    <option value="">Select gender</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Age Group</label>
                                                <select
                                                    value={visitorData.age}
                                                    onChange={e => setVisitorData({ ...visitorData, age: e.target.value })}
                                                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: 'white' }}
                                                >
                                                    <option value="">Select age group</option>
                                                    <option value="18-25">18-25</option>
                                                    <option value="26-40">26-40</option>
                                                    <option value="41-60">41-60</option>
                                                    <option value="60+">60+</option>
                                                </select>
                                            </div>
                                            <div style={{ gridColumn: 'span 2' }}>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Organization / Company</label>
                                                <input
                                                    type="text" placeholder="Enter organization name"
                                                    value={visitorData.organization}
                                                    onChange={e => setVisitorData({ ...visitorData, organization: e.target.value })}
                                                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                                />
                                            </div>
                                            <div style={{ gridColumn: 'span 2' }}>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Designation</label>
                                                <input
                                                    type="text" placeholder="Enter designation"
                                                    value={visitorData.designation}
                                                    onChange={e => setVisitorData({ ...visitorData, designation: e.target.value })}
                                                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Pass Validity *</label>
                                                <select
                                                    value={visitorData.validDates}
                                                    onChange={e => setVisitorData({ ...visitorData, validDates: e.target.value })}
                                                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: 'white' }}
                                                >
                                                    <option value="">Select duration</option>
                                                    <option value="day1">Day 1 Only</option>
                                                    <option value="day2">Day 2 Only</option>
                                                    <option value="all">Full Event Pass</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {modalStep === 3 && (
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '20px' }}>Communication Settings</h3>
                                                {[
                                                    { id: 'whatsapp', label: 'WhatsApp Notification', icon: MessageSquare },
                                                    { id: 'email', label: 'Email Confirmation', icon: Mail },
                                                    { id: 'sms', label: 'SMS Ticket', icon: Send }
                                                ].map((setting, idx) => (
                                                    <div key={setting.id} style={{
                                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                        padding: '12px 0', borderBottom: idx === 2 ? 'none' : '1px solid #e2e8f0'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ background: 'white', padding: '8px', borderRadius: '8px', border: '1.5px solid #f1f5f9' }}>
                                                                <setting.icon size={18} color="#64748b" />
                                                            </div>
                                                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>{setting.label}</span>
                                                        </div>
                                                        <div
                                                            onClick={() => setVisitorData({
                                                                ...visitorData,
                                                                communication: { ...visitorData.communication, [setting.id]: !visitorData.communication[setting.id] }
                                                            })}
                                                            style={{
                                                                width: '44px', height: '24px', borderRadius: '12px',
                                                                background: visitorData.communication[setting.id] ? '#0d89a4' : '#e2e8f0',
                                                                position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease'
                                                            }}
                                                        >
                                                            <div style={{
                                                                width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                                                                position: 'absolute', top: '3px',
                                                                left: visitorData.communication[setting.id] ? '23px' : '3px',
                                                                transition: 'all 0.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                            }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div style={{
                                        marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #f1f5f9',
                                        display: 'flex', justifyContent: 'flex-end', gap: '12px'
                                    }}>
                                        {modalStep === 1 ? (
                                            <button onClick={handleCloseModal} style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                        ) : (
                                            <button onClick={() => setModalStep(modalStep - 1)} style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Back</button>
                                        )}

                                        <button
                                            onClick={() => modalStep < 3 ? setModalStep(modalStep + 1) : handleCreateVisitor()}
                                            disabled={createVisitorLoading}
                                            style={{
                                                padding: '10px 32px', borderRadius: '8px', border: 'none',
                                                background: '#0d89a4', color: 'white', fontWeight: 600, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '8px'
                                            }}
                                        >
                                            {modalStep === 3 ? (createVisitorLoading ? 'Registering...' : 'Register Visitor') : 'Next'}
                                            {modalStep < 3 && <ChevronRight size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisitorsManagement;
