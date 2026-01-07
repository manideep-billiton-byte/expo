import React from 'react';
import { Download, FileText, Building2, Users, Mail, Phone, Settings, Shield, UserPlus } from 'lucide-react';

const ExhibitorUsers = () => {
    const users = [
        { name: 'Rajesh Kumar', email: 'rajesh@techcorp.com', role: 'Admin', status: 'Active', lastActive: '5 mins ago' },
        { name: 'Priya Sharma', email: 'priya@techcorp.com', role: 'Manager', status: 'Active', lastActive: '2 hours ago' },
        { name: 'Amit Patel', email: 'amit@techcorp.com', role: 'Staff', status: 'Active', lastActive: '1 day ago' },
        { name: 'Sneha Reddy', email: 'sneha@techcorp.com', role: 'Staff', status: 'Inactive', lastActive: '3 days ago' }
    ];

    return (
        <div style={{ padding: '0px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>Users</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Manage team members and permissions</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                        <Download size={16} />
                        Export
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563eb', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: 'white', cursor: 'pointer' }}>
                        <UserPlus size={16} />
                        Add User
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {[
                    { label: 'Total Users', value: '4', icon: Users, color: '#2563eb' },
                    { label: 'Active', value: '3', icon: Shield, color: '#10b981' },
                    { label: 'Admins', value: '1', icon: Settings, color: '#f59e0b' },
                    { label: 'Staff', value: '2', icon: UserPlus, color: '#0ea5e9' }
                ].map((stat, idx) => (
                    <div key={idx} className="card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{stat.label}</div>
                                <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', marginTop: '4px' }}>{stat.value}</div>
                            </div>
                            <div style={{ background: `${stat.color}15`, padding: '10px', borderRadius: '10px' }}>
                                {stat.icon && <stat.icon size={20} color={stat.color} />}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>Team Members</h3>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>USER</th>
                                <th>EMAIL</th>
                                <th>ROLE</th>
                                <th>STATUS</th>
                                <th>LAST ACTIVE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '14px' }}>
                                                {user.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{user.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '13px', color: '#64748b' }}>{user.email}</td>
                                    <td>
                                        <span style={{ padding: '4px 12px', background: '#f1f5f9', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{
                                            color: user.status === 'Active' ? '#10b981' : '#94a3b8',
                                            fontWeight: 700,
                                            fontSize: '12px'
                                        }}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '13px', color: '#64748b' }}>{user.lastActive}</td>
                                    <td>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}>...</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '32px', paddingBottom: '24px' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Powered By Billiton</p>
            </div>
        </div>
    );
};

export default ExhibitorUsers;
