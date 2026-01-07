import React, { useState } from 'react';
import { Search, Download, Plus, Mail, Phone, MessageSquare, MoreHorizontal, Filter, Star, CheckCircle2, Building2, Users, Clock } from 'lucide-react';

const LeadManagement = () => {
    const [activeTab, setActiveTab] = useState('All Leads');

    const leads = [
        { name: 'Rajesh Kumar', company: 'Infosys Technologies', email: 'rajesh.k@infosys.com', phone: '+91 98765 43210', score: 9, status: 'New', time: '2 hours ago', notes: 'Very interested in our cloud solutions. Requested demo.' },
        { name: 'Priya Sharma', company: 'TCS Digital', email: 'priya.s@tcs.com', phone: '+91 87654 32109', score: 7, status: 'Contacted', time: '4 hours ago', notes: 'Budget discussions in progress.' },
        { name: 'Amit Patel', company: 'Wipro Ltd', email: 'amit.p@wipro.com', phone: '+91 76543 21098', score: 8, status: 'New', time: '2 hours ago', notes: 'Decision maker. Schedule follow-up call next week.' },
        { name: 'Sneha Reddy', company: 'HCL Technologies', email: 'sneha.r@hcl.com', phone: '+91 65432 10987', score: 6, status: 'New', time: '8 hours ago', notes: '' },
        { name: 'Vikram Singh', company: 'Tech Mahindra', email: 'vikram.s@techmahindra.com', phone: '+91 54321 09876', score: 10, status: 'New', time: '2 hours ago', notes: 'Deal closed! Contract signed for 2 years.' },
    ];

    return (
        <div style={{ padding: '0px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>Lead Management</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Manage and follow up with your captured leads</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                        <Download size={16} />
                        Export
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563eb', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: 'white', cursor: 'pointer' }}>
                        <Plus size={16} />
                        Add Lead
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {[
                    { label: 'Total Leads', value: '5', icon: Users, color: '#2563eb' },
                    { label: 'New Today', value: '2', icon: Clock, color: '#0ea5e9' },
                    { label: 'Contacted', value: '1', icon: Phone, color: '#10b981' },
                    { label: 'Converted', value: '1', icon: CheckCircle2, color: '#f59e0b' }
                ].map((stat, idx) => (
                    <div key={idx} className="card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b' }}>{stat.value}</div>
                                <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>{stat.label}</div>
                            </div>
                            <div style={{ background: `${stat.color}15`, padding: '10px', borderRadius: '10px' }}>
                                <stat.icon size={20} color={stat.color} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ padding: '0px' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                        {['All Leads', 'New', 'Contacted', 'Converted'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    background: activeTab === tab ? '#eff6ff' : 'white',
                                    color: activeTab === tab ? '#2563eb' : '#64748b',
                                    border: '1px solid',
                                    borderColor: activeTab === tab ? '#bfdbfe' : '#e2e8f0',
                                    cursor: 'pointer'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '320px' }}>
                            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Search Leads..."
                                style={{ width: '100%', padding: '10px 14px 10px 44px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>Show</span>
                            <select style={{ padding: '6px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none' }}>
                                <option>10</option>
                                <option>25</option>
                                <option>50</option>
                            </select>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>entries</span>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {leads.map((lead, idx) => (
                            <div key={idx} className="hover-lift" style={{
                                padding: '20px',
                                border: '1px solid #f1f5f9',
                                borderRadius: '16px',
                                transition: 'all 0.2s'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: 600 }}>
                                            {lead.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <span style={{ fontWeight: 700, fontSize: '16px', color: '#1e293b' }}>{lead.name}</span>
                                                <Star size={14} fill="#f59e0b" color="#f59e0b" />
                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#10b981', fontWeight: 800 }}>
                                                    {lead.score}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>{lead.company}</div>
                                            <div style={{ display: 'flex', gap: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                                                    <Mail size={14} /> {lead.email}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                                                    <Phone size={14} /> {lead.phone}
                                                </div>
                                            </div>
                                            {lead.notes && (
                                                <div style={{ marginTop: '12px', fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                                                    "{lead.notes}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '11px', color: '#64748b' }}>{lead.time}</span>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                background: lead.status === 'New' ? '#ecfdf5' : '#fff7ed',
                                                color: lead.status === 'New' ? '#10b981' : '#f59e0b'
                                            }}>
                                                {lead.status}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button style={{ padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Mail size={14} /> Email
                                            </button>
                                            <button style={{ padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Phone size={14} /> Call
                                            </button>
                                            <button style={{ padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <MessageSquare size={14} /> WhatsApp
                                            </button>
                                            <button style={{ padding: '8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>
                                                <MoreHorizontal size={14} />
                                            </button>
                                        </div>
                                    </div>
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

export default LeadManagement;
