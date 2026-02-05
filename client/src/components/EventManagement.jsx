import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Calendar, TrendingUp, FileText, Send, Search, Download, Plus, MoreHorizontal, X, Check, ChevronRight, ChevronDown, MapPin, Building2, Users, Image as ImageIcon, Eye, Clock, Laptop, Copy, CheckCircle2, Upload, Edit2, Trash2, Save, Grid, Edit, Ban } from 'lucide-react';
import { apiFetch } from '../utils/api';
import StallSelector from './StallSelector';


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
        organizationId: '',
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

    // Stall Type Editing State
    const [editingStallType, setEditingStallType] = useState(null); // null or stall type id being edited
    const [stallTypeForm, setStallTypeForm] = useState({
        name: '',
        stallCount: 10,
        startNumber: 1,
        color: '#3B82F6',
        price: 50000
    });


    // View Event Modal State
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [viewEventModal, setViewEventModal] = useState(false);

    // Interactive Stall Selector State
    const [showStallSelector, setShowStallSelector] = useState(false);
    const [stallAssignments, setStallAssignments] = useState({});

    // Actions dropdown and modals
    const [openDropdown, setOpenDropdown] = useState(null);
    const [editEventModal, setEditEventModal] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Toast notification helper
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };


    // Handle View Event
    const handleViewEvent = async (eventId) => {
        try {
            const response = await apiFetch(`/api/events/${eventId}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch event details');
            setSelectedEvent(data.event || data);
            setViewEventModal(true);
        } catch (error) {
            console.error('Failed to load event details:', error);
            alert('Failed to load event details: ' + (error.message || error));
        }
    };

    // Handle Stall Selector Save
    const handleStallSelectorSave = (payload) => {
        setStallAssignments(payload.assignments);
        setShowStallSelector(false);

        // Update eventData with the new stall configuration
        setEventData({
            ...eventData,
            stallConfig: {
                ...eventData.stallConfig,
                totalStalls: payload.totalStalls
            },
            stallAssignments: payload.assignments
        });

        alert('Stall assignments saved successfully!');
    };

    const handleOpenModal = () => {
        setModalStep(1);
        setShowSuccess(false);
        setCopied(false);

        // Auto-fill organizationId for organization users
        const userType = localStorage.getItem('userType');
        const organizationId = localStorage.getItem('organizationId');

        if (userType === 'organization' && organizationId) {
            // Pre-fill the organization ID for organization users
            setEventData(prev => ({
                ...prev,
                organizationId: organizationId
            }));
        } else {
            // Reset to default for master admin
            setEventData({
                organizationId: '',
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
        }

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
            // Get organizationId from localStorage if user is logged in as organization
            const organizationId = localStorage.getItem('organizationId');
            const userType = localStorage.getItem('userType');

            // Build API URL with organization filter if applicable
            let apiUrl = '/api/events';
            if (userType === 'organization' && organizationId) {
                apiUrl += `?organization_id=${organizationId}`;
            }

            const resp = await apiFetch(apiUrl);
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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (openDropdown !== null) {
                setOpenDropdown(null);
            }
        };

        if (openDropdown !== null) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [openDropdown]);

    // Handle Edit Event
    const handleEditEvent = async (eventId) => {
        try {
            const response = await apiFetch(`/api/events/${eventId}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch event details');
            setSelectedEvent(data.event || data);
            setEditEventModal(true);
            setOpenDropdown(null);
        } catch (error) {
            showToast(error.message || 'Failed to load event details', 'error');
        }
    };

    // Handle Update Event
    const handleUpdateEvent = async (e) => {
        e.preventDefault();
        if (!selectedEvent) return;

        try {
            const response = await apiFetch(`/api/events/${selectedEvent.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedEvent)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to update event');

            showToast('✅ Event updated successfully!', 'success');
            setEditEventModal(false);
            setSelectedEvent(null);
            await loadEvents();
        } catch (error) {
            showToast('❌ ' + (error.message || 'Failed to update event'), 'error');
        }
    };

    // Handle Suspend/Activate Event
    const handleSuspendEvent = async (eventId, currentStatus) => {
        const newStatus = currentStatus === 'Suspended' ? 'Draft' : 'Suspended';
        const action = newStatus === 'Suspended' ? 'suspend' : 'activate';

        if (!confirm(`Are you sure you want to ${action} this event?`)) {
            setOpenDropdown(null);
            return;
        }

        try {
            const response = await apiFetch(`/api/events/${eventId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Failed to ${action} event`);

            showToast(`✅ Event ${action}d successfully!`, 'success');
            setOpenDropdown(null);
            await loadEvents();
        } catch (error) {
            showToast('❌ ' + (error.message || `Failed to ${action} event`), 'error');
            setOpenDropdown(null);
        }
    };

    // Handle Delete Event
    const handleDeleteEvent = async (eventId, eventName) => {
        if (!confirm(`⚠️ Are you sure you want to DELETE "${eventName}"?\n\nThis action cannot be undone and will remove all associated data.`)) {
            setOpenDropdown(null);
            return;
        }

        try {
            const response = await apiFetch(`/api/events/${eventId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to delete event');

            showToast('✅ Event deleted successfully!', 'success');
            setOpenDropdown(null);
            await loadEvents();
        } catch (error) {
            showToast('❌ ' + (error.message || 'Failed to delete event'), 'error');
            setOpenDropdown(null);
        }
    };


    const handleCreateEvent = async () => {
        setCreateEventLoading(true);
        try {
            const payload = {
                organizationId: eventData.organizationId,
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
                stallAssignments: stallAssignments,
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
            const regUrl = `${baseUrl}/register?eventId=${data.id}&eventName=${encodeURIComponent(eventData.eventName)}&eventDate=${encodeURIComponent(eventData.startDate)}&token=${data.qr_token}`;

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
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Manage all events across organisations</p>
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
                                <tr
                                    key={idx}
                                    className="hover-lift"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleViewEvent(event.id)}
                                >
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
                                    <td style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenDropdown(openDropdown === event.id ? null : event.id);
                                            }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                        >
                                            <MoreHorizontal size={18} color="#64748b" />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {openDropdown === event.id && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    right: '0',
                                                    top: '100%',
                                                    marginTop: '4px',
                                                    background: '#ffffff',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                                    border: '1px solid #e5e7eb',
                                                    minWidth: '200px',
                                                    zIndex: 9999,
                                                    overflow: 'visible',
                                                    backdropFilter: 'none',
                                                    WebkitBackdropFilter: 'none'
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div style={{ padding: '8px 0' }}>
                                                    <button
                                                        onClick={() => handleViewEvent(event.id)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px 16px',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            textAlign: 'left',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '12px',
                                                            fontSize: '14px',
                                                            color: '#334155',
                                                            transition: 'background 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <Eye size={16} color="#64748b" />
                                                        <span>View Details</span>
                                                    </button>

                                                    <button
                                                        onClick={() => handleEditEvent(event.id)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px 16px',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            textAlign: 'left',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '12px',
                                                            fontSize: '14px',
                                                            color: '#334155',
                                                            transition: 'background 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <Edit size={16} color="#64748b" />
                                                        <span>Edit Event</span>
                                                    </button>

                                                    <div style={{ height: '1px', background: '#e2e8f0', margin: '8px 0' }}></div>

                                                    <button
                                                        onClick={() => handleSuspendEvent(event.id, event.status)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px 16px',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            textAlign: 'left',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '12px',
                                                            fontSize: '14px',
                                                            color: '#f59e0b',
                                                            transition: 'background 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#fffbeb'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <Ban size={16} color="#f59e0b" />
                                                        <span>{event.status === 'Suspended' ? 'Activate Event' : 'Suspend Event'}</span>
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteEvent(event.id, event.name)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px 16px',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            textAlign: 'left',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '12px',
                                                            fontSize: '14px',
                                                            color: '#ef4444',
                                                            transition: 'background 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <Trash2 size={16} color="#ef4444" />
                                                        <span>Delete Event</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
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
                                        {/* Organization Selector */}
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Organization *</label>
                                            <select
                                                value={eventData.organizationId}
                                                onChange={e => setEventData({ ...eventData, organizationId: e.target.value })}
                                                disabled={localStorage.getItem('userType') === 'organization'}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 14px',
                                                    border: '1.5px solid #e2e8f0',
                                                    borderRadius: '10px',
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    background: localStorage.getItem('userType') === 'organization' ? '#f8fafc' : 'white',
                                                    cursor: localStorage.getItem('userType') === 'organization' ? 'not-allowed' : 'pointer',
                                                    opacity: localStorage.getItem('userType') === 'organization' ? 0.7 : 1
                                                }}
                                            >
                                                <option value="">Select organization</option>
                                                {orgs.map(org => (
                                                    <option key={org.id} value={org.id}>
                                                        {org.org_name || org.name || org.organization_name}
                                                    </option>
                                                ))}
                                            </select>
                                            {orgsLoading && <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Loading organizations...</p>}
                                            {localStorage.getItem('userType') === 'organization' && (
                                                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                                    📌 Events will be created for your organization: {localStorage.getItem('organizationName')}
                                                </p>
                                            )}
                                        </div>

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

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
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
                                        {/* Total Number of Stalls */}
                                        <div style={{
                                            marginBottom: '24px',
                                            padding: '20px',
                                            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                                            borderRadius: '12px',
                                            border: '2px solid #0ea5e9'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                <Grid size={18} color="#0ea5e9" />
                                                <label style={{ fontSize: '15px', fontWeight: 700, color: '#0c4a6e', margin: 0 }}>
                                                    Total Number of Stalls *
                                                </label>
                                            </div>
                                            <p style={{ fontSize: '13px', color: '#0369a1', marginBottom: '12px', lineHeight: 1.5 }}>
                                                Specify the total number of stalls available for this event (e.g., 100, 200, 300). This will determine the grid layout in the stall configuration.
                                            </p>
                                            <input
                                                type="number"
                                                min="1"
                                                max="1000"
                                                placeholder="Enter total number of stalls (e.g., 100, 200, 300)"
                                                value={eventData.stallConfig.totalStalls}
                                                onChange={e => {
                                                    const totalStalls = parseInt(e.target.value) || 100;
                                                    const sqrt = Math.sqrt(totalStalls);
                                                    const cols = Math.ceil(sqrt);
                                                    const rows = Math.ceil(totalStalls / cols);

                                                    setEventData({
                                                        ...eventData,
                                                        stallConfig: {
                                                            ...eventData.stallConfig,
                                                            totalStalls: totalStalls,
                                                            rows: rows,
                                                            columns: cols
                                                        }
                                                    });
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '14px 16px',
                                                    border: '2px solid #0ea5e9',
                                                    borderRadius: '10px',
                                                    fontSize: '15px',
                                                    fontWeight: 600,
                                                    color: '#0c4a6e',
                                                    outline: 'none',
                                                    background: 'white',
                                                    transition: 'all 0.2s'
                                                }}
                                            />
                                            <div style={{
                                                marginTop: '12px',
                                                padding: '12px',
                                                background: 'white',
                                                borderRadius: '8px',
                                                border: '1px solid #bae6fd'
                                            }}>
                                                <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: 600 }}>
                                                    Grid Layout: {eventData.stallConfig.rows} rows × {eventData.stallConfig.columns} columns
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stall Types List */}
                                        <div style={{
                                            border: '1.5px solid #e2e8f0',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            maxHeight: '450px',
                                            overflowY: 'auto',
                                            marginBottom: '20px'
                                        }}>
                                            {eventData.stallTypes.length === 0 && editingStallType !== 'new' ? (
                                                <div style={{
                                                    padding: '40px',
                                                    textAlign: 'center',
                                                    color: '#94a3b8',
                                                    fontSize: '14px'
                                                }}>
                                                    No stall types configured yet. Click "Add Custom Stall Type" to get started.
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    {eventData.stallTypes.map((type, idx) => (
                                                        <React.Fragment key={type.id}>
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '16px',
                                                                    padding: '16px 20px',
                                                                    borderBottom: (idx < eventData.stallTypes.length - 1 || editingStallType === type.id) ? '1px solid #f1f5f9' : 'none',
                                                                    background: 'white',
                                                                    transition: 'background 0.2s'
                                                                }}
                                                            >
                                                                {/* Color Indicator */}
                                                                <div style={{
                                                                    width: '40px',
                                                                    height: '40px',
                                                                    borderRadius: '10px',
                                                                    background: type.color,
                                                                    flexShrink: 0
                                                                }} />

                                                                {/* Stall Info */}
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{
                                                                        fontWeight: 600,
                                                                        color: '#1e293b',
                                                                        fontSize: '15px',
                                                                        marginBottom: '2px'
                                                                    }}>
                                                                        {type.name}
                                                                    </div>
                                                                    <div style={{
                                                                        fontSize: '13px',
                                                                        color: '#64748b'
                                                                    }}>
                                                                        {type.endNumber - type.startNumber + 1} stalls (#{type.startNumber} - #{type.endNumber}) • ₹{type.price.toLocaleString()}
                                                                    </div>
                                                                </div>

                                                                {/* Action Buttons */}
                                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (editingStallType === type.id) {
                                                                                setEditingStallType(null);
                                                                                setStallTypeForm({ name: '', stallCount: 10, startNumber: 1, color: '#3B82F6', price: 50000 });
                                                                            } else {
                                                                                setEditingStallType(type.id);
                                                                                setStallTypeForm({
                                                                                    name: type.name,
                                                                                    stallCount: type.endNumber - type.startNumber + 1,
                                                                                    startNumber: type.startNumber,
                                                                                    color: type.color,
                                                                                    price: type.price
                                                                                });
                                                                            }
                                                                        }}
                                                                        style={{
                                                                            background: 'none',
                                                                            border: 'none',
                                                                            cursor: 'pointer',
                                                                            padding: '8px',
                                                                            borderRadius: '8px',
                                                                            transition: 'background 0.2s'
                                                                        }}
                                                                        onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                                                                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                                                    >
                                                                        <Edit2 size={18} color="#64748b" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (confirm(`Delete "${type.name}" stall type?`)) {
                                                                                setEventData({
                                                                                    ...eventData,
                                                                                    stallTypes: eventData.stallTypes.filter(t => t.id !== type.id)
                                                                                });
                                                                            }
                                                                        }}
                                                                        style={{
                                                                            background: 'none',
                                                                            border: 'none',
                                                                            cursor: 'pointer',
                                                                            padding: '8px',
                                                                            borderRadius: '8px',
                                                                            transition: 'background 0.2s'
                                                                        }}
                                                                        onMouseOver={e => e.currentTarget.style.background = '#fef2f2'}
                                                                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                                                    >
                                                                        <Trash2 size={18} color="#ef4444" />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Inline Edit Form - appears below the stall type being edited */}
                                                            {editingStallType === type.id && (
                                                                <div style={{
                                                                    border: '2px dashed #cbd5e1',
                                                                    borderRadius: '12px',
                                                                    padding: '24px',
                                                                    margin: '16px 20px',
                                                                    background: '#fafbfc'
                                                                }}>
                                                                    {/* First Row: Stall Type Name and Price */}
                                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                                                        <div>
                                                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#1e293b', marginBottom: '8px' }}>Stall Type Name *</label>
                                                                            <input
                                                                                type="text"
                                                                                placeholder="e.g., VIP, Ultra Premium"
                                                                                value={stallTypeForm.name}
                                                                                onChange={e => setStallTypeForm({ ...stallTypeForm, name: e.target.value })}
                                                                                style={{
                                                                                    width: '100%',
                                                                                    padding: '12px 14px',
                                                                                    border: '1.5px solid #e2e8f0',
                                                                                    borderRadius: '10px',
                                                                                    fontSize: '14px',
                                                                                    outline: 'none',
                                                                                    background: 'white'
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#1e293b', marginBottom: '8px' }}>Price (₹) *</label>
                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                step="1000"
                                                                                value={stallTypeForm.price}
                                                                                onChange={e => setStallTypeForm({ ...stallTypeForm, price: parseInt(e.target.value) || 0 })}
                                                                                style={{
                                                                                    width: '100%',
                                                                                    padding: '12px 14px',
                                                                                    border: '1.5px solid #e2e8f0',
                                                                                    borderRadius: '10px',
                                                                                    fontSize: '14px',
                                                                                    outline: 'none',
                                                                                    background: 'white'
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Second Row: Number of Stalls, Stall Color */}
                                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px', marginBottom: '24px' }}>
                                                                        <div>
                                                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#1e293b', marginBottom: '8px' }}>Number of Stalls</label>
                                                                            <input
                                                                                type="number"
                                                                                min="1"
                                                                                value={stallTypeForm.stallCount}
                                                                                onChange={e => setStallTypeForm({ ...stallTypeForm, stallCount: parseInt(e.target.value) || 1 })}
                                                                                style={{
                                                                                    width: '100%',
                                                                                    padding: '12px 14px',
                                                                                    border: '1.5px solid #e2e8f0',
                                                                                    borderRadius: '10px',
                                                                                    fontSize: '14px',
                                                                                    outline: 'none',
                                                                                    background: 'white'
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#1e293b', marginBottom: '8px' }}>Stall Color</label>
                                                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                                                <input
                                                                                    type="color"
                                                                                    value={stallTypeForm.color}
                                                                                    onChange={e => setStallTypeForm({ ...stallTypeForm, color: e.target.value })}
                                                                                    style={{
                                                                                        width: '48px',
                                                                                        height: '46px',
                                                                                        padding: '2px',
                                                                                        border: '1.5px solid #e2e8f0',
                                                                                        borderRadius: '10px',
                                                                                        cursor: 'pointer',
                                                                                        background: 'white'
                                                                                    }}
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    value={stallTypeForm.color.toUpperCase()}
                                                                                    onChange={e => {
                                                                                        let val = e.target.value;
                                                                                        if (!val.startsWith('#')) val = '#' + val;
                                                                                        if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                                                                                            setStallTypeForm({ ...stallTypeForm, color: val });
                                                                                        }
                                                                                    }}
                                                                                    style={{
                                                                                        flex: 1,
                                                                                        padding: '12px 14px',
                                                                                        border: '1.5px solid #e2e8f0',
                                                                                        borderRadius: '10px',
                                                                                        fontSize: '14px',
                                                                                        outline: 'none',
                                                                                        fontFamily: 'monospace',
                                                                                        background: 'white',
                                                                                        textTransform: 'uppercase'
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Action Buttons */}
                                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                                                        <button
                                                                            onClick={() => {
                                                                                setEditingStallType(null);
                                                                                setStallTypeForm({ name: '', stallCount: 10, startNumber: 1, color: '#3B82F6', price: 50000 });
                                                                            }}
                                                                            style={{
                                                                                padding: '12px 24px',
                                                                                background: 'white',
                                                                                border: '1.5px solid #e2e8f0',
                                                                                borderRadius: '10px',
                                                                                fontSize: '14px',
                                                                                fontWeight: 600,
                                                                                color: '#374151',
                                                                                cursor: 'pointer',
                                                                                transition: 'all 0.2s'
                                                                            }}
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                if (!stallTypeForm.name.trim()) {
                                                                                    alert('Please enter a stall name');
                                                                                    return;
                                                                                }

                                                                                // Update existing stall type
                                                                                setEventData({
                                                                                    ...eventData,
                                                                                    stallTypes: eventData.stallTypes.map(t =>
                                                                                        t.id === editingStallType
                                                                                            ? {
                                                                                                ...t,
                                                                                                name: stallTypeForm.name,
                                                                                                color: stallTypeForm.color,
                                                                                                startNumber: stallTypeForm.startNumber,
                                                                                                endNumber: stallTypeForm.startNumber + stallTypeForm.stallCount - 1,
                                                                                                price: stallTypeForm.price
                                                                                            }
                                                                                            : t
                                                                                    )
                                                                                });

                                                                                setEditingStallType(null);
                                                                                setStallTypeForm({ name: '', stallCount: 10, startNumber: 1, color: '#3B82F6', price: 50000 });
                                                                            }}
                                                                            style={{
                                                                                padding: '12px 24px',
                                                                                background: 'white',
                                                                                border: '1.5px solid #e2e8f0',
                                                                                borderRadius: '10px',
                                                                                fontSize: '14px',
                                                                                fontWeight: 600,
                                                                                color: '#374151',
                                                                                cursor: 'pointer',
                                                                                transition: 'all 0.2s'
                                                                            }}
                                                                        >
                                                                            Done
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Add Custom Stall Type Button - Outside the list with dashed border */}
                                        {editingStallType !== 'new' && (
                                            <button
                                                onClick={() => {
                                                    const lastEnd = eventData.stallTypes.length > 0
                                                        ? Math.max(...eventData.stallTypes.map(t => t.endNumber))
                                                        : 0;
                                                    setEditingStallType('new');
                                                    setStallTypeForm({
                                                        name: '',
                                                        stallCount: 10,
                                                        startNumber: lastEnd + 1,
                                                        color: '#6366F1',
                                                        price: 25000
                                                    });
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '18px',
                                                    border: '2px dashed #cbd5e1',
                                                    borderRadius: '12px',
                                                    background: '#fafbfc',
                                                    color: '#64748b',
                                                    fontWeight: 600,
                                                    fontSize: '14px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={e => {
                                                    e.currentTarget.style.background = '#f1f5f9';
                                                    e.currentTarget.style.color = '#2563eb';
                                                    e.currentTarget.style.borderColor = '#2563eb';
                                                }}
                                                onMouseOut={e => {
                                                    e.currentTarget.style.background = '#fafbfc';
                                                    e.currentTarget.style.color = '#64748b';
                                                    e.currentTarget.style.borderColor = '#cbd5e1';
                                                }}
                                            >
                                                <Plus size={18} /> Add Custom Stall Type
                                            </button>
                                        )}

                                        {/* Add Custom Stall Type Form */}
                                        {editingStallType === 'new' && (
                                            <div style={{
                                                border: '2px dashed #cbd5e1',
                                                borderRadius: '12px',
                                                padding: '24px',
                                                background: '#fafbfc'
                                            }}>
                                                {/* First Row: Stall Type Name and Price */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#1e293b', marginBottom: '8px' }}>Stall Type Name *</label>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g., VIP, Ultra Premium"
                                                            value={stallTypeForm.name}
                                                            onChange={e => setStallTypeForm({ ...stallTypeForm, name: e.target.value })}
                                                            style={{
                                                                width: '100%',
                                                                padding: '12px 14px',
                                                                border: '1.5px solid #e2e8f0',
                                                                borderRadius: '10px',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                background: 'white'
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#1e293b', marginBottom: '8px' }}>Price (₹) *</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="1000"
                                                            value={stallTypeForm.price}
                                                            onChange={e => setStallTypeForm({ ...stallTypeForm, price: parseInt(e.target.value) || 0 })}
                                                            style={{
                                                                width: '100%',
                                                                padding: '12px 14px',
                                                                border: '1.5px solid #e2e8f0',
                                                                borderRadius: '10px',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                background: 'white'
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Second Row: Number of Stalls, Stall Color */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px', marginBottom: '24px' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#1e293b', marginBottom: '8px' }}>Number of Stalls</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={stallTypeForm.stallCount}
                                                            onChange={e => setStallTypeForm({ ...stallTypeForm, stallCount: parseInt(e.target.value) || 1 })}
                                                            style={{
                                                                width: '100%',
                                                                padding: '12px 14px',
                                                                border: '1.5px solid #e2e8f0',
                                                                borderRadius: '10px',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                background: 'white'
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#1e293b', marginBottom: '8px' }}>Stall Color</label>
                                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                            <input
                                                                type="color"
                                                                value={stallTypeForm.color}
                                                                onChange={e => setStallTypeForm({ ...stallTypeForm, color: e.target.value })}
                                                                style={{
                                                                    width: '48px',
                                                                    height: '46px',
                                                                    padding: '2px',
                                                                    border: '1.5px solid #e2e8f0',
                                                                    borderRadius: '10px',
                                                                    cursor: 'pointer',
                                                                    background: 'white'
                                                                }}
                                                            />
                                                            <input
                                                                type="text"
                                                                value={stallTypeForm.color.toUpperCase()}
                                                                onChange={e => {
                                                                    let val = e.target.value;
                                                                    if (!val.startsWith('#')) val = '#' + val;
                                                                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                                                                        setStallTypeForm({ ...stallTypeForm, color: val });
                                                                    }
                                                                }}
                                                                style={{
                                                                    flex: 1,
                                                                    padding: '12px 14px',
                                                                    border: '1.5px solid #e2e8f0',
                                                                    borderRadius: '10px',
                                                                    fontSize: '14px',
                                                                    outline: 'none',
                                                                    fontFamily: 'monospace',
                                                                    background: 'white',
                                                                    textTransform: 'uppercase'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                                    <button
                                                        onClick={() => {
                                                            setEditingStallType(null);
                                                            setStallTypeForm({ name: '', stallCount: 10, startNumber: 1, color: '#3B82F6', price: 50000 });
                                                        }}
                                                        style={{
                                                            padding: '12px 24px',
                                                            background: 'white',
                                                            border: '1.5px solid #e2e8f0',
                                                            borderRadius: '10px',
                                                            fontSize: '14px',
                                                            fontWeight: 600,
                                                            color: '#374151',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (!stallTypeForm.name.trim()) {
                                                                alert('Please enter a stall name');
                                                                return;
                                                            }

                                                            // Add new stall type
                                                            const newId = eventData.stallTypes.length > 0
                                                                ? Math.max(...eventData.stallTypes.map(t => t.id)) + 1
                                                                : 1;
                                                            setEventData({
                                                                ...eventData,
                                                                stallTypes: [...eventData.stallTypes, {
                                                                    id: newId,
                                                                    name: stallTypeForm.name,
                                                                    color: stallTypeForm.color,
                                                                    startNumber: stallTypeForm.startNumber,
                                                                    endNumber: stallTypeForm.startNumber + stallTypeForm.stallCount - 1,
                                                                    price: stallTypeForm.price
                                                                }]
                                                            });

                                                            setEditingStallType(null);
                                                            setStallTypeForm({ name: '', stallCount: 10, startNumber: 1, color: '#3B82F6', price: 50000 });
                                                        }}
                                                        style={{
                                                            padding: '12px 24px',
                                                            background: '#4F46E5',
                                                            border: 'none',
                                                            borderRadius: '10px',
                                                            fontSize: '14px',
                                                            fontWeight: 600,
                                                            color: 'white',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px'
                                                        }}
                                                    >
                                                        <Save size={16} /> Add Stall Type
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Interactive Stall Selection Button */}
                                        {eventData.stallTypes.length > 0 && editingStallType !== 'new' && (
                                            <div style={{ marginTop: '20px' }}>
                                                <button
                                                    onClick={() => {
                                                        // Convert stallTypes to format expected by StallSelector
                                                        const formattedStallTypes = eventData.stallTypes.map(type => ({
                                                            name: type.name,
                                                            price: type.price,
                                                            color: type.color,
                                                            limit: type.endNumber - type.startNumber + 1
                                                        }));
                                                        setShowStallSelector(true);
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        padding: '20px',
                                                        border: '2px solid #2563eb',
                                                        borderRadius: '12px',
                                                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                                        color: 'white',
                                                        fontWeight: 600,
                                                        fontSize: '15px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '10px',
                                                        transition: 'all 0.3s',
                                                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                                                    }}
                                                    onMouseOver={e => {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.4)';
                                                    }}
                                                    onMouseOut={e => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
                                                    }}
                                                >
                                                    <Grid size={20} />
                                                    Open Interactive Stall Selection
                                                </button>
                                                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', textAlign: 'center' }}>
                                                    Click to visually select and assign stalls on an interactive grid
                                                </p>
                                            </div>
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
            )
            }

            {/* View Event Details Modal */}
            {
                viewEventModal && selectedEvent && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
                        justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                        backdropFilter: 'blur(4px)'
                    }}>
                        <div style={{
                            background: 'white', borderRadius: '24px', padding: '40px',
                            width: '700px', maxWidth: '95%', maxHeight: '90vh',
                            overflowY: 'auto', position: 'relative',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                        }} onClick={e => e.stopPropagation()}>

                            <button onClick={() => { setViewEventModal(false); setSelectedEvent(null); }} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                <X size={24} />
                            </button>

                            <div style={{ marginBottom: '32px' }}>
                                <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Event Details</h2>
                                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>View event information</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>EVENT ID</div>
                                    <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: 600 }}>{selectedEvent.id}</div>
                                </div>
                                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>STATUS</div>
                                    <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: 600 }}>{selectedEvent.status || 'Draft'}</div>
                                </div>
                                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>EVENT NAME</div>
                                    <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: 600 }}>{selectedEvent.event_name || selectedEvent.name}</div>
                                </div>
                                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>DESCRIPTION</div>
                                    <div style={{ fontSize: '14px', color: '#475569' }}>{selectedEvent.description || 'No description'}</div>
                                </div>
                                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>EVENT TYPE</div>
                                    <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: 600 }}>{selectedEvent.event_type || '-'}</div>
                                </div>
                                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>EVENT MODE</div>
                                    <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: 600 }}>{selectedEvent.event_mode || '-'}</div>
                                </div>
                                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>START DATE</div>
                                    <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: 600 }}>{selectedEvent.start_date ? new Date(selectedEvent.start_date).toLocaleDateString() : '-'}</div>
                                </div>
                                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>END DATE</div>
                                    <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: 600 }}>{selectedEvent.end_date ? new Date(selectedEvent.end_date).toLocaleDateString() : '-'}</div>
                                </div>
                                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>VENUE</div>
                                    <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: 600 }}>{selectedEvent.venue || '-'}</div>
                                </div>
                                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>CITY</div>
                                    <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: 600 }}>{selectedEvent.city || '-'}</div>
                                </div>
                                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>STATE</div>
                                    <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: 600 }}>{selectedEvent.state || '-'}</div>
                                </div>
                                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>ORGANIZER NAME</div>
                                    <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: 600 }}>{selectedEvent.organizer_name || '-'}</div>
                                </div>
                                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>ORGANIZER EMAIL</div>
                                    <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: 600 }}>{selectedEvent.organizer_email || '-'}</div>
                                </div>
                            </div>


                            {/* QR Code Button */}
                            <div style={{
                                marginTop: '24px',
                                padding: '20px',
                                background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                                border: '2px solid #10b981',
                                borderRadius: '16px',
                                textAlign: 'center'
                            }}>
                                <h3 style={{
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    color: '#047857',
                                    margin: '0 0 12px 0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}>
                                    📱 Event QR Code
                                </h3>
                                <p style={{
                                    fontSize: '13px',
                                    color: '#059669',
                                    marginBottom: '16px'
                                }}>
                                    Share this event's QR code for easy registration
                                </p>
                                <button
                                    onClick={() => window.open(`/qr/event/${selectedEvent.id}`, '_blank')}
                                    style={{
                                        padding: '12px 24px',
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        border: 'none',
                                        borderRadius: '10px',
                                        color: 'white',
                                        fontSize: '15px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'transform 0.2s'
                                    }}
                                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="7" height="7" />
                                        <rect x="14" y="3" width="7" height="7" />
                                        <rect x="14" y="14" width="7" height="7" />
                                        <rect x="3" y="14" width="7" height="7" />
                                    </svg>
                                    View & Share QR Code
                                </button>
                            </div>


                            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => { setViewEventModal(false); setSelectedEvent(null); }}
                                    style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Interactive Stall Selector */}
            {showStallSelector && (
                <StallSelector
                    totalStalls={eventData.stallConfig.totalStalls}
                    stallTypes={eventData.stallTypes.map(type => ({
                        name: type.name,
                        price: type.price,
                        color: type.color,
                        limit: type.endNumber - type.startNumber + 1
                    }))}
                    initialAssignments={stallAssignments}
                    onSave={handleStallSelectorSave}
                    onClose={() => setShowStallSelector(false)}
                />
            )}

            {/* Toast Notification */}
            {toast.show && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    background: toast.type === 'success' ? '#10b981' : '#ef4444',
                    color: 'white',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    zIndex: 10000,
                    fontSize: '14px',
                    fontWeight: 600,
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default EventManagement;
