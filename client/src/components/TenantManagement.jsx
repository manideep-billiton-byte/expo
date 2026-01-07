import React, { useState, useEffect } from 'react';
import { Building2, Search, Download, Plus, MoreHorizontal, X, UserPlus, Users, ArrowLeft } from 'lucide-react';
import { verifyGSTINViaAPI, validateGSTINFormat } from '../utils/gstinValidator';

const TenantManagement = () => {
    const [activeTab, setActiveTab] = useState('All Organizations');
    const [searchQuery, setSearchQuery] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    const [organizations, setOrganizations] = useState([]);
    const [organizationsLoading, setOrganizationsLoading] = useState(false);
    const [organizationsError, setOrganizationsError] = useState('');

    const loadOrganizations = async () => {
        setOrganizationsLoading(true);
        setOrganizationsError('');
        try {
            const resp = await fetch('/api/organizations');
            let data;
            const txt = await resp.clone().text();
            try { data = JSON.parse(txt); } catch (e) { data = txt; }
            if (!resp.ok) throw new Error((data && data.error) || String(data) || 'Failed to load organizations');
            setOrganizations(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load organizations', err);
            setOrganizationsError(err?.message || String(err));
            setOrganizations([]);
        } finally {
            setOrganizationsLoading(false);
        }
    };

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalStep, setModalStep] = useState('SELECTION'); // 'SELECTION', 'INVITE', 'CREATE_ORG'
    const [inviteData, setInviteData] = useState({ email: '', mobile: '' });
    const [createOrgData, setCreateOrgData] = useState({
        email: '',
        mobile: '',
        businessType: '',
        isRegistered: '',
        password: '',
        confirmPassword: ''
    });
    const [createOrgErrors, setCreateOrgErrors] = useState({});
    const [gstData, setGstData] = useState({ gstNumber: '' });
    const [gstVerifying, setGstVerifying] = useState(false);
    const [gstError, setGstError] = useState('');

    // Wizard State
    const [wizardTab, setWizardTab] = useState('BASIC'); // BASIC, CONTACT, GST, FEATURES, SUBSCRIPTION
    const [wizardData, setWizardData] = useState({
        // Basic
        orgName: '', tradeName: '', tenantType: '', industry: '', size: '',
        apiAccess: false, state: '', district: '', town: '', address: '',
        // Contact
        contactName: '', contactEmail: '', contactPhone: '', altPhone: '', website: '',
        // GST
        gstNumber: '', panNumber: '', regNumber: '', dateInc: '', isVerified: false,
        // Features
        features: [],
        // Subscription
        plan: 'Free'
    });

    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [verifiedPlan, setVerifiedPlan] = useState(null);
    const [couponAppliedPlan, setCouponAppliedPlan] = useState(null);
    const [verifyLoading, setVerifyLoading] = useState(false);

    const handleVerifyCoupon = async () => {
        if (!couponCode) return;
        setVerifyLoading(true);
        try {
            const res = await fetch('/api/verify-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode })
            });
            const data = await res.json();
            if (res.ok) {
                setVerifiedPlan(data.coupon);
                setCouponAppliedPlan(data.coupon);
            } else {
                alert(data.error || 'Invalid Coupon');
                setVerifiedPlan(null);
                setCouponAppliedPlan(null);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to verify coupon: ' + (err?.message || err));
        } finally {
            setVerifyLoading(false);
        }
    };

    const wizardTabs = [
        { id: 'BASIC', label: 'Basic Info' },
        { id: 'CONTACT', label: 'Contact' },
        { id: 'GST', label: 'GST & Verify' },
        { id: 'FEATURES', label: 'Features' },
        { id: 'SUBSCRIPTION', label: 'Subscription' }
    ];

    const handleOpenModal = () => {
        setModalStep('SELECTION');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalStep('SELECTION');
        setInviteData({ email: '', mobile: '' });
        setCreateOrgData({
            email: '',
            mobile: '',
            businessType: '',
            isRegistered: '',
            password: '',
            confirmPassword: ''
        });
        setCreateOrgErrors({});
        setGstData({ gstNumber: '' });
        setWizardData({
            orgName: '', tradeName: '', tenantType: '', industry: '', size: '',
            apiAccess: false, state: '', district: '', town: '', address: '',
            contactName: '', contactEmail: '', contactPhone: '', altPhone: '', website: '',
            gstNumber: '', panNumber: '', regNumber: '', dateInc: '', isVerified: false,
            features: [],
            plan: 'Free'
        });
        setWizardTab('BASIC');
    };

    const validateCreateOrgStep1 = () => {
        const nextErrors = {};

        const emailVal = (createOrgData.email || '').trim();
        const mobileVal = (createOrgData.mobile || '').trim();
        const passwordVal = createOrgData.password || '';
        const confirmVal = createOrgData.confirmPassword || '';

        if (!emailVal) {
            nextErrors.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(emailVal)) {
            nextErrors.email = 'Enter a valid email address';
        }

        if (!mobileVal) {
            nextErrors.mobile = 'Mobile number is required';
        } else if (!/^\d{8,15}$/.test(mobileVal.replace(/\D/g, ''))) {
            nextErrors.mobile = 'Enter a valid mobile number';
        }

        if (!createOrgData.businessType) {
            nextErrors.businessType = 'Business type is required';
        }

        if (!createOrgData.isRegistered) {
            nextErrors.isRegistered = 'Please select yes or no';
        }

        if (!passwordVal) {
            nextErrors.password = 'Password is required';
        } else if (passwordVal.length < 6) {
            nextErrors.password = 'Password must be at least 6 characters';
        }

        if (!confirmVal) {
            nextErrors.confirmPassword = 'Confirm password is required';
        } else if (passwordVal !== confirmVal) {
            nextErrors.confirmPassword = 'Passwords do not match';
        }

        setCreateOrgErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleStep1Continue = () => {
        if (!validateCreateOrgStep1()) {
            return;
        }
        if (createOrgData.isRegistered === 'yes') {
            setModalStep('GST_VERIFICATION');
        } else {
            console.log('Proceeding to Wizard (Non-registered)');
            setModalStep('WIZARD');
            setWizardTab('BASIC');
        }
    };

    const handleVerifyGst = async () => {
        const val = (gstData.gstNumber || '').trim();

        // Clear previous errors
        setGstError('');

        if (!val) {
            setGstError('Please enter GST number');
            return;
        }

        // Frontend validation
        const formatValidation = validateGSTINFormat(val);
        if (!formatValidation.isValid) {
            setGstError(formatValidation.error);
            return;
        }

        // Set loading state
        setGstVerifying(true);

        try {
            // Call API to verify GSTIN
            const result = await verifyGSTINViaAPI(val);

            if (result.success && result.data) {
                // Successful verification
                const data = result.data;

                // Auto-fill data based on verified GST
                const autoFillData = {
                    gstNumber: data.gstin,
                    panNumber: data.panNumber,
                    dateInc: data.registrationDate || '',
                    isVerified: true,
                    state: data.state,
                    district: data.district,
                    town: data.district, // Default town to district
                    orgName: data.legalName,
                    tradeName: data.tradeName || data.legalName,
                    address: data.address || ''
                };

                // Update wizard data with verified GST and auto-filled info
                setWizardData(prev => ({
                    ...prev,
                    ...autoFillData
                }));

                // Show success message
                alert(`GST verified successfully!\n\nCompany: ${data.legalName}\nStatus: ${data.status}\nState: ${data.state}`);

                // Move to wizard
                setWizardTab('BASIC');
                setModalStep('WIZARD');
            } else {
                // Verification failed
                const errorMessage = result.error || 'GST verification failed';
                setGstError(errorMessage);
                alert(errorMessage);
            }
        } catch (error) {
            console.error('GST verification error:', error);
            const errorMessage = 'Unable to verify GSTIN. Please try again later.';
            setGstError(errorMessage);
            alert(errorMessage);
        } finally {
            setGstVerifying(false);
        }
    };

    const handleInviteUser = async () => {
        if (!inviteData.email && !inviteData.mobile) {
            alert('Please provide either email or mobile number');
            return;
        }

        try {
            const res = await fetch('/api/send-invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: inviteData.email || null,
                    mobile: inviteData.mobile || null
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Invitation sent successfully');
                handleCloseModal();
            } else {
                throw new Error(data.error || 'Failed to send invite');
            }
        } catch (err) {
            console.error('Error sending invite:', err);
            alert(err.message || 'Failed to send invite');
        }
    };

    const handleCreateOrganization = async () => {
        try {
            // Validate required fields
            if (!wizardData.orgName || wizardData.orgName.trim() === '') {
                alert('Organization name is required. Please fill in the Basic Info tab.');
                return;
            }

            if (!validateCreateOrgStep1()) {
                alert('Please fix the highlighted errors in Step 1 before submitting.');
                setModalStep('CREATE_ORG');
                return;
            }

            // Check email in multiple places (createOrgData or wizardData.contactEmail)
            const emailValue = createOrgData.email?.trim() || wizardData.contactEmail?.trim() || '';
            if (!emailValue) {
                alert('Email is required. Please fill in the basic information.');
                return;
            }

            // Prepare the organization data
            const orgData = {
                orgName: wizardData.orgName.trim(),
                tradeName: wizardData.tradeName || wizardData.orgName.trim(),
                tenantType: wizardData.tenantType || '',
                industry: wizardData.industry || '',
                size: wizardData.size || '',
                apiAccess: wizardData.apiAccess || false,
                businessType: createOrgData.businessType || '',
                isRegistered: createOrgData.isRegistered === 'yes' || createOrgData.isRegistered === true,
                email: emailValue,
                mobile: createOrgData.mobile || '',
                password: createOrgData.password || '',
                state: wizardData.state || '',
                district: wizardData.district || '',
                town: wizardData.town || '',
                address: wizardData.address || '',
                contactName: wizardData.contactName || '',
                contactEmail: wizardData.contactEmail || emailValue,
                contactPhone: wizardData.contactPhone || createOrgData.mobile || '',
                altPhone: wizardData.altPhone || '',
                website: wizardData.website || '',
                gstNumber: wizardData.gstNumber || '',
                panNumber: wizardData.panNumber || '',
                regNumber: wizardData.regNumber || '',
                dateInc: wizardData.dateInc || null,
                isVerified: wizardData.isVerified || false,
                features: wizardData.features || [],
                plan: wizardData.plan || 'Free'
            };

            const response = await fetch('/api/create-organization', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orgData),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.details || data.error || 'Failed to create organization';
                throw new Error(errorMsg);
            }

            // Show credentials if provided
            if (data.credentials) {
                const credMessage = `Organization created successfully!\n\nLogin Credentials:\nEmail: ${data.credentials.email}\nPassword: ${data.credentials.password}\n\n${data.credentials.note}`;
                alert(credMessage);
            } else {
                alert('Organization created successfully!');
            }

            handleCloseModal();

            await loadOrganizations();

        } catch (error) {
            console.error('Error creating organization:', error);
            alert(`Error: ${error.message}`);
        }
    };

    useEffect(() => {
        loadOrganizations();
    }, []);

    // Add this function to handle wizard form submission
    const handleWizardSubmit = () => {
        // If this is the last tab, submit the form
        if (wizardTab === 'SUBSCRIPTION') {
            handleCreateOrganization();
        } else {
            // Otherwise, go to the next tab
            const currentIndex = wizardTabs.findIndex(tab => tab.id === wizardTab);
            if (currentIndex < wizardTabs.length - 1) {
                setWizardTab(wizardTabs[currentIndex + 1].id);
            }
        }
    };

    const tabs = ['All Organizations', 'Active', 'Pending', 'Suspended', 'Plans'];

    const normalizedTenants = organizations.map((row) => {
        const createdAt = row.created_at ? new Date(row.created_at) : null;
        const updatedAt = row.updated_at ? new Date(row.updated_at) : null;

        return {
            id: String(row.id ?? ''),
            name: row.org_name ?? row.name ?? row.trade_name ?? '',
            email: row.primary_email ?? row.contact_email ?? row.email ?? '',
            status: row.status ?? 'Active',
            plan: row.plan ?? row.subscription_plan ?? row.plan_name ?? 'Free',
            events: row.events_count ?? '-',
            exhibitors: row.exhibitors_count ?? '-',
            createdDate: createdAt ? createdAt.toLocaleDateString() : '',
            lastDate: updatedAt ? updatedAt.toLocaleDateString() : (createdAt ? createdAt.toLocaleDateString() : '')
        };
    });

    const filteredTenants = normalizedTenants
        .filter((t) => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                (t.id || '').toLowerCase().includes(q) ||
                (t.name || '').toLowerCase().includes(q) ||
                (t.email || '').toLowerCase().includes(q)
            );
        })
        .filter((t) => {
            if (activeTab === 'All Organizations' || activeTab === 'Plans') return true;
            return String(t.status || '').toLowerCase() === String(activeTab || '').toLowerCase();
        });

    const getStatusBadge = (status) => {
        const statusStyles = {
            'Active': 'badge-live',
            'Inactive': 'badge-draft',
            'Suspended': 'badge-upcoming'
        };
        return statusStyles[status] || 'badge-draft';
    };

    return (
        <div className="dashboard-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }} className="fade-in">
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>Organization Management</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Manage all platform organizations, their subscriptions and access</p>
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
                        Add Organization
                    </button>
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
                            placeholder="Search organizations..."
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
                                <th>ORG ID</th>
                                <th>ORGANIZATION NAME</th>
                                <th>STATUS</th>
                                <th>PLAN</th>
                                <th>EVENTS</th>
                                <th>EXHIBITORS</th>
                                <th>CREATED DATE</th>
                                <th>LAST DATE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {organizationsLoading ? (
                                <tr>
                                    <td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                                        Loading organizations...
                                    </td>
                                </tr>
                            ) : organizationsError ? (
                                <tr>
                                    <td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: '#991b1b', fontWeight: 700, background: '#fff1f2' }}>
                                        {organizationsError}
                                    </td>
                                </tr>
                            ) : filteredTenants.length === 0 ? (
                                <tr>
                                    <td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                                        No organizations found
                                    </td>
                                </tr>
                            ) : (
                                filteredTenants.slice(0, entriesPerPage).map((tenant, idx) => (
                                    <tr key={idx} className="hover-lift">
                                        <td style={{ fontWeight: 600, color: '#475569' }}>{tenant.id}</td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{tenant.name}</div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{tenant.email}</div>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(tenant.status)}`}>
                                                {tenant.status}
                                            </span>
                                        </td>
                                        <td style={{ color: '#475569' }}>{tenant.plan}</td>
                                        <td style={{ fontWeight: 600 }}>{tenant.events}</td>
                                        <td style={{ fontWeight: 600 }}>{tenant.exhibitors}</td>
                                        <td style={{ fontSize: '13px', color: '#64748b' }}>{tenant.createdDate}</td>
                                        <td style={{ fontSize: '13px', color: '#64748b' }}>{tenant.lastDate}</td>
                                        <td>
                                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                                <MoreHorizontal size={18} color="#64748b" />
                                            </button>
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
                        Showing {Math.min(filteredTenants.length, entriesPerPage)} of {filteredTenants.length} entries
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

            {/* Modal Overlay */}
            {
                showModal && (
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
                        zIndex: 1000,
                        backdropFilter: 'blur(4px)'
                    }}>

                        {/* Modal Content */}
                        <div style={{
                            background: 'white',
                            borderRadius: '24px',
                            padding: '40px',
                            width: modalStep === 'WIZARD' ? '1000px' : '600px',
                            maxWidth: '95%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            position: 'relative',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            animation: 'fadeIn 0.2s ease-out'
                        }} onClick={e => e.stopPropagation()}>

                            <button
                                onClick={handleCloseModal}
                                style={{
                                    position: 'absolute',
                                    top: '20px',
                                    right: '20px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#94a3b8'
                                }}
                            >
                                <X size={24} />
                            </button>

                            {/* Close Button - Optional based on design, but good UX */}
                            {/* <button 
                            onClick={handleCloseModal}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#94a3b8'
                            }}
                        >
                            <X size={24} />
                        </button> */}

                            {modalStep === 'SELECTION' && (
                                <div style={{ textAlign: 'center' }}>
                                    <h2 style={{
                                        fontSize: '32px',
                                        fontWeight: 700,
                                        color: '#1e40af', // Blue color similar to screenshot
                                        marginBottom: '40px'
                                    }}>Create Organization</h2>

                                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                                        {/* Invite User Card */}
                                        <div
                                            onClick={() => setModalStep('INVITE')}
                                            style={{
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                padding: '40px 20px',
                                                width: '200px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '12px',
                                                transition: 'all 0.2s',
                                                backgroundColor: '#f8fafc' // Slight grey bg
                                            }}
                                            className="hover-card"
                                        >
                                            <div style={{ color: '#2563eb' }}>
                                                <UserPlus size={32} />
                                            </div>
                                            <span style={{ fontSize: '15px', color: '#334155', fontWeight: 500 }}>Invite User</span>
                                        </div>

                                        {/* Add Create Organization Card */}
                                        <div
                                            onClick={() => setModalStep('CREATE_ORG')}
                                            style={{
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                padding: '40px 20px',
                                                width: '200px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '12px',
                                                transition: 'all 0.2s',
                                                backgroundColor: '#f8fafc'
                                            }}
                                            className="hover-card"
                                        >
                                            <div style={{ color: '#2563eb' }}>
                                                <Users size={32} />
                                            </div>
                                            <span style={{ fontSize: '15px', color: '#334155', fontWeight: 500 }}>Add Create Organization</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modalStep === 'CREATE_ORG' && (
                                <div>
                                    {/* Header with Back Button */}
                                    <div style={{ marginBottom: '30px' }}>
                                        <button
                                            onClick={() => setModalStep('SELECTION')}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '14px',
                                                color: '#64748b',
                                                cursor: 'pointer',
                                                marginBottom: '16px',
                                                padding: 0
                                            }}
                                        >
                                            <ArrowLeft size={16} /> Back
                                        </button>

                                        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Create New Organization</h2>
                                        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Step 1 of 2-3</p>
                                    </div>

                                    {/* Form Container */}
                                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                        <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Let's Get Started</h3>
                                        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Please provide your basic information to begin</p>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                                                Email Address <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            <input
                                                type="email"
                                                placeholder="Enter your email"
                                                value={createOrgData.email}
                                                onChange={(e) => {
                                                    setCreateOrgData({ ...createOrgData, email: e.target.value });
                                                    setCreateOrgErrors(prev => ({ ...prev, email: undefined }));
                                                }}
                                                style={{ width: '100%', padding: '10px 14px', border: createOrgErrors.email ? '1px solid #ef4444' : '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                                            />
                                            {createOrgErrors.email && (
                                                <div style={{ marginTop: '6px', fontSize: '12px', color: '#ef4444', fontWeight: 500 }}>{createOrgErrors.email}</div>
                                            )}
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                                                Mobile Number <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                placeholder="Enter your mobile number"
                                                value={createOrgData.mobile}
                                                onChange={(e) => {
                                                    setCreateOrgData({ ...createOrgData, mobile: e.target.value });
                                                    setCreateOrgErrors(prev => ({ ...prev, mobile: undefined }));
                                                }}
                                                style={{ width: '100%', padding: '10px 14px', border: createOrgErrors.mobile ? '1px solid #ef4444' : '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                                            />
                                            {createOrgErrors.mobile && (
                                                <div style={{ marginTop: '6px', fontSize: '12px', color: '#ef4444', fontWeight: 500 }}>{createOrgErrors.mobile}</div>
                                            )}
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                                                Business Type <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            <select
                                                value={createOrgData.businessType}
                                                onChange={(e) => {
                                                    setCreateOrgData({ ...createOrgData, businessType: e.target.value });
                                                    setCreateOrgErrors(prev => ({ ...prev, businessType: undefined }));
                                                }}
                                                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white' }}
                                            >
                                                <option value="">Select business type</option>
                                                <option value="corporation">Corporation</option>
                                                <option value="llc">LLC</option>
                                                <option value="partnership">Partnership</option>
                                                <option value="sole_proprietorship">Sole Proprietorship</option>
                                            </select>
                                            {createOrgErrors.businessType && (
                                                <div style={{ marginTop: '6px', fontSize: '12px', color: '#ef4444', fontWeight: 500 }}>{createOrgErrors.businessType}</div>
                                            )}
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                                                Is your business registered? <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            <div style={{ display: 'flex', gap: '24px' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
                                                    <input
                                                        type="radio"
                                                        name="isRegistered"
                                                        value="yes"
                                                        checked={createOrgData.isRegistered === 'yes'}
                                                        onChange={(e) => {
                                                            setCreateOrgData({ ...createOrgData, isRegistered: e.target.value });
                                                            setCreateOrgErrors(prev => ({ ...prev, isRegistered: undefined }));
                                                        }}
                                                        style={{ width: '16px', height: '16px', accentColor: '#0f172a' }}
                                                    />
                                                    Yes, it's registered
                                                </label>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
                                                    <input
                                                        type="radio"
                                                        name="isRegistered"
                                                        value="no"
                                                        checked={createOrgData.isRegistered === 'no'}
                                                        onChange={(e) => {
                                                            setCreateOrgData({ ...createOrgData, isRegistered: e.target.value });
                                                            setCreateOrgErrors(prev => ({ ...prev, isRegistered: undefined }));
                                                        }}
                                                        style={{ width: '16px', height: '16px', accentColor: '#0f172a' }}
                                                    />
                                                    No, not registered
                                                </label>
                                            </div>
                                            {createOrgErrors.isRegistered && (
                                                <div style={{ marginTop: '8px', fontSize: '12px', color: '#ef4444', fontWeight: 500 }}>{createOrgErrors.isRegistered}</div>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', gap: '20px' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                                                    Password <span style={{ color: '#ef4444' }}>*</span>
                                                </label>
                                                <input
                                                    type="password"
                                                    placeholder="Enter password"
                                                    value={createOrgData.password}
                                                    onChange={(e) => {
                                                        setCreateOrgData({ ...createOrgData, password: e.target.value });
                                                        setCreateOrgErrors(prev => ({ ...prev, password: undefined }));
                                                    }}
                                                    style={{ width: '100%', padding: '10px 14px', border: createOrgErrors.password ? '1px solid #ef4444' : '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                                                />
                                                {createOrgErrors.password && (
                                                    <div style={{ marginTop: '6px', fontSize: '12px', color: '#ef4444', fontWeight: 500 }}>{createOrgErrors.password}</div>
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                                                    Confirm Password <span style={{ color: '#ef4444' }}>*</span>
                                                </label>
                                                <input
                                                    type="password"
                                                    placeholder="Confirm password"
                                                    value={createOrgData.confirmPassword}
                                                    onChange={(e) => {
                                                        setCreateOrgData({ ...createOrgData, confirmPassword: e.target.value });
                                                        setCreateOrgErrors(prev => ({ ...prev, confirmPassword: undefined }));
                                                    }}
                                                    style={{ width: '100%', padding: '10px 14px', border: createOrgErrors.confirmPassword ? '1px solid #ef4444' : '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                                                />
                                                {createOrgErrors.confirmPassword && (
                                                    <div style={{ marginTop: '6px', fontSize: '12px', color: '#ef4444', fontWeight: 500 }}>{createOrgErrors.confirmPassword}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                                            <button
                                                style={{
                                                    background: '#0f172a',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '12px 24px',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}
                                                onClick={handleStep1Continue}
                                            >
                                                Continue →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modalStep === 'GST_VERIFICATION' && (
                                <div>
                                    {/* Header with Back Button */}
                                    <div style={{ marginBottom: '30px' }}>
                                        <button
                                            onClick={() => setModalStep('CREATE_ORG')}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '14px',
                                                color: '#64748b',
                                                cursor: 'pointer',
                                                marginBottom: '16px',
                                                padding: 0
                                            }}
                                        >
                                            <ArrowLeft size={16} /> Back
                                        </button>

                                        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Create New Organization</h2>
                                        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Step 2 of 3</p>
                                    </div>

                                    {/* Form Container */}
                                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                        <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#0f172a', margin: 0 }}>GST Verification</h3>
                                        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Enter your GST number to auto-fill business details</p>
                                    </div>

                                    <div style={{ maxWidth: '480px', margin: '0 auto' }}>
                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px', textAlign: 'left' }}>
                                                GST Number <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Enter GST Number (e.g., 27AAACH7409R1Z1)"
                                                    value={gstData.gstNumber}
                                                    onChange={(e) => {
                                                        setGstData({ ...gstData, gstNumber: e.target.value });
                                                        setGstError(''); // Clear error when user types
                                                    }}
                                                    disabled={gstVerifying}
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px 14px',
                                                        border: gstError ? '1px solid #ef4444' : '1px solid #cbd5e1',
                                                        borderRadius: '8px',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        textTransform: 'uppercase',
                                                        backgroundColor: gstVerifying ? '#f1f5f9' : 'white',
                                                        cursor: gstVerifying ? 'not-allowed' : 'text'
                                                    }}
                                                />
                                                <button
                                                    onClick={handleVerifyGst}
                                                    disabled={gstVerifying}
                                                    style={{
                                                        padding: '10px 24px',
                                                        background: gstVerifying ? '#94a3b8' : '#2563eb',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        fontSize: '14px',
                                                        fontWeight: 500,
                                                        cursor: gstVerifying ? 'not-allowed' : 'pointer',
                                                        minWidth: '100px'
                                                    }}
                                                >
                                                    {gstVerifying ? 'Verifying...' : 'Verify'}
                                                </button>
                                            </div>

                                            {/* Error Message */}
                                            {gstError && (
                                                <div style={{
                                                    marginTop: '8px',
                                                    padding: '10px 12px',
                                                    backgroundColor: '#fef2f2',
                                                    border: '1px solid #fecaca',
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '8px'
                                                }}>
                                                    <span style={{ color: '#ef4444', fontSize: '14px' }}>⚠</span>
                                                    <span style={{ fontSize: '13px', color: '#991b1b', flex: 1 }}>{gstError}</span>
                                                </div>
                                            )}

                                            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px', textAlign: 'left' }}>
                                                GST number format: 22AAAAA0000A1Z5
                                            </p>
                                            <div style={{ marginTop: '12px', fontSize: '13px', color: '#64748b' }}>
                                                <div style={{ fontWeight: 600, marginBottom: '6px' }}>Test Registration Details : Statewise (where HCL Presence is there)</div>
                                                <div style={{ fontSize: '13px' }}>
                                                    <ol>
                                                        <li>Uttar Pradesh — 09AAACH7409R1ZZ</li>
                                                        <li>Karnataka — 29AAACH7409R1ZX</li>
                                                        <li>Telangana — 36AAACH7409R1Z2</li>
                                                        <li>Tamil Nadu — 33AAACH7409R1Z8</li>
                                                        <li>Gujarat — 24AAACH7409R2Z6</li>
                                                        <li>West Bengal — 19AAACH7409R1ZY</li>
                                                        <li>Rajasthan — 08AAACH7409R1Z1</li>
                                                        <li>Madhya Pradesh — 23AAACH7409R1Z9</li>
                                                        <li>Jharkhand — 20AAACH7409R1ZF</li>
                                                        <li>Maharashtra — 27AAACH7409R1Z1</li>
                                                        <li>Delhi — 07AAACH7409R1Z6</li>
                                                        <li>Haryana — 06AAACH7409R1Z8</li>
                                                        <li>Punjab — 03AAACH7409R1Z2</li>
                                                        <li>Bihar — 10AAACH7409R1Z4</li>
                                                        <li>Odisha — 21AAACH7409R1Z5</li>
                                                        <li>Chhattisgarh — 22AAACH7409R1Z6</li>
                                                        <li>Jharkhand — 20AAACH7409R1Z7</li>
                                                        <li>Assam — 18AAACH7409R1Z8</li>
                                                        <li>Himachal Pradesh — 02AAACH7409R1Z9</li>
                                                        <li>Jammu & Kashmir — 01AAACH7409R1Z0</li>
                                                        <li>Uttarakhand — 05AAACH7409R1Z1</li>
                                                        <li>Goa — 30AAACH7409R1Z2</li>
                                                        <li>Chandigarh — 04AAACH7409R1Z3</li>
                                                        <li>Puducherry — 34AAACH7409R1Z4</li>
                                                    </ol>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'left' }}>
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setModalStep('WIZARD');
                                                    setWizardTab('BASIC');
                                                }}
                                                style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}
                                            >
                                                Don't have GST? Enter details manually →
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}



                            {modalStep === 'WIZARD' && (
                                <div style={{ width: '100%' }}>
                                    {/* Using minWidth to make modal wider for wizard */}
                                    {/* Header */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <button
                                            onClick={() => {
                                                if (wizardTab === 'BASIC') setModalStep('CREATE_ORG');
                                                else {
                                                    // Simple back logic
                                                    const currentIndex = wizardTabs.findIndex(t => t.id === wizardTab);
                                                    if (currentIndex > 0) setWizardTab(wizardTabs[currentIndex - 1].id);
                                                }
                                            }}
                                            style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#64748b', cursor: 'pointer', marginBottom: '16px', padding: 0 }}
                                        >
                                            <ArrowLeft size={16} /> Back
                                        </button>
                                        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Create New Organization</h2>
                                        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Step 2 of 2 - Complete organization details</p>
                                    </div>

                                    {/* Tabs */}
                                    <div style={{ display: 'flex', background: '#f8fafc', padding: '4px', borderRadius: '8px', marginBottom: '32px' }}>
                                        {wizardTabs.map(tab => (
                                            <div
                                                key={tab.id}
                                                onClick={() => setWizardTab(tab.id)}
                                                style={{
                                                    flex: 1,
                                                    textAlign: 'center',
                                                    padding: '10px',
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    background: wizardTab === tab.id ? 'white' : 'transparent',
                                                    color: wizardTab === tab.id ? '#0f172a' : '#64748b',
                                                    boxShadow: wizardTab === tab.id ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {tab.label}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Wizard Content */}
                                    <div style={{ marginBottom: '32px', minHeight: '300px' }}>
                                        {wizardTab === 'BASIC' && (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                {/* Org Name */}
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Organization Name <span style={{ color: '#ef4444' }}>*</span></label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter organization name"
                                                        value={wizardData.orgName}
                                                        onChange={(e) => setWizardData({ ...wizardData, orgName: e.target.value })}
                                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                                                    />
                                                </div>
                                                {/* Trade Name */}
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Trade Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter trade name"
                                                        value={wizardData.tradeName}
                                                        onChange={(e) => setWizardData({ ...wizardData, tradeName: e.target.value })}
                                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                                                    />
                                                </div>
                                                {/* Tenant Type */}
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Organization Type <span style={{ color: '#ef4444' }}>*</span></label>
                                                    <select
                                                        value={wizardData.tenantType}
                                                        onChange={(e) => setWizardData({ ...wizardData, tenantType: e.target.value })}
                                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white' }}
                                                    >
                                                        <option value="">Select organization type</option>
                                                        <option value="type1">Type 1</option>
                                                    </select>
                                                </div>
                                                {/* Industry */}
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Industry / Sector</label>
                                                    <select
                                                        value={wizardData.industry}
                                                        onChange={(e) => setWizardData({ ...wizardData, industry: e.target.value })}
                                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white' }}
                                                    >
                                                        <option value="">Select industry</option>
                                                        <option value="tech">Technology</option>
                                                    </select>
                                                </div>
                                                {/* Org Size */}
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Organization Size</label>
                                                    <select
                                                        value={wizardData.size}
                                                        onChange={(e) => setWizardData({ ...wizardData, size: e.target.value })}
                                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white' }}
                                                    >
                                                        <option value="">Select size</option>
                                                        <option value="small">1-10</option>
                                                    </select>
                                                </div>
                                                {/* API Access Switch */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Business API Access</label>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                        <div
                                                            onClick={() => setWizardData({ ...wizardData, apiAccess: !wizardData.apiAccess })}
                                                            style={{
                                                                width: '36px', height: '20px',
                                                                background: wizardData.apiAccess ? '#0f172a' : '#cbd5e1',
                                                                borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            <div style={{
                                                                width: '16px', height: '16px', background: 'white', borderRadius: '50%',
                                                                position: 'absolute', top: '2px', left: wizardData.apiAccess ? '18px' : '2px', transition: 'all 0.2s'
                                                            }} />
                                                        </div>
                                                        <span style={{ fontSize: '13px', color: '#64748b' }}>{wizardData.apiAccess ? 'Yes' : 'No'}</span>
                                                    </div>
                                                </div>
                                                {/* State */}
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>State</label>
                                                    <select
                                                        value={wizardData.state}
                                                        onChange={(e) => setWizardData({ ...wizardData, state: e.target.value })}
                                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white' }}
                                                    >
                                                        <option value="">Select state</option>
                                                        <option value="state1">State 1</option>
                                                    </select>
                                                </div>
                                                {/* District */}
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>District</label>
                                                    <select
                                                        value={wizardData.district}
                                                        onChange={(e) => setWizardData({ ...wizardData, district: e.target.value })}
                                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white' }}
                                                    >
                                                        <option value="">Select state first</option>
                                                        <option value="district1">District 1</option>
                                                    </select>
                                                </div>
                                                {/* Town */}
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Town / City</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter town or city"
                                                        value={wizardData.town}
                                                        onChange={(e) => setWizardData({ ...wizardData, town: e.target.value })}
                                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                                                    />
                                                </div>
                                                {/* Spacer to keep grid balanced or span 2 cols for Address */}
                                                <div style={{ display: 'none' }}></div>

                                                {/* Address (Full Width) */}
                                                <div style={{ gridColumn: 'span 2' }}>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Registered Address</label>
                                                    <textarea
                                                        placeholder="Enter registered address"
                                                        rows={3}
                                                        value={wizardData.address}
                                                        onChange={(e) => setWizardData({ ...wizardData, address: e.target.value })}
                                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {wizardTab === 'CONTACT' && (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                {/* Contact Person */}
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Contact Person Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter contact person name"
                                                        value={wizardData.contactName}
                                                        onChange={(e) => setWizardData({ ...wizardData, contactName: e.target.value })}
                                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                                                    />
                                                </div>
                                                {/* Email Address */}
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Email Address</label>
                                                    <input
                                                        type="email"
                                                        placeholder="Enter email address"
                                                        value={wizardData.contactEmail}
                                                        onChange={(e) => setWizardData({ ...wizardData, contactEmail: e.target.value })}
                                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                                                    />
                                                </div>
                                                {/* Phone Number */}
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Phone Number</label>
                                                    <input
                                                        type="tel"
                                                        placeholder="Enter phone number"
                                                        value={wizardData.contactPhone}
                                                        onChange={(e) => setWizardData({ ...wizardData, contactPhone: e.target.value })}
                                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                                                    />
                                                </div>
                                                {/* Alternate Phone */}
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Alternate Phone</label>
                                                    <input
                                                        type="tel"
                                                        placeholder="Enter alternate phone"
                                                        value={wizardData.altPhone}
                                                        onChange={(e) => setWizardData({ ...wizardData, altPhone: e.target.value })}
                                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                                                    />
                                                </div>
                                                {/* Website URL (Full Width) */}
                                                <div style={{ gridColumn: 'span 2' }}>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Website URL</label>
                                                    <input
                                                        type="url"
                                                        placeholder="https://example.com"
                                                        value={wizardData.website}
                                                        onChange={(e) => setWizardData({ ...wizardData, website: e.target.value })}
                                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {wizardTab === 'GST' && (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                {/* GST Number */}
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>GST Number</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter GST number"
                                                        value={wizardData.gstNumber}
                                                        onChange={(e) => setWizardData({ ...wizardData, gstNumber: e.target.value })}
                                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                                                    />
                                                </div>
                                                {/* PAN Number */}
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>PAN Number</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter PAN number"
                                                        value={wizardData.panNumber}
                                                        onChange={(e) => setWizardData({ ...wizardData, panNumber: e.target.value })}
                                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                                                    />
                                                </div>
                                                {/* Business Registration Number */}
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Business Registration Number</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter registration number"
                                                        value={wizardData.regNumber}
                                                        onChange={(e) => setWizardData({ ...wizardData, regNumber: e.target.value })}
                                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                                                    />
                                                </div>
                                                {/* Date of Incorporation */}
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Date of Incorporation</label>
                                                    <div style={{ position: 'relative' }}>
                                                        <input
                                                            type="text"
                                                            placeholder="mm/dd/yyyy"
                                                            value={wizardData.dateInc}
                                                            onChange={(e) => setWizardData({ ...wizardData, dateInc: e.target.value })}
                                                            style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                                                        />
                                                        {/* Calendar icon placeholder */}
                                                        <span style={{ position: 'absolute', right: '12px', top: '10px', color: '#64748b' }}>📅</span>
                                                    </div>
                                                </div>
                                                {/* Verification Status Switch (Full Width) */}
                                                <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px' }}>
                                                        <div>
                                                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>Verification Status</div>
                                                            <div style={{ fontSize: '13px', color: '#64748b' }}>Mark this organization as verified</div>
                                                        </div>
                                                        <div
                                                            onClick={() => setWizardData({ ...wizardData, isVerified: !wizardData.isVerified })}
                                                            style={{
                                                                width: '44px', height: '24px',
                                                                background: wizardData.isVerified ? '#0f172a' : '#cbd5e1',
                                                                borderRadius: '24px', position: 'relative', cursor: 'pointer', transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            <div style={{
                                                                width: '20px', height: '20px', background: 'white', borderRadius: '50%',
                                                                position: 'absolute', top: '2px', left: wizardData.isVerified ? '22px' : '2px', transition: 'all 0.2s'
                                                            }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {wizardTab === 'FEATURES' && (
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                                    <span style={{ fontSize: '13px', color: '#64748b' }}>Select the features your organization needs</span>
                                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{wizardData.features.length} features selected</span>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                    {[
                                                        { id: 'multi_user', label: 'Multi-User Access', desc: 'Allow multiple users to access the organization account' },
                                                        { id: 'api_access', label: 'API Access', desc: 'Enable programmatic access via REST API' },
                                                        { id: 'custom_branding', label: 'Custom Branding', desc: 'Customize the look and feel with your own branding' },
                                                        { id: 'analytics', label: 'Analytics Dashboard', desc: 'Access to detailed analytics and insights' },
                                                        { id: 'reporting', label: 'Advanced Reporting', desc: 'Generate comprehensive reports and exports' },
                                                        { id: 'priority_support', label: 'Priority Support', desc: 'Get faster response times from support team' },
                                                        { id: 'sso', label: 'SSO Integration', desc: 'Single sign-on with SAML or OAuth providers' },
                                                        { id: 'audit_logs', label: 'Audit Logs', desc: 'Track all actions and changes in the system' }
                                                    ].map(feature => (
                                                        <div
                                                            key={feature.id}
                                                            onClick={() => {
                                                                const newFeatures = wizardData.features.includes(feature.id)
                                                                    ? wizardData.features.filter(f => f !== feature.id)
                                                                    : [...wizardData.features, feature.id];
                                                                setWizardData({ ...wizardData, features: newFeatures });
                                                            }}
                                                            style={{
                                                                padding: '16px',
                                                                border: `1px solid ${wizardData.features.includes(feature.id) ? '#0f172a' : '#e2e8f0'}`,
                                                                borderRadius: '8px',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                gap: '12px',
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            <div style={{
                                                                width: '18px', height: '18px',
                                                                border: `1px solid ${wizardData.features.includes(feature.id) ? '#0f172a' : '#cbd5e1'}`,
                                                                borderRadius: '4px',
                                                                background: wizardData.features.includes(feature.id) ? '#0f172a' : 'white',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px'
                                                            }}>
                                                                {wizardData.features.includes(feature.id) && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>{feature.label}</div>
                                                                <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>{feature.desc}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {wizardTab === 'SUBSCRIPTION' && (
                                            <div>
                                                <div style={{ marginBottom: '20px', fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>Choose Your Subscription Plan</div>
                                                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>Select the plan that best fits your organization's needs</div>

                                                {/* Coupon Section */}
                                                <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                                                    <div style={{ flex: 1, maxWidth: '300px' }}>
                                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Have a Coupon Code?</label>
                                                        <input
                                                            value={couponCode}
                                                            onChange={e => setCouponCode(e.target.value)}
                                                            placeholder="Enter code (e.g. CUSTOM-XY7Z)"
                                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none' }}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={handleVerifyCoupon}
                                                        disabled={!couponCode || verifyLoading}
                                                        style={{ padding: '10px 20px', background: '#0f172a', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', height: '42px' }}
                                                    >
                                                        {verifyLoading ? '...' : 'Apply Coupon'}
                                                    </button>
                                                </div>

                                                {verifiedPlan && (
                                                    <div style={{
                                                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                                        background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)',
                                                        zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        <div style={{
                                                            background: 'white', borderRadius: '24px', width: '100%', maxWidth: '400px',
                                                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden'
                                                        }} onClick={e => e.stopPropagation()}>
                                                            <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Plan Unlocked!</h3>
                                                                <button onClick={() => setVerifiedPlan(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#94a3b8" /></button>
                                                            </div>
                                                            <div style={{ padding: '24px' }}>
                                                                <div style={{ background: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: '16px', padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
                                                                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#064e3b', marginBottom: '8px' }}>{verifiedPlan.plan_name}</h2>
                                                                    <p style={{ color: '#059669', fontSize: '14px', marginBottom: '16px' }}>{verifiedPlan.description}</p>
                                                                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#064e3b' }}>
                                                                        {verifiedPlan.pricing?.monthly ? `₹${verifiedPlan.pricing.monthly}` : 'Custom'}
                                                                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#059669' }}>/mo</span>
                                                                    </div>
                                                                </div>

                                                                {/* Show Selected Coupon Code */}
                                                                <div style={{ textAlign: 'center', marginBottom: '20px', color: '#64748b', fontSize: '13px' }}>
                                                                    Code: <strong>{verifiedPlan.coupon_code}</strong>
                                                                </div>

                                                                <button
                                                                    onClick={() => {
                                                                        setWizardData({ ...wizardData, plan: verifiedPlan.plan_name || 'Coupon Plan' });
                                                                        setVerifiedPlan(null);
                                                                    }}
                                                                    style={{ width: '100%', padding: '14px', background: '#059669', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '16px', cursor: 'pointer' }}
                                                                >
                                                                    Select This Plan
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                                    {[
                                                        { id: 'Free', name: 'Free', price: '₹0', users: 'Up to 5 users', analytics: 'Basic analytics', support: 'Email support', recommended: true },
                                                        { id: 'Basic', name: 'Basic', price: '₹999', users: 'Up to 25 users', analytics: 'Advanced analytics', support: 'Priority email support', recommended: false },
                                                        { id: 'Professional', name: 'Professional', price: '₹2,499', users: 'Up to 100 users', analytics: 'Custom branding', support: 'Phone support', recommended: false },
                                                        { id: 'Enterprise', name: 'Enterprise', price: '₹4,999', users: 'Unlimited users', analytics: 'Dedicated support', support: 'Audit logs', recommended: false },
                                                        ...(couponAppliedPlan ? [{
                                                            id: 'CouponPlan',
                                                            name: 'Coupon Plan',
                                                            price: couponAppliedPlan?.pricing?.monthly ? `₹${couponAppliedPlan.pricing.monthly}` : 'Custom',
                                                            users: 'Unlocked by coupon',
                                                            analytics: 'Coupon applied',
                                                            support: `Code: ${couponAppliedPlan?.coupon_code || ''}`,
                                                            recommended: false,
                                                            __coupon: true
                                                        }] : []),
                                                        { id: 'Custom', name: 'Custom Plan', price: 'Contact', sub: 'for pricing', users: 'Custom user limits', analytics: 'Custom features', support: 'Dedicated account manager', recommended: false }
                                                    ].map(plan => (
                                                        <div
                                                            key={plan.id}
                                                            onClick={() => {
                                                                if (plan.__coupon) {
                                                                    setWizardData({ ...wizardData, plan: couponAppliedPlan?.plan_name || 'Coupon Plan' });
                                                                } else {
                                                                    setWizardData({ ...wizardData, plan: plan.id });
                                                                }
                                                            }}
                                                            style={{
                                                                border: `1px solid ${(
                                                                    plan.__coupon
                                                                        ? (wizardData.plan === (couponAppliedPlan?.plan_name || 'Coupon Plan'))
                                                                        : (wizardData.plan === plan.id)
                                                                ) ? '#0f172a' : '#e2e8f0'}`,
                                                                borderRadius: '8px',
                                                                padding: '20px',
                                                                cursor: 'pointer',
                                                                position: 'relative',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                height: '100%'
                                                            }}
                                                        >
                                                            {plan.recommended && (
                                                                <div style={{
                                                                    position: 'absolute', top: '-10px', left: '20px',
                                                                    background: '#0f172a', color: 'white', fontSize: '10px',
                                                                    padding: '4px 10px', borderRadius: '12px', fontWeight: 600
                                                                }}>
                                                                    ★ Recommended
                                                                </div>
                                                            )}

                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{plan.name}</span>
                                                                <div style={{
                                                                    width: '16px', height: '16px', borderRadius: '50%',
                                                                    border: `1px solid ${(
                                                                        plan.__coupon
                                                                            ? (wizardData.plan === (couponAppliedPlan?.plan_name || 'Coupon Plan'))
                                                                            : (wizardData.plan === plan.id)
                                                                    ) ? '#0f172a' : '#cbd5e1'}`,
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                                }}>
                                                                    {(
                                                                        plan.__coupon
                                                                            ? (wizardData.plan === (couponAppliedPlan?.plan_name || 'Coupon Plan'))
                                                                            : (wizardData.plan === plan.id)
                                                                    ) && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0f172a' }} />}
                                                                </div>
                                                            </div>

                                                            <div style={{ marginBottom: '16px' }}>
                                                                <span style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>{plan.price}</span>
                                                                <span style={{ fontSize: '12px', color: '#64748b' }}>/month</span>
                                                            </div>

                                                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                                                                Get started with basic features
                                                            </div>

                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                                                {[plan.users, plan.analytics, plan.support].map((feat, i) => (
                                                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155' }}>
                                                                        <span style={{ color: '#0f172a' }}>✓</span> {feat}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Actions */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                                        <button
                                            onClick={() => {
                                                const currentIndex = wizardTabs.findIndex(t => t.id === wizardTab);
                                                if (currentIndex > 0) setWizardTab(wizardTabs[currentIndex - 1].id);
                                                else setModalStep('CREATE_ORG');
                                            }}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0',
                                                borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer'
                                            }}
                                        >
                                            <ArrowLeft size={16} /> Previous
                                        </button>
                                        <button
                                            onClick={() => {
                                                const currentIndex = wizardTabs.findIndex(t => t.id === wizardTab);
                                                if (currentIndex < wizardTabs.length - 1) setWizardTab(wizardTabs[currentIndex + 1].id);
                                                else {
                                                    // Final submit: create organization
                                                    // Use the existing handleCreateOrganization function
                                                    handleCreateOrganization();
                                                }
                                            }}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                padding: '10px 24px', background: '#0f172a', border: 'none',
                                                borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: 'white', cursor: 'pointer'
                                            }}
                                        >
                                            {wizardTab === 'SUBSCRIPTION' ? 'Create Tenant' : 'Next'} {wizardTab !== 'SUBSCRIPTION' && '→'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {modalStep === 'INVITE' && (
                                <div style={{ textAlign: 'center' }}>
                                    <h2 style={{
                                        fontSize: '32px',
                                        fontWeight: 700,
                                        color: '#1e40af',
                                        marginBottom: '40px'
                                    }}>Create Organization</h2>

                                    <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', textAlign: 'left' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>Enter Email ID</label>
                                            <input
                                                type="email"
                                                placeholder="user@billiton.com"
                                                value={inviteData.email}
                                                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    border: '1px solid #cbd5e1',
                                                    borderRadius: '8px',
                                                    fontSize: '15px',
                                                    color: '#334155',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>Enter Mobile</label>
                                            <input
                                                type="tel"
                                                placeholder="7893911194"
                                                value={inviteData.mobile}
                                                onChange={(e) => setInviteData({ ...inviteData, mobile: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    border: '1px solid #cbd5e1',
                                                    borderRadius: '8px',
                                                    fontSize: '15px',
                                                    color: '#334155',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleInviteUser}
                                        style={{
                                            background: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 40px',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        &lt; Send Link &gt;
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default TenantManagement;
