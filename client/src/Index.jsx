import React, { useState } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import StatsCard from './components/StatsCard';
import EventManagement from './components/EventManagement';
import ExhibitorsManagement from './components/ExhibitorsManagement';
import TenantManagement from './components/TenantManagement';
import UserManagement from './components/UserManagement';
import VisitorsManagement from './components/VisitorsManagement';
import BillingManagement from './components/BillingManagement';
import {
    Building2, Calendar, Image as ImageIcon, Users,
    MapPin, MousePointer2, IndianRupee, UserCheck,
    MessageSquare, Activity, ShieldCheck,
    AlertTriangle, Smartphone, Plus, UserPlus,
    FileText, Globe, Database, Mail, ChevronRight
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const chartData = [
    { name: 'Mon', organizations: 200, exhibitors: 150, visitors: 400 },
    { name: 'Tue', organizations: 250, exhibitors: 180, visitors: 350 },
    { name: 'Wed', organizations: 220, exhibitors: 200, visitors: 450 },
    { name: 'Thu', organizations: 300, exhibitors: 250, visitors: 500 },
    { name: 'Fri', organizations: 450, exhibitors: 300, visitors: 650 },
    { name: 'Sat', organizations: 350, exhibitors: 220, visitors: 550 },
    { name: 'Sun', organizations: 300, exhibitors: 200, visitors: 480 },
];

const Index = () => {
    const [activeScreen, setActiveScreen] = useState('dashboard');

    const handleNavigate = (screen) => {
        setActiveScreen(screen);
    };

    const renderContent = () => {
        switch (activeScreen) {
            case 'events':
                return <EventManagement />;
            case 'exhibitors':
                return <ExhibitorsManagement />;
            case 'tenants':
                return <TenantManagement />;
            case 'users':
                return <UserManagement />;
            case 'visitors':
                return <VisitorsManagement />;
            case 'billing':
                return <BillingManagement />;
            default:
                return (
                    <div className="dashboard-container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }} className="fade-in">
                            <div>
                                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>Master Dashboard</h1>
                                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Global overview of your event management platform</p>
                            </div>
                            <div style={{ background: 'rgba(37, 99, 235, 0.08)', padding: '8px 16px', borderRadius: '12px', color: '#2563eb', fontWeight: 600, fontSize: '14px' }}>
                                Good Morning Deepak...!
                            </div>
                        </div>

                        <div className="stats-grid fade-in">
                            <StatsCard label="Active Tenants" value="248" change="+12 this month" icon={Building2} colorClass="text-blue-500" />
                            <StatsCard label="Active Events" value="42" change="8 ongoing" icon={Calendar} colorClass="text-emerald-500" />
                            <StatsCard label="Total Exhibitors" value="1,847" change="+150 this week" icon={ImageIcon} colorClass="text-purple-500" />
                            <StatsCard label="Registered Visitors" value="24,582" change="+2,340 today" icon={Users} colorClass="text-blue-400" />
                            <StatsCard label="Leads Captured" value="18,429" change="+842 today" icon={MousePointer2} colorClass="text-orange-500" />
                            <StatsCard label="Messages Sent" value="45,621" change="+1,234 today" icon={MessageSquare} colorClass="text-cyan-500" />
                            <StatsCard label="Revenue (MTD)" value="₹12.4L" change="+15% vs last month" icon={IndianRupee} colorClass="text-emerald-600" />
                            <StatsCard label="Active Users" value="892" change="Online now" icon={UserCheck} colorClass="text-teal-500" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px', marginBottom: '24px' }} className="fade-in">
                            <div className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '10px' }}>
                                            <Calendar size={18} color="#10b981" />
                                        </div>
                                        <div>
                                            <span style={{ fontWeight: 700, fontSize: '16px', color: '#1e293b' }}>Live Events</span>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>2 events currently running</p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {[
                                        { name: 'Tech Summit 2025', org: 'ABC - ORG', leads: '2,847', exhibitors: '156', visitors: '12,450', status: 'Done' },
                                        { name: 'Digital Marketing Expo', org: 'XYZ - ORG', leads: '1,532', exhibitors: '89', visitors: '8,780', status: 'Live' },
                                        { name: 'Healthcare Innovation Summit', org: '123 - ORG', leads: '945', exhibitors: '67', visitors: '4,230', status: 'Upcoming' }
                                    ].map((event, idx) => (
                                        <div key={idx} style={{ padding: '20px', border: '1px solid #f1f5f9', borderRadius: '16px', position: 'relative', transition: 'all 0.2s' }} className="hover-lift">
                                            <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                                                <span className={`badge badge-${event.status.toLowerCase()}`}>{event.status}</span>
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>{event.name}</div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>{event.org}</div>
                                            <div style={{ display: 'flex', gap: '40px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Activity size={14} color="#64748b" />
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '13px' }}>{event.leads}</div>
                                                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>Leads</div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <ImageIcon size={14} color="#64748b" />
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '13px' }}>{event.exhibitors}</div>
                                                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>Exhibitors</div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Users size={14} color="#64748b" />
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '13px' }}>{event.visitors}</div>
                                                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>Visitors</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '10px', borderRadius: '10px' }}>
                                            <Activity size={20} color="#2563eb" />
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: '17px', color: '#1e293b' }}>Lead Capture</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fee2e2', padding: '4px 10px', borderRadius: '6px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }}></div>
                                            <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 700 }}>Live</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ fontWeight: 800, fontSize: '32px', color: '#2563eb', lineHeight: 1 }}>8,542</span>
                                            <span style={{ fontSize: '13px', color: '#94a3b8', marginLeft: '8px', fontWeight: 500 }}>Today</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {[
                                        { type: 'Visitor Qr', count: '2,134', status: 'Good', color: '#10b981' },
                                        { type: 'Stall Qr', count: '1,856', status: 'Good', color: '#10b981' },
                                        { type: 'Ocr', count: '892', status: 'Warning', color: '#f59e0b' },
                                        { type: 'Manual', count: '2,134', status: 'Good', color: '#10b981' }
                                    ].map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></div>
                                                <div style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}>{item.type}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>{item.count}</div>
                                                <div style={{ fontSize: '11px', color: item.color, background: `${item.color}15`, padding: '4px 10px', borderRadius: '6px', fontWeight: 600, minWidth: '65px', textAlign: 'center' }}>{item.status}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px', marginBottom: '24px' }} className="fade-in">
                            <div className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <div>
                                        <span style={{ fontWeight: 700, fontSize: '16px' }}>Users Trend</span>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Weekly engagement metrics</p>
                                    </div>
                                    <select style={{ border: '1px solid #e2e8f0', background: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, color: '#64748b' }}>
                                        <option>Weekly View</option>
                                        <option>Monthly View</option>
                                    </select>
                                </div>
                                <div style={{ height: '280px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.12} />
                                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                            <Area type="monotone" dataKey="visitors" stroke="#2563eb" strokeWidth={3} fillOpacity={0.1} fill="#2563eb" />
                                            <Area type="monotone" dataKey="organizations" stroke="#8b5cf6" strokeWidth={2} fillOpacity={0.06} fill="#8b5cf6" />
                                            <Area type="monotone" dataKey="exhibitors" stroke="#10b981" strokeWidth={2} fillOpacity={0.06} fill="#10b981" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 500, color: '#64748b' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#2563eb' }}></div> Organizations
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 500, color: '#64748b' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#8b5cf6' }}></div> Exhibitors
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 500, color: '#64748b' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#10b981' }}></div> Visitors
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
                                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '10px' }}>
                                        <MessageSquare size={18} color="#3b82f6" />
                                    </div>
                                    <span style={{ fontWeight: 700, fontSize: '16px' }}>Communication Health</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Sent Today</div>
                                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>15,420</div>
                                        <div style={{ fontSize: '10px', color: '#10b981', mt: '4px', fontWeight: 600 }}>↑ 12% vs yesterday</div>
                                    </div>
                                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Last 15 min</div>
                                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>342</div>
                                        <div style={{ fontSize: '10px', color: '#2563eb', mt: '4px', fontWeight: 600 }}>Active burst</div>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                                    <div>
                                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>Delivery Rate</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ height: '8px', flex: 1, background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ width: '98.5%', height: '100%', background: '#10b981' }}></div>
                                            </div>
                                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#10b981' }}>98.5%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>Opt-out Rate</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ height: '8px', flex: 1, background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ width: '1.2%', height: '100%', background: '#f43f5e' }}></div>
                                            </div>
                                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#f43f5e' }}>1.2%</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Rate Limiting</span>
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '9999px', fontWeight: 700 }}>NOT ACTIVE</span>
                                </div>
                            </div>
                        </div>

                        <div className="card fade-in" style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '8px', borderRadius: '10px' }}>
                                        <Building2 size={20} color="#8b5cf6" />
                                    </div>
                                    <div>
                                        <span style={{ fontWeight: 700, fontSize: '16px' }}>Organization Insights</span>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Real-time activity by organization</p>
                                    </div>
                                </div>
                                <select style={{ border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', color: '#475569', fontWeight: 500, background: 'white' }}>
                                    <option>All Organizations</option>
                                    <option>TechCorp India</option>
                                    <option>Govt. of Maharashtra</option>
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                                {[
                                    { label: 'Total Events', value: '32', color: 'rgba(239, 68, 68, 0.05)', textColor: '#ef4444' },
                                    { label: 'Exhibitors', value: '500', color: 'rgba(100, 116, 139, 0.05)', textColor: '#475569' },
                                    { label: 'Live Leads', value: '1,000', color: 'rgba(245, 158, 11, 0.05)', textColor: '#f59e0b' },
                                    { label: 'Visitors', value: '15,000', color: 'rgba(37, 99, 235, 0.05)', textColor: '#2563eb' },
                                    { label: 'Net Revenue', value: '₹10.0L', color: 'rgba(16, 185, 129, 0.05)', textColor: '#10b981' }
                                ].map((item, idx) => (
                                    <div key={idx} style={{ background: item.color, padding: '24px 16px', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(0,0,0,0.02)' }} className="hover-lift">
                                        <div style={{ fontSize: '26px', fontWeight: 800, color: item.textColor, marginBottom: '4px' }}>{item.value}</div>
                                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px', marginBottom: '24px' }} className="fade-in">
                            <div className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '8px', borderRadius: '10px' }}>
                                            <Calendar size={18} color="#2563eb" />
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: '16px' }}>Recent Events Activity</span>
                                    </div>
                                    <button style={{ color: '#2563eb', fontSize: '13px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
                                </div>
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Event Name</th>
                                                <th>Tenant</th>
                                                <th>Status</th>
                                                <th>Visitors</th>
                                                <th>Leads</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { name: 'Tech Expo 2024', tenant: 'TechCorp India', status: 'Active', visitors: '2,450', leads: '1,820', date: 'Dec 20-24' },
                                                { name: 'MSME Connect', tenant: 'Govt. of Maharashtra', status: 'Active', visitors: '680', leads: '455', date: 'Dec 22-25' },
                                                { name: 'Startup Summit', tenant: 'StartupHub', status: 'Pending', visitors: '0', leads: '0', date: 'Jan 5-7' },
                                                { name: 'Industry 4.0 Expo', tenant: 'Industrial Association', status: 'Active', visitors: '3,200', leads: '2,100', date: 'Dec 18-22' }
                                            ].map((row, idx) => (
                                                <tr key={idx}>
                                                    <td style={{ fontWeight: 600 }}>{row.name}</td>
                                                    <td style={{ fontSize: '13px', color: '#64748b' }}>{row.tenant}</td>
                                                    <td><span className={`badge ${row.status === 'Active' ? 'badge-done' : 'badge-live'}`}>{row.status}</span></td>
                                                    <td style={{ fontWeight: 600 }}>{row.visitors}</td>
                                                    <td style={{ fontWeight: 600 }}>{row.leads}</td>
                                                    <td style={{ fontSize: '12px', color: '#94a3b8' }}>{row.date}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '10px' }}>
                                        <ShieldCheck size={18} color="#10b981" />
                                    </div>
                                    <span style={{ fontWeight: 700, fontSize: '16px' }}>System Health</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {[
                                        { label: 'API Gateway', status: '99.98%', icon: Globe, color: '#3b82f6' },
                                        { label: 'Main Database', status: '99.91%', icon: Database, color: '#8b5cf6' },
                                        { label: 'WhatsApp Service', status: '99.88%', icon: MessageSquare, color: '#10b981' },
                                        { label: 'Email Relay', status: '99.58%', icon: Mail, color: '#f59e0b' },
                                        { label: 'SMS Gateway', status: '99.94%', icon: Smartphone, color: '#f43f5e' }
                                    ].map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ background: `${item.color}10`, padding: '6px', borderRadius: '8px' }}>
                                                    <item.icon size={14} color={item.color} />
                                                </div>
                                                <span style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>{item.label}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{item.status}</span>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button style={{ width: '100%', marginTop: '30px', padding: '12px', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: 'white', fontSize: '13px', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                                    Full Status Report <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="card fade-in" style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '8px', borderRadius: '10px' }}>
                                    <AlertTriangle size={20} color="#f59e0b" />
                                </div>
                                <span style={{ fontWeight: 700, fontSize: '16px' }}>Critical Alerts & Activities</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[
                                    { text: 'High WhatsApp usage for TechCorp India - 85% quota used', time: '5 min ago', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.03)' },
                                    { text: 'Payment failed for StartupHub subscription renewal', time: '12 min ago', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.03)' },
                                    { text: 'New tenant registration request: EventPro Global Solutions', time: '1 hour ago', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.03)' },
                                    { text: 'MSME Connect event metadata successfully published to registry', time: '2 hours ago', color: '#10b981', bg: 'rgba(16, 185, 129, 0.03)' }
                                ].map((alert, idx) => (
                                    <div key={idx} className="alert-item" style={{ background: alert.bg, display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: alert.color }}></div>
                                            <span style={{ fontSize: '14px', color: '#334155' }}>{alert.text}</span>
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>{alert.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="layout-wrapper">
            <Navigation activeScreen={activeScreen} onNavigate={handleNavigate} />
            <div className="main-content">
                <Header />
                {renderContent()}
            </div>
        </div>
    );
};

export default Index;
