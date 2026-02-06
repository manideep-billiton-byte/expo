import React, { useEffect, useState } from 'react';
import { Image, TrendingUp, Users, UserCheck, Search, Download, Plus, MoreHorizontal, X, ChevronRight, ChevronDown, Check, Building2, MapPin, CheckCircle2, FileText, Send, Eye, Edit, Ban, Trash2 } from 'lucide-react';
import { apiFetch } from '../utils/api';

const ExhibitorsManagement = () => {
    const [activeTab, setActiveTab] = useState('All Exhibitors');
    const [searchQuery, setSearchQuery] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [modalStep, setModalStep] = useState(1);
    const [openDropdown, setOpenDropdown] = useState(null);

    const defaultExhibitorData = {
        companyName: '',
        gstNumber: '',
        address: '',
        industry: '',
        logo: null,
        contactPerson: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: '',
        organizationId: '',
        assignedEvent: '',
        stallNumbers: [],
        accessStatus: 'Active',
        leadCapture: {
            visitorQR: true,
            stallQR: true,
            ocr: false,
            manual: true
        },
        communication: {
            whatsapp: true,
            email: true,
            sms: false
        }
    };

    const [exhibitors, setExhibitors] = useState([]);
    const [exhibitorsLoading, setExhibitorsLoading] = useState(false);
    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(false);
    const [organizations, setOrganizations] = useState([]);
    const [organizationsLoading, setOrganizationsLoading] = useState(false);
    const [createExhibitorLoading, setCreateExhibitorLoading] = useState(false);

    const [exhibitorData, setExhibitorData] = useState({
        ...defaultExhibitorData
    });

    const [showSuccess, setShowSuccess] = useState(false);

    // State for exhibitor actions (View, Edit, Suspend, Delete)
    const [selectedExhibitor, setSelectedExhibitor] = useState(null);
    const [viewExhibitorModal, setViewExhibitorModal] = useState(false);
    const [editExhibitorModal, setEditExhibitorModal] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Toast notification helper
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleOpenModal = () => {
        setModalStep(1);
        setShowSuccess(false);

        // Auto-fill organizationId for organization users
        const userType = localStorage.getItem('userType');
        const organizationId = localStorage.getItem('organizationId');

        if (userType === 'organization' && organizationId) {
            // Pre-fill the organization ID for organization users
            setExhibitorData({
                ...defaultExhibitorData,
                organizationId: organizationId
            });
        } else {
            // Reset to default for master admin
            setExhibitorData({ ...defaultExhibitorData });
        }

        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalStep(1);
        setShowSuccess(false);
        setExhibitorData({ ...defaultExhibitorData });
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
            const data = await resp.json();
            console.log('Loaded events:', data);
            setEvents(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load events', err);
            setEvents([]);
        } finally {
            setEventsLoading(false);
        }
    };

    const loadOrganizations = async () => {
        setOrganizationsLoading(true);
        try {
            const resp = await apiFetch('/api/organizations');
            const data = await resp.json();
            console.log('Loaded organizations:', data);
            setOrganizations(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load organizations', err);
            setOrganizations([]);
        } finally {
            setOrganizationsLoading(false);
        }
    };

    const loadExhibitors = async () => {
        setExhibitorsLoading(true);
        try {
            // Get organizationId from localStorage if user is logged in as organization
            const organizationId = localStorage.getItem('organizationId');
            const userType = localStorage.getItem('userType');

            // Build API URL with organization filter if applicable
            let apiUrl = '/api/exhibitors';
            if (userType === 'organization' && organizationId) {
                apiUrl += `?organization_id=${organizationId}`;
            }

            const resp = await apiFetch(apiUrl);
            const data = await resp.json();

            const mapped = (Array.isArray(data) ? data : []).map((row) => {
                const createdDate = row.created_at ? new Date(row.created_at).toLocaleDateString() : '';
                const lastDate = row.created_at ? new Date(row.created_at).toLocaleDateString() : '';
                return {
                    id: String(row.id ?? ''),
                    company: row.company_name ?? '',
                    email: row.email ?? '',
                    status: row.access_status ?? 'Active',
                    event: row.event_name ?? '',
                    organisation: row.organization_name ?? '',
                    leads: '-',
                    staff: '-',
                    lastActive: createdDate,
                    lastDate
                };
            });

            setExhibitors(mapped);
        } catch (err) {
            console.error('Failed to load exhibitors', err);
            setExhibitors([]);
        } finally {
            setExhibitorsLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
        loadExhibitors();
        loadOrganizations();
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

    const handleCreateExhibitor = async () => {
        // Validate password match
        if (exhibitorData.password && exhibitorData.password !== exhibitorData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        setCreateExhibitorLoading(true);
        try {
            const payload = {
                companyName: exhibitorData.companyName,
                gstNumber: exhibitorData.gstNumber,
                address: exhibitorData.address,
                industry: exhibitorData.industry,
                logoUrl: null,
                contactPerson: exhibitorData.contactPerson,
                email: exhibitorData.email,
                mobile: exhibitorData.mobile,
                password: exhibitorData.password || null,
                organizationId: exhibitorData.organizationId || null,
                eventId: exhibitorData.assignedEvent || null,
                stallNumbers: exhibitorData.stallNumbers,
                accessStatus: exhibitorData.accessStatus,
                leadCapture: exhibitorData.leadCapture,
                communication: exhibitorData.communication
            };

            const resp = await apiFetch('/api/exhibitors', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            const data = await resp.json();

            setShowSuccess(true);
            if (data && data.credentials) {
                alert(`Exhibitor created successfully!\n\nLogin Credentials:\nEmail: ${data.credentials.email}\nPassword: ${data.credentials.password}\n\n${data.credentials.note || ''}`);
            } else {
                alert('Exhibitor created successfully!');
            }
            await loadExhibitors();
        } catch (err) {
            console.error('Create exhibitor failed', err);
            alert('Failed to create exhibitor: ' + (err.message || err));
        } finally {
            setCreateExhibitorLoading(false);
        }
    };

    // Handle View Exhibitor
    const handleViewExhibitor = async (exhibitorId) => {
        try {
            const response = await apiFetch(`/api/exhibitors/${exhibitorId}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch exhibitor details');
            setSelectedExhibitor(data.exhibitor);
            setViewExhibitorModal(true);
            setOpenDropdown(null);
        } catch (error) {
            showToast(error.message || 'Failed to load exhibitor details', 'error');
        }
    };

    // Handle Edit Exhibitor
    const handleEditExhibitor = async (exhibitorId) => {
        try {
            const response = await apiFetch(`/api/exhibitors/${exhibitorId}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch exhibitor details');
            setSelectedExhibitor(data.exhibitor);
            setEditExhibitorModal(true);
            setOpenDropdown(null);
        } catch (error) {
            showToast(error.message || 'Failed to load exhibitor details', 'error');
        }
    };

    // Handle Update Exhibitor
    const handleUpdateExhibitor = async (e) => {
        e.preventDefault();
        if (!selectedExhibitor) return;

        try {
            const response = await apiFetch(`/api/exhibitors/${selectedExhibitor.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedExhibitor)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to update exhibitor');

            showToast('✅ Exhibitor updated successfully!', 'success');
            setEditExhibitorModal(false);
            setSelectedExhibitor(null);
            await loadExhibitors();
        } catch (error) {
            showToast('❌ ' + (error.message || 'Failed to update exhibitor'), 'error');
        }
    };

    // Handle Suspend/Activate Exhibitor
    const handleSuspendExhibitor = async (exhibitorId, currentStatus) => {
        const newStatus = currentStatus === 'Suspended' ? 'Active' : 'Suspended';
        const action = newStatus === 'Suspended' ? 'suspend' : 'activate';

        if (!confirm(`Are you sure you want to ${action} this exhibitor?`)) {
            setOpenDropdown(null);
            return;
        }

        try {
            const response = await apiFetch(`/api/exhibitors/${exhibitorId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Failed to ${action} exhibitor`);

            showToast(`✅ Exhibitor ${action}d successfully!`, 'success');
            setOpenDropdown(null);
            await loadExhibitors();
        } catch (error) {
            showToast('❌ ' + (error.message || `Failed to ${action} exhibitor`), 'error');
            setOpenDropdown(null);
        }
    };

    // Handle Delete Exhibitor
    const handleDeleteExhibitor = async (exhibitorId, companyName) => {
        if (!confirm(`⚠️ Are you sure you want to DELETE "${companyName}"?\n\nThis action cannot be undone and will remove all associated data.`)) {
            setOpenDropdown(null);
            return;
        }

        try {
            const response = await apiFetch(`/api/exhibitors/${exhibitorId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to delete exhibitor');

            showToast('✅ Exhibitor deleted successfully!', 'success');
            setOpenDropdown(null);
            await loadExhibitors();
        } catch (error) {
            showToast('❌ ' + (error.message || 'Failed to delete exhibitor'), 'error');
            setOpenDropdown(null);
        }
    };

    const tabs = ['All Exhibitors', 'Active', 'Pending', 'Stalls', 'Leads'];

    const getStatusBadge = (status) => {
        const statusStyles = {
            'Active': 'badge-live',
            'Inactive': 'badge-draft'
        };
        return statusStyles[status] || 'badge-draft';
    };

    return (
        <div className="dashboard-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }} className="fade-in">
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>Exhibitors Management</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Manage exhibitors, their staff and lead capture</p>
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
                        Add Exhibitors
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }} className="fade-in">
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Total Exhibitors</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{exhibitorsLoading ? '...' : exhibitors.length}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Right Now</div>
                        </div>
                        <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Image size={20} color="#06b6d4" />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Active</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{exhibitorsLoading ? '...' : exhibitors.filter(e => e.status === 'Active').length}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Currently Running</div>
                        </div>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Image size={20} color="#3b82f6" />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Total Leads</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>0</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Right Now</div>
                        </div>
                        <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Users size={20} color="#2563eb" />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Staff Members</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>0</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Right Now</div>
                        </div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <UserCheck size={20} color="#10b981" />
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
                            placeholder="Search Exhibitors..."
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
                                <th>EXHIBITOR ID</th>
                                <th>COMPANY</th>
                                <th>STATUS</th>
                                <th>EVENT</th>
                                <th>ORGANISATION</th>
                                <th>LEADS</th>
                                <th>STAFF</th>
                                <th>LAST ACTIVE</th>
                                <th>LAST DATE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exhibitorsLoading ? (
                                <tr>
                                    <td colSpan="10" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>Loading...</td>
                                </tr>
                            ) : exhibitors.length === 0 ? (
                                <tr>
                                    <td colSpan="10" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No exhibitors found</td>
                                </tr>
                            ) : (
                                exhibitors.slice(0, entriesPerPage).map((exhibitor, idx) => (
                                    <tr
                                        key={idx}
                                        className="hover-lift"
                                        style={{ position: 'relative', zIndex: openDropdown === exhibitor.id ? 100 : 1, cursor: 'pointer' }}
                                        onClick={() => handleViewExhibitor(exhibitor.id)}
                                    >
                                        <td style={{ fontWeight: 600, color: '#475569' }}>{exhibitor.id}</td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{exhibitor.company}</div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{exhibitor.email}</div>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(exhibitor.status)}`}>
                                                {exhibitor.status}
                                            </span>
                                        </td>
                                        <td style={{ color: '#475569' }}>{exhibitor.event}</td>
                                        <td style={{ color: '#475569' }}>{exhibitor.organisation}</td>
                                        <td style={{ fontWeight: 600 }}>{exhibitor.leads}</td>
                                        <td style={{ fontWeight: 600 }}>{exhibitor.staff}</td>
                                        <td style={{ fontSize: '13px', color: '#64748b' }}>{exhibitor.lastActive}</td>
                                        <td style={{ fontSize: '13px', color: '#64748b' }}>{exhibitor.lastDate}</td>
                                        <td style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenDropdown(openDropdown === exhibitor.id ? null : exhibitor.id);
                                                }}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                            >
                                                <MoreHorizontal size={18} color="#64748b" />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {openDropdown === exhibitor.id && (
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
                                                            onClick={() => handleViewExhibitor(exhibitor.id)}
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
                                                            onClick={() => handleEditExhibitor(exhibitor.id)}
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
                                                            <span>Edit Exhibitor</span>
                                                        </button>

                                                        <div style={{ height: '1px', background: '#e2e8f0', margin: '8px 0' }}></div>

                                                        <button
                                                            onClick={() => handleSuspendExhibitor(exhibitor.id, exhibitor.status)}
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
                                                            <span>{exhibitor.status === 'Suspended' ? 'Activate Exhibitor' : 'Suspend Exhibitor'}</span>
                                                        </button>

                                                        <button
                                                            onClick={() => handleDeleteExhibitor(exhibitor.id, exhibitor.company)}
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
                                                            <span>Delete Exhibitor</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                        Showing {exhibitors.length > 0 ? 1 : 0} to {Math.min(exhibitors.length, entriesPerPage)} of {exhibitors.length} entries
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

            {/* Add Exhibitor Modal */}
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
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <div style={{
                                    width: '80px', height: '80px', background: '#f0fdf4',
                                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', margin: '0 auto 24px'
                                }}>
                                    <CheckCircle2 size={48} color="#22c55e" />
                                </div>
                                <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '12px' }}>Exhibitor Created!</h2>
                                <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '40px' }}>The exhibitor has been added successfully.</p>

                                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                                    <button
                                        onClick={handleCloseModal}
                                        style={{ padding: '12px 32px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        Close
                                    </button>
                                    <button style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: '#0d89a4', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                                        Create Order
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: '32px' }}>
                                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Add New Exhibitor</h2>
                                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Fill in the exhibitor details</p>
                                </div>

                                {/* Tabs Navigation */}
                                <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', marginBottom: '40px' }}>
                                    {['Profile', 'Event & Stall', 'Lead Capture', 'Communication'].map((tabName, idx) => {
                                        const stepNum = idx + 1;
                                        const isActive = modalStep === stepNum;
                                        const isCompleted = modalStep > stepNum;
                                        return (
                                            <div
                                                key={tabName}
                                                onClick={() => setModalStep(stepNum)}
                                                style={{
                                                    flex: 1, textAlign: 'center', paddingBottom: '16px',
                                                    borderBottom: isActive ? '3px solid #0d89a4' : '3px solid transparent',
                                                    color: isActive ? '#0d89a4' : (isCompleted ? '#1e293b' : '#94a3b8'),
                                                    fontWeight: (isActive || isCompleted) ? 700 : 500,
                                                    fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                                }}
                                            >
                                                {tabName}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Step Content */}
                                <div style={{ minHeight: '400px' }}>
                                    {modalStep === 1 && (
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Company Name *</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter company name"
                                                        value={exhibitorData.companyName}
                                                        onChange={e => setExhibitorData({ ...exhibitorData, companyName: e.target.value })}
                                                        style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>GST Number</label>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <input
                                                            type="text"
                                                            placeholder="27XXXXX1234X1ZX"
                                                            value={exhibitorData.gstNumber}
                                                            onChange={e => setExhibitorData({ ...exhibitorData, gstNumber: e.target.value })}
                                                            style={{ flex: 1, padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                                        />
                                                        <button style={{ padding: '0 20px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Verify</button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: '20px' }}>
                                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Business Address</label>
                                                <textarea
                                                    placeholder="Enter business address"
                                                    value={exhibitorData.address}
                                                    onChange={e => setExhibitorData({ ...exhibitorData, address: e.target.value })}
                                                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', minHeight: '100px', resize: 'vertical' }}
                                                />
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Industry / Sector</label>
                                                    <select
                                                        value={exhibitorData.industry}
                                                        onChange={e => setExhibitorData({ ...exhibitorData, industry: e.target.value })}
                                                        style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: 'white' }}
                                                    >
                                                        <option value="">Select industry</option>
                                                        <option value="it">Information Technology</option>
                                                        <option value="healthcare">Healthcare</option>
                                                        <option value="manufacturing">Manufacturing</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Company Logo</label>
                                                    <input
                                                        type="file"
                                                        style={{ width: '100%', padding: '9px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: 'white', cursor: 'pointer' }}
                                                    />
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Primary Contact *</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter contact name"
                                                        value={exhibitorData.contactPerson}
                                                        onChange={e => setExhibitorData({ ...exhibitorData, contactPerson: e.target.value })}
                                                        style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Email *</label>
                                                    <input
                                                        type="email"
                                                        placeholder="Enter email"
                                                        value={exhibitorData.email}
                                                        onChange={e => setExhibitorData({ ...exhibitorData, email: e.target.value })}
                                                        style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                                    />
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: '20px' }}>
                                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Mobile Number *</label>
                                                <input
                                                    type="tel"
                                                    placeholder="+91 XXXXX XXXXX"
                                                    value={exhibitorData.mobile}
                                                    onChange={e => setExhibitorData({ ...exhibitorData, mobile: e.target.value })}
                                                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                                />
                                            </div>

                                            <div style={{ marginBottom: '20px' }}>
                                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Organization Name *</label>
                                                <select
                                                    value={exhibitorData.organizationId}
                                                    onChange={e => setExhibitorData({ ...exhibitorData, organizationId: e.target.value })}
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
                                                    {organizations.map((org) => (
                                                        <option key={org.id} value={String(org.id)}>
                                                            {org.org_name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {localStorage.getItem('userType') === 'organization' && (
                                                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                                        📌 Exhibitors will be created for your organization: {localStorage.getItem('organizationName')}
                                                    </p>
                                                )}
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Password *</label>
                                                    <input
                                                        type="password"
                                                        placeholder="Enter password"
                                                        value={exhibitorData.password}
                                                        onChange={e => setExhibitorData({ ...exhibitorData, password: e.target.value })}
                                                        style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Confirm Password *</label>
                                                    <input
                                                        type="password"
                                                        placeholder="Confirm password"
                                                        value={exhibitorData.confirmPassword}
                                                        onChange={e => setExhibitorData({ ...exhibitorData, confirmPassword: e.target.value })}
                                                        style={{
                                                            width: '100%',
                                                            padding: '12px 14px',
                                                            border: exhibitorData.confirmPassword && exhibitorData.password !== exhibitorData.confirmPassword
                                                                ? '1.5px solid #ef4444'
                                                                : '1.5px solid #e2e8f0',
                                                            borderRadius: '10px',
                                                            fontSize: '14px',
                                                            outline: 'none'
                                                        }}
                                                    />
                                                    {exhibitorData.confirmPassword && exhibitorData.password !== exhibitorData.confirmPassword && (
                                                        <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>Passwords do not match</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {modalStep === 2 && (
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Assigned Event *</label>
                                                    <select
                                                        value={exhibitorData.assignedEvent}
                                                        onChange={e => setExhibitorData({ ...exhibitorData, assignedEvent: e.target.value })}
                                                        style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: 'white' }}
                                                    >
                                                        <option value="">Select event</option>
                                                        {events.map((ev) => (
                                                            <option key={ev.id} value={String(ev.id)}>
                                                                {ev.event_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Selected Stalls</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Select stalls from grid below"
                                                        value={exhibitorData.stallNumbers.join(', ')}
                                                        readOnly
                                                        style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#f8fafc', cursor: 'not-allowed' }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Ground Layout Display with Interactive Stall Selection */}
                                            {(() => {
                                                if (!exhibitorData.assignedEvent) {
                                                    // No event selected - show prompt
                                                    return (
                                                        <div style={{
                                                            marginBottom: '24px',
                                                            border: '2px dashed #e2e8f0',
                                                            borderRadius: '16px',
                                                            padding: '32px',
                                                            background: '#fafbfc',
                                                            textAlign: 'center'
                                                        }}>
                                                            <Image size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
                                                            <p style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
                                                                Select an Event First
                                                            </p>
                                                            <p style={{ fontSize: '12px', color: '#cbd5e1' }}>
                                                                The stall selection grid will appear here after selecting an event
                                                            </p>
                                                        </div>
                                                    );
                                                }

                                                const selectedEvent = events.find(ev => String(ev.id) === exhibitorData.assignedEvent);
                                                const groundLayoutUrl = selectedEvent?.ground_layout_url;
                                                const apiBase = import.meta.env.VITE_API_URL || 'https://d36p7i1koir3da.cloudfront.net';

                                                // Parse stall configuration
                                                let stallConfig = { rows: 10, columns: 10, stallPrefix: 'S', totalStalls: 100 };
                                                let stallTypes = [
                                                    { id: 1, name: 'Basic', color: '#3b82f6', startNumber: 1, endNumber: 40, price: 25000 },
                                                    { id: 2, name: 'Standard', color: '#10b981', startNumber: 41, endNumber: 70, price: 50000 },
                                                    { id: 3, name: 'Premium', color: '#8b5cf6', startNumber: 71, endNumber: 90, price: 85000 },
                                                    { id: 4, name: 'Corner', color: '#f97316', startNumber: 91, endNumber: 100, price: 25000 }
                                                ];

                                                try {
                                                    if (selectedEvent?.stall_config) {
                                                        const parsed = typeof selectedEvent.stall_config === 'string'
                                                            ? JSON.parse(selectedEvent.stall_config)
                                                            : selectedEvent.stall_config;
                                                        stallConfig = { ...stallConfig, ...parsed };
                                                    }
                                                    if (selectedEvent?.stall_types && Array.isArray(selectedEvent.stall_types)) {
                                                        stallTypes = typeof selectedEvent.stall_types[0] === 'string'
                                                            ? JSON.parse(selectedEvent.stall_types)
                                                            : selectedEvent.stall_types;
                                                    } else if (selectedEvent?.stall_types && typeof selectedEvent.stall_types === 'string') {
                                                        stallTypes = JSON.parse(selectedEvent.stall_types);
                                                    }
                                                } catch (e) {
                                                    console.error('Error parsing stall config:', e);
                                                }

                                                // Get booked stalls from exhibitors (stalls already assigned)
                                                const bookedStalls = exhibitors
                                                    .filter(ex => String(ex.event) === selectedEvent?.event_name || String(ex.eventId) === selectedEvent?.id)
                                                    .map(ex => ex.stallNumber || ex.stall_number)
                                                    .filter(Boolean);

                                                // Generate stalls grid
                                                const totalStalls = stallConfig.totalStalls || (stallConfig.rows * stallConfig.columns);
                                                const columns = stallConfig.columns || 10;
                                                const rows = Math.ceil(totalStalls / columns);
                                                const prefix = stallConfig.stallPrefix || 'S';

                                                // Function to get stall type by number
                                                const getStallType = (stallNum) => {
                                                    for (const type of stallTypes) {
                                                        if (stallNum >= type.startNumber && stallNum <= type.endNumber) {
                                                            return type;
                                                        }
                                                    }
                                                    return stallTypes[0] || { name: 'Basic', color: '#3b82f6', price: 0 };
                                                };

                                                // Check if stall is booked
                                                const isBooked = (stallId) => bookedStalls.includes(stallId);

                                                // Check if stall is selected
                                                const isSelected = (stallId) => exhibitorData.stallNumbers.includes(stallId);

                                                return (
                                                    <div style={{
                                                        marginBottom: '24px',
                                                        border: '2px solid #0d89a4',
                                                        borderRadius: '16px',
                                                        padding: '20px',
                                                        background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)'
                                                    }}>
                                                        {/* Header */}
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <Image size={20} color="#0d89a4" />
                                                                <span style={{ fontSize: '16px', fontWeight: 700, color: '#0d89a4' }}>
                                                                    Select Your Stall
                                                                </span>
                                                                <span style={{
                                                                    fontSize: '12px',
                                                                    background: '#0d89a4',
                                                                    color: 'white',
                                                                    padding: '4px 12px',
                                                                    borderRadius: '20px',
                                                                    fontWeight: 600
                                                                }}>
                                                                    {selectedEvent?.event_name}
                                                                </span>
                                                            </div>
                                                            {exhibitorData.stallNumbers.length > 0 && (() => {
                                                                const totalPrice = exhibitorData.stallNumbers.reduce((sum, stallId) => {
                                                                    const stallNum = parseInt(stallId.replace(/[^0-9]/g, ''));
                                                                    const type = getStallType(stallNum);
                                                                    return sum + (type.price || 0);
                                                                }, 0);
                                                                return (
                                                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                                        <div style={{
                                                                            background: '#10b981',
                                                                            color: 'white',
                                                                            padding: '8px 16px',
                                                                            borderRadius: '8px',
                                                                            fontWeight: 700,
                                                                            fontSize: '14px'
                                                                        }}>
                                                                            Selected: {exhibitorData.stallNumbers.length} Stall{exhibitorData.stallNumbers.length > 1 ? 's' : ''}
                                                                        </div>
                                                                        <div style={{
                                                                            background: '#0d89a4',
                                                                            color: 'white',
                                                                            padding: '8px 16px',
                                                                            borderRadius: '8px',
                                                                            fontWeight: 700,
                                                                            fontSize: '14px'
                                                                        }}>
                                                                            Total: ₹{totalPrice.toLocaleString()}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>

                                                        {/* Legend */}
                                                        <div style={{
                                                            display: 'flex',
                                                            gap: '16px',
                                                            marginBottom: '16px',
                                                            flexWrap: 'wrap',
                                                            padding: '12px',
                                                            background: 'rgba(255,255,255,0.7)',
                                                            borderRadius: '10px'
                                                        }}>
                                                            {stallTypes.map(type => (
                                                                <div key={type.id || type.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <div style={{
                                                                        width: '20px',
                                                                        height: '20px',
                                                                        background: type.color,
                                                                        borderRadius: '4px',
                                                                        border: '2px solid white',
                                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                                    }} />
                                                                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                                                                        {type.name} (₹{(type.price || 0).toLocaleString()})
                                                                    </span>
                                                                </div>
                                                            ))}
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <div style={{
                                                                    width: '20px',
                                                                    height: '20px',
                                                                    background: '#94a3b8',
                                                                    borderRadius: '4px',
                                                                    position: 'relative'
                                                                }}>
                                                                    <X size={14} color="white" style={{ position: 'absolute', top: '3px', left: '3px' }} />
                                                                </div>
                                                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Booked</span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <div style={{
                                                                    width: '20px',
                                                                    height: '20px',
                                                                    background: '#10b981',
                                                                    borderRadius: '4px',
                                                                    border: '3px solid #059669'
                                                                }} />
                                                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Selected</span>
                                                            </div>
                                                        </div>

                                                        {/* Interactive Stall Grid */}
                                                        <div style={{
                                                            background: 'white',
                                                            borderRadius: '12px',
                                                            padding: '16px',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                                            overflowX: 'auto'
                                                        }}>
                                                            {/* Stage/Entry indicator */}
                                                            <div style={{
                                                                background: 'linear-gradient(90deg, #1e293b, #334155)',
                                                                color: 'white',
                                                                padding: '10px 24px',
                                                                borderRadius: '8px',
                                                                textAlign: 'center',
                                                                fontWeight: 700,
                                                                fontSize: '14px',
                                                                marginBottom: '20px',
                                                                letterSpacing: '2px'
                                                            }}>
                                                                🎤 STAGE / MAIN ENTRANCE
                                                            </div>

                                                            {/* Stalls Grid */}
                                                            <div style={{
                                                                display: 'grid',
                                                                gridTemplateColumns: `repeat(${columns}, minmax(45px, 1fr))`,
                                                                gap: '8px',
                                                                justifyContent: 'center'
                                                            }}>
                                                                {Array.from({ length: totalStalls }, (_, i) => {
                                                                    const stallNum = i + 1;
                                                                    const stallId = `${prefix}${stallNum}`;
                                                                    const type = getStallType(stallNum);
                                                                    const booked = isBooked(stallId);
                                                                    const selected = isSelected(stallId);

                                                                    return (
                                                                        <div
                                                                            key={stallId}
                                                                            onClick={() => {
                                                                                if (!booked) {
                                                                                    const currentStalls = exhibitorData.stallNumbers || [];
                                                                                    const isAlreadySelected = currentStalls.includes(stallId);
                                                                                    setExhibitorData({
                                                                                        ...exhibitorData,
                                                                                        stallNumbers: isAlreadySelected
                                                                                            ? currentStalls.filter(s => s !== stallId)
                                                                                            : [...currentStalls, stallId]
                                                                                    });
                                                                                }
                                                                            }}
                                                                            style={{
                                                                                position: 'relative',
                                                                                width: '100%',
                                                                                aspectRatio: '1',
                                                                                minWidth: '45px',
                                                                                background: booked
                                                                                    ? '#94a3b8'
                                                                                    : selected
                                                                                        ? '#10b981'
                                                                                        : type.color,
                                                                                borderRadius: '8px',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                cursor: booked ? 'not-allowed' : 'pointer',
                                                                                border: selected
                                                                                    ? '4px solid #059669'
                                                                                    : '2px solid rgba(255,255,255,0.3)',
                                                                                boxShadow: selected
                                                                                    ? '0 0 12px rgba(16, 185, 129, 0.5)'
                                                                                    : '0 2px 4px rgba(0,0,0,0.1)',
                                                                                transition: 'all 0.2s ease',
                                                                                transform: selected ? 'scale(1.1)' : 'scale(1)',
                                                                                opacity: booked ? 0.6 : 1
                                                                            }}
                                                                            onMouseEnter={(e) => {
                                                                                if (!booked && !selected) {
                                                                                    e.currentTarget.style.transform = 'scale(1.08)';
                                                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                                                                                }
                                                                            }}
                                                                            onMouseLeave={(e) => {
                                                                                if (!booked && !selected) {
                                                                                    e.currentTarget.style.transform = 'scale(1)';
                                                                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                                                                }
                                                                            }}
                                                                            title={booked
                                                                                ? `${stallId} - Already Booked`
                                                                                : `${stallId} - ${type.name} - ₹${(type.price || 0).toLocaleString()}`
                                                                            }
                                                                        >
                                                                            {booked ? (
                                                                                <X size={16} color="white" />
                                                                            ) : (
                                                                                <span style={{
                                                                                    color: 'white',
                                                                                    fontWeight: 700,
                                                                                    fontSize: '11px',
                                                                                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                                                                }}>
                                                                                    {stallNum}
                                                                                </span>
                                                                            )}
                                                                            {selected && (
                                                                                <Check
                                                                                    size={14}
                                                                                    color="white"
                                                                                    style={{
                                                                                        position: 'absolute',
                                                                                        top: '-4px',
                                                                                        right: '-4px',
                                                                                        background: '#059669',
                                                                                        borderRadius: '50%',
                                                                                        padding: '2px'
                                                                                    }}
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        {/* Floor Plan Reference (collapsible) */}
                                                        {groundLayoutUrl && (
                                                            <details style={{ marginTop: '16px' }}>
                                                                <summary style={{
                                                                    cursor: 'pointer',
                                                                    fontSize: '13px',
                                                                    fontWeight: 600,
                                                                    color: '#0d89a4',
                                                                    padding: '8px 12px',
                                                                    background: 'rgba(255,255,255,0.7)',
                                                                    borderRadius: '8px',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px'
                                                                }}>
                                                                    📋 View Actual Floor Plan Image
                                                                </summary>
                                                                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                                                                    <img
                                                                        src={groundLayoutUrl.startsWith('http') ? groundLayoutUrl : `${apiBase}${groundLayoutUrl}`}
                                                                        alt="Event Ground Layout"
                                                                        style={{
                                                                            maxWidth: '100%',
                                                                            height: 'auto',
                                                                            borderRadius: '8px',
                                                                            cursor: 'zoom-in',
                                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                                        }}
                                                                        onClick={() => {
                                                                            const fullUrl = groundLayoutUrl.startsWith('http') ? groundLayoutUrl : `${apiBase}${groundLayoutUrl}`;
                                                                            window.open(fullUrl, '_blank');
                                                                        }}
                                                                    />
                                                                </div>
                                                            </details>
                                                        )}

                                                        <p style={{ fontSize: '11px', color: '#64748b', marginTop: '12px', textAlign: 'center' }}>
                                                            💡 Click on any available stall to select it. Your selection will be highlighted in green.
                                                        </p>
                                                    </div>
                                                );
                                            })()}


                                        </div>
                                    )}

                                    {modalStep === 3 && (
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '20px' }}>Lead Capture Settings</h3>

                                                {[
                                                    { id: 'visitorQR', label: 'Enable Visitor QR Scan' },
                                                    { id: 'stallQR', label: 'Enable Stall QR' },
                                                    { id: 'ocr', label: 'Enable Business Card OCR' },
                                                    { id: 'manual', label: 'Manual Lead Entry' }
                                                ].map((setting, idx) => (
                                                    <div key={setting.id} style={{
                                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                        padding: '12px 0', borderBottom: idx === 3 ? 'none' : '1px solid #e2e8f0'
                                                    }}>
                                                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>{setting.label}</span>
                                                        <div
                                                            onClick={() => setExhibitorData({
                                                                ...exhibitorData,
                                                                leadCapture: { ...exhibitorData.leadCapture, [setting.id]: !exhibitorData.leadCapture[setting.id] }
                                                            })}
                                                            style={{
                                                                width: '44px', height: '24px', borderRadius: '12px',
                                                                background: exhibitorData.leadCapture[setting.id] ? '#0d89a4' : '#e2e8f0',
                                                                position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease'
                                                            }}
                                                        >
                                                            <div style={{
                                                                width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                                                                position: 'absolute', top: '3px',
                                                                left: exhibitorData.leadCapture[setting.id] ? '23px' : '3px',
                                                                transition: 'all 0.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                            }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {modalStep === 4 && (
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '20px' }}>Messaging Settings</h3>

                                                {[
                                                    { id: 'whatsapp', label: 'WhatsApp Messaging' },
                                                    { id: 'email', label: 'Email Messaging' },
                                                    { id: 'sms', label: 'SMS Messaging' }
                                                ].map((setting, idx) => (
                                                    <div key={setting.id} style={{
                                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                        padding: '12px 0', borderBottom: idx === 2 ? 'none' : '1px solid #e2e8f0'
                                                    }}>
                                                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>{setting.label}</span>
                                                        <div
                                                            onClick={() => setExhibitorData({
                                                                ...exhibitorData,
                                                                communication: { ...exhibitorData.communication, [setting.id]: !exhibitorData.communication[setting.id] }
                                                            })}
                                                            style={{
                                                                width: '44px', height: '24px', borderRadius: '12px',
                                                                background: exhibitorData.communication[setting.id] ? '#0d89a4' : '#e2e8f0',
                                                                position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease'
                                                            }}
                                                        >
                                                            <div style={{
                                                                width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                                                                position: 'absolute', top: '3px',
                                                                left: exhibitorData.communication[setting.id] ? '23px' : '3px',
                                                                transition: 'all 0.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                            }} />
                                                        </div>
                                                    </div>
                                                ))}
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
                                            onClick={() => modalStep < 4 ? setModalStep(modalStep + 1) : handleCreateExhibitor()}
                                            disabled={createExhibitorLoading}
                                            style={{
                                                padding: '10px 32px', borderRadius: '8px', border: 'none',
                                                background: '#0d89a4', color: 'white', fontWeight: 600, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '8px'
                                            }}
                                        >
                                            {modalStep === 4 ? (createExhibitorLoading ? 'Creating...' : 'Create Exhibitor') : 'Next'}
                                            {modalStep < 4 && <ChevronRight size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* View Exhibitor Modal */}
            {viewExhibitorModal && selectedExhibitor && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        background: 'white', borderRadius: '24px', padding: '40px',
                        width: '600px', maxWidth: '95%', maxHeight: '90vh',
                        overflowY: 'auto', position: 'relative',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => { setViewExhibitorModal(false); setSelectedExhibitor(null); }}
                            style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                            <X size={24} />
                        </button>

                        <div style={{ marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Exhibitor Details</h2>
                            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>View exhibitor information</p>
                        </div>

                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Company Name</label>
                                    <p style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', margin: '4px 0 0 0' }}>{selectedExhibitor.company_name || '-'}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Status</label>
                                    <p style={{ fontSize: '16px', fontWeight: 600, color: selectedExhibitor.access_status === 'Active' ? '#10b981' : '#ef4444', margin: '4px 0 0 0' }}>{selectedExhibitor.access_status || 'Active'}</p>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Email</label>
                                    <p style={{ fontSize: '16px', color: '#475569', margin: '4px 0 0 0' }}>{selectedExhibitor.email || '-'}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Mobile</label>
                                    <p style={{ fontSize: '16px', color: '#475569', margin: '4px 0 0 0' }}>{selectedExhibitor.mobile || '-'}</p>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Contact Person</label>
                                    <p style={{ fontSize: '16px', color: '#475569', margin: '4px 0 0 0' }}>{selectedExhibitor.contact_person || '-'}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Industry</label>
                                    <p style={{ fontSize: '16px', color: '#475569', margin: '4px 0 0 0' }}>{selectedExhibitor.industry || '-'}</p>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Event</label>
                                    <p style={{ fontSize: '16px', color: '#475569', margin: '4px 0 0 0' }}>{selectedExhibitor.event_name || '-'}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Organization</label>
                                    <p style={{ fontSize: '16px', color: '#475569', margin: '4px 0 0 0' }}>{selectedExhibitor.organization_name || '-'}</p>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>GST Number</label>
                                    <p style={{ fontSize: '16px', color: '#475569', margin: '4px 0 0 0' }}>{selectedExhibitor.gst_number || '-'}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Stall Number</label>
                                    <p style={{ fontSize: '16px', color: '#475569', margin: '4px 0 0 0' }}>{selectedExhibitor.stall_number || '-'}</p>
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Address</label>
                                <p style={{ fontSize: '16px', color: '#475569', margin: '4px 0 0 0' }}>{selectedExhibitor.address || '-'}</p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Created At</label>
                                    <p style={{ fontSize: '16px', color: '#475569', margin: '4px 0 0 0' }}>{selectedExhibitor.created_at ? new Date(selectedExhibitor.created_at).toLocaleDateString() : '-'}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Updated At</label>
                                    <p style={{ fontSize: '16px', color: '#475569', margin: '4px 0 0 0' }}>{selectedExhibitor.updated_at ? new Date(selectedExhibitor.updated_at).toLocaleDateString() : '-'}</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                            <button onClick={() => { setViewExhibitorModal(false); setSelectedExhibitor(null); }}
                                style={{ padding: '12px 32px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Exhibitor Modal */}
            {editExhibitorModal && selectedExhibitor && (
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
                        <button onClick={() => { setEditExhibitorModal(false); setSelectedExhibitor(null); }}
                            style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                            <X size={24} />
                        </button>

                        <div style={{ marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Edit Exhibitor</h2>
                            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Update exhibitor information</p>
                        </div>

                        <form onSubmit={handleUpdateExhibitor}>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Company Name *</label>
                                        <input
                                            type="text"
                                            value={selectedExhibitor.company_name || ''}
                                            onChange={e => setSelectedExhibitor({ ...selectedExhibitor, company_name: e.target.value })}
                                            style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Email *</label>
                                        <input
                                            type="email"
                                            value={selectedExhibitor.email || ''}
                                            onChange={e => setSelectedExhibitor({ ...selectedExhibitor, email: e.target.value })}
                                            style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                            required
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Contact Person</label>
                                        <input
                                            type="text"
                                            value={selectedExhibitor.contact_person || ''}
                                            onChange={e => setSelectedExhibitor({ ...selectedExhibitor, contact_person: e.target.value })}
                                            style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Mobile</label>
                                        <input
                                            type="tel"
                                            value={selectedExhibitor.mobile || ''}
                                            onChange={e => setSelectedExhibitor({ ...selectedExhibitor, mobile: e.target.value })}
                                            style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>GST Number</label>
                                        <input
                                            type="text"
                                            value={selectedExhibitor.gst_number || ''}
                                            onChange={e => setSelectedExhibitor({ ...selectedExhibitor, gst_number: e.target.value })}
                                            style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Industry</label>
                                        <select
                                            value={selectedExhibitor.industry || ''}
                                            onChange={e => setSelectedExhibitor({ ...selectedExhibitor, industry: e.target.value })}
                                            style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: 'white' }}
                                        >
                                            <option value="">Select industry</option>
                                            <option value="it">Information Technology</option>
                                            <option value="healthcare">Healthcare</option>
                                            <option value="manufacturing">Manufacturing</option>
                                            <option value="retail">Retail</option>
                                            <option value="finance">Finance</option>
                                            <option value="education">Education</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Address</label>
                                    <textarea
                                        value={selectedExhibitor.address || ''}
                                        onChange={e => setSelectedExhibitor({ ...selectedExhibitor, address: e.target.value })}
                                        style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', minHeight: '80px', resize: 'vertical' }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Stall Number</label>
                                        <input
                                            type="text"
                                            value={selectedExhibitor.stall_number || ''}
                                            onChange={e => setSelectedExhibitor({ ...selectedExhibitor, stall_number: e.target.value })}
                                            style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Status</label>
                                        <select
                                            value={selectedExhibitor.access_status || 'Active'}
                                            onChange={e => setSelectedExhibitor({ ...selectedExhibitor, access_status: e.target.value })}
                                            style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: 'white' }}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                            <option value="Suspended">Suspended</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                                <button type="button" onClick={() => { setEditExhibitorModal(false); setSelectedExhibitor(null); }}
                                    style={{ padding: '12px 32px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button type="submit"
                                    style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                                    Update Exhibitor
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast.show && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    background: toast.type === 'success' ? '#dcfce7' : '#fef2f2',
                    color: toast.type === 'success' ? '#166534' : '#991b1b',
                    fontWeight: 600,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    zIndex: 9999,
                    animation: 'fadeIn 0.3s ease-in-out'
                }}>
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default ExhibitorsManagement;
