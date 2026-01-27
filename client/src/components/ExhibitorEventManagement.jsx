import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Clock, Users, BarChart3, TrendingUp, Search, Download, Plus, MapPin, ChevronRight, MoreHorizontal, X, CreditCard, Building2, ArrowLeft, Check } from 'lucide-react';
import { apiFetch } from '../utils/api';

const ExhibitorEventManagement = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [registering, setRegistering] = useState(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Multi-step registration state
    const [registrationStep, setRegistrationStep] = useState(0); // 0: event list, 1: stall selection, 2: payment
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedStalls, setSelectedStalls] = useState([]); // Changed to array for multiple selection
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');

    // Stall categories with pricing
    const stallCategories = [
        { id: 'basic', name: 'Basic', range: 'Stall #1 - #40', price: 25000, color: '#3b82f6' },
        { id: 'standard', name: 'Standard', range: 'Stall #41 - #70', price: 50000, color: '#10b981' },
        { id: 'premium', name: 'Premium', range: 'Stall #71 - #90', price: 85000, color: '#8b5cf6' },
        { id: 'corner', name: 'Corner', range: 'Stall #91 - #100', price: 125000, color: '#f59e0b' }
    ];

    // Generate stall layout (10x10 grid)
    const generateStalls = () => {
        const stalls = [];
        const occupiedStalls = [3, 7, 8, 16, 22, 28, 29, 35, 36, 48, 50, 63, 64, 72, 78, 82, 86, 92, 93, 97]; // Sample occupied stalls

        for (let i = 1; i <= 100; i++) {
            let category = 'basic';
            let color = '#3b82f6';

            if (i >= 41 && i <= 70) {
                category = 'standard';
                color = '#10b981';
            } else if (i >= 71 && i <= 90) {
                category = 'premium';
                color = '#8b5cf6';
            } else if (i >= 91) {
                category = 'corner';
                color = '#f59e0b';
            }

            stalls.push({
                id: i,
                category,
                color,
                occupied: occupiedStalls.includes(i),
                price: stallCategories.find(c => c.id === category)?.price || 25000
            });
        }
        return stalls;
    };

    const [stalls] = useState(generateStalls());

    const events = [
        { name: 'Tech Innovation Summit 2024', status: 'Completed', location: 'Mumbai Convention Centre', date: 'Feb 20-22, 2024', leads: 156, visitors: 943, rating: 4.8, roi: '+285%' },
        { name: 'Digital Marketing Expo', status: 'Completed', location: 'Mumbai Convention Centre', date: 'Feb 20-22, 2024', leads: 98, visitors: 567, rating: 4.5, roi: '+210%' },
        { name: 'Startup India Conference', status: 'Completed', location: 'Delhi Trade Fair Ground', date: 'Jan 10-12, 2024', leads: 124, visitors: 789, rating: 4.6, roi: '+245%' },
        { name: 'AI & ML World Congress', status: 'Upcoming', location: 'Hyderabad Tech Park', date: 'Apr 5-7, 2024', leads: 0, visitors: 0, rating: 0, roi: '-' },
        { name: 'Cloud Computing Summit', status: 'Upcoming', location: 'Chennai Trade Centre', date: 'May 12-14, 2024', leads: 0, visitors: 0, rating: 0, roi: '-' },
    ];

    // Fetch upcoming events from the same organization
    const fetchUpcomingEvents = async () => {
        setLoadingEvents(true);
        try {
            // Get current user data from localStorage
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const organizationId = userData.organizationId;

            if (!organizationId) {
                console.error('No organization ID found in user data');
                setUpcomingEvents([]);
                return;
            }

            console.log('Fetching upcoming events for organization:', organizationId);

            // Fetch upcoming events for this organization
            const response = await apiFetch(`/api/exhibitors/upcoming-events/${organizationId}`);
            const events = await response.json();
            console.log('Fetched events:', events);
            setUpcomingEvents(events);
        } catch (error) {
            console.error('Error fetching upcoming events:', error);
            setUpcomingEvents([]);
        } finally {
            setLoadingEvents(false);
        }
    };

    // Handle register button click
    const handleRegisterClick = () => {
        setShowModal(true);
        setRegistrationStep(0);
        setSelectedEvent(null);
        setSelectedStalls([]); // Reset to empty array
        fetchUpcomingEvents();
    };

    // Handle event selection - move to stall selection
    const handleEventSelect = (event) => {
        setSelectedEvent(event);
        setSelectedStalls([]); // Reset selection when changing events
        setRegistrationStep(1);
    };

    // Handle stall selection (toggle for multiple selection)
    const handleStallSelect = (stall) => {
        if (stall.occupied) return;

        setSelectedStalls(prev => {
            const isSelected = prev.some(s => s.id === stall.id);
            if (isSelected) {
                // Remove if already selected
                return prev.filter(s => s.id !== stall.id);
            } else {
                // Add to selection
                return [...prev, stall];
            }
        });
    };

    // Check if a stall is selected
    const isStallSelected = (stallId) => {
        return selectedStalls.some(s => s.id === stallId);
    };

    // Calculate total price of selected stalls
    const calculateSubtotal = () => {
        return selectedStalls.reduce((sum, stall) => sum + stall.price, 0);
    };

    // Calculate GST (18%)
    const calculateGST = () => {
        return Math.round(calculateSubtotal() * 0.18);
    };

    // Calculate total with GST
    const calculateTotal = () => {
        return calculateSubtotal() + calculateGST();
    };

    // Handle proceed to payment
    const handleProceedToPayment = () => {
        if (selectedStalls.length === 0) {
            alert('Please select at least one stall');
            return;
        }
        setRegistrationStep(2);
    };

    // Handle back button
    const handleBack = () => {
        if (registrationStep === 2) {
            setRegistrationStep(1);
        } else if (registrationStep === 1) {
            setRegistrationStep(0);
            setSelectedEvent(null);
            setSelectedStalls([]);
        }
    };

    // Handle close modal
    const handleCloseModal = () => {
        setShowModal(false);
        setRegistrationStep(0);
        setSelectedEvent(null);
        setSelectedStalls([]);
    };

    // Handle final registration with payment
    const handleFinalRegister = async () => {
        if (!selectedEvent || selectedStalls.length === 0) return;

        setRegistering(selectedEvent.id);
        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const exhibitorId = userData.id;

            if (!exhibitorId) {
                alert('Please log in to register for events');
                return;
            }

            const response = await apiFetch('/api/exhibitors/register-event', {
                method: 'POST',
                body: JSON.stringify({
                    exhibitorId,
                    eventId: selectedEvent.id,
                    stallNumbers: selectedStalls.map(s => s.id),
                    stallCategories: selectedStalls.map(s => s.category),
                    stallCount: selectedStalls.length,
                    subtotal: calculateSubtotal(),
                    gst: calculateGST(),
                    totalAmount: calculateTotal(),
                    paymentMethod: selectedPaymentMethod
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to register for event');
            }

            if (data.success) {
                setSuccessMessage(`Successfully registered for ${selectedEvent.event_name} with ${selectedStalls.length} stall(s)!`);
                setShowSuccessPopup(true);
                handleCloseModal();

                setTimeout(() => {
                    setShowSuccessPopup(false);
                }, 3000);
            }
        } catch (error) {
            console.error('Error registering for event:', error);
            alert(error.message || 'Failed to register for event. Please try again.');
        } finally {
            setRegistering(null);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'TBA';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div style={{ padding: '0px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>Event Management</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Track your exhibition history and upcoming events</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={handleRegisterClick}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563eb', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: 'white', cursor: 'pointer' }}
                    >
                        <Plus size={16} />
                        Register New Event
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {[
                    { label: 'Total Events', value: '12', icon: Calendar, color: '#2563eb' },
                    { label: 'Completed', value: '10', icon: CheckCircle2, color: '#10b981' },
                    { label: 'Upcoming', value: '2', icon: Clock, color: '#f59e0b' },
                    { label: 'Total Leads', value: '1,245', icon: Users, color: '#0ea5e9' }
                ].map((stat, idx) => (
                    <div key={idx} className="card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{stat.label}</div>
                                <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', marginTop: '4px' }}>{stat.value}</div>
                            </div>
                            <div style={{ background: `${stat.color}15`, padding: '10px', borderRadius: '10px' }}>
                                <stat.icon size={20} color={stat.color} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '10px' }}>
                            <TrendingUp size={20} color="#10b981" />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Performance Overview</h3>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                    {[
                        { label: 'Average Leads per Event', value: '124', change: '+18%' },
                        { label: 'Average Visitors', value: '766', change: '+22%' },
                        { label: 'Average Rating', value: '4.6', change: '+0.3' },
                        { label: 'Total Revenue', value: '₹24,50,000', change: '+45%' }
                    ].map((item, idx) => (
                        <div key={idx} style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>{item.label}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>{item.value}</div>
                                <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, background: '#f0fdf4', padding: '2px 8px', borderRadius: '6px' }}>{item.change}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Events History</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['All', 'Completed', 'Upcoming'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '6px 16px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    background: activeTab === tab ? '#f1f5f9' : 'white',
                                    color: activeTab === tab ? '#1e293b' : '#64748b',
                                    border: '1px solid #e2e8f0',
                                    cursor: 'pointer'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {events.filter(e => activeTab === 'All' || e.status === activeTab).map((event, idx) => (
                        <div key={idx} style={{ padding: '20px', border: '1px solid #f1f5f9', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', border: '1px solid #e2e8f0' }}>
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: 700, fontSize: '16px', color: '#1e293b' }}>{event.name}</span>
                                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, background: event.status === 'Completed' ? '#f0fdf4' : '#fff7ed', color: event.status === 'Completed' ? '#10b981' : '#f59e0b' }}>{event.status}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {event.location}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {event.date}</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>{event.leads}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>Leads</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>{event.visitors}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>Visitors</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>★ {event.rating}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>Rating</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>{event.roi}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>ROI</div>
                                </div>
                                <button style={{ padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    View Details <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal for Registration Flow */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        maxWidth: registrationStep === 0 ? '800px' : '900px',
                        width: '95%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        position: 'relative'
                    }}>
                        <button
                            onClick={handleCloseModal}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#64748b'
                            }}
                        >
                            <X size={24} />
                        </button>

                        {/* Step 0: Event Selection */}
                        {registrationStep === 0 && (
                            <>
                                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                                    Register for Upcoming Events
                                </h2>
                                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
                                    Select an event to register with one click. Your information will be auto-filled.
                                </p>

                                {loadingEvents ? (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                        Loading upcoming events...
                                    </div>
                                ) : upcomingEvents.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                        No upcoming events available from your organization.
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {upcomingEvents.map((event) => (
                                            <div
                                                key={event.id}
                                                style={{
                                                    padding: '20px',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <div style={{ flex: 1 }}>
                                                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                                                        {event.event_name}
                                                    </h3>
                                                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748b' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <MapPin size={14} />
                                                            {event.city}, {event.state}
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Clock size={14} />
                                                            {formatDate(event.start_date)} - {formatDate(event.end_date)}
                                                        </div>
                                                    </div>
                                                    {event.description && (
                                                        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px', lineHeight: '1.5' }}>
                                                            {event.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleEventSelect(event)}
                                                    style={{
                                                        padding: '10px 20px',
                                                        background: '#2563eb',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        fontSize: '14px',
                                                        fontWeight: 600,
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        marginLeft: '16px',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    Register Now
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Step 1: Stall Selection */}
                        {registrationStep === 1 && selectedEvent && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <Building2 size={24} color="#2563eb" />
                                    <div>
                                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                                            Register for Event
                                        </h2>
                                        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                                            Select your preferred stall from the layout below
                                        </p>
                                    </div>
                                </div>

                                {/* Progress Steps */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '14px' }}>1</div>
                                        <div style={{ width: '60px', height: '3px', background: '#e2e8f0' }}></div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 700, fontSize: '14px' }}>2</div>
                                        <div style={{ width: '60px', height: '3px', background: '#e2e8f0' }}></div>
                                    </div>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 700, fontSize: '14px' }}>3</div>
                                </div>

                                {/* Event Info Card */}
                                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>{selectedEvent.event_name}</h3>
                                    <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#64748b' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {selectedEvent.city || 'Location TBA'}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {formatDate(selectedEvent.start_date)}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> 45 stalls available</div>
                                    </div>
                                </div>

                                {/* Stall Categories */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                                    {stallCategories.map(cat => (
                                        <div key={cat.id} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: cat.color }}></div>
                                                <span style={{ fontWeight: 700, color: '#1e293b' }}>{cat.name}</span>
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>{cat.range}</div>
                                            <div style={{ fontSize: '18px', fontWeight: 800, color: cat.color }}>₹{cat.price.toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Legend */}
                                <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#94a3b8' }}></div> Occupied</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#2563eb', border: '2px solid #1d4ed8' }}></div> Selected</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#3b82f6' }}></div> Basic</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#10b981' }}></div> Standard</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#8b5cf6' }}></div> Premium</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#f59e0b' }}></div> Corner</div>
                                </div>

                                {/* Stall Grid */}
                                <div style={{ background: '#0f172a', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                                    <div style={{ background: '#334155', borderRadius: '8px', padding: '8px 24px', textAlign: 'center', marginBottom: '24px', color: 'white', fontWeight: 600, fontSize: '14px' }}>
                                        STAGE / MAIN ENTRANCE
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '8px' }}>
                                        {stalls.map(stall => (
                                            <button
                                                key={stall.id}
                                                onClick={() => handleStallSelect(stall)}
                                                disabled={stall.occupied}
                                                style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '6px',
                                                    border: isStallSelected(stall.id) ? '3px solid white' : 'none',
                                                    background: stall.occupied ? '#64748b' : (isStallSelected(stall.id) ? '#2563eb' : stall.color),
                                                    color: 'white',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    cursor: stall.occupied ? 'not-allowed' : 'pointer',
                                                    opacity: stall.occupied ? 0.5 : 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                {isStallSelected(stall.id) ? <Check size={16} /> : stall.id}
                                            </button>
                                        ))}
                                    </div>
                                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                                        <div style={{ background: '#334155', borderRadius: '8px', padding: '8px 24px', display: 'inline-block', color: 'white', fontWeight: 600, fontSize: '14px' }}>
                                            EXIT
                                        </div>
                                    </div>
                                </div>

                                {/* Selected Stalls Summary Bar */}
                                {selectedStalls.length > 0 && (
                                    <div style={{
                                        background: '#f0fdf4',
                                        border: '1px solid #86efac',
                                        borderRadius: '12px',
                                        padding: '16px 20px',
                                        marginBottom: '24px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#166534', marginBottom: '4px' }}>
                                                {selectedStalls.length} Stall{selectedStalls.length > 1 ? 's' : ''} Selected
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#15803d' }}>
                                                Stall #{selectedStalls.map(s => s.id).sort((a, b) => a - b).join(', #')}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Subtotal</div>
                                            <div style={{ fontSize: '20px', fontWeight: 800, color: '#166534' }}>
                                                ₹{calculateSubtotal().toLocaleString()}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>+ ₹{calculateGST().toLocaleString()} GST</div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <button onClick={handleBack} style={{ padding: '12px 24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleProceedToPayment}
                                        disabled={selectedStalls.length === 0}
                                        style={{
                                            padding: '12px 24px',
                                            background: selectedStalls.length > 0 ? '#2563eb' : '#94a3b8',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            color: 'white',
                                            cursor: selectedStalls.length > 0 ? 'pointer' : 'not-allowed',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        Proceed <ChevronRight size={16} />
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Step 2: Payment */}
                        {registrationStep === 2 && selectedEvent && selectedStalls.length > 0 && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <Building2 size={24} color="#2563eb" />
                                    <div>
                                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                                            Register for Event
                                        </h2>
                                        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                                            Review and confirm your booking
                                        </p>
                                    </div>
                                </div>

                                {/* Progress Steps */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Check size={16} /></div>
                                        <div style={{ width: '60px', height: '3px', background: '#10b981' }}></div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Check size={16} /></div>
                                        <div style={{ width: '60px', height: '3px', background: '#e2e8f0' }}></div>
                                    </div>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '14px' }}>3</div>
                                </div>

                                {/* Event Info Card */}
                                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>{selectedEvent.event_name}</h3>
                                    <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#64748b' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {selectedEvent.city || 'Location TBA'}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {formatDate(selectedEvent.start_date)}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> {selectedStalls.length} stall(s) selected</div>
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>Order Summary</h3>
                                    <div style={{ borderTop: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                                            <span style={{ color: '#64748b' }}>Event</span>
                                            <span style={{ fontWeight: 600 }}>{selectedEvent.event_name}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                                            <span style={{ color: '#64748b' }}>Company</span>
                                            <span style={{ fontWeight: 600 }}>{JSON.parse(localStorage.getItem('user') || '{}').name || 'Your Company'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                                            <span style={{ color: '#64748b' }}>Total Stalls Selected</span>
                                            <span style={{ fontWeight: 600 }}>{selectedStalls.length} stall(s)</span>
                                        </div>

                                        {/* List each selected stall */}
                                        {selectedStalls.sort((a, b) => a.id - b.id).map(stall => (
                                            <div key={stall.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', paddingLeft: '16px', borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                                                <span style={{ color: '#64748b', fontSize: '13px' }}>
                                                    Stall #{stall.id}
                                                    <span style={{
                                                        marginLeft: '8px',
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                        background: stall.color + '20',
                                                        color: stall.color
                                                    }}>
                                                        {stall.category.charAt(0).toUpperCase() + stall.category.slice(1)}
                                                    </span>
                                                </span>
                                                <span style={{ fontWeight: 600, fontSize: '13px' }}>₹{stall.price.toLocaleString()}</span>
                                            </div>
                                        ))}

                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                                            <span style={{ color: '#64748b' }}>Subtotal</span>
                                            <span style={{ fontWeight: 600 }}>₹{calculateSubtotal().toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                                            <span style={{ color: '#64748b' }}>GST (18%)</span>
                                            <span style={{ fontWeight: 600 }}>₹{calculateGST().toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '2px solid #e2e8f0' }}>
                                            <span style={{ fontWeight: 700, fontSize: '16px' }}>Total</span>
                                            <span style={{ fontWeight: 800, fontSize: '18px', color: '#2563eb' }}>₹{calculateTotal().toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Methods */}
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>Select Payment Method</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {[
                                            { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
                                            { id: 'upi', label: 'UPI Payment', icon: Building2 },
                                            { id: 'netbanking', label: 'Net Banking', icon: Building2 }
                                        ].map(method => (
                                            <label
                                                key={method.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    padding: '16px',
                                                    border: selectedPaymentMethod === method.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                                    borderRadius: '12px',
                                                    cursor: 'pointer',
                                                    background: selectedPaymentMethod === method.id ? '#eff6ff' : 'white'
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    checked={selectedPaymentMethod === method.id}
                                                    onChange={() => setSelectedPaymentMethod(method.id)}
                                                    style={{ accentColor: '#2563eb' }}
                                                />
                                                <method.icon size={20} color="#64748b" />
                                                <span style={{ fontWeight: 500 }}>{method.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <button
                                        onClick={handleBack}
                                        style={{
                                            padding: '12px 24px',
                                            background: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            color: '#475569',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <ArrowLeft size={16} /> Back
                                    </button>
                                    <button
                                        onClick={handleFinalRegister}
                                        disabled={registering}
                                        style={{
                                            padding: '12px 24px',
                                            background: registering ? '#94a3b8' : '#2563eb',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            color: 'white',
                                            cursor: registering ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <CreditCard size={16} /> {registering ? 'Processing...' : `Pay ₹${calculateTotal().toLocaleString()}`}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Success Popup */}
            {showSuccessPopup && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    background: '#10b981',
                    color: 'white',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    zIndex: 2000,
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    <CheckCircle2 size={24} />
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{successMessage}</span>
                </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '32px', paddingBottom: '24px' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Powered By Billiton</p>
            </div>

            <style>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default ExhibitorEventManagement;

