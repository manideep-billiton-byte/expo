import React, { useEffect, useState } from 'react';
import { apiFetch } from './utils/api';
import Layout from './components/Layout';
import StatsCard from './components/StatsCard';
import EventManagement from './components/EventManagement';
import ExhibitorsManagement from './components/ExhibitorsManagement';
import TenantManagement from './components/TenantManagement';
import UserManagement from './components/UserManagement';
import VisitorsManagement from './components/VisitorsManagement';
import BillingManagement from './components/BillingManagement';
import ExhibitorDashboardContent from './components/ExhibitorDashboardContent';
import LeadManagement from './components/LeadManagement';
import Scanner from './components/Scanner';
import ExhibitorAnalytics from './components/ExhibitorAnalytics';
import ExhibitorEventManagement from './components/ExhibitorEventManagement';
import ScanPrint from './components/ScanPrint';
import CommunicationControl from './components/CommunicationControl';
import UserLogsAudit from './components/UserLogsAudit';
import AnalyticsAPI from './components/AnalyticsAPI';
import CompliancePrivacy from './components/CompliancePrivacy';
import SupportManagement from './components/SupportManagement';
import {
    Building2, Calendar, Image as ImageIcon, Users,
    MapPin, MousePointer2, IndianRupee, UserCheck,
    MessageSquare, Activity, ShieldCheck,
    AlertTriangle, Smartphone, Plus, UserPlus,
    FileText, Globe, Database, Mail, ChevronRight
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
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

const Index = ({ onLogout, userType = 'master' }) => {
    const [activeScreen, setActiveScreen] = useState(() => {
        const stored = localStorage.getItem('activeScreen');
        return stored || 'dashboard';
    });

    const [dashboardLoading, setDashboardLoading] = useState(false);
    const [dashboardError, setDashboardError] = useState('');
    const [dashboardOrgs, setDashboardOrgs] = useState([]);
    const [dashboardEvents, setDashboardEvents] = useState([]);
    const [dashboardExhibitors, setDashboardExhibitors] = useState([]);
    const [dashboardVisitors, setDashboardVisitors] = useState([]);
    const [selectedOrg, setSelectedOrg] = useState('all'); // Organization filter

    const loadDashboardData = async () => {
        setDashboardLoading(true);
        setDashboardError('');
        try {
            const parseResp = async (resp) => {
                const txt = await resp.clone().text();
                try { return JSON.parse(txt); } catch (e) { return txt; }
            };

            const [orgsResp, eventsResp, exhibitorsResp, visitorsResp] = await Promise.all([
                apiFetch('/api/organizations'),
                apiFetch('/api/events'),
                apiFetch('/api/exhibitors'),
                apiFetch('/api/visitors')
            ]);

            const [orgsData, eventsData, exhibitorsData, visitorsData] = await Promise.all([
                parseResp(orgsResp),
                parseResp(eventsResp),
                parseResp(exhibitorsResp),
                parseResp(visitorsResp)
            ]);

            if (!orgsResp.ok) throw new Error((orgsData && orgsData.error) || String(orgsData) || 'Failed to load organizations');
            if (!eventsResp.ok) throw new Error((eventsData && eventsData.error) || String(eventsData) || 'Failed to load events');
            if (!exhibitorsResp.ok) throw new Error((exhibitorsData && exhibitorsData.error) || String(exhibitorsData) || 'Failed to load exhibitors');
            if (!visitorsResp.ok) throw new Error((visitorsData && visitorsData.error) || String(visitorsData) || 'Failed to load visitors');

            setDashboardOrgs(Array.isArray(orgsData) ? orgsData : []);
            setDashboardEvents(Array.isArray(eventsData) ? eventsData : []);
            setDashboardExhibitors(Array.isArray(exhibitorsData) ? exhibitorsData : []);
            setDashboardVisitors(Array.isArray(visitorsData) ? visitorsData : []);
        } catch (err) {
            console.error('Failed to load dashboard data', err);
            setDashboardError(err?.message || String(err));
            setDashboardOrgs([]);
            setDashboardEvents([]);
            setDashboardExhibitors([]);
            setDashboardVisitors([]);
        } finally {
            setDashboardLoading(false);
        }
    };

    const handleNavigate = (screen) => {
        setActiveScreen(screen);
        localStorage.setItem('activeScreen', screen);
    };

    useEffect(() => {
        if (activeScreen === 'dashboard' && userType !== 'exhibitor') {
            loadDashboardData();
        }
    }, [activeScreen, userType]);

    const renderContent = () => {
        if (userType === 'exhibitor') {
            switch (activeScreen) {
                case 'leads':
                    return <LeadManagement onNavigate={handleNavigate} />;
                case 'scanner':
                    return <Scanner onNavigate={handleNavigate} />;
                case 'events':
                    return <ExhibitorEventManagement onNavigate={handleNavigate} />;
                case 'analytics':
                    return <ExhibitorAnalytics onNavigate={handleNavigate} />;
                case 'billing':
                    return <BillingManagement onNavigate={handleNavigate} />;
                case 'users':
                    return <UserManagement onNavigate={handleNavigate} />;
                default:
                    return <ExhibitorDashboardContent onNavigate={handleNavigate} />;
            }
        }

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
            case 'scan-print':
                return <ScanPrint />;
            case 'communication':
                return <CommunicationControl />;
            case 'logs':
                return <UserLogsAudit />;
            case 'analytics':
                return <AnalyticsAPI />;
            case 'compliance':
                return <CompliancePrivacy />;
            case 'support':
                return <SupportManagement />;
            default:
                const isOrganization = userType === 'organization';
                const activeTenantsCount = dashboardOrgs.length;
                const activeEventsCount = dashboardEvents.length;
                const totalExhibitorsCount = dashboardExhibitors.length;
                const totalVisitorsCount = dashboardVisitors.length;

                const sortedEvents = [...dashboardEvents].sort((a, b) => {
                    const ad = a?.created_at ? new Date(a.created_at).getTime() : 0;
                    const bd = b?.created_at ? new Date(b.created_at).getTime() : 0;
                    return bd - ad;
                });
                const topLiveEvents = sortedEvents.slice(0, 3);
                const recentEvents = sortedEvents.slice(0, 4);

                return (
                    <div className="dashboard-container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }} className="fade-in">
                            <div>
                                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>
                                    {isOrganization ? 'Dashboard' : 'Master Dashboard'}
                                </h1>
                                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
                                    {isOrganization ? 'Overview of your event management' : 'Global overview of your event management platform'}
                                </p>
                            </div>
                            <div style={{ background: 'rgba(37, 99, 235, 0.08)', padding: '8px 16px', borderRadius: '12px', color: '#2563eb', fontWeight: 600, fontSize: '14px' }}>
                                Good Morning {localStorage.getItem('organizationName') || 'User'}....!
                            </div>
                        </div>

                        <div className="stats-grid fade-in">
                            <StatsCard label="Active Tenants" value={String(activeTenantsCount)} change={dashboardLoading ? 'Loading...' : undefined} icon={Building2} colorClass="text-blue-500" customClass="stat-card-blue" />
                            <StatsCard label="Active Events" value={String(activeEventsCount)} change={dashboardLoading ? 'Loading...' : undefined} icon={Calendar} colorClass="text-emerald-500" customClass="stat-card-green" />
                            <StatsCard label="Total Exhibitors" value={String(totalExhibitorsCount)} change={dashboardLoading ? 'Loading...' : undefined} icon={ImageIcon} colorClass="text-purple-500" customClass="stat-card-purple" />
                            <StatsCard label="Registered Visitors" value={String(totalVisitorsCount)} change={dashboardLoading ? 'Loading...' : undefined} icon={Users} colorClass="text-blue-400" customClass="stat-card-blue" />
                            <StatsCard label="Leads Captured" value="18,429" change="+892 today" icon={MousePointer2} colorClass="text-orange-500" customClass="stat-card-orange" />
                            <StatsCard label="Messages Sent" value="45,621" change="+1,234 today" icon={MessageSquare} colorClass="text-cyan-500" customClass="stat-card-cyan" />
                            <StatsCard label="Revenue (MTD)" value="₹12.4L" change="+18% vs last month" icon={IndianRupee} colorClass="text-emerald-600" customClass="stat-card-emerald" />
                            <StatsCard label="Active Users" value="892" change="Online now" icon={UserCheck} colorClass="text-teal-500" customClass="stat-card-teal" />
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
                                    {dashboardError ? (
                                        <div style={{ padding: '20px', border: '1px solid #fee2e2', borderRadius: '16px', background: '#fff1f2', color: '#991b1b', fontWeight: 600 }}>
                                            {dashboardError}
                                        </div>
                                    ) : dashboardLoading ? (
                                        <div style={{ padding: '20px', border: '1px solid #f1f5f9', borderRadius: '16px', color: '#64748b', fontWeight: 600 }}>
                                            Loading...
                                        </div>
                                    ) : topLiveEvents.length === 0 ? (
                                        <div style={{ padding: '20px', border: '1px solid #f1f5f9', borderRadius: '16px', color: '#64748b', fontWeight: 600 }}>
                                            No events yet
                                        </div>
                                    ) : topLiveEvents.map((event, idx) => (
                                        <div key={idx} style={{ padding: '20px', border: '1px solid #f1f5f9', borderRadius: '16px', position: 'relative', transition: 'all 0.2s' }} className="hover-lift">
                                            <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                                                <span className={`badge badge-${String(event.status || 'draft').toLowerCase()}`}>{event.status || 'Draft'}</span>
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>{event.event_name || event.name || ''}</div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>{event.organizer_name || event.organizer_email || '-'}</div>
                                            <div style={{ display: 'flex', gap: '40px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Activity size={14} color="#64748b" />
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '13px' }}>-</div>
                                                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>Leads</div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <ImageIcon size={14} color="#64748b" />
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '13px' }}>-</div>
                                                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>Exhibitors</div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Users size={14} color="#64748b" />
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '13px' }}>-</div>
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

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                                    {[
                                        { type: 'Visitor QR', count: '2,134', status: 'Good', color: '#10b981' },
                                        { type: 'Stall QR', count: '1,856', status: 'Good', color: '#10b981' },
                                        { type: 'OCR', count: '892', status: 'Warning', color: '#f59e0b' },
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
                                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Lead Captures</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                        <div>
                                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>1,00,000</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>QR Scan</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>5,00,000</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>OCR / card</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>10,000</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '16px' }}>Manual</div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Conversion Rate</div>
                                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb' }}>34.5%</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card fade-in" style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '8px', borderRadius: '10px' }}>
                                        <Activity size={20} color="#2563eb" />
                                    </div>
                                    <div>
                                        <span style={{ fontWeight: 700, fontSize: '16px', color: '#1e293b' }}>Filter Organization Activity</span>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Real-time activity by organization</p>
                                    </div>
                                </div>
                                <select
                                    value={selectedOrg}
                                    onChange={(e) => setSelectedOrg(e.target.value)}
                                    style={{ border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', color: '#475569', fontWeight: 500, background: 'white', cursor: 'pointer' }}
                                >
                                    <option value="all">All Organizations</option>
                                    {dashboardOrgs.map((org, idx) => (
                                        <option key={idx} value={org.id || idx}>
                                            {org.organization_name || org.email || `Organization ${idx + 1}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                                {[
                                    { label: 'Events', value: '32', customClass: 'activity-pink', textColor: '#ef4444' },
                                    { label: 'Exhibitors', value: '500', customClass: 'activity-gray', textColor: '#475569' },
                                    { label: 'Stalls', value: '1000', customClass: 'activity-orange', textColor: '#f59e0b' },
                                    { label: 'Visitors', value: '15000', customClass: 'activity-red', textColor: '#dc2626' },
                                    { label: 'Revenue', value: '10,00,000', customClass: 'activity-green', textColor: '#16a34a', isDropdown: true }
                                ].map((item, idx) => (
                                    <div key={idx} className={`hover-lift ${item.customClass}`} style={{ padding: '24px 16px', borderRadius: '12px', textAlign: 'center', border: '1px solid transparent' }}>
                                        {item.isDropdown ? (
                                            <div>
                                                <select style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '26px', fontWeight: 800, color: item.textColor, textAlign: 'center', outline: 'none', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}>
                                                    <option value="1000000">10,00,000</option>
                                                    <option value="500000">5,00,000</option>
                                                    <option value="2000000">20,00,000</option>
                                                </select>
                                                <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.02em', marginTop: '4px' }}>{item.label}</div>
                                            </div>
                                        ) : (
                                            <>
                                                <div style={{ fontSize: '26px', fontWeight: 800, color: item.textColor, marginBottom: '4px' }}>{item.value}</div>
                                                <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{item.label}</div>
                                            </>
                                        )}
                                    </div>
                                ))}
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
                                        <option>Weekly</option>
                                        <option>Monthly</option>
                                    </select>
                                </div>
                                <div style={{ height: '280px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 800]} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                            <Line type="monotone" dataKey="organizations" stroke="#2563eb" strokeWidth={2} dot={false} />
                                            <Line type="monotone" dataKey="exhibitors" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                                            <Line type="monotone" dataKey="visitors" stroke="#10b981" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }}></div> Organizations
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }}></div> Exhibitors
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div> Visitors
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
                                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>WhatsApp Sent Today</div>
                                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>15,420</div>
                                    </div>
                                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Last 15 min</div>
                                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>342</div>
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
                                    <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>Not Active</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px', marginBottom: '24px' }} className="fade-in">
                            <div className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '8px', borderRadius: '10px' }}>
                                            <Calendar size={18} color="#2563eb" />
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: '16px' }}>Recent Events</span>
                                    </div>
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
                                            {dashboardLoading ? (
                                                <tr>
                                                    <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Loading...</td>
                                                </tr>
                                            ) : recentEvents.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>No events yet</td>
                                                </tr>
                                            ) : recentEvents.map((row, idx) => {
                                                const status = row.status || 'Draft';
                                                const created = row.created_at ? new Date(row.created_at) : null;
                                                const dateText = created ? created.toLocaleDateString() : '';
                                                return (
                                                    <tr key={idx}>
                                                        <td style={{ fontWeight: 600 }}>{row.event_name || row.name || ''}</td>
                                                        <td style={{ fontSize: '13px', color: '#64748b' }}>{row.organizer_name || row.organizer_email || '-'}</td>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: String(status).toLowerCase() === 'active' ? '#10b981' : '#f59e0b' }}></div>
                                                                <span style={{ fontSize: '12px', fontWeight: 600, color: String(status).toLowerCase() === 'active' ? '#10b981' : '#f59e0b' }}>{status}</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ fontWeight: 600 }}>-</td>
                                                        <td style={{ fontWeight: 600 }}>-</td>
                                                        <td style={{ fontSize: '12px', color: '#94a3b8' }}>{dateText}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                                    <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '8px', borderRadius: '10px' }}>
                                        <Activity size={18} color="#2563eb" />
                                    </div>
                                    <span style={{ fontWeight: 700, fontSize: '16px' }}>System Health</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {[
                                        { label: 'API Gateway', status: '99.99%', color: '#10b981' },
                                        { label: 'Database', status: '99.95%', color: '#10b981' },
                                        { label: 'WhatsApp Service', status: '99.90%', color: '#10b981' },
                                        { label: 'Email Service', status: '98.50%', color: '#f59e0b' },
                                        { label: 'SMS Gateway', status: '99.85%', color: '#10b981' }
                                    ].map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '12px', height: '12px', borderRadius: '4px', border: `1px solid ${item.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: item.color }}></div>
                                                </div>
                                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{item.label}</span>
                                            </div>
                                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>{item.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '24px' }} className="fade-in">
                            <div className="card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <ShieldCheck size={18} color="#10b981" />
                                    <span style={{ fontWeight: 700, fontSize: '14px' }}>Compliance & Trust</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>Consent Rate</span>
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>94.5%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>Complaints</span>
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>3</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>Deletion Requests</span>
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>12</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>GST Failures</span>
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>8</span>
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <Activity size={18} color="#2563eb" />
                                    <span style={{ fontWeight: 700, fontSize: '14px' }}>Platform Health</span>
                                    <span style={{ fontSize: '10px', color: '#10b981', background: '#f0fdf4', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', fontWeight: 600 }}>(Operational)</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                        <span style={{ color: '#64748b' }}>Active Users</span>
                                        <span style={{ fontWeight: 700 }}>1,847</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                        <span style={{ color: '#64748b' }}>API Response</span>
                                        <span style={{ fontWeight: 700 }}>0.23s</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                        <span style={{ color: '#64748b' }}>Error Rate</span>
                                        <span style={{ fontWeight: 700 }}>0.02%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                        <span style={{ color: '#64748b' }}>Sync Backlog</span>
                                        <span style={{ fontWeight: 700 }}>234</span>
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <IndianRupee size={18} color="#10b981" />
                                    <span style={{ fontWeight: 700, fontSize: '14px' }}>Revenue Signals</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                        <span style={{ color: '#64748b' }}>Active Paid Tenants</span>
                                        <span style={{ fontWeight: 700 }}>47</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                        <span style={{ color: '#64748b' }}>Usage Mismatch</span>
                                        <span style={{ fontWeight: 700 }}>3</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                        <span style={{ color: '#64748b' }}>Unbilled Events</span>
                                        <span style={{ fontWeight: 700 }}>2</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                        <span style={{ color: '#64748b' }}>Government Events</span>
                                        <span style={{ fontWeight: 700 }}>2</span>
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <MousePointer2 size={18} color="#f59e0b" />
                                    <span style={{ fontWeight: 700, fontSize: '14px' }}>Quick Actions</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div
                                        onClick={() => handleNavigate('events')}
                                        style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', border: '1px solid #f1f5f9', transition: 'all 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
                                    >
                                        <Plus size={14} color="#64748b" />
                                        <div style={{ fontSize: '9px', fontWeight: 600, color: '#64748b', marginTop: '4px' }}>Create Event</div>
                                    </div>
                                    <div
                                        onClick={() => handleNavigate('tenants')}
                                        style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', border: '1px solid #f1f5f9', transition: 'all 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
                                    >
                                        <Building2 size={14} color="#64748b" />
                                        <div style={{ fontSize: '9px', fontWeight: 600, color: '#64748b', marginTop: '4px' }}>Add Tenant</div>
                                    </div>
                                    <div
                                        onClick={() => handleNavigate('users')}
                                        style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', border: '1px solid #f1f5f9', transition: 'all 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
                                    >
                                        <UserPlus size={14} color="#64748b" />
                                        <div style={{ fontSize: '9px', fontWeight: 600, color: '#64748b', marginTop: '4px' }}>Invite User</div>
                                    </div>
                                    <div
                                        onClick={() => handleNavigate('exhibitors')}
                                        style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', border: '1px solid #f1f5f9', transition: 'all 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
                                    >
                                        <ImageIcon size={14} color="#64748b" />
                                        <div style={{ fontSize: '9px', fontWeight: 600, color: '#64748b', marginTop: '4px' }}>New Exhibitor</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card fade-in" style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <AlertTriangle size={20} color="#f59e0b" />
                                <span style={{ fontWeight: 700, fontSize: '16px' }}>Recent Alerts</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[
                                    { text: 'High WhatsApp usage for TechCorp India - 85% quota used', time: '5 min ago', color: '#f59e0b', bg: '#fffaf0' },
                                    { text: 'Payment failed for StartupHub subscription renewal', time: '12 min ago', color: '#f43f5e', bg: '#fef2f2' },
                                    { text: 'New tenant registration: EventPro Solutions', time: '1 hour ago', color: '#2563eb', bg: '#f0f7ff' },
                                    { text: 'MSME Connect event successfully published', time: '2 hours ago', color: '#10b981', bg: '#f0fdf4' }
                                ].map((alert, idx) => (
                                    <div key={idx} style={{ background: alert.bg, border: '1px solid #f1f5f9', padding: '12px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: alert.color }}></div>
                                            <span style={{ fontSize: '13px', color: '#475569' }}>{alert.text}</span>
                                        </div>
                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{alert.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <Layout activeScreen={activeScreen} onNavigate={handleNavigate} userType={userType} onLogout={onLogout}>
            {renderContent()}
        </Layout>
    );
};

export default Index;
