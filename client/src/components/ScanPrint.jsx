import React, { useEffect, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Check, Printer, Eye, Download, Plus, X, Type, Square, Image as ImageIcon, Edit3, Save, FileText } from 'lucide-react';
import { apiFetch } from '../utils/api';

const ScanPrint = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Step 2: Size & Material
    const [selectedSize, setSelectedSize] = useState('4x6');
    const [selectedNotch, setSelectedNotch] = useState('double');

    // Step 3: Design
    const [passDesigns, setPassDesigns] = useState([]);
    const [selectedDesign, setSelectedDesign] = useState(null);
    const [activeZone, setActiveZone] = useState('top');
    const [showCreateNew, setShowCreateNew] = useState(false);

    const steps = [
        { id: 1, label: 'Select Event' },
        { id: 2, label: 'Choose Size' },
        { id: 3, label: 'Design Badge' },
        { id: 4, label: 'Preview & Save' }
    ];

    const sizes = [
        { id: '4x6', label: '4" × 6"', pixels: '240px × 360px', popular: true },
        { id: '4x3', label: '4" × 3"', pixels: '240px × 180px', popular: false },
        { id: '3.5x2', label: '3.5" × 2"', pixels: '210px × 120px', popular: false },
        { id: '4x6plastic', label: '4" × 6" Plastic', pixels: '240px × 360px', popular: false }
    ];

    const notchStyles = [
        { id: 'none', label: 'No Notch' },
        { id: 'single', label: 'Single Notch' },
        { id: 'double', label: 'Double Notch' }
    ];

    const passTypes = [
        { id: 'visitor', label: 'Visitor', color: '#3b82f6', icon: '👤' },
        { id: 'exhibitor', label: 'Exhibitor', color: '#10b981', icon: '🏢' },
        { id: 'vip', label: 'VIP', color: '#8b5cf6', icon: '⭐' },
        { id: 'organizer', label: 'Organizer', color: '#f97316', icon: '📋' }
    ];

    // Load events
    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        setEventsLoading(true);
        try {
            const resp = await apiFetch('/api/events');
            const data = await resp.json();
            setEvents(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load events:', err);
            setEvents([]);
        } finally {
            setEventsLoading(false);
        }
    };

    const getStatusBadge = (event) => {
        const now = new Date();
        const start = new Date(event.start_date);
        const end = new Date(event.end_date);

        if (now >= start && now <= end) {
            return { label: 'active', color: '#10b981', bg: '#dcfce7' };
        } else if (now < start) {
            return { label: 'upcoming', color: '#2563eb', bg: '#dbeafe' };
        }
        return { label: 'completed', color: '#64748b', bg: '#f1f5f9' };
    };

    const createDesign = (type) => {
        const passType = passTypes.find(p => p.id === type);
        const newDesign = {
            id: Date.now(),
            type: type,
            name: `${passType.label} Pass`,
            color: passType.color,
            status: 'create',
            frontDesign: {
                eventLogo: true,
                eventName: selectedEvent?.event_name || 'EVENT NAME',
                eventDate: selectedEvent?.start_date || 'Feb 15-17 2026',
                qrCode: true,
                attendeeName: true,
                badgeType: passType.label.toUpperCase(),
                badgeColor: passType.color
            },
            backDesign: {
                sponsors: true,
                schedule: false,
                notes: ''
            }
        };
        setPassDesigns([...passDesigns, newDesign]);
        setSelectedDesign(newDesign);
        setShowCreateNew(false);
    };

    const canProceed = () => {
        if (currentStep === 1) return selectedEvent !== null;
        if (currentStep === 2) return selectedSize && selectedNotch;
        if (currentStep === 3) return passDesigns.length > 0;
        return true;
    };

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div style={{ marginBottom: '28px' }} className="fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <Printer size={28} color="#2563eb" />
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0 }}>Scan & Print</h1>
                </div>
                <p style={{ fontSize: '14px', color: '#64748b' }}>Design and print custom event badges for visitors, exhibitors, VIPs, and organizers</p>
            </div>

            {/* Stepper */}
            <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {steps.map((step, idx) => (
                        <React.Fragment key={step.id}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: currentStep > step.id ? '#10b981' : currentStep === step.id ? '#2563eb' : '#f1f5f9',
                                    color: currentStep >= step.id ? 'white' : '#94a3b8',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 600, fontSize: '14px',
                                    border: currentStep === step.id ? '4px solid #dbeafe' : 'none'
                                }}>
                                    {currentStep > step.id ? <Check size={20} /> : step.id}
                                </div>
                                <span style={{
                                    fontSize: '13px', fontWeight: 600, marginTop: '8px',
                                    color: currentStep >= step.id ? '#2563eb' : '#94a3b8'
                                }}>{step.label}</span>
                            </div>
                            {idx < steps.length - 1 && (
                                <div style={{
                                    flex: 1, height: '3px', margin: '0 8px',
                                    background: currentStep > step.id ? '#10b981' : '#e2e8f0',
                                    marginBottom: '28px'
                                }} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="card fade-in" style={{ minHeight: '400px' }}>

                {/* Step 1: Select Event */}
                {currentStep === 1 && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Calendar size={20} color="#2563eb" />
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Select Event</h3>
                        </div>
                        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
                            Choose the event for which you want to create badge designs
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                            {eventsLoading ? (
                                <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    Loading events...
                                </div>
                            ) : events.length === 0 ? (
                                <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    No events found. Please create an event first.
                                </div>
                            ) : (
                                events.map(event => {
                                    const status = getStatusBadge(event);
                                    const isSelected = selectedEvent?.id === event.id;
                                    return (
                                        <div
                                            key={event.id}
                                            onClick={() => setSelectedEvent(event)}
                                            style={{
                                                padding: '20px',
                                                border: isSelected ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                background: isSelected ? '#f0f9ff' : 'white',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '15px', marginBottom: '4px' }}>
                                                        {event.event_name}
                                                    </div>
                                                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                                                        {event.venue || 'Venue TBD'}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                                        {event.start_date ? new Date(event.start_date).toLocaleDateString() : 'Date TBD'}
                                                    </div>
                                                    {isSelected && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: '#2563eb', fontSize: '13px', fontWeight: 600 }}>
                                                            <Check size={16} /> Selected
                                                        </div>
                                                    )}
                                                </div>
                                                <span style={{
                                                    padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                                                    background: status.bg, color: status.color
                                                }}>
                                                    {status.label}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Choose Size & Material */}
                {currentStep === 2 && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Square size={20} color="#2563eb" />
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Choose Size & Material</h3>
                        </div>
                        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
                            Select the badge size for your event passes
                        </p>

                        {/* Size Selection */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                            {sizes.map(size => (
                                <div
                                    key={size.id}
                                    onClick={() => setSelectedSize(size.id)}
                                    style={{
                                        padding: '24px', textAlign: 'center',
                                        border: selectedSize === size.id ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                                        borderRadius: '12px', cursor: 'pointer',
                                        background: selectedSize === size.id ? '#f0f9ff' : 'white',
                                        position: 'relative'
                                    }}
                                >
                                    {size.popular && (
                                        <span style={{
                                            position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                                            background: '#2563eb', color: 'white', padding: '2px 10px', borderRadius: '8px',
                                            fontSize: '11px', fontWeight: 600
                                        }}>Popular</span>
                                    )}
                                    <div style={{
                                        width: size.id.includes('4x6') ? '60px' : size.id === '4x3' ? '60px' : '50px',
                                        height: size.id.includes('4x6') ? '90px' : size.id === '4x3' ? '45px' : '30px',
                                        border: '2px solid #cbd5e1', borderRadius: '4px',
                                        margin: '0 auto 12px'
                                    }} />
                                    <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>{size.label}</div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{size.pixels}</div>
                                </div>
                            ))}
                        </div>

                        {/* Notch Style */}
                        <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Choose Notch Style</h4>
                        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Select the lanyard hole style for the badge</p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            {notchStyles.map(notch => (
                                <div
                                    key={notch.id}
                                    onClick={() => setSelectedNotch(notch.id)}
                                    style={{
                                        padding: '24px', textAlign: 'center',
                                        border: selectedNotch === notch.id ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                                        borderRadius: '12px', cursor: 'pointer',
                                        background: selectedNotch === notch.id ? '#f0f9ff' : 'white'
                                    }}
                                >
                                    <div style={{
                                        width: '50px', height: '70px', border: '2px solid #cbd5e1', borderRadius: '4px',
                                        margin: '0 auto 12px', position: 'relative'
                                    }}>
                                        {notch.id === 'single' && (
                                            <div style={{ position: 'absolute', top: '-2px', left: '50%', transform: 'translateX(-50%)', width: '12px', height: '8px', borderRadius: '0 0 6px 6px', background: '#f8fafc', border: '2px solid #cbd5e1', borderTop: 'none' }} />
                                        )}
                                        {notch.id === 'double' && (
                                            <>
                                                <div style={{ position: 'absolute', top: '-2px', left: '8px', width: '10px', height: '6px', borderRadius: '0 0 5px 5px', background: '#f8fafc', border: '2px solid #cbd5e1', borderTop: 'none' }} />
                                                <div style={{ position: 'absolute', top: '-2px', right: '8px', width: '10px', height: '6px', borderRadius: '0 0 5px 5px', background: '#f8fafc', border: '2px solid #cbd5e1', borderTop: 'none' }} />
                                            </>
                                        )}
                                    </div>
                                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{notch.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Design Badge */}
                {currentStep === 3 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr 220px', gap: '24px', minHeight: '500px' }}>
                        {/* Left Panel - Pass Designs */}
                        <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '24px' }}>
                            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>Pass Designs</h4>
                            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Add and manage pass designs</p>

                            {/* Design List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                                {passDesigns.map(design => (
                                    <div
                                        key={design.id}
                                        onClick={() => setSelectedDesign(design)}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                                            background: selectedDesign?.id === design.id ? '#f0f9ff' : '#f8fafc',
                                            border: selectedDesign?.id === design.id ? '1px solid #2563eb' : '1px solid transparent'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: design.color }} />
                                            <span style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b' }}>{design.name}</span>
                                            <span style={{ fontSize: '10px', color: '#64748b', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                                                {design.status}
                                            </span>
                                        </div>
                                        <X size={14} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={(e) => {
                                            e.stopPropagation();
                                            setPassDesigns(passDesigns.filter(d => d.id !== design.id));
                                            if (selectedDesign?.id === design.id) setSelectedDesign(null);
                                        }} />
                                    </div>
                                ))}
                            </div>

                            {/* Add New Design */}
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Add New Design</div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>Create New:</span>
                                    <X size={14} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => setShowCreateNew(!showCreateNew)} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    {passTypes.map(type => (
                                        <button
                                            key={type.id}
                                            onClick={() => createDesign(type.id)}
                                            style={{
                                                padding: '10px', border: `1.5px solid ${type.color}20`, borderRadius: '8px',
                                                background: `${type.color}10`, color: type.color, fontSize: '12px', fontWeight: 600,
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                            }}
                                        >
                                            {type.icon} {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Center - Badge Preview */}
                        <div>
                            {selectedDesign ? (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Printer size={18} color="#2563eb" />
                                            <span style={{ fontWeight: 700, color: '#1e293b' }}>{selectedDesign.name}</span>
                                            <span style={{ fontSize: '11px', color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>
                                                {selectedDesign.status}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', fontSize: '12px', cursor: 'pointer' }}>Front</button>
                                            <button style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#f8fafc', fontSize: '12px', cursor: 'pointer' }}>Back</button>
                                        </div>
                                    </div>

                                    {/* Badge Preview Card */}
                                    <div style={{
                                        width: '220px', margin: '0 auto', padding: '20px',
                                        border: '1px solid #e2e8f0', borderRadius: '12px', background: 'white',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                                    }}>
                                        {/* Notch */}
                                        {selectedNotch === 'double' && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <div style={{ width: '30px', height: '10px', borderRadius: '0 0 8px 8px', background: '#e2e8f0' }} />
                                                <div style={{ width: '30px', height: '10px', borderRadius: '0 0 8px 8px', background: '#e2e8f0' }} />
                                            </div>
                                        )}
                                        {selectedNotch === 'single' && (
                                            <div style={{ width: '40px', height: '10px', borderRadius: '0 0 10px 10px', background: '#e2e8f0', margin: '0 auto 8px' }} />
                                        )}

                                        <div style={{ border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                                            {/* QR Code placeholder */}
                                            <div style={{ width: '60px', height: '60px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <span style={{ fontSize: '8px', color: '#94a3b8' }}>QR Code</span>
                                            </div>

                                            {/* Event Name */}
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                                                {selectedEvent?.event_name || 'EVENT NAME'}
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '16px' }}>
                                                {selectedEvent?.start_date ? new Date(selectedEvent.start_date).toLocaleDateString() : 'Feb 15-17, 2026'}
                                            </div>

                                            {/* Attendee Name */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '8px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0' }} />
                                                <div style={{ textAlign: 'left' }}>
                                                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>ATTENDEE NAME</div>
                                                    <div style={{ fontSize: '9px', color: selectedDesign.color }}>Company / Title</div>
                                                </div>
                                            </div>

                                            {/* Badge Type */}
                                            <div style={{
                                                background: selectedDesign.color, color: 'white', padding: '8px 16px',
                                                borderRadius: '6px', fontSize: '12px', fontWeight: 700, marginTop: '12px'
                                            }}>
                                                {selectedDesign.frontDesign.badgeType}
                                            </div>

                                            <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '8px' }}>www.event.com</div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
                                        <button style={{ padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Eye size={14} /> Preview Mode
                                        </button>
                                        <button style={{ padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <X size={14} /> Deselect
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                                    <Printer size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                                    <p>Select a design from the left panel or create a new one</p>
                                </div>
                            )}
                        </div>

                        {/* Right Panel - Design Tools */}
                        <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '24px' }}>
                            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>Design Tools</h4>

                            {/* Active Zone Toggle */}
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Active Zone</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    <button
                                        onClick={() => setActiveZone('top')}
                                        style={{
                                            padding: '8px', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                                            background: activeZone === 'top' ? '#2563eb' : '#f1f5f9',
                                            color: activeZone === 'top' ? 'white' : '#475569', cursor: 'pointer'
                                        }}
                                    >Top Zone</button>
                                    <button
                                        onClick={() => setActiveZone('bottom')}
                                        style={{
                                            padding: '8px', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                                            background: activeZone === 'bottom' ? '#2563eb' : '#f1f5f9',
                                            color: activeZone === 'bottom' ? 'white' : '#475569', cursor: 'pointer'
                                        }}
                                    >Bottom Zone</button>
                                </div>
                            </div>

                            {/* Add Elements */}
                            <div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Add to {activeZone} zone</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                    {[
                                        { icon: Type, label: 'Text' },
                                        { icon: Square, label: 'Shape' },
                                        { icon: ImageIcon, label: 'Image' }
                                    ].map(tool => (
                                        <button
                                            key={tool.label}
                                            style={{
                                                padding: '12px 8px', border: '1px solid #e2e8f0', borderRadius: '8px',
                                                background: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                                alignItems: 'center', gap: '4px'
                                            }}
                                        >
                                            <tool.icon size={18} color="#475569" />
                                            <span style={{ fontSize: '10px', color: '#475569' }}>{tool.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Preview & Save */}
                {currentStep === 4 && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Eye size={20} color="#2563eb" />
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Preview All Designs</h3>
                        </div>
                        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
                            Review all badge designs before saving for {selectedEvent?.event_name}
                        </p>

                        {/* Design Previews */}
                        {passDesigns.map(design => (
                            <div key={design.id} style={{ marginBottom: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: design.color }} />
                                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{design.name}</span>
                                </div>

                                <div style={{ display: 'flex', gap: '24px' }}>
                                    {/* Front Design */}
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{
                                            width: '140px', height: '200px', border: '1px solid #e2e8f0', borderRadius: '8px',
                                            background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            marginBottom: '8px', fontSize: '12px', color: '#64748b'
                                        }}>
                                            Front Design
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>Front</span>
                                    </div>

                                    {/* Back Design */}
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{
                                            width: '140px', height: '200px', border: '1px solid #e2e8f0', borderRadius: '8px',
                                            background: design.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            marginBottom: '8px', fontSize: '12px', color: 'white'
                                        }}>
                                            Back Design
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>Back</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '32px' }}>
                            <button
                                onClick={() => setCurrentStep(3)}
                                style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <Edit3 size={16} /> Edit Designs
                            </button>
                            <button style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', background: '#2563eb', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Save size={16} /> Save All Designs
                            </button>
                            <button style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Download size={16} /> Export as PDF
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                <button
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                    style={{
                        padding: '10px 24px', borderRadius: '8px', border: '1px solid #e2e8f0',
                        background: 'white', color: currentStep === 1 ? '#94a3b8' : '#475569',
                        fontWeight: 600, cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    <ChevronLeft size={18} /> Previous
                </button>
                <button
                    onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                    disabled={!canProceed()}
                    style={{
                        padding: '10px 24px', borderRadius: '8px', border: 'none',
                        background: canProceed() ? '#2563eb' : '#94a3b8', color: 'white',
                        fontWeight: 600, cursor: canProceed() ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    Next <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default ScanPrint;
