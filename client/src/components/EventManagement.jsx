import React, { useState } from 'react';
import { Calendar, TrendingUp, FileText, Send, Search, Download, Plus, MoreHorizontal, X, Check, ChevronRight, ChevronDown, MapPin, Building2, Users, Image as ImageIcon, Eye, Clock, Laptop, Copy, CheckCircle2 } from 'lucide-react';

const EventManagement = () => {
    const [activeTab, setActiveTab] = useState('All Events');
    const [searchQuery, setSearchQuery] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [modalStep, setModalStep] = useState(1);

    const [eventData, setEventData] = useState({
        eventName: '',
        description: '',
        eventType: '',
        eventMode: '',
        industry: '',
        startDate: '',
        endDate: '',
        venue: '',
        city: '',
        state: '',
        country: 'India',
        organizerName: '',
        contactPerson: '',
        organizerEmail: '',
        organizerMobile: '',
        registration: {
            enableVisitor: true,
            approvalRequired: false,
            externalMode: false,
            startDate: '',
            endDate: '',
            generateQR: true,
            passType: 'Digital Only',
            allowQRRegen: false
        },
        leadCapture: {
            enableQR: true,
            enableStallQR: true,
            enableOCR: false,
            manualCapture: true
        },
        communication: {
            enableWhatsApp: true,
            enableEmail: true,
            enableSMS: false,
            triggerQRScan: true,
            triggerStallQRScan: true,
            triggerManualSend: true
        }
    });

    const [showSuccess, setShowSuccess] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleOpenModal = () => {
        setModalStep(1);
        setShowSuccess(false);
        setCopied(false);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalStep(1);
        setShowSuccess(false);
        setCopied(false);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText("https://expo.example.com/register/event");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const tabs = ['All Events', 'Active', 'Pending', 'Upcoming', 'Cancelled'];

    const events = [
        { id: 'HC456789', name: 'Tech Summit 2025', email: 'admin@techevents.com', status: 'Live', venue: 'Hyderabad - KPHB', exhibitors: '1233', visitors: '1500', createdDate: '2/20/2024', lastDate: '12/17/2024' },
        { id: 'HC456789', name: 'TechEvents Inc.', email: 'admin@techevents.com', status: 'Draft', venue: 'Kakinada , Sarjanapuram', exhibitors: '2933', visitors: '1500', createdDate: '2/20/2024', lastDate: '12/17/2024' },
        { id: 'HC456789', name: 'TechEvents Inc.', email: 'admin@techevents.com', status: 'Completed', venue: 'Jaggampeta, Bus stand', exhibitors: '1333', visitors: '1500', createdDate: '2/20/2024', lastDate: '12/17/2024' },
        { id: 'HC456789', name: 'TechEvents Inc.', email: 'admin@techevents.com', status: 'Upcoming', venue: 'Visakhapatnam', exhibitors: '3433', visitors: '1500', createdDate: '2/20/2024', lastDate: '12/17/2024' },
        { id: 'HC456789', name: 'ABC Events', email: 'admin@techevents.com', status: 'Live', venue: 'Hyderabad', exhibitors: '1322', visitors: '1500', createdDate: '2/20/2024', lastDate: '12/17/2024' },
        { id: 'HC456789', name: 'TechEvents Inc.', email: 'admin@techevents.com', status: 'Draft', venue: 'Kakinada Town', exhibitors: '1343', visitors: '1500', createdDate: '2/20/2024', lastDate: '12/17/2024' },
    ];

    const getStatusBadge = (status) => {
        const statusStyles = {
            'Live': 'badge-live',
            'Draft': 'badge-draft',
            'Completed': 'badge-done',
            'Upcoming': 'badge-upcoming'
        };
        return statusStyles[status] || 'badge-draft';
    };

    return (
        <div className="dashboard-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }} className="fade-in">
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>Event Management</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Manage all events across tenants</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                        <Download size={16} />
                        Export
                    </button>
                    <button
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563eb', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: 'white', cursor: 'pointer' }}
                        onClick={handleOpenModal}
                    >
                        <Plus size={16} />
                        Add Event
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }} className="fade-in">
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Total Events</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>06</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Right now</div>
                        </div>
                        <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Calendar size={20} color="#2563eb" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
                        <TrendingUp size={14} />
                        +12%
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Live Now</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>03</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Currently running</div>
                        </div>
                        <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Send size={20} color="#06b6d4" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
                        <TrendingUp size={14} />
                        +8.4%
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Upcoming</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>01</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Right Now</div>
                        </div>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <FileText size={20} color="#3b82f6" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
                        <TrendingUp size={14} />
                        +8.4%
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Completed</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>02</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Right Now</div>
                        </div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <FileText size={20} color="#10b981" />
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
                            placeholder="Search Events..."
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
                                <th>EVENT ID</th>
                                <th>EVENT NAME</th>
                                <th>STATUS</th>
                                <th>VENUE</th>
                                <th>EXHIBITORS</th>
                                <th>VISITORS</th>
                                <th>CREATED DATE</th>
                                <th>LAST DATE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((event, idx) => (
                                <tr key={idx} className="hover-lift">
                                    <td style={{ fontWeight: 600, color: '#475569' }}>{event.id}</td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{event.name}</div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{event.email}</div>
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(event.status)}`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td style={{ color: '#475569' }}>{event.venue}</td>
                                    <td style={{ fontWeight: 600 }}>{event.exhibitors}</td>
                                    <td style={{ fontWeight: 600 }}>{event.visitors}</td>
                                    <td style={{ fontSize: '13px', color: '#64748b' }}>{event.createdDate}</td>
                                    <td style={{ fontSize: '13px', color: '#64748b' }}>{event.lastDate}</td>
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

            {/* Create Event Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }} onClick={handleCloseModal}>
                    <div style={{
                        background: 'white', borderRadius: '24px', padding: '40px',
                        width: '800px', maxWidth: '95%', maxHeight: '90vh',
                        overflowY: 'auto', position: 'relative',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }} onClick={e => e.stopPropagation()}>

                        {/* Close Button */}
                        <button onClick={handleCloseModal} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                            <X size={24} />
                        </button>

                        {showSuccess ? (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
                                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e0f2f1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                        <CheckCircle2 size={40} color="#0d89a4" />
                                    </div>
                                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Event Created Successfully!</h2>
                                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>New Event has been created</p>
                                </div>

                                <div style={{ border: '2px dashed #0d89a4', borderRadius: '16px', padding: '32px', background: '#f8fafc', marginBottom: '32px', display: 'inline-block', width: '100%' }}>
                                    <p style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', marginBottom: '20px' }}>Event Registration QR Code</p>
                                    <div style={{ width: '160px', height: '160px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {/* Mock QR Code */}
                                        <div style={{ width: '128px', height: '128px', border: '8px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                            <div style={{ width: '64px', height: '64px', background: '#000' }}></div>
                                            <div style={{ position: 'absolute', top: 0, left: 0, width: '24px', height: '24px', background: '#fff' }}></div>
                                            <div style={{ position: 'absolute', top: 0, left: 0, width: '16px', height: '16px', background: '#000' }}></div>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>Scan to register for this event</p>
                                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                        <button style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Download size={18} />
                                            Download PNG
                                        </button>
                                        <button style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Download size={18} />
                                            Download PDF
                                        </button>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Registration Link</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            readOnly
                                            value="https://expo.example.com/register/event"
                                            style={{ flex: 1, padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
                                        />
                                        <button
                                            onClick={handleCopyLink}
                                            style={{ padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', color: copied ? '#0d89a4' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '46px' }}
                                        >
                                            {copied ? <Check size={20} /> : <Copy size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'left' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Share Registration Link</label>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        {[
                                            { icon: <Send size={20} />, label: 'WhatsApp', color: '#25D366' },
                                            { icon: <FileText size={20} />, label: 'Email', color: '#EA4335' },
                                            { icon: <Users size={20} />, label: 'SMS', color: '#34B7F1' }
                                        ].map((platform, idx) => (
                                            <div key={idx} style={{
                                                width: '44px', height: '44px', borderRadius: '10px',
                                                background: '#f1f5f9', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', cursor: 'pointer', color: '#475569',
                                                transition: 'all 0.2s'
                                            }}
                                                onMouseOver={e => {
                                                    e.currentTarget.style.background = '#e2e8f0';
                                                    e.currentTarget.style.color = platform.color;
                                                }}
                                                onMouseOut={e => {
                                                    e.currentTarget.style.background = '#f1f5f9';
                                                    e.currentTarget.style.color = '#475569';
                                                }}
                                            >
                                                {platform.icon}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: '32px' }}>
                                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Create New Event</h2>
                                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Fill in the event details step by step</p>
                                </div>

                                {/* Tabs Navigation */}
                                <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', marginBottom: '40px' }}>
                                    {['Basic Info', 'Organizer', 'Registration', 'Lead Capture', 'Communication'].map((tabName, idx) => {
                                        const stepNum = idx + 1;
                                        const isActive = modalStep === stepNum;
                                        const isCompleted = modalStep > stepNum;
                                        return (
                                            <div
                                                key={tabName}
                                                onClick={() => setModalStep(stepNum)}
                                                style={{
                                                    padding: '12px 10px',
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    color: isActive ? '#0d89a4' : (isCompleted ? '#0d89a4' : '#64748b'),
                                                    borderBottom: isActive ? '2.5px solid #0d89a4' : '2.5px solid transparent',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    flex: 1,
                                                    justifyContent: 'center',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                <div style={{
                                                    width: '24px', height: '24px', borderRadius: '50%',
                                                    background: (isActive || isCompleted) ? '#0d89a4' : '#f1f5f9',
                                                    color: (isActive || isCompleted) ? 'white' : '#94a3b8',
                                                    fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    border: isActive ? '4px solid #e0f2f1' : 'none'
                                                }}>
                                                    {isCompleted ? <Check size={14} /> : stepNum}
                                                </div>
                                                {tabName}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Step 1: Basic Information */}
                                {modalStep === 1 && (
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Event Name *</label>
                                            <input
                                                type="text"
                                                placeholder="Enter event name"
                                                value={eventData.eventName}
                                                onChange={e => setEventData({ ...eventData, eventName: e.target.value })}
                                                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                            />
                                        </div>

                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Event Description</label>
                                            <textarea
                                                placeholder="Enter event description"
                                                rows={4}
                                                value={eventData.description}
                                                onChange={e => setEventData({ ...eventData, description: e.target.value })}
                                                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                                            />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Event Type *</label>
                                                <select
                                                    value={eventData.eventType}
                                                    onChange={e => setEventData({ ...eventData, eventType: e.target.value })}
                                                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: 'white' }}
                                                >
                                                    <option value="">Select type</option>
                                                    <option value="conference">Conference</option>
                                                    <option value="exhibition">Exhibition</option>
                                                    <option value="seminar">Seminar</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Event Mode *</label>
                                                <select
                                                    value={eventData.eventMode}
                                                    onChange={e => setEventData({ ...eventData, eventMode: e.target.value })}
                                                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: 'white' }}
                                                >
                                                    <option value="">Select mode</option>
                                                    <option value="in_person">In-Person</option>
                                                    <option value="virtual">Virtual</option>
                                                    <option value="hybrid">Hybrid</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Industry / Sector</label>
                                                <select
                                                    value={eventData.industry}
                                                    onChange={e => setEventData({ ...eventData, industry: e.target.value })}
                                                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: 'white' }}
                                                >
                                                    <option value="">Select industry</option>
                                                    <option value="it">Information Technology</option>
                                                    <option value="healthcare">Healthcare</option>
                                                    <option value="manufacturing">Manufacturing</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Start Date *</label>
                                                <input
                                                    type="date"
                                                    value={eventData.startDate}
                                                    onChange={e => setEventData({ ...eventData, startDate: e.target.value })}
                                                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>End Date *</label>
                                                <input
                                                    type="date"
                                                    value={eventData.endDate}
                                                    onChange={e => setEventData({ ...eventData, endDate: e.target.value })}
                                                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Venue *</label>
                                            <input
                                                type="text"
                                                placeholder="Enter venue name"
                                                value={eventData.venue}
                                                onChange={e => setEventData({ ...eventData, venue: e.target.value })}
                                                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                            />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>City</label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter city"
                                                    value={eventData.city}
                                                    onChange={e => setEventData({ ...eventData, city: e.target.value })}
                                                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>State</label>
                                                <select
                                                    value={eventData.state}
                                                    onChange={e => setEventData({ ...eventData, state: e.target.value })}
                                                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: 'white' }}
                                                >
                                                    <option value="">Select state</option>
                                                    <option value="telangana">Telangana</option>
                                                    <option value="andhra">Andhra Pradesh</option>
                                                    <option value="karnataka">Karnataka</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Country</label>
                                                <select
                                                    value={eventData.country}
                                                    onChange={e => setEventData({ ...eventData, country: e.target.value })}
                                                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: 'white' }}
                                                >
                                                    <option value="India">India</option>
                                                    <option value="USA">USA</option>
                                                    <option value="UAE">UAE</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Organizer */}
                                {modalStep === 2 && (
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Organizer Name *</label>
                                            <input
                                                type="text"
                                                placeholder="Enter organizer name"
                                                value={eventData.organizerName}
                                                onChange={e => setEventData({ ...eventData, organizerName: e.target.value })}
                                                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                            />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Contact Person *</label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter contact person name"
                                                    value={eventData.contactPerson}
                                                    onChange={e => setEventData({ ...eventData, contactPerson: e.target.value })}
                                                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Email *</label>
                                                <input
                                                    type="email"
                                                    placeholder="Enter email"
                                                    value={eventData.organizerEmail}
                                                    onChange={e => setEventData({ ...eventData, organizerEmail: e.target.value })}
                                                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Mobile Number *</label>
                                            <input
                                                type="tel"
                                                placeholder="+91 XXXXX XXXXX"
                                                value={eventData.organizerMobile}
                                                onChange={e => setEventData({ ...eventData, organizerMobile: e.target.value })}
                                                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                            />
                                        </div>
                                    </div>
                                )}


                                {/* Step 3: Registration */}
                                {modalStep === 3 && (
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                                            <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', marginBottom: '20px' }}>Visitor Registration Settings</h4>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
                                                {[
                                                    { id: 'enableVisitor', label: 'Enable Visitor Registration', key: 'enableVisitor' },
                                                    { id: 'approvalRequired', label: 'Registration Approval Required', key: 'approvalRequired' },
                                                    { id: 'externalMode', label: 'External Registration Mode', key: 'externalMode' }
                                                ].map(item => (
                                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b' }}>{item.label}</span>
                                                        <div
                                                            onClick={() => setEventData({
                                                                ...eventData,
                                                                registration: { ...eventData.registration, [item.key]: !eventData.registration[item.key] }
                                                            })}
                                                            style={{
                                                                width: '40px', height: '22px', borderRadius: '20px',
                                                                background: eventData.registration[item.key] ? '#0d89a4' : '#e2e8f0',
                                                                position: 'relative', cursor: 'pointer', transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            <div style={{
                                                                width: '18px', height: '18px', background: 'white', borderRadius: '50%',
                                                                position: 'absolute', top: '2px',
                                                                left: eventData.registration[item.key] ? '20px' : '2px',
                                                                transition: 'all 0.2s'
                                                            }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Registration Start Date</label>
                                                    <input
                                                        type="date"
                                                        value={eventData.registration.startDate}
                                                        onChange={e => setEventData({
                                                            ...eventData,
                                                            registration: { ...eventData.registration, startDate: e.target.value }
                                                        })}
                                                        style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Registration End Date</label>
                                                    <input
                                                        type="date"
                                                        value={eventData.registration.endDate}
                                                        onChange={e => setEventData({
                                                            ...eventData,
                                                            registration: { ...eventData.registration, endDate: e.target.value }
                                                        })}
                                                        style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                                            <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', marginBottom: '20px' }}>Pass & QR Management</h4>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b' }}>Generate Visitor QR</span>
                                                    <div
                                                        onClick={() => setEventData({
                                                            ...eventData,
                                                            registration: { ...eventData.registration, generateQR: !eventData.registration.generateQR }
                                                        })}
                                                        style={{
                                                            width: '40px', height: '22px', borderRadius: '20px',
                                                            background: eventData.registration.generateQR ? '#0d89a4' : '#e2e8f0',
                                                            position: 'relative', cursor: 'pointer', transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <div style={{
                                                            width: '18px', height: '18px', background: 'white', borderRadius: '50%',
                                                            position: 'absolute', top: '2px',
                                                            left: eventData.registration.generateQR ? '20px' : '2px',
                                                            transition: 'all 0.2s'
                                                        }} />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Pass Type</label>
                                                    <select
                                                        value={eventData.registration.passType}
                                                        onChange={e => setEventData({
                                                            ...eventData,
                                                            registration: { ...eventData.registration, passType: e.target.value }
                                                        })}
                                                        style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: 'white' }}
                                                    >
                                                        <option value="Digital Only">Digital Only</option>
                                                        <option value="Physical Only">Physical Only</option>
                                                        <option value="Both">Both (Digital + Physical)</option>
                                                    </select>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b' }}>Allow QR Regeneration</span>
                                                    <div
                                                        onClick={() => setEventData({
                                                            ...eventData,
                                                            registration: { ...eventData.registration, allowQRRegen: !eventData.registration.allowQRRegen }
                                                        })}
                                                        style={{
                                                            width: '40px', height: '22px', borderRadius: '20px',
                                                            background: eventData.registration.allowQRRegen ? '#0d89a4' : '#e2e8f0',
                                                            position: 'relative', cursor: 'pointer', transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <div style={{
                                                            width: '18px', height: '18px', background: 'white', borderRadius: '50%',
                                                            position: 'absolute', top: '2px',
                                                            left: eventData.registration.allowQRRegen ? '20px' : '2px',
                                                            transition: 'all 0.2s'
                                                        }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Lead Capture */}
                                {modalStep === 4 && (
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                                            <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', marginBottom: '20px' }}>Lead Capture Settings</h4>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                {[
                                                    { id: 'enableQR', label: 'Enable QR Lead Capture', key: 'enableQR' },
                                                    { id: 'enableStallQR', label: 'Enable Stall QR', key: 'enableStallQR' },
                                                    { id: 'enableOCR', label: 'Enable OCR Capture', key: 'enableOCR' },
                                                    { id: 'manualCapture', label: 'Manual Lead Capture', key: 'manualCapture' }
                                                ].map(item => (
                                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b' }}>{item.label}</span>
                                                        <div
                                                            onClick={() => setEventData({
                                                                ...eventData,
                                                                leadCapture: { ...eventData.leadCapture, [item.key]: !eventData.leadCapture[item.key] }
                                                            })}
                                                            style={{
                                                                width: '40px', height: '22px', borderRadius: '20px',
                                                                background: eventData.leadCapture[item.key] ? '#0d89a4' : '#e2e8f0',
                                                                position: 'relative', cursor: 'pointer', transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            <div style={{
                                                                width: '18px', height: '18px', background: 'white', borderRadius: '50%',
                                                                position: 'absolute', top: '2px',
                                                                left: eventData.leadCapture[item.key] ? '20px' : '2px',
                                                                transition: 'all 0.2s'
                                                            }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 5: Communication */}
                                {modalStep === 5 && (
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                                            <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', marginBottom: '20px' }}>Messaging Channels</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                {[
                                                    { label: 'Enable WhatsApp Messaging', key: 'enableWhatsApp' },
                                                    { label: 'Enable Email Messaging', key: 'enableEmail' },
                                                    { label: 'Enable SMS Messaging', key: 'enableSMS' }
                                                ].map(item => (
                                                    <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b' }}>{item.label}</span>
                                                        <div
                                                            onClick={() => setEventData({
                                                                ...eventData,
                                                                communication: { ...eventData.communication, [item.key]: !eventData.communication[item.key] }
                                                            })}
                                                            style={{
                                                                width: '40px', height: '22px', borderRadius: '20px',
                                                                background: eventData.communication[item.key] ? '#0d89a4' : '#e2e8f0',
                                                                position: 'relative', cursor: 'pointer', transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            <div style={{
                                                                width: '18px', height: '18px', background: 'white', borderRadius: '50%',
                                                                position: 'absolute', top: '2px',
                                                                left: eventData.communication[item.key] ? '20px' : '2px',
                                                                transition: 'all 0.2s'
                                                            }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                                            <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', marginBottom: '20px' }}>Message Trigger Rules</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                {[
                                                    { label: 'Trigger on QR Scan', key: 'triggerQRScan' },
                                                    { label: 'Trigger on Stall QR Scan', key: 'triggerStallQRScan' },
                                                    { label: 'Trigger on Manual Send', key: 'triggerManualSend' }
                                                ].map(item => (
                                                    <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b' }}>{item.label}</span>
                                                        <div
                                                            onClick={() => setEventData({
                                                                ...eventData,
                                                                communication: { ...eventData.communication, [item.key]: !eventData.communication[item.key] }
                                                            })}
                                                            style={{
                                                                width: '40px', height: '22px', borderRadius: '20px',
                                                                background: eventData.communication[item.key] ? '#0d89a4' : '#e2e8f0',
                                                                position: 'relative', cursor: 'pointer', transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            <div style={{
                                                                width: '18px', height: '18px', background: 'white', borderRadius: '50%',
                                                                position: 'absolute', top: '2px',
                                                                left: eventData.communication[item.key] ? '20px' : '2px',
                                                                transition: 'all 0.2s'
                                                            }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Modal Footer */}
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
                                        onClick={() => modalStep < 5 ? setModalStep(modalStep + 1) : setShowSuccess(true)}
                                        style={{
                                            padding: '10px 32px', borderRadius: '8px', border: 'none',
                                            background: '#0d89a4', color: 'white', fontWeight: 600, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '8px'
                                        }}
                                    >
                                        {modalStep === 5 ? 'Create Event & Generate QR' : 'Next'}
                                        {modalStep < 5 && <ChevronRight size={18} />}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventManagement;
