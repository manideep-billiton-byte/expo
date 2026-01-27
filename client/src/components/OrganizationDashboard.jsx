import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import {
    Calendar, Users, Building2, IndianRupee, MapPin,
    Sparkles, AlertCircle, ChevronRight, TrendingUp
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

// Sample revenue data for the chart
const revenueData = [
    { name: 'Jan', revenue: 35000 },
    { name: 'Feb', revenue: 42000 },
    { name: 'Mar', revenue: 55000 },
    { name: 'Apr', revenue: 48000 },
    { name: 'May', revenue: 62000 },
    { name: 'Jun', revenue: 58000 },
    { name: 'Jul', revenue: 72000 },
    { name: 'Aug', revenue: 85000 },
    { name: 'Sep', revenue: 78000 },
    { name: 'Oct', revenue: 95000 },
    { name: 'Nov', revenue: 110000 },
    { name: 'Dec', revenue: 125000 },
];

const OrganizationDashboard = ({ onNavigate }) => {
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [exhibitors, setExhibitors] = useState([]);
    const [visitors, setVisitors] = useState([]);
    const [error, setError] = useState('');

    const organizationId = localStorage.getItem('organizationId');
    const organizationName = localStorage.getItem('organizationName') || 'Organizer';

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        setError('');
        try {
            const [eventsResp, exhibitorsResp, visitorsResp] = await Promise.all([
                apiFetch(`/api/events?organization_id=${organizationId}`),
                apiFetch(`/api/exhibitors?organization_id=${organizationId}`),
                apiFetch(`/api/visitors?organization_id=${organizationId}`)
            ]);

            const parseResp = async (resp) => {
                const txt = await resp.clone().text();
                try { return JSON.parse(txt); } catch (e) { return txt; }
            };

            const [eventsData, exhibitorsData, visitorsData] = await Promise.all([
                parseResp(eventsResp),
                parseResp(exhibitorsResp),
                parseResp(visitorsResp)
            ]);

            if (eventsResp.ok) setEvents(Array.isArray(eventsData) ? eventsData : []);
            if (exhibitorsResp.ok) setExhibitors(Array.isArray(exhibitorsData) ? exhibitorsData : []);
            if (visitorsResp.ok) setVisitors(Array.isArray(visitorsData) ? visitorsData : []);
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
            setError(err?.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats
    const totalEvents = events.length;
    const totalExhibitors = exhibitors.length;
    const totalVisitors = visitors.length;
    const totalRevenue = '₹295k'; // Sample data - replace with actual calculation

    // Calculate percentage changes (sample data)
    const eventsChange = '+12%';
    const exhibitorsChange = '+8%';
    const visitorsChange = '+23%';
    const revenueChange = '+18%';

    // Stall occupancy data
    const bookedStalls = 445;
    const availableStalls = 85;
    const totalStalls = bookedStalls + availableStalls;
    const occupancyPercent = Math.round((bookedStalls / totalStalls) * 100);

    // Get event status
    const getEventStatus = (event) => {
        const now = new Date();
        const startDate = event.start_date ? new Date(event.start_date) : null;
        const endDate = event.end_date ? new Date(event.end_date) : null;

        if (!startDate) return 'upcoming';
        if (startDate > now) return 'upcoming';
        if (endDate && endDate < now) return 'completed';
        return 'ongoing';
    };

    // Sort events by date
    const sortedEvents = [...events].sort((a, b) => {
        const dateA = a.start_date ? new Date(a.start_date) : new Date(a.created_at);
        const dateB = b.start_date ? new Date(b.start_date) : new Date(b.created_at);
        return dateB - dateA;
    }).slice(0, 3);

    // Recent activity (sample data)
    const recentActivity = [
        { icon: '💼', text: 'TechVision Solutions registered for Tech Expo 2025', time: '2 hours ago' },
        { icon: '💰', text: 'Payment received from AutoMax Industries - ₹1,23,900', time: '3 hours ago' },
        { icon: '👥', text: '45 new visitor registrations for Auto World Exhibition', time: '1 day ago' },
        { icon: '📅', text: 'Fashion Week Spring 2025 event created', time: '2 days ago' }
    ];

    // Pending payments (sample data)
    const pendingPayments = 112100;

    return (
        <div className="org-dashboard">
            {/* Header */}
            <div className="org-dashboard-header fade-in">
                <div>
                    <div className="welcome-badge">
                        <Sparkles size={16} />
                        <span>Welcome back!</span>
                    </div>
                    <h1 className="org-dashboard-title">Dashboard</h1>
                    <p className="org-dashboard-subtitle">Here's an overview of your expo management.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="org-stats-grid fade-in">
                <div className="org-stat-card">
                    <div className="org-stat-header">
                        <span className="org-stat-label">Total Events</span>
                        <div className="org-stat-icon org-stat-icon-blue">
                            <Calendar size={18} />
                        </div>
                    </div>
                    <div className="org-stat-value">{loading ? '...' : totalEvents}</div>
                    <div className="org-stat-change positive">
                        <TrendingUp size={12} />
                        <span>{eventsChange} vs last month</span>
                    </div>
                </div>

                <div className="org-stat-card">
                    <div className="org-stat-header">
                        <span className="org-stat-label">Total Exhibitors</span>
                        <div className="org-stat-icon org-stat-icon-green">
                            <Building2 size={18} />
                        </div>
                    </div>
                    <div className="org-stat-value">{loading ? '...' : totalExhibitors}</div>
                    <div className="org-stat-change positive">
                        <TrendingUp size={12} />
                        <span>{exhibitorsChange} vs last month</span>
                    </div>
                </div>

                <div className="org-stat-card">
                    <div className="org-stat-header">
                        <span className="org-stat-label">Total Visitors</span>
                        <div className="org-stat-icon org-stat-icon-purple">
                            <Users size={18} />
                        </div>
                    </div>
                    <div className="org-stat-value">{loading ? '...' : totalVisitors.toLocaleString()}</div>
                    <div className="org-stat-change positive">
                        <TrendingUp size={12} />
                        <span>{visitorsChange} vs last month</span>
                    </div>
                </div>

                <div className="org-stat-card">
                    <div className="org-stat-header">
                        <span className="org-stat-label">Total Revenue</span>
                        <div className="org-stat-icon org-stat-icon-teal">
                            <IndianRupee size={18} />
                        </div>
                    </div>
                    <div className="org-stat-value">{totalRevenue}</div>
                    <div className="org-stat-change positive">
                        <TrendingUp size={12} />
                        <span>{revenueChange} vs last month</span>
                    </div>
                </div>
            </div>

            {/* Pending Payments Alert */}
            <div className="pending-payments-alert fade-in">
                <div className="pending-payments-content">
                    <div className="pending-payments-icon">
                        <AlertCircle size={20} />
                    </div>
                    <div className="pending-payments-text">
                        <span>You have <strong>₹{pendingPayments.toLocaleString()}</strong> in pending payments</span>
                        <p>2 invoices are overdue. Review billing section for details.</p>
                    </div>
                </div>
                <button className="pending-payments-btn" onClick={() => onNavigate('billing')}>
                    View Billing
                </button>
            </div>

            {/* Charts Section */}
            <div className="org-charts-grid fade-in">
                {/* Revenue Overview */}
                <div className="org-chart-card revenue-chart">
                    <div className="org-chart-header">
                        <div>
                            <h3 className="org-chart-title">Revenue Overview</h3>
                            <p className="org-chart-subtitle">Monthly revenue trends for the year</p>
                        </div>
                    </div>
                    <div className="org-chart-container">
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                                    tickFormatter={(value) => `₹${(value / 1000)}k`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                        padding: '12px 16px'
                                    }}
                                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#14b8a6"
                                    strokeWidth={3}
                                    fill="url(#revenueGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Stall Occupancy */}
                <div className="org-chart-card stall-occupancy">
                    <div className="org-chart-header">
                        <div>
                            <h3 className="org-chart-title">Stall Occupancy</h3>
                            <p className="org-chart-subtitle">Across all active events</p>
                        </div>
                    </div>
                    <div className="occupancy-chart-container">
                        <div className="donut-chart">
                            <svg viewBox="0 0 100 100" className="donut-svg">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke="#e2e8f0"
                                    strokeWidth="12"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke="#14b8a6"
                                    strokeWidth="12"
                                    strokeDasharray={`${occupancyPercent * 2.51} 251`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 50 50)"
                                    className="donut-progress"
                                />
                            </svg>
                            <div className="donut-center">
                                <span className="donut-percent">{occupancyPercent}%</span>
                                <span className="donut-label">Occupied</span>
                            </div>
                        </div>
                        <div className="occupancy-legend">
                            <div className="legend-item">
                                <span className="legend-dot booked"></span>
                                <span className="legend-text">Booked: {bookedStalls}</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot available"></span>
                                <span className="legend-text">Available: {availableStalls}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Events & Activity */}
            <div className="org-bottom-grid fade-in">
                {/* Recent Events */}
                <div className="org-card recent-events-card">
                    <div className="org-card-header">
                        <div>
                            <h3 className="org-card-title">Recent Events</h3>
                            <p className="org-card-subtitle">Your latest event activities</p>
                        </div>
                        <button className="view-all-btn" onClick={() => onNavigate('events')}>
                            View all
                        </button>
                    </div>
                    <div className="events-list">
                        {loading ? (
                            <div className="events-loading">Loading events...</div>
                        ) : sortedEvents.length === 0 ? (
                            <div className="events-empty">No events yet</div>
                        ) : (
                            sortedEvents.map((event, idx) => {
                                const status = getEventStatus(event);
                                const statusLabels = {
                                    upcoming: 'Upcoming',
                                    ongoing: 'Ongoing',
                                    completed: 'Completed'
                                };
                                return (
                                    <div key={idx} className="event-item">
                                        <div className="event-icon">
                                            <Calendar size={18} />
                                        </div>
                                        <div className="event-details">
                                            <h4 className="event-name">{event.event_name || event.name || 'Untitled Event'}</h4>
                                            <div className="event-meta">
                                                <span className="event-location">
                                                    <MapPin size={12} />
                                                    {event.venue || 'Venue TBD'}
                                                </span>
                                                <span className="event-stalls">
                                                    <Building2 size={12} />
                                                    {event.stall_count || 0}/{event.total_stalls || 150} stalls
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`event-status-badge ${status}`}>
                                            {statusLabels[status]}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="org-card recent-activity-card">
                    <div className="org-card-header">
                        <div>
                            <h3 className="org-card-title">Recent Activity</h3>
                            <p className="org-card-subtitle">Latest updates and actions</p>
                        </div>
                    </div>
                    <div className="activity-list">
                        {recentActivity.map((activity, idx) => (
                            <div key={idx} className="activity-item">
                                <div className="activity-icon">
                                    {activity.icon}
                                </div>
                                <div className="activity-content">
                                    <p className="activity-text">{activity.text}</p>
                                    <span className="activity-time">{activity.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .org-dashboard {
                    padding: 0;
                }

                .org-dashboard-header {
                    margin-bottom: 24px;
                }

                .welcome-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
                    color: #059669;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                    margin-bottom: 12px;
                }

                .org-dashboard-title {
                    font-size: 28px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 4px 0;
                }

                .org-dashboard-subtitle {
                    font-size: 14px;
                    color: #64748b;
                    margin: 0;
                }

                .org-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    margin-bottom: 24px;
                }

                .org-stat-card {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                    border: 1px solid #f1f5f9;
                    transition: all 0.2s ease;
                }

                .org-stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px -5px rgba(0,0,0,0.08);
                }

                .org-stat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 16px;
                }

                .org-stat-label {
                    font-size: 13px;
                    font-weight: 500;
                    color: #64748b;
                }

                .org-stat-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .org-stat-icon-blue {
                    background: #eff6ff;
                    color: #3b82f6;
                }

                .org-stat-icon-green {
                    background: #f0fdf4;
                    color: #22c55e;
                }

                .org-stat-icon-purple {
                    background: #faf5ff;
                    color: #a855f7;
                }

                .org-stat-icon-teal {
                    background: #f0fdfa;
                    color: #14b8a6;
                }

                .org-stat-value {
                    font-size: 32px;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 8px;
                    line-height: 1;
                }

                .org-stat-change {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 12px;
                    font-weight: 500;
                }

                .org-stat-change.positive {
                    color: #22c55e;
                }

                .org-stat-change.negative {
                    color: #ef4444;
                }

                /* Pending Payments Alert */
                .pending-payments-alert {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                    border-radius: 16px;
                    padding: 16px 24px;
                    margin-bottom: 24px;
                    border: 1px solid #fcd34d;
                }

                .pending-payments-content {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .pending-payments-icon {
                    width: 44px;
                    height: 44px;
                    background: white;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #f59e0b;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                .pending-payments-text span {
                    font-size: 14px;
                    color: #92400e;
                }

                .pending-payments-text strong {
                    color: #78350f;
                }

                .pending-payments-text p {
                    font-size: 12px;
                    color: #a16207;
                    margin: 4px 0 0 0;
                }

                .pending-payments-btn {
                    background: #1e293b;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .pending-payments-btn:hover {
                    background: #0f172a;
                    transform: translateY(-1px);
                }

                /* Charts Grid */
                .org-charts-grid {
                    display: grid;
                    grid-template-columns: 1.6fr 1fr;
                    gap: 24px;
                    margin-bottom: 24px;
                }

                .org-chart-card {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                    border: 1px solid #f1f5f9;
                }

                .org-chart-header {
                    margin-bottom: 24px;
                }

                .org-chart-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 4px 0;
                }

                .org-chart-subtitle {
                    font-size: 13px;
                    color: #94a3b8;
                    margin: 0;
                }

                .org-chart-container {
                    height: 280px;
                }

                /* Donut Chart */
                .occupancy-chart-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding-top: 20px;
                }

                .donut-chart {
                    position: relative;
                    width: 200px;
                    height: 200px;
                    margin-bottom: 24px;
                }

                .donut-svg {
                    width: 100%;
                    height: 100%;
                }

                .donut-progress {
                    transition: stroke-dasharray 1s ease;
                }

                .donut-center {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                }

                .donut-percent {
                    display: block;
                    font-size: 36px;
                    font-weight: 700;
                    color: #1e293b;
                    line-height: 1;
                }

                .donut-label {
                    display: block;
                    font-size: 13px;
                    color: #94a3b8;
                    margin-top: 4px;
                }

                .occupancy-legend {
                    display: flex;
                    justify-content: center;
                    gap: 32px;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .legend-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                }

                .legend-dot.booked {
                    background: #14b8a6;
                }

                .legend-dot.available {
                    background: #e2e8f0;
                }

                .legend-text {
                    font-size: 13px;
                    color: #64748b;
                    font-weight: 500;
                }

                /* Bottom Grid */
                .org-bottom-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }

                .org-card {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                    border: 1px solid #f1f5f9;
                }

                .org-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 20px;
                }

                .org-card-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 4px 0;
                }

                .org-card-subtitle {
                    font-size: 13px;
                    color: #94a3b8;
                    margin: 0;
                }

                .view-all-btn {
                    background: none;
                    border: none;
                    color: #3b82f6;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 0;
                    transition: color 0.2s;
                }

                .view-all-btn:hover {
                    color: #2563eb;
                }

                /* Events List */
                .events-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .events-loading,
                .events-empty {
                    padding: 32px;
                    text-align: center;
                    color: #94a3b8;
                    font-size: 14px;
                }

                .event-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 12px;
                    transition: all 0.2s;
                }

                .event-item:hover {
                    background: #f1f5f9;
                }

                .event-icon {
                    width: 44px;
                    height: 44px;
                    background: white;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #3b82f6;
                    border: 1px solid #e2e8f0;
                    flex-shrink: 0;
                }

                .event-details {
                    flex: 1;
                    min-width: 0;
                }

                .event-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: #1e293b;
                    margin: 0 0 6px 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .event-meta {
                    display: flex;
                    gap: 16px;
                }

                .event-location,
                .event-stalls {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 12px;
                    color: #64748b;
                }

                .event-status-badge {
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    flex-shrink: 0;
                }

                .event-status-badge.upcoming {
                    background: #dbeafe;
                    color: #2563eb;
                }

                .event-status-badge.ongoing {
                    background: #d1fae5;
                    color: #059669;
                }

                .event-status-badge.completed {
                    background: #f1f5f9;
                    color: #64748b;
                }

                /* Activity List */
                .activity-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .activity-item {
                    display: flex;
                    gap: 12px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #f1f5f9;
                }

                .activity-item:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }

                .activity-icon {
                    width: 36px;
                    height: 36px;
                    background: #f8fafc;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    flex-shrink: 0;
                }

                .activity-content {
                    flex: 1;
                }

                .activity-text {
                    font-size: 13px;
                    color: #334155;
                    margin: 0 0 4px 0;
                    line-height: 1.5;
                }

                .activity-time {
                    font-size: 12px;
                    color: #94a3b8;
                }

                /* Responsive */
                @media (max-width: 1200px) {
                    .org-stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .org-charts-grid {
                        grid-template-columns: 1fr;
                    }

                    .org-bottom-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .org-stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .pending-payments-alert {
                        flex-direction: column;
                        gap: 16px;
                        text-align: center;
                    }

                    .pending-payments-content {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
};

export default OrganizationDashboard;
