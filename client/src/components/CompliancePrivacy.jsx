import React, { useState } from 'react';
import { Shield, AlertTriangle, FileText, Calendar, Eye } from 'lucide-react';

const CompliancePrivacy = () => {
    const [activeTab, setActiveTab] = useState('Overview');

    const tabs = ['Overview', 'Data Privacy', 'Audit Reports', 'Policies', 'Certifications'];

    const complianceItems = [
        { name: 'Data Encryption', status: 100, category: 'Security', lastCheck: 'Checked 1 hour ago' },
        { name: 'Access Control', status: 95, category: 'Security', lastCheck: 'Checked 2 days ago' },
        { name: 'Data Retention', status: 90, category: 'Privacy', lastCheck: 'Checked 1 day ago' },
        { name: 'User Consent', status: 78, category: 'Privacy', lastCheck: 'Checked 5 days ago' },
        { name: 'Audit Logging', status: 100, category: 'Monitoring', lastCheck: 'Checked 1 hour ago' }
    ];

    const auditReports = [
        { title: 'Q4 2024 Security Audit', date: 'Dec 15, 2024', type: 'Internal', findings: '3 findings', status: 'Active' },
        { title: 'GDPR Compliance Review', date: 'Nov 03, 2024', type: 'External', findings: '5 findings', status: 'Active' },
        { title: 'Data Privacy Assessment', date: 'Nov 15, 2024', type: 'Internal', findings: '2 findings', status: 'Active' },
        { title: 'ISO 27001 Pre-Audit', date: 'Oct 28, 2024', type: 'External', findings: '8 findings', status: 'Pending' }
    ];

    return (
        <div className="dashboard-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }} className="fade-in">
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>Compliance & Privacy</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Manage compliance standards, policies, and audit requirements</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563eb', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: 'white', cursor: 'pointer' }}>
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }} className="fade-in">
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>COMPLIANCE SCORE</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>94%</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>+2% this month</div>
                        </div>
                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Shield size={20} color="#22c55e" />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>OPEN ISSUES</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>8</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>3 critical</div>
                        </div>
                        <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <AlertTriangle size={20} color="#fbbf24" />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>POLICIES ACTIVE</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>24</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>All up to date</div>
                        </div>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <FileText size={20} color="#3b82f6" />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>LAST AUDIT</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>Dec 15</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>15 days ago</div>
                        </div>
                        <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Calendar size={20} color="#06b6d4" />
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

                {/* Compliance Status */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Shield size={18} color="#2563eb" />
                            Compliance Status
                        </h3>
                        <button style={{ fontSize: '13px', color: '#2563eb', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                            View All
                        </button>
                    </div>
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {complianceItems.map((item, idx) => (
                            <div key={idx} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{item.name}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                background: 'rgba(59, 130, 246, 0.1)',
                                                color: '#3b82f6',
                                                fontWeight: 600,
                                                marginRight: '8px'
                                            }}>
                                                {item.category}
                                            </span>
                                            {item.lastCheck}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color: item.status === 100 ? '#22c55e' : item.status >= 90 ? '#3b82f6' : '#fbbf24' }}>
                                        {item.status}%
                                    </div>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${item.status}%`,
                                        height: '100%',
                                        background: item.status === 100 ? '#22c55e' : item.status >= 90 ? '#3b82f6' : '#fbbf24',
                                        borderRadius: '4px',
                                        transition: 'width 0.3s ease'
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Audit Reports */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={18} color="#2563eb" />
                            Recent Audit Reports
                        </h3>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#2563eb', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'white', cursor: 'pointer' }}>
                            Export
                        </button>
                    </div>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {auditReports.map((report, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                                    <div style={{ background: 'white', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                        <FileText size={20} color="#3b82f6" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{report.title}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                            📅 {report.date} • {report.type}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{report.findings}</div>
                                    <span className={`badge ${report.status === 'Active' ? 'badge-live' : 'badge-draft'}`}>
                                        {report.status}
                                    </span>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                        <Eye size={18} color="#64748b" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '32px', paddingBottom: '24px' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Powered By Billiton</p>
            </div>
        </div>
    );
};

export default CompliancePrivacy;
