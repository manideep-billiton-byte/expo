import React from 'react';
import { Download, FileText, ChevronDown, BarChart3, TrendingUp, Users, Clock, Activity, Calendar, CheckCircle2, Mail } from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const ExhibitorAnalytics = () => {
    const hourlyData = [
        { time: '9 AM', visitors: 45 },
        { time: '10 AM', visitors: 110 },
        { time: '11 AM', visitors: 145 },
        { time: '12 PM', visitors: 115 },
        { time: '1 PM', visitors: 95 },
        { time: '2 PM', visitors: 135 },
        { time: '3 PM', visitors: 145 },
        { time: '4 PM', visitors: 125 },
        { time: '5 PM', visitors: 105 },
        { time: '6 PM', visitors: 75 }
    ];

    const weeklyData = [
        { day: 'Mon', visitors: 420, leads: 85 },
        { day: 'Tue', visitors: 380, leads: 72 },
        { day: 'Wed', visitors: 510, leads: 95 },
        { day: 'Thu', visitors: 480, leads: 88 },
        { day: 'Fri', visitors: 620, leads: 112 },
        { day: 'Sat', visitors: 320, leads: 54 },
        { day: 'Sun', visitors: 280, leads: 48 }
    ];

    const interestData = [
        { name: 'Product A', value: 85, color: '#0d89a4' },
        { name: 'Product B', value: 72, color: '#10b981' },
        { name: 'Product C', value: 58, color: '#f59e0b' },
        { name: 'Service X', value: 45, color: '#ef4444' },
        { name: 'Solution Y', value: 38, color: '#8b5cf6' }
    ];

    const distributionData = [
        { name: 'Hot', value: 35, color: '#ef4444' },
        { name: 'Warm', value: 42, color: '#f59e0b' },
        { name: 'Cold', value: 23, color: '#3b82f6' }
    ];

    return (
        <div style={{ padding: '0px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>Analytics</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Generate and download event reports</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                        <Download size={16} />
                        Export
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563eb', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: 'white', cursor: 'pointer' }}>
                        <BarChart3 size={16} />
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {[
                    { label: 'Total Reports', value: '4', icon: FileText, color: '#2563eb' },
                    { label: 'Ready', value: '3', icon: CheckCircle2, color: '#10b981' },
                    { label: 'Processing', value: '1', icon: Clock, color: '#f59e0b' },
                    { label: 'This Week', value: '4', icon: Calendar, color: '#0ea5e9' }
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

            <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Generated Reports</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>Show</span>
                        <select style={{ padding: '6px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13px' }}>
                            <option>10</option>
                        </select>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>entries</span>
                    </div>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>REPORT NAME</th>
                                <th>TYPE</th>
                                <th>DATE RANGE</th>
                                <th>FORMAT</th>
                                <th>STATUS</th>
                                <th>SIZE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: 'Lead Summary Report - March 2024', type: 'Leads', range: 'Mar 15-17, 2024', format: 'PDF', status: 'Ready', size: '2.4 MB' },
                                { name: 'Visitor Analytics Export', type: 'Visitors', range: 'Mar 15-17, 2024', format: 'EXCEL', status: 'Ready', size: '1.4 MB' },
                                { name: 'Daily Performance Report', type: 'Performance', range: 'Mar 15-17, 2024', format: 'PDF', status: 'Ready', size: '1.4 MB' },
                            ].map((report, idx) => (
                                <tr key={idx}>
                                    <td style={{ fontWeight: 600 }}>{report.name}</td>
                                    <td><span style={{ padding: '4px 8px', background: '#f1f5f9', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{report.type}</span></td>
                                    <td style={{ fontSize: '13px', color: '#64748b' }}>{report.range}</td>
                                    <td style={{ fontWeight: 600, fontSize: '13px' }}>{report.format}</td>
                                    <td><span style={{ color: '#10b981', fontWeight: 700, fontSize: '12px' }}>{report.status}</span></td>
                                    <td style={{ fontSize: '13px', color: '#64748b' }}>{report.size}</td>
                                    <td><button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>...</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                {/* Hourly Traffic */}
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>Hourly Visitor Traffic</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={hourlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -1px rgba(0,0,0,0.1)' }} />
                                <Line type="monotone" dataKey="visitors" stroke="#0d89a4" strokeWidth={3} dot={false} fill="url(#colorVis)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Weekly Performance */}
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>Weekly Performance</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -1px rgba(0,0,0,0.1)' }} />
                                <Legend />
                                <Bar dataKey="visitors" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="leads" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                {/* Lead Distribution */}
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>Lead Quality Distribution</h3>
                    <div style={{ height: '300px', display: 'flex', alignItems: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distributionData}
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Product Interest */}
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>Product/Service Interest</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {interestData.map((item, idx) => (
                            <div key={idx}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                                    <span style={{ fontWeight: 600, color: '#475569' }}>{item.name}</span>
                                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{item.value}%</span>
                                </div>
                                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${item.value}%`, height: '100%', background: item.color, borderRadius: '4px' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>Scheduled Reports</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                        { name: 'Daily Lead Summary', time: 'Sent daily at 11:59 PM', icon: <Mail size={16} /> },
                        { name: 'Weekly Performance Digest', time: 'Sent every Sunday at 6:00 PM', icon: <BarChart3 size={16} /> }
                    ].map((row, idx) => (
                        <div key={idx} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', border: '1px solid #e2e8f0' }}>
                                    {row.icon}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>{row.name}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{row.time}</div>
                                </div>
                            </div>
                            <button style={{ padding: '6px 12px', background: '#f0fdf4', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 700, color: '#10b981' }}>Active</button>
                        </div>
                    ))}
                    <button style={{ width: '100%', padding: '12px', background: 'white', border: '1px dashed #e2e8f0', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: '#64748b', cursor: 'pointer', marginTop: '12px' }}>
                        + Add Scheduled Report
                    </button>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '32px', paddingBottom: '24px' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Powered By Billiton</p>
            </div>
        </div>
    );
};

export default ExhibitorAnalytics;
