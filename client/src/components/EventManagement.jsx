import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Calendar, TrendingUp, FileText, Send, Search, Download, Plus, MoreHorizontal, X, Check, ChevronRight, ChevronDown, MapPin, Building2, Users, Image as ImageIcon, Eye, Clock, Laptop, Copy, CheckCircle2, Upload } from 'lucide-react';
import { apiFetch } from '../utils/api';

const EventManagement = () => {
    const [activeTab, setActiveTab] = useState('All Events');
    const [searchQuery, setSearchQuery] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [modalStep, setModalStep] = useState(1);

    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(false);
    const [orgs, setOrgs] = useState([]);
    const [orgsLoading, setOrgsLoading] = useState(false);
    const [createEventLoading, setCreateEventLoading] = useState(false);

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
        // Stall Configuration
        enableStalls: false,
        stallConfig: {
            totalStalls: 100,
            rows: 10,
            columns: 10,
            stallPrefix: 'S'
        },
        stallTypes: [
            { id: 1, name: 'Basic', color: '#3b82f6', startNumber: 1, endNumber: 40, price: 25000 },
            { id: 2, name: 'Standard', color: '#10b981', startNumber: 41, endNumber: 70, price: 50000 },
            { id: 3, name: 'Premium', color: '#8b5cf6', startNumber: 71, endNumber: 90, price: 85000 },
            { id: 4, name: 'Corner', color: '#f97316', startNumber: 91, endNumber: 100, price: 25000 }
        ],
        groundLayoutUrl: null,
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
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [createdEvent, setCreatedEvent] = useState(null);
    const [registrationLink, setRegistrationLink] = useState('');

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
        navigator.clipboard.writeText(registrationLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const loadOrgs = async () => {
        setOrgsLoading(true);
        try {
            const resp = await apiFetch('/api/organizations');
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

    const loadEvents = async () => {
        setEventsLoading(true);
        try {
            const resp = await apiFetch('/api/events');
            let data;
            const txt = await resp.clone().text();
            try { data = JSON.parse(txt); } catch (e) { data = txt; }
            if (!resp.ok) throw new Error((data && data.error) || String(data) || 'Failed to load events');

            const mapped = (Array.isArray(data) ? data : []).map((row) => {
                const createdDate = row.created_at ? new Date(row.created_at).toLocaleDateString() : '';
                const lastDate = row.created_at ? new Date(row.created_at).toLocaleDateString() : '';

                return {
                    id: String(row.id ?? ''),
                    name: row.event_name ?? '',
                    email: row.organizer_email ?? '',
                    status: row.status ?? 'Draft',
                    venue: row.venue ?? '',
                    exhibitors: '-',
                    visitors: '-',
                    createdDate,
                    lastDate
                };
            });

            setEvents(mapped);
        } catch (err) {
            console.error('Failed to load events', err);
            setEvents([]);
        } finally {
            setEventsLoading(false);
        }
    };

    useEffect(() => {
        loadOrgs();
        loadEvents();
    }, []);

    const handleCreateEvent = async () => {
        setCreateEventLoading(true);
        try {
            const payload = {
                eventName: eventData.eventName,
                description: eventData.description,
                eventType: eventData.eventType,
                eventMode: eventData.eventMode,
                industry: eventData.industry,
                startDate: eventData.startDate,
                endDate: eventData.endDate,
                venue: eventData.venue,
                city: eventData.city,
                state: eventData.state,
                country: eventData.country,
                organizerName: eventData.organizerName,
                contactPerson: eventData.contactPerson,
                organizerEmail: eventData.organizerEmail,
                organizerMobile: eventData.organizerMobile,
                // Stall Configuration
                enableStalls: eventData.enableStalls,
                stallConfig: eventData.stallConfig,
                stallTypes: eventData.stallTypes,
                groundLayoutUrl: eventData.groundLayoutUrl,
                // Original fields
                registration: eventData.registration,
                leadCapture: eventData.leadCapture,
                communication: eventData.communication
            };

            const resp = await apiFetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            console.log('Event creation response status:', resp.status, resp.ok);
            let data;
            const bodyTxt = await resp.clone().text();
            console.log('Event creation response body:', bodyTxt);
            try { data = JSON.parse(bodyTxt); } catch (e) { data = bodyTxt; }
            console.log('Event creation parsed data:', data);
            if (!resp.ok) throw new Error((data && data.error) || String(data) || 'Failed to create event');

            setCreatedEvent(data);

            // Check email status and show alert
            if (data.emailStatus) {
                if (data.emailStatus.sent) {
                    // Show success alert for email sent
                    setTimeout(() => {
                        alert(`✅ Event created successfully!\n\n📧 Registration link has been sent to: ${data.emailStatus.email}`);
                    }, 500);
                } else if (data.emailStatus.email) {
                    // Show warning if email failed
                    setTimeout(() => {
                        alert(`⚠️ Event created successfully!\n\nHowever, the email could not be sent to: ${data.emailStatus.email}\n\nPlease share the registration link manually.`);
                    }, 500);
                }
            }

            // Generate registration link with event details
            const baseUrl = window.location.origin;
            const regUrl = `${baseUrl}/?action=register&eventId=${data.id}&eventName=${encodeURIComponent(eventData.eventName)}&eventDate=${encodeURIComponent(eventData.startDate)}`;

            setRegistrationLink(regUrl);

            try {
                const url = await generateQR(regUrl);
                setQrDataUrl(url);
            } catch (gErr) {
                console.warn('QR generation failed', gErr);
            }

            setShowSuccess(true);

            // Refresh events list in background - don't let this failure affect success flow
            try {
                await loadEvents();
            } catch (loadErr) {
                console.warn('Failed to refresh events list:', loadErr);
            }
        } catch (err) {
            console.error('Create event failed', err);
            alert('Failed to create event: ' + (err.message || err));
        } finally {
            setCreateEventLoading(false);
        }
    };

    // Simple deterministic dummy QR generator (renders a black/white pattern)
    const generateQR = async (text) => {
        try {
            return await QRCode.toDataURL(text, { width: 256, margin: 1 });
        } catch (err) {
            console.error('QR Gen Error:', err);
            return null;
        }
    };

    const downloadQR = (filename = 'event_qr.png') => {
        if (!qrDataUrl) return;
        const a = document.createElement('a');
        a.href = qrDataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    const tabs = ['All Events', 'Active', 'Pending', 'Upcoming', 'Cancelled'];

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
                }}>
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
                                    <div style={{ width: '180px', height: '180px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {qrDataUrl ? (
                                            <img src={qrDataUrl} alt="QR" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px', background: 'white' }} />
                                        ) : (
                                            <div style={{ width: '128px', height: '128px', border: '8px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                                <div style={{ width: '64px', height: '64px', background: '#000' }}></div>
                                            </div>
                                        )}
                                    </div>
                                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>Scan to register for this event</p>
                                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                        <button onClick={() => downloadQR((createdEvent && `event_${createdEvent.id || Date.now()}.png`) || 'event_qr.png')} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Download size={18} />
                                            Download PNG
                                        </button>
                                        <button onClick={() => {
                                            if (qrDataUrl) window.open(qrDataUrl, '_blank');
                                        }} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Download size={18} />
                                            Open Image
                                        </button>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Registration Link</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            readOnly
                                            value={registrationLink}
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
                                <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', marginBottom: '40px', overflowX: 'auto' }}>
                                    {['Basic Info', 'Stall Config', 'Ground Layout', 'Organizer', 'Registration', 'Lead Capture', 'Communication'].map((tabName, idx) => {
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

                                {/* Step 2: Stall Config */}
                                {modalStep === 2 && (
                                    <div style={{ textAlign: 'left' }}>
                                        {/* Enable Exhibition Stalls Toggle */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px', marginBottom: '24px' }}>
                                            <div>
                                                <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Enable Exhibition Stalls</div>
                                                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Allow exhibitors to book stalls for this event</div>
                                            </div>
                                            <button
                                                onClick={() => setEventData({ ...eventData, enableStalls: !eventData.enableStalls })}
                                                style={{
                                                    width: '52px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                                                    background: eventData.enableStalls ? '#2563eb' : '#e2e8f0',
                                                    position: 'relative', transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{
                                                    width: '22px', height: '22px', borderRadius: '50%', background: 'white',
                                                    position: 'absolute', top: '3px', left: eventData.enableStalls ? '27px' : '3px',
                                                    transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                                }} />
                                            </button>
                                        </div>

                                        {eventData.enableStalls && (
                                            <>
                                                {/* Stall Range Configuration */}
                                                <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                                        <Building2 size={18} color="#2563eb" />
                                                        <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Stall Range Configuration</span>
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#64748b', marginBottom: '6px' }}>Total Stalls</label>
                                                            <div style={{ padding: '14px', background: '#eff6ff', borderRadius: '10px', textAlign: 'center' }}>
                                                                <div style={{ fontSize: '24px', fontWeight: 700, color: '#2563eb' }}>
                                                                    {eventData.stallConfig.rows * eventData.stallConfig.columns}
                                                                </div>
                                                                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Auto-calculated</div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#64748b', marginBottom: '6px' }}>Rows</label>
                                                            <input
                                                                type="number"
                                                                value={eventData.stallConfig.rows}
                                                                onChange={e => setEventData({
                                                                    ...eventData,
                                                                    stallConfig: { ...eventData.stallConfig, rows: parseInt(e.target.value) || 0 }
                                                                })}
                                                                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#64748b', marginBottom: '6px' }}>Columns</label>
                                                            <input
                                                                type="number"
                                                                value={eventData.stallConfig.columns}
                                                                onChange={e => setEventData({
                                                                    ...eventData,
                                                                    stallConfig: { ...eventData.stallConfig, columns: parseInt(e.target.value) || 0 }
                                                                })}
                                                                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#64748b', marginBottom: '6px' }}>Stall Prefix</label>
                                                        <input
                                                            type="text"
                                                            value={eventData.stallConfig.stallPrefix}
                                                            onChange={e => setEventData({
                                                                ...eventData,
                                                                stallConfig: { ...eventData.stallConfig, stallPrefix: e.target.value }
                                                            })}
                                                            style={{ width: '120px', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                                        />
                                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                                                            Stalls will be numbered as {eventData.stallConfig.stallPrefix}-001, {eventData.stallConfig.stallPrefix}-002, etc.
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Stall Types & Pricing */}
                                                <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                                        <Building2 size={18} color="#2563eb" />
                                                        <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Stall Types & Pricing</span>
                                                    </div>
                                                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                                                        Configure each stall type with quantity, number range, price, and color
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                        {eventData.stallTypes.map((type, idx) => (
                                                            <div key={type.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#f8fafc', borderRadius: '10px' }}>
                                                                <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: type.color }} />
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{type.name}</div>
                                                                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                                        {type.endNumber - type.startNumber + 1} stalls (#{type.startNumber} - #{type.endNumber}) • ₹{type.price.toLocaleString()}
                                                                    </div>
                                                                </div>
                                                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                                                    <Eye size={18} color="#64748b" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const newId = Math.max(...eventData.stallTypes.map(t => t.id)) + 1;
                                                            const lastEnd = Math.max(...eventData.stallTypes.map(t => t.endNumber));
                                                            setEventData({
                                                                ...eventData,
                                                                stallTypes: [...eventData.stallTypes, {
                                                                    id: newId, name: 'Custom', color: '#94a3b8',
                                                                    startNumber: lastEnd + 1, endNumber: lastEnd + 10, price: 30000
                                                                }]
                                                            });
                                                        }}
                                                        style={{
                                                            width: '100%', marginTop: '16px', padding: '12px', border: '2px dashed #cbd5e1',
                                                            borderRadius: '10px', background: 'transparent', color: '#64748b',
                                                            fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex',
                                                            alignItems: 'center', justifyContent: 'center', gap: '8px'
                                                        }}
                                                    >
                                                        <Plus size={16} /> Add Custom Stall Type
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Step 3: Ground Layout */}
                                {modalStep === 3 && (
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                <ImageIcon size={18} color="#2563eb" />
                                                <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Event Ground Architecture</span>
                                            </div>
                                            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px', lineHeight: 1.5 }}>
                                                Upload the floor plan or ground architecture map of the event venue. This will be visible to exhibitors when selecting stalls.
                                            </p>

                                            {/* Upload Area */}
                                            <div
                                                style={{
                                                    border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '48px',
                                                    textAlign: 'center', background: '#f8fafc', cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                onClick={() => document.getElementById('groundLayoutInput').click()}
                                                onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#2563eb'; }}
                                                onDragLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; }}
                                                onDrop={async (e) => {
                                                    e.preventDefault();
                                                    e.currentTarget.style.borderColor = '#cbd5e1';
                                                    const file = e.dataTransfer.files[0];
                                                    if (file) {
                                                        const formData = new FormData();
                                                        formData.append('file', file);
                                                        try {
                                                            const resp = await apiFetch('/api/upload/ground-layout', { method: 'POST', body: formData });
                                                            const data = await resp.json();
                                                            if (data.success) {
                                                                setEventData({ ...eventData, groundLayoutUrl: data.url });
                                                            }
                                                        } catch (err) { console.error('Upload failed:', err); }
                                                    }
                                                }}
                                            >
                                                <input
                                                    type="file"
                                                    id="groundLayoutInput"
                                                    accept=".jpg,.jpeg,.png,.pdf"
                                                    style={{ display: 'none' }}
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            const formData = new FormData();
                                                            formData.append('file', file);
                                                            try {
                                                                const resp = await apiFetch('/api/upload/ground-layout', { method: 'POST', body: formData });
                                                                const data = await resp.json();
                                                                if (data.success) {
                                                                    setEventData({ ...eventData, groundLayoutUrl: data.url });
                                                                }
                                                            } catch (err) { console.error('Upload failed:', err); }
                                                        }
                                                    }}
                                                />
                                                {eventData.groundLayoutUrl ? (
                                                    <div>
                                                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                                                        <div style={{ fontWeight: 600, color: '#10b981', marginBottom: '8px' }}>File Uploaded</div>
                                                        <div style={{ fontSize: '13px', color: '#64748b' }}>{eventData.groundLayoutUrl}</div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setEventData({ ...eventData, groundLayoutUrl: null }); }}
                                                            style={{ marginTop: '12px', padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', color: '#64748b', fontSize: '13px', cursor: 'pointer' }}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div style={{ marginBottom: '16px' }}>
                                                            <Upload size={48} color="#94a3b8" />
                                                        </div>
                                                        <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Upload Ground Layout</div>
                                                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                                                            Drag & drop or click to upload floor plan, stall map, or venue architecture
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>Supported formats: JPG, PNG, PDF (Max 10MB)</div>
                                                        <button
                                                            style={{ marginTop: '16px', padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', color: '#475569', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                                                            onClick={(e) => { e.stopPropagation(); document.getElementById('groundLayoutInput').click(); }}
                                                        >
                                                            <Download size={16} /> Select File
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Organizer */}
                                {modalStep === 4 && (
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


                                {/* Step 5: Registration */}
                                {modalStep === 5 && (
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

                                {/* Step 6: Lead Capture */}
                                {modalStep === 6 && (
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

                                {/* Step 7: Communication */}
                                {modalStep === 7 && (
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
                                        onClick={() => modalStep < 7 ? setModalStep(modalStep + 1) : handleCreateEvent()}
                                        disabled={createEventLoading}
                                        style={{
                                            padding: '10px 32px', borderRadius: '8px', border: 'none',
                                            background: '#0d89a4', color: 'white', fontWeight: 600, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '8px'
                                        }}
                                    >
                                        {modalStep === 7 ? (createEventLoading ? 'Creating...' : 'Create Event & Generate QR') : 'Next'}
                                        {modalStep < 7 && <ChevronRight size={18} />}
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
