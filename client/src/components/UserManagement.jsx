import React, { useEffect, useState } from 'react';
import { Users, User, Search, Download, Plus, MoreHorizontal, X, ArrowLeft, Check, Shield, ShieldCheck, Mail, Lock, Globe, Settings, CreditCard, MessageSquare, Cpu, LineChart, Receipt, Calendar, Image, Eye, UserCheck, LifeBuoy, Building2, Send, Copy, ChevronDown } from 'lucide-react';
import { apiFetch } from '../utils/api';

const UserManagement = () => {
    const [activeTab, setActiveTab] = useState('All Users');
    const [searchQuery, setSearchQuery] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [modalStep, setModalStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);

    const defaultUserData = {
        role: '',
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        organization: '',
        department: '',
        permissions: {},
        additionalPermissions: {
            globalAccess: false,
            crossEvent: true,
            dataExport: false
        },
        loginType: 'manual',
        password: '',
        forceReset: true,
        security: {
            requireMFA: true,
            ipRestriction: false,
            sessionTimeout: '30 minutes'
        }
    };

    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [orgs, setOrgs] = useState([]);
    const [orgsLoading, setOrgsLoading] = useState(false);
    const [createUserLoading, setCreateUserLoading] = useState(false);

    const [userData, setUserData] = useState({
        ...defaultUserData
    });

    const roles = [
        { id: 'super_admin', title: 'Super Admin', desc: 'Full control over entire platform, all tenants, billing, configuration and security.' },
        { id: 'platform_admin', title: 'Platform Admin', desc: 'Manages tenants, events, configurations and monitors platform health.' },
        { id: 'support_admin', title: 'Support Admin', desc: 'Handles support tickets, incidents and customer issues across platform.' },
        { id: 'finance_admin', title: 'Finance Admin', desc: 'Manages subscriptions, billing, invoices and payments.' },
        { id: 'compliance_admin', title: 'Compliance Admin', desc: 'Ensures legal, privacy, audit and government compliance.' },
        { id: 'integration_admin', title: 'Integration Admin', desc: 'Manages WhatsApp, SMS, Email, GST and CRM integrations.' },
    ];

    const modules = [
        { id: 'control_room', label: 'Control Room', icon: Building2 },
        { id: 'tenant_mgmt', label: 'Tenant Management', icon: Building2 },
        { id: 'user_mgmt', label: 'User Management', icon: Users },
        { id: 'event_mgmt', label: 'Event Management', icon: Calendar },
        { id: 'exhibitor_mgmt', label: 'Exhibitor Management', icon: Image },
        { id: 'visitor_mgmt', label: 'Visitor Management', icon: Eye },
        { id: 'subscription_billing', label: 'Subscription & Billing', icon: CreditCard },
        { id: 'communication', label: 'Communication Control', icon: MessageSquare },
        { id: 'api_integration', label: 'API Integration', icon: Cpu },
        { id: 'analytics', label: 'Analytics & Reporting', icon: LineChart },
        { id: 'compliance_audit', label: 'Compliance & Audit', icon: ShieldCheck },
        { id: 'system_config', label: 'System Configuration', icon: Settings },
        { id: 'rbac_mgmt', label: 'RBAC Management', icon: UserCheck },
        { id: 'support_mgmt', label: 'Support Management', icon: LifeBuoy },
    ];

    const handleOpenModal = () => {
        setModalStep(1);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalStep(1);
        setShowPassword(false);
        setUserData({ ...defaultUserData });
    };

    const loadOrgs = async () => {
        setOrgsLoading(true);
        try {
            const resp = await apiFetch('/api/organizations');
            const data = await resp.json();
            if (!resp.ok) throw new Error(data.error || 'Failed to load organizations');
            setOrgs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load organizations', err);
            setOrgs([]);
        } finally {
            setOrgsLoading(false);
        }
    };

    const loadUsers = async () => {
        setUsersLoading(true);
        try {
            const resp = await apiFetch('/api/users');
            const data = await resp.json();
            if (!resp.ok) throw new Error(data.error || 'Failed to load users');

            const mapped = (Array.isArray(data) ? data : []).map((row) => {
                const created = row.created_at ? new Date(row.created_at) : null;
                const lastLogin = created ? created.toLocaleString() : '';

                return {
                    id: String(row.id ?? ''),
                    name: `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim(),
                    email: row.email ?? '',
                    status: row.status ?? 'active',
                    role: row.role ?? '',
                    lastLogin,
                    organization: row.organization_name ?? ''
                };
            });

            setUsers(mapped);
        } catch (err) {
            console.error('Failed to load users', err);
            setUsers([]);
        } finally {
            setUsersLoading(false);
        }
    };

    useEffect(() => {
        loadOrgs();
        loadUsers();
    }, []);

    const handleCreateUser = async () => {
        setCreateUserLoading(true);
        try {
            const payload = {
                role: userData.role,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                mobile: userData.mobile,
                organizationId: userData.organization || null,
                department: userData.department,
                permissions: userData.permissions,
                additionalPermissions: userData.additionalPermissions,
                loginType: userData.loginType,
                password: userData.loginType === 'manual' ? userData.password : null,
                forceReset: userData.forceReset,
                security: userData.security
            };

            const resp = await apiFetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await resp.json();
            if (!resp.ok) throw new Error(data.error || 'Failed to create user');

            if (userData.loginType !== 'manual') {
                const inviteResp = await apiFetch('/api/send-invite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: userData.email, mobile: userData.mobile })
                });
                const inviteData = await inviteResp.json();
                if (!inviteResp.ok) throw new Error(inviteData.error || 'Failed to send invite');
            }

            handleCloseModal();
            await loadUsers();
        } catch (err) {
            console.error('Create user failed', err);
            alert('Failed to create user: ' + (err.message || err));
        } finally {
            setCreateUserLoading(false);
        }
    };

    const tabs = ['All Users', 'Platform Admins', 'Organization Users', 'Roles', 'Activity Logs'];

    const getStatusBadge = (status) => {
        const statusStyles = {
            'active': 'badge-live',
            'Pending': 'badge-upcoming'
        };
        return statusStyles[status] || 'badge-draft';
    };

    const getRoleBadge = (role) => {
        const roleColors = {
            'Organizer': { bg: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' },
            'Super Admin': { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
            'Support': { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
            'Exhibitor Admin': { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }
        };
        const colors = roleColors[role] || { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748b' };
        return (
            <span style={{
                background: colors.bg,
                color: colors.color,
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600
            }}>
                {role}
            </span>
        );
    };

    return (
        <div className="dashboard-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }} className="fade-in">
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>User Management</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Manage platform administrators and users</p>
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
                        Add Users
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }} className="fade-in">
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Total Users</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>7</div>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Active</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>6</div>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Admins</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>2</div>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Pending</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>1</div>
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
                            placeholder="Search Users..."
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
                                <th>USER NAME</th>
                                <th>USER ID</th>
                                <th>STATUS</th>
                                <th>ROLE</th>
                                <th>LAST LOGIN</th>
                                <th>ORGANIZATION</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, idx) => (
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
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#1e293b' }}>{user.name}</div>
                                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 600, color: '#475569' }}>{user.id}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(user.status)}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td>{getRoleBadge(user.role)}</td>
                                    <td style={{ fontSize: '13px', color: '#64748b' }}>{user.lastLogin}</td>
                                    <td style={{ color: '#475569' }}>{user.organization}</td>
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
            {/* Modal Overlay */}
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

                        {/* Close Button */}
                        <button onClick={handleCloseModal} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                            <X size={24} />
                        </button>

                        {/* Modal Header */}
                        <div style={{ marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Create New User</h2>
                            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Add a new user with role-based permissions</p>
                        </div>

                        {/* Named Tabs Navigation */}
                        <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', marginBottom: '40px' }}>
                            {['Basic Information', 'Role Selection', 'Permissions Configuration', 'Login & Invite'].map((tabName, idx) => {
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
                                            justifyContent: 'center',
                                            whiteSpace: 'nowrap'
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

                        {/* Step 1: Basic Information */}
                        {modalStep === 1 && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'left' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>First Name *</label>
                                    <input
                                        type="text" placeholder="Enter first name"
                                        value={userData.firstName}
                                        onChange={e => setUserData({ ...userData, firstName: e.target.value })}
                                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Last Name *</label>
                                    <input
                                        type="text" placeholder="Enter last name"
                                        value={userData.lastName}
                                        onChange={e => setUserData({ ...userData, lastName: e.target.value })}
                                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Email ID *</label>
                                    <input
                                        type="email" placeholder="Enter email"
                                        value={userData.email}
                                        onChange={e => setUserData({ ...userData, email: e.target.value })}
                                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Mobile Number *</label>
                                    <input
                                        type="tel" placeholder="+91 XXXXX XXXXX"
                                        value={userData.mobile}
                                        onChange={e => setUserData({ ...userData, mobile: e.target.value })}
                                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Assign Organization</label>
                                    <select
                                        value={userData.organization}
                                        onChange={e => setUserData({ ...userData, organization: e.target.value })}
                                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: 'white' }}
                                    >
                                        <option value="">Select organization</option>
                                        {orgs.map((o) => (
                                            <option key={o.id} value={String(o.id)}>
                                                {o.org_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Department</label>
                                    <input
                                        type="text" placeholder="Enter department"
                                        value={userData.department}
                                        onChange={e => setUserData({ ...userData, department: e.target.value })}
                                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Role Selection */}
                        {modalStep === 2 && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                                <label style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '8px', display: 'block', textAlign: 'left' }}>Select Role *</label>
                                {roles.map(role => (
                                    <div
                                        key={role.id}
                                        onClick={() => setUserData({ ...userData, role: role.id })}
                                        style={{
                                            padding: '16px 20px', borderRadius: '12px', border: '1.5px solid',
                                            borderColor: userData.role === role.id ? '#0d89a4' : '#e2e8f0',
                                            background: userData.role === role.id ? '#f0f9fa' : 'white',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{
                                            width: '20px', height: '20px', borderRadius: '50%', border: '2px solid',
                                            borderColor: userData.role === role.id ? '#0d89a4' : '#cbd5e1',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                                        }}>
                                            {userData.role === role.id && <div style={{ width: '10px', height: '10px', background: '#0d89a4', borderRadius: '50%' }} />}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '15px' }}>{role.title}</div>
                                            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{role.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Step 3: Permissions Configuration */}
                        {modalStep === 3 && (
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Module Permissions</h4>
                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Based on: <span style={{ color: '#0d89a4', fontWeight: 600 }}>{roles.find(r => r.id === userData.role)?.title || 'Selected Role'}</span></span>
                                </div>
                                <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                            <thead style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 1 }}>
                                                <tr>
                                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>Module</th>
                                                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>View</th>
                                                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Create</th>
                                                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Edit</th>
                                                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Delete</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {modules.map((mod) => (
                                                    <tr key={mod.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ padding: '12px 16px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <mod.icon size={16} color="#64748b" />
                                                                <span style={{ fontWeight: 500, color: '#1e293b' }}>{mod.label}</span>
                                                            </div>
                                                        </td>
                                                        {['view', 'create', 'edit', 'delete'].map(perm => (
                                                            <td key={perm} style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                                <div style={{
                                                                    width: '18px', height: '18px', border: '2px solid #cbd5e1', borderRadius: '4px',
                                                                    margin: '0 auto', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    background: userData.permissions[mod.id]?.[perm] ? '#0d89a4' : 'transparent',
                                                                    borderColor: userData.permissions[mod.id]?.[perm] ? '#0d89a4' : '#cbd5e1'
                                                                }} onClick={() => {
                                                                    const newPerms = { ...userData.permissions };
                                                                    if (!newPerms[mod.id]) newPerms[mod.id] = {};
                                                                    newPerms[mod.id][perm] = !newPerms[mod.id][perm];
                                                                    setUserData({ ...userData, permissions: newPerms });
                                                                }}>
                                                                    {userData.permissions[mod.id]?.[perm] && <Check size={14} color="white" />}
                                                                </div>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div style={{ marginTop: '24px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}>
                                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '16px' }}>Additional Permission Scopes</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {[
                                            { id: 'globalAccess', label: 'Global Access (All Organizations)', desc: 'Allow user to manage data across all registered organizations.' },
                                            { id: 'crossEvent', label: 'Cross-Event Access', desc: 'Allow user to access data between different events of same organization.' },
                                            { id: 'dataExport', label: 'Data Export Permission', desc: 'Enable user to export sensitive platform data into downloadable formats.' }
                                        ].map(item => (
                                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{item.label}</div>
                                                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{item.desc}</div>
                                                </div>
                                                <div
                                                    onClick={() => setUserData({
                                                        ...userData,
                                                        additionalPermissions: { ...userData.additionalPermissions, [item.id]: !userData.additionalPermissions[item.id] }
                                                    })}
                                                    style={{
                                                        width: '40px', height: '22px', borderRadius: '20px',
                                                        background: userData.additionalPermissions[item.id] ? '#0d89a4' : '#cbd5e1',
                                                        position: 'relative', cursor: 'pointer', transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '18px', height: '18px', background: 'white', borderRadius: '50%',
                                                        position: 'absolute', top: '2px',
                                                        left: userData.additionalPermissions[item.id] ? '20px' : '2px',
                                                        transition: 'all 0.2s'
                                                    }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Login & Invite */}
                        {modalStep === 4 && (
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', marginBottom: '20px' }}>Login Credentials Setup</h4>
                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                                        <button
                                            onClick={() => setUserData({ ...userData, loginType: 'invite' })}
                                            style={{
                                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                padding: '12px', borderRadius: '10px', border: '1.5px solid',
                                                borderColor: userData.loginType === 'invite' ? '#0d89a4' : '#e2e8f0',
                                                background: userData.loginType === 'invite' ? '#0d89a4' : 'white',
                                                color: userData.loginType === 'invite' ? 'white' : '#64748b',
                                                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        >
                                            <Send size={18} style={{ color: userData.loginType === 'invite' ? 'white' : '#cbd5e1' }} />
                                            Send Invite Email
                                        </button>
                                        <button
                                            onClick={() => setUserData({ ...userData, loginType: 'manual' })}
                                            style={{
                                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                padding: '12px', borderRadius: '10px', border: '1.5px solid',
                                                borderColor: userData.loginType === 'manual' ? '#0d89a4' : '#e2e8f0',
                                                background: userData.loginType === 'manual' ? '#0d89a4' : 'white',
                                                color: userData.loginType === 'manual' ? 'white' : '#64748b',
                                                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        >
                                            <Lock size={18} style={{ color: userData.loginType === 'manual' ? 'white' : '#cbd5e1' }} />
                                            Set Password Manually
                                        </button>
                                    </div>

                                    {userData.loginType === 'manual' ? (
                                        <div style={{ marginTop: '20px' }}>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Password *</label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="Enter password"
                                                    value={userData.password}
                                                    onChange={e => setUserData({ ...userData, password: e.target.value })}
                                                    style={{ width: '100%', padding: '12px 80px 12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                                                />
                                                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><Eye size={18} /></button>
                                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><Copy size={18} /></button>
                                                </div>
                                            </div>
                                            <div
                                                style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px', cursor: 'pointer' }}
                                                onClick={() => setUserData({ ...userData, forceReset: !userData.forceReset })}
                                            >
                                                <div style={{
                                                    width: '18px', height: '18px', borderRadius: '4px', border: '2px solid',
                                                    borderColor: userData.forceReset ? '#0d89a4' : '#cbd5e1',
                                                    background: userData.forceReset ? '#0d89a4' : 'transparent',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    {userData.forceReset && <Check size={14} color="white" />}
                                                </div>
                                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Force password reset on first login</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{
                                            background: '#f8fafc', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0',
                                            display: 'flex', gap: '16px', alignItems: 'flex-start'
                                        }}>
                                            <div style={{ padding: '8px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                <Mail size={20} color="#0d89a4" />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Email Invitation</div>
                                                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                                                    An invitation email will be sent to the user with a secure link to set their password and complete account setup.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
                                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', marginBottom: '20px' }}>Security Settings</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Require MFA</div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>Two-factor authentication</div>
                                            </div>
                                            <div
                                                onClick={() => setUserData({
                                                    ...userData,
                                                    security: { ...userData.security, requireMFA: !userData.security.requireMFA }
                                                })}
                                                style={{
                                                    width: '40px', height: '22px', borderRadius: '20px',
                                                    background: userData.security.requireMFA ? '#0d89a4' : '#cbd5e1',
                                                    position: 'relative', cursor: 'pointer', transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{
                                                    width: '18px', height: '18px', background: 'white', borderRadius: '50%',
                                                    position: 'absolute', top: '2px',
                                                    left: userData.security.requireMFA ? '20px' : '2px',
                                                    transition: 'all 0.2s'
                                                }} />
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>IP Restriction</div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>Limit access by IP</div>
                                            </div>
                                            <div
                                                onClick={() => setUserData({
                                                    ...userData,
                                                    security: { ...userData.security, ipRestriction: !userData.security.ipRestriction }
                                                })}
                                                style={{
                                                    width: '40px', height: '22px', borderRadius: '20px',
                                                    background: userData.security.ipRestriction ? '#0d89a4' : '#cbd5e1',
                                                    position: 'relative', cursor: 'pointer', transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{
                                                    width: '18px', height: '18px', background: 'white', borderRadius: '50%',
                                                    position: 'absolute', top: '2px',
                                                    left: userData.security.ipRestriction ? '20px' : '2px',
                                                    transition: 'all 0.2s'
                                                }} />
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Session Timeout</label>
                                            <select
                                                value={userData.security.sessionTimeout}
                                                onChange={e => setUserData({
                                                    ...userData,
                                                    security: { ...userData.security, sessionTimeout: e.target.value }
                                                })}
                                                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: 'white' }}
                                            >
                                                <option value="15 minutes">15 minutes</option>
                                                <option value="30 minutes">30 minutes</option>
                                                <option value="1 hour">1 hour</option>
                                                <option value="4 hours">4 hours</option>
                                            </select>
                                        </div>
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
                                onClick={() => modalStep < 4 ? setModalStep(modalStep + 1) : handleCreateUser()}
                                disabled={createUserLoading}
                                style={{
                                    padding: '10px 32px', borderRadius: '8px', border: 'none',
                                    background: '#0d89a4', color: 'white', fontWeight: 600, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                {modalStep === 4 ? (
                                    <>
                                        {userData.loginType === 'manual'
                                            ? (createUserLoading ? 'Creating...' : 'Create User')
                                            : (createUserLoading ? 'Sending...' : 'Send Invite')}
                                        <ChevronDown size={16} />
                                    </>
                                ) : 'Next'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
