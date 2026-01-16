import React, { useEffect, useState, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Check, Printer, Eye, Download, Plus, X, Type, Square, Image as ImageIcon, Edit3, Save, FileText, Users, Building2, Star, ClipboardList } from 'lucide-react';
import { apiFetch } from '../utils/api';
import QRCode from 'qrcode';

const ScanPrint = () => {
    // Refs for printing
    const printRef = useRef(null);
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

    // Design Elements State
    const [designElements, setDesignElements] = useState({}); // { designId: { top: [], bottom: [] } }
    const [selectedElement, setSelectedElement] = useState(null);
    const [badgeView, setBadgeView] = useState('front'); // 'front' or 'back'

    // Modal States
    const [showTextModal, setShowTextModal] = useState(false);
    const [showShapeModal, setShowShapeModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [editingElement, setEditingElement] = useState(null);

    // Print & Save States
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [printDesign, setPrintDesign] = useState(null);
    const [printSide, setPrintSide] = useState('front');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [qrCodeDataUrls, setQrCodeDataUrls] = useState({});
    const [attendees, setAttendees] = useState([]);
    const [selectedAttendee, setSelectedAttendee] = useState(null);
    const [printQuantity, setPrintQuantity] = useState(1);

    // Text Modal Form
    const [textForm, setTextForm] = useState({
        content: '',
        fontSize: 14,
        color: '#1e293b',
        fontWeight: 'normal',
        alignment: 'center'
    });

    // Shape Modal Form
    const [shapeForm, setShapeForm] = useState({
        shapeType: 'rectangle',
        fillColor: '#3b82f6',
        borderColor: '#2563eb',
        width: 60,
        height: 30
    });

    // Image Modal Form
    const [imageForm, setImageForm] = useState({
        url: '',
        width: 60,
        height: 60
    });

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

    // Generate QR code data URL
    const generateQRCode = async (text) => {
        try {
            const url = await QRCode.toDataURL(text, {
                width: 120,
                margin: 1,
                color: { dark: '#1e293b', light: '#ffffff' }
            });
            return url;
        } catch (err) {
            console.error('QR generation error:', err);
            return null;
        }
    };

    // Load attendees based on pass type
    const loadAttendees = async (passType) => {
        if (!selectedEvent) return;
        try {
            let endpoint = '';
            if (passType === 'visitor') {
                endpoint = `/api/visitors?event_id=${selectedEvent.id}`;
            } else if (passType === 'exhibitor') {
                endpoint = `/api/exhibitors?event_id=${selectedEvent.id}`;
            }
            if (endpoint) {
                const resp = await apiFetch(endpoint);
                const data = await resp.json();
                setAttendees(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Failed to load attendees:', err);
            setAttendees([]);
        }
    };

    // Save all designs to backend
    const handleSaveDesigns = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            // For now, save to localStorage as a demo
            const designsData = {
                eventId: selectedEvent?.id,
                eventName: selectedEvent?.event_name,
                selectedSize,
                selectedNotch,
                designs: passDesigns.map(design => ({
                    ...design,
                    elements: designElements[design.id] || { top: [], bottom: [] }
                })),
                savedAt: new Date().toISOString()
            };
            localStorage.setItem(`badge_designs_${selectedEvent?.id}`, JSON.stringify(designsData));
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error('Failed to save designs:', err);
            alert('Failed to save designs');
        } finally {
            setIsSaving(false);
        }
    };

    // Open print modal for a specific design
    const openPrintModal = async (design) => {
        setPrintDesign(design);
        setPrintSide('front');
        setSelectedAttendee(null);
        setPrintQuantity(1);
        setShowPrintModal(true);

        // Load attendees for this pass type
        await loadAttendees(design.type);

        // Generate sample QR code
        const qrUrl = await generateQRCode(`${selectedEvent?.event_name || 'Event'}-${design.type}-SAMPLE`);
        setQrCodeDataUrls(prev => ({ ...prev, sample: qrUrl }));
    };

    // Handle print action
    const handlePrint = async () => {
        if (!printRef.current) return;

        // Generate QR for selected attendee
        if (selectedAttendee) {
            const attendeeQr = await generateQRCode(
                `${selectedEvent?.id}-${printDesign?.type}-${selectedAttendee.id}`
            );
            setQrCodeDataUrls(prev => ({ ...prev, [selectedAttendee.id]: attendeeQr }));
        }

        const printContent = printRef.current.innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print Badge - ${printDesign?.name}</title>
                <style>
                    @page { margin: 0.5in; }
                    body { 
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                        margin: 0; padding: 20px;
                    }
                    .badge-container { 
                        page-break-after: always;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                    }
                    .badge-container:last-child { page-break-after: auto; }
                </style>
            </head>
            <body>
                ${Array(printQuantity).fill(`<div class="badge-container">${printContent}</div>`).join('')}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    // Export as PDF (using browser print to PDF)
    const handleExportPDF = async () => {
        if (passDesigns.length === 0) {
            alert('No designs to export');
            return;
        }

        // Generate QR codes for all designs
        const qrPromises = passDesigns.map(async (design) => {
            const qr = await generateQRCode(`${selectedEvent?.id}-${design.type}-SAMPLE`);
            return { id: design.id, qr };
        });
        const qrResults = await Promise.all(qrPromises);
        const qrMap = {};
        qrResults.forEach(r => { qrMap[r.id] = r.qr; });

        // Create print-friendly HTML
        const badgesHtml = passDesigns.map(design => `
            <div style="page-break-after: always; padding: 40px; display: flex; justify-content: center;">
                <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; width: 240px; text-align: center; background: white;">
                    ${selectedNotch === 'double' ? `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                            <div style="width: 30px; height: 10px; border-radius: 0 0 8px 8px; background: #e2e8f0;"></div>
                            <div style="width: 30px; height: 10px; border-radius: 0 0 8px 8px; background: #e2e8f0;"></div>
                        </div>
                    ` : selectedNotch === 'single' ? `
                        <div style="width: 40px; height: 10px; border-radius: 0 0 10px 10px; background: #e2e8f0; margin: 0 auto 12px;"></div>
                    ` : ''}
                    <img src="${qrMap[design.id]}" style="width: 80px; height: 80px; margin: 0 auto 16px; display: block;" />
                    <div style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">${selectedEvent?.event_name || 'EVENT NAME'}</div>
                    <div style="font-size: 12px; color: #64748b; margin-bottom: 20px;">${selectedEvent?.start_date ? new Date(selectedEvent.start_date).toLocaleDateString() : 'Date TBD'}</div>
                    <div style="display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 12px;">
                        <div style="width: 40px; height: 40px; border-radius: 50%; background: #e2e8f0;"></div>
                        <div style="text-align: left;">
                            <div style="font-size: 14px; font-weight: 600; color: #1e293b;">ATTENDEE NAME</div>
                            <div style="font-size: 10px; color: ${design.color};">Company / Title</div>
                        </div>
                    </div>
                    <div style="background: ${design.color}; color: white; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 700; margin-top: 16px;">
                        ${design.frontDesign.badgeType}
                    </div>
                </div>
            </div>
        `).join('');

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Badge Designs - ${selectedEvent?.event_name || 'Event'}</title>
                <style>
                    @page { margin: 0.5in; size: portrait; }
                    body { font-family: 'Inter', -apple-system, sans-serif; margin: 0; }
                    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                </style>
            </head>
            <body>
                ${badgesHtml}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 250);
    };

    // Get current design elements for the selected design and zone
    const getCurrentElements = () => {
        if (!selectedDesign) return [];
        const designId = selectedDesign.id;
        return designElements[designId]?.[activeZone] || [];
    };

    // Add text element
    const addTextElement = () => {
        if (!selectedDesign || !textForm.content.trim()) return;

        const newElement = {
            id: Date.now(),
            type: 'text',
            content: textForm.content,
            fontSize: textForm.fontSize,
            color: textForm.color,
            fontWeight: textForm.fontWeight,
            alignment: textForm.alignment
        };

        setDesignElements(prev => ({
            ...prev,
            [selectedDesign.id]: {
                ...prev[selectedDesign.id],
                [activeZone]: [...(prev[selectedDesign.id]?.[activeZone] || []), newElement]
            }
        }));

        setTextForm({ content: '', fontSize: 14, color: '#1e293b', fontWeight: 'normal', alignment: 'center' });
        setShowTextModal(false);
    };

    // Add shape element
    const addShapeElement = () => {
        if (!selectedDesign) return;

        const newElement = {
            id: Date.now(),
            type: 'shape',
            shapeType: shapeForm.shapeType,
            fillColor: shapeForm.fillColor,
            borderColor: shapeForm.borderColor,
            width: shapeForm.width,
            height: shapeForm.height
        };

        setDesignElements(prev => ({
            ...prev,
            [selectedDesign.id]: {
                ...prev[selectedDesign.id],
                [activeZone]: [...(prev[selectedDesign.id]?.[activeZone] || []), newElement]
            }
        }));

        setShapeForm({ shapeType: 'rectangle', fillColor: '#3b82f6', borderColor: '#2563eb', width: 60, height: 30 });
        setShowShapeModal(false);
    };

    // Add image element
    const addImageElement = () => {
        if (!selectedDesign || !imageForm.url.trim()) return;

        const newElement = {
            id: Date.now(),
            type: 'image',
            url: imageForm.url,
            width: imageForm.width,
            height: imageForm.height
        };

        setDesignElements(prev => ({
            ...prev,
            [selectedDesign.id]: {
                ...prev[selectedDesign.id],
                [activeZone]: [...(prev[selectedDesign.id]?.[activeZone] || []), newElement]
            }
        }));

        setImageForm({ url: '', width: 60, height: 60 });
        setShowImageModal(false);
    };

    // Delete element
    const deleteElement = (elementId) => {
        if (!selectedDesign) return;

        setDesignElements(prev => ({
            ...prev,
            [selectedDesign.id]: {
                ...prev[selectedDesign.id],
                top: (prev[selectedDesign.id]?.top || []).filter(el => el.id !== elementId),
                bottom: (prev[selectedDesign.id]?.bottom || []).filter(el => el.id !== elementId)
            }
        }));
        setSelectedElement(null);
    };

    // Handle image file upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageForm(prev => ({ ...prev, url: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Render an element
    const renderElement = (element) => {
        const isSelected = selectedElement?.id === element.id;
        const baseStyle = {
            cursor: 'pointer',
            outline: isSelected ? '2px solid #2563eb' : 'none',
            outlineOffset: '2px'
        };

        if (element.type === 'text') {
            return (
                <div
                    key={element.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedElement(element); }}
                    style={{
                        ...baseStyle,
                        fontSize: `${element.fontSize}px`,
                        color: element.color,
                        fontWeight: element.fontWeight,
                        textAlign: element.alignment,
                        padding: '4px'
                    }}
                >
                    {element.content}
                </div>
            );
        }

        if (element.type === 'shape') {
            const shapeStyle = {
                ...baseStyle,
                width: `${element.width}px`,
                height: `${element.height}px`,
                backgroundColor: element.fillColor,
                border: `2px solid ${element.borderColor}`,
                borderRadius: element.shapeType === 'circle' ? '50%' : element.shapeType === 'rounded' ? '8px' : '0'
            };
            return (
                <div
                    key={element.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedElement(element); }}
                    style={shapeStyle}
                />
            );
        }

        if (element.type === 'image') {
            return (
                <img
                    key={element.id}
                    src={element.url}
                    alt="Design element"
                    onClick={(e) => { e.stopPropagation(); setSelectedElement(element); }}
                    style={{
                        ...baseStyle,
                        width: `${element.width}px`,
                        height: `${element.height}px`,
                        objectFit: 'cover'
                    }}
                />
            );
        }
        return null;
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

                                        <div style={{ border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '16px', textAlign: 'center' }} onClick={() => setSelectedElement(null)}>
                                            {/* Top Zone - Custom Elements */}
                                            {designElements[selectedDesign.id]?.top?.length > 0 && (
                                                <div style={{
                                                    marginBottom: '12px', padding: '8px',
                                                    background: activeZone === 'top' ? '#f0f9ff' : 'transparent',
                                                    border: activeZone === 'top' ? '1px dashed #2563eb' : '1px dashed transparent',
                                                    borderRadius: '4px', minHeight: '30px',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                                                }}>
                                                    {designElements[selectedDesign.id].top.map(el => renderElement(el))}
                                                </div>
                                            )}

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

                                            {/* Bottom Zone - Custom Elements */}
                                            {designElements[selectedDesign.id]?.bottom?.length > 0 && (
                                                <div style={{
                                                    marginTop: '12px', padding: '8px',
                                                    background: activeZone === 'bottom' ? '#f0f9ff' : 'transparent',
                                                    border: activeZone === 'bottom' ? '1px dashed #2563eb' : '1px dashed transparent',
                                                    borderRadius: '4px', minHeight: '30px',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                                                }}>
                                                    {designElements[selectedDesign.id].bottom.map(el => renderElement(el))}
                                                </div>
                                            )}

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
                                    <button
                                        onClick={() => selectedDesign && setShowTextModal(true)}
                                        disabled={!selectedDesign}
                                        style={{
                                            padding: '12px 8px', border: '1px solid #e2e8f0', borderRadius: '8px',
                                            background: selectedDesign ? 'white' : '#f8fafc', cursor: selectedDesign ? 'pointer' : 'not-allowed',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                            opacity: selectedDesign ? 1 : 0.5
                                        }}
                                    >
                                        <Type size={18} color="#475569" />
                                        <span style={{ fontSize: '10px', color: '#475569' }}>Text</span>
                                    </button>
                                    <button
                                        onClick={() => selectedDesign && setShowShapeModal(true)}
                                        disabled={!selectedDesign}
                                        style={{
                                            padding: '12px 8px', border: '1px solid #e2e8f0', borderRadius: '8px',
                                            background: selectedDesign ? 'white' : '#f8fafc', cursor: selectedDesign ? 'pointer' : 'not-allowed',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                            opacity: selectedDesign ? 1 : 0.5
                                        }}
                                    >
                                        <Square size={18} color="#475569" />
                                        <span style={{ fontSize: '10px', color: '#475569' }}>Shape</span>
                                    </button>
                                    <button
                                        onClick={() => selectedDesign && setShowImageModal(true)}
                                        disabled={!selectedDesign}
                                        style={{
                                            padding: '12px 8px', border: '1px solid #e2e8f0', borderRadius: '8px',
                                            background: selectedDesign ? 'white' : '#f8fafc', cursor: selectedDesign ? 'pointer' : 'not-allowed',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                            opacity: selectedDesign ? 1 : 0.5
                                        }}
                                    >
                                        <ImageIcon size={18} color="#475569" />
                                        <span style={{ fontSize: '10px', color: '#475569' }}>Image</span>
                                    </button>
                                </div>
                            </div>

                            {/* Selected Element Properties */}
                            {selectedElement && (
                                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Selected Element</div>
                                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '8px', textTransform: 'capitalize' }}>
                                            {selectedElement.type}
                                        </div>
                                        {selectedElement.type === 'text' && (
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>"{selectedElement.content}"</div>
                                        )}
                                        <button
                                            onClick={() => deleteElement(selectedElement.id)}
                                            style={{
                                                marginTop: '8px', padding: '6px 12px', border: 'none', borderRadius: '6px',
                                                background: '#fee2e2', color: '#dc2626', fontSize: '11px', fontWeight: 600,
                                                cursor: 'pointer', width: '100%'
                                            }}
                                        >
                                            Delete Element
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 4: Preview & Save */}
                {currentStep === 4 && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Eye size={20} color="#2563eb" />
                                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Preview All Designs</h3>
                            </div>
                            {saveSuccess && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#dcfce7', color: '#15803d', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                                    <Check size={14} /> Designs saved successfully!
                                </div>
                            )}
                        </div>
                        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
                            Review all badge designs before saving for {selectedEvent?.event_name}
                        </p>

                        {/* Design Previews */}
                        {passDesigns.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                                <Printer size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                                <p>No designs created yet. Go back to Step 3 to create badge designs.</p>
                            </div>
                        ) : (
                            passDesigns.map(design => (
                                <div key={design.id} style={{ marginBottom: '32px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: design.color }} />
                                            <span style={{ fontWeight: 600, color: '#1e293b' }}>{design.name}</span>
                                            <span style={{ fontSize: '11px', background: '#e2e8f0', color: '#64748b', padding: '2px 8px', borderRadius: '4px' }}>
                                                {design.type}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => openPrintModal(design)}
                                            style={{
                                                padding: '8px 16px', border: 'none', borderRadius: '8px',
                                                background: design.color, color: 'white', fontSize: '12px', fontWeight: 600,
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                                            }}
                                        >
                                            <Printer size={14} /> Print Badge
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', gap: '24px' }}>
                                        {/* Front Design Preview */}
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{
                                                width: '160px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px',
                                                background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '8px'
                                            }}>
                                                {/* Notch */}
                                                {selectedNotch === 'double' && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <div style={{ width: '24px', height: '8px', borderRadius: '0 0 6px 6px', background: '#e2e8f0' }} />
                                                        <div style={{ width: '24px', height: '8px', borderRadius: '0 0 6px 6px', background: '#e2e8f0' }} />
                                                    </div>
                                                )}
                                                {selectedNotch === 'single' && (
                                                    <div style={{ width: '30px', height: '8px', borderRadius: '0 0 8px 8px', background: '#e2e8f0', margin: '0 auto 8px' }} />
                                                )}

                                                {/* Top Zone Elements */}
                                                {designElements[design.id]?.top?.length > 0 && (
                                                    <div style={{ marginBottom: '8px', padding: '4px' }}>
                                                        {designElements[design.id].top.map((el, idx) => (
                                                            <div key={idx} style={{ fontSize: `${Math.min(el.fontSize || 12, 12)}px`, color: el.color || '#1e293b', fontWeight: el.fontWeight || 'normal' }}>
                                                                {el.type === 'text' ? el.content : el.type === 'shape' ? <div style={{ width: '30px', height: '15px', background: el.fillColor, borderRadius: el.shapeType === 'circle' ? '50%' : '2px', margin: '0 auto' }} /> : null}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* QR Code */}
                                                <div style={{ width: '50px', height: '50px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1px', width: '30px', height: '30px' }}>
                                                        {[...Array(25)].map((_, i) => (
                                                            <div key={i} style={{ background: Math.random() > 0.4 ? '#1e293b' : '#fff', width: '5px', height: '5px' }} />
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Event Info */}
                                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>{selectedEvent?.event_name || 'EVENT'}</div>
                                                <div style={{ fontSize: '8px', color: '#64748b', marginBottom: '8px' }}>{selectedEvent?.start_date ? new Date(selectedEvent.start_date).toLocaleDateString() : ''}</div>

                                                {/* Attendee */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', marginBottom: '8px' }}>
                                                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#e2e8f0' }} />
                                                    <div style={{ textAlign: 'left' }}>
                                                        <div style={{ fontSize: '9px', fontWeight: 600, color: '#1e293b' }}>ATTENDEE</div>
                                                        <div style={{ fontSize: '7px', color: design.color }}>Company</div>
                                                    </div>
                                                </div>

                                                {/* Badge Type */}
                                                <div style={{ background: design.color, color: 'white', padding: '5px 10px', borderRadius: '4px', fontSize: '9px', fontWeight: 700 }}>
                                                    {design.frontDesign.badgeType}
                                                </div>

                                                {/* Bottom Zone Elements */}
                                                {designElements[design.id]?.bottom?.length > 0 && (
                                                    <div style={{ marginTop: '8px', padding: '4px' }}>
                                                        {designElements[design.id].bottom.map((el, idx) => (
                                                            <div key={idx} style={{ fontSize: `${Math.min(el.fontSize || 12, 10)}px`, color: el.color || '#1e293b' }}>
                                                                {el.type === 'text' ? el.content : null}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>Front</span>
                                        </div>

                                        {/* Back Design Preview */}
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{
                                                width: '160px', height: 'auto', minHeight: '200px', padding: '16px',
                                                border: '1px solid #e2e8f0', borderRadius: '10px',
                                                background: `linear-gradient(135deg, ${design.color} 0%, ${design.color}dd 100%)`,
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '8px',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {/* Notch */}
                                                {selectedNotch === 'double' && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '12px' }}>
                                                        <div style={{ width: '24px', height: '8px', borderRadius: '0 0 6px 6px', background: 'rgba(255,255,255,0.3)' }} />
                                                        <div style={{ width: '24px', height: '8px', borderRadius: '0 0 6px 6px', background: 'rgba(255,255,255,0.3)' }} />
                                                    </div>
                                                )}
                                                {selectedNotch === 'single' && (
                                                    <div style={{ width: '30px', height: '8px', borderRadius: '0 0 8px 8px', background: 'rgba(255,255,255,0.3)', marginBottom: '12px' }} />
                                                )}

                                                <div style={{ color: 'white', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>
                                                        {selectedEvent?.event_name || 'Event'}
                                                    </div>
                                                    <div style={{ fontSize: '9px', opacity: 0.9, marginBottom: '16px' }}>
                                                        {design.frontDesign.badgeType}
                                                    </div>

                                                    {/* Sponsors placeholder */}
                                                    <div style={{ fontSize: '8px', opacity: 0.8, marginBottom: '8px' }}>SPONSORS</div>
                                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                        {[1, 2, 3].map(i => (
                                                            <div key={i} style={{ width: '30px', height: '16px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }} />
                                                        ))}
                                                    </div>

                                                    <div style={{ marginTop: '16px', fontSize: '7px', opacity: 0.7 }}>
                                                        www.event.com
                                                    </div>
                                                </div>
                                            </div>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>Back</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '32px' }}>
                            <button
                                onClick={() => setCurrentStep(3)}
                                style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <Edit3 size={16} /> Edit Designs
                            </button>
                            <button
                                onClick={handleSaveDesigns}
                                disabled={isSaving || passDesigns.length === 0}
                                style={{
                                    padding: '10px 20px', border: 'none', borderRadius: '8px',
                                    background: isSaving ? '#94a3b8' : '#10b981', color: 'white',
                                    fontSize: '13px', fontWeight: 600,
                                    cursor: isSaving || passDesigns.length === 0 ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '6px'
                                }}
                            >
                                <Save size={16} /> {isSaving ? 'Saving...' : 'Save All Designs'}
                            </button>
                            <button
                                onClick={handleExportPDF}
                                disabled={passDesigns.length === 0}
                                style={{
                                    padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: '8px',
                                    background: 'white', fontSize: '13px', fontWeight: 600,
                                    cursor: passDesigns.length === 0 ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    opacity: passDesigns.length === 0 ? 0.5 : 1
                                }}
                            >
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

            {/* Text Modal */}
            {showTextModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '24px',
                        width: '400px', maxWidth: '90vw', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>Add Text</h3>
                            <button onClick={() => setShowTextModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={20} color="#64748b" />
                            </button>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Text Content</label>
                            <input
                                type="text"
                                value={textForm.content}
                                onChange={(e) => setTextForm(prev => ({ ...prev, content: e.target.value }))}
                                placeholder="Enter text..."
                                style={{
                                    width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0',
                                    borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Font Size</label>
                                <select
                                    value={textForm.fontSize}
                                    onChange={(e) => setTextForm(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                >
                                    {[10, 12, 14, 16, 18, 20, 24, 28, 32].map(size => (
                                        <option key={size} value={size}>{size}px</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Color</label>
                                <input
                                    type="color"
                                    value={textForm.color}
                                    onChange={(e) => setTextForm(prev => ({ ...prev, color: e.target.value }))}
                                    style={{ width: '100%', height: '42px', border: '1.5px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Font Weight</label>
                                <select
                                    value={textForm.fontWeight}
                                    onChange={(e) => setTextForm(prev => ({ ...prev, fontWeight: e.target.value }))}
                                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                >
                                    <option value="normal">Normal</option>
                                    <option value="600">Semi-Bold</option>
                                    <option value="700">Bold</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Alignment</label>
                                <select
                                    value={textForm.alignment}
                                    onChange={(e) => setTextForm(prev => ({ ...prev, alignment: e.target.value }))}
                                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                >
                                    <option value="left">Left</option>
                                    <option value="center">Center</option>
                                    <option value="right">Right</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setShowTextModal(false)} style={{
                                flex: 1, padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '8px',
                                background: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                            }}>Cancel</button>
                            <button onClick={addTextElement} style={{
                                flex: 1, padding: '12px', border: 'none', borderRadius: '8px',
                                background: '#2563eb', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                            }}>Add Text</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Shape Modal */}
            {showShapeModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '24px',
                        width: '400px', maxWidth: '90vw', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>Add Shape</h3>
                            <button onClick={() => setShowShapeModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={20} color="#64748b" />
                            </button>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Shape Type</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                {['rectangle', 'rounded', 'circle'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setShapeForm(prev => ({ ...prev, shapeType: type }))}
                                        style={{
                                            padding: '16px', border: shapeForm.shapeType === type ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                                            borderRadius: '8px', background: shapeForm.shapeType === type ? '#f0f9ff' : 'white', cursor: 'pointer',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
                                        }}
                                    >
                                        <div style={{
                                            width: '30px', height: type === 'circle' ? '30px' : '20px',
                                            backgroundColor: '#3b82f6',
                                            borderRadius: type === 'circle' ? '50%' : type === 'rounded' ? '6px' : '0'
                                        }} />
                                        <span style={{ fontSize: '11px', color: '#475569', textTransform: 'capitalize' }}>{type}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Fill Color</label>
                                <input
                                    type="color"
                                    value={shapeForm.fillColor}
                                    onChange={(e) => setShapeForm(prev => ({ ...prev, fillColor: e.target.value }))}
                                    style={{ width: '100%', height: '42px', border: '1.5px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Border Color</label>
                                <input
                                    type="color"
                                    value={shapeForm.borderColor}
                                    onChange={(e) => setShapeForm(prev => ({ ...prev, borderColor: e.target.value }))}
                                    style={{ width: '100%', height: '42px', border: '1.5px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Width (px)</label>
                                <input
                                    type="number"
                                    value={shapeForm.width}
                                    onChange={(e) => setShapeForm(prev => ({ ...prev, width: parseInt(e.target.value) || 60 }))}
                                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Height (px)</label>
                                <input
                                    type="number"
                                    value={shapeForm.height}
                                    onChange={(e) => setShapeForm(prev => ({ ...prev, height: parseInt(e.target.value) || 30 }))}
                                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setShowShapeModal(false)} style={{
                                flex: 1, padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '8px',
                                background: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                            }}>Cancel</button>
                            <button onClick={addShapeElement} style={{
                                flex: 1, padding: '12px', border: 'none', borderRadius: '8px',
                                background: '#2563eb', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                            }}>Add Shape</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Modal */}
            {showImageModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '24px',
                        width: '400px', maxWidth: '90vw', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>Add Image</h3>
                            <button onClick={() => setShowImageModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={20} color="#64748b" />
                            </button>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Upload Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{
                                    width: '100%', padding: '10px', border: '1.5px dashed #e2e8f0',
                                    borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Or Enter URL</label>
                            <input
                                type="text"
                                value={imageForm.url.startsWith('data:') ? '' : imageForm.url}
                                onChange={(e) => setImageForm(prev => ({ ...prev, url: e.target.value }))}
                                placeholder="https://example.com/image.png"
                                style={{
                                    width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0',
                                    borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        {imageForm.url && (
                            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                                <img src={imageForm.url} alt="Preview" style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '8px' }} />
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Width (px)</label>
                                <input
                                    type="number"
                                    value={imageForm.width}
                                    onChange={(e) => setImageForm(prev => ({ ...prev, width: parseInt(e.target.value) || 60 }))}
                                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Height (px)</label>
                                <input
                                    type="number"
                                    value={imageForm.height}
                                    onChange={(e) => setImageForm(prev => ({ ...prev, height: parseInt(e.target.value) || 60 }))}
                                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => { setShowImageModal(false); setImageForm({ url: '', width: 60, height: 60 }); }} style={{
                                flex: 1, padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '8px',
                                background: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                            }}>Cancel</button>
                            <button onClick={addImageElement} disabled={!imageForm.url} style={{
                                flex: 1, padding: '12px', border: 'none', borderRadius: '8px',
                                background: imageForm.url ? '#2563eb' : '#94a3b8', color: 'white', fontSize: '14px', fontWeight: 600,
                                cursor: imageForm.url ? 'pointer' : 'not-allowed'
                            }}>Add Image</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Print Modal */}
            {showPrintModal && printDesign && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '28px',
                        width: '700px', maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>Print Badge</h3>
                                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>{printDesign.name} for {selectedEvent?.event_name}</p>
                            </div>
                            <button onClick={() => setShowPrintModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                                <X size={24} color="#64748b" />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            {/* Left: Options */}
                            <div>
                                {/* Select Attendee */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px' }}>
                                        Select Attendee (Optional)
                                    </label>
                                    <select
                                        value={selectedAttendee?.id || ''}
                                        onChange={(e) => {
                                            const att = attendees.find(a => a.id === parseInt(e.target.value));
                                            setSelectedAttendee(att || null);
                                        }}
                                        style={{
                                            width: '100%', padding: '12px', border: '1.5px solid #e2e8f0',
                                            borderRadius: '8px', fontSize: '14px', background: 'white'
                                        }}
                                    >
                                        <option value="">-- Sample Badge --</option>
                                        {attendees.map(att => (
                                            <option key={att.id} value={att.id}>
                                                {att.name || att.full_name || att.email || `ID: ${att.id}`}
                                            </option>
                                        ))}
                                    </select>
                                    {attendees.length === 0 && (
                                        <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                                            No {printDesign.type}s found. Printing sample badge.
                                        </p>
                                    )}
                                </div>

                                {/* Print Side */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px' }}>
                                        Print Side
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {['front', 'back', 'both'].map(side => (
                                            <button
                                                key={side}
                                                onClick={() => setPrintSide(side)}
                                                style={{
                                                    flex: 1, padding: '10px', border: printSide === side ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                                                    borderRadius: '8px', background: printSide === side ? '#f0f9ff' : 'white',
                                                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                                    color: printSide === side ? '#2563eb' : '#475569', textTransform: 'capitalize'
                                                }}
                                            >
                                                {side}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Quantity */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px' }}>
                                        Print Quantity
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <button
                                            onClick={() => setPrintQuantity(Math.max(1, printQuantity - 1))}
                                            style={{
                                                width: '40px', height: '40px', border: '1.5px solid #e2e8f0',
                                                borderRadius: '8px', background: 'white', fontSize: '20px',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >−</button>
                                        <input
                                            type="number"
                                            value={printQuantity}
                                            onChange={(e) => setPrintQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                            style={{
                                                width: '60px', textAlign: 'center', padding: '10px',
                                                border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', fontWeight: 600
                                            }}
                                        />
                                        <button
                                            onClick={() => setPrintQuantity(printQuantity + 1)}
                                            style={{
                                                width: '40px', height: '40px', border: '1.5px solid #e2e8f0',
                                                borderRadius: '8px', background: 'white', fontSize: '20px',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >+</button>
                                    </div>
                                </div>

                                {/* Badge Size Info */}
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Badge Size</div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                                        {sizes.find(s => s.id === selectedSize)?.label || '4" × 6"'}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                        Notch: {notchStyles.find(n => n.id === selectedNotch)?.label || 'Double Notch'}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Preview */}
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '12px' }}>Preview</div>
                                <div ref={printRef} style={{
                                    border: '1px solid #e2e8f0', borderRadius: '12px',
                                    padding: '20px', background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                                }}>
                                    {(printSide === 'front' || printSide === 'both') && (
                                        <div style={{
                                            width: '200px', margin: '0 auto', padding: '20px',
                                            border: '1px solid #e2e8f0', borderRadius: '10px', background: 'white', textAlign: 'center'
                                        }}>
                                            {/* Notch */}
                                            {selectedNotch === 'double' && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                    <div style={{ width: '28px', height: '10px', borderRadius: '0 0 8px 8px', background: '#e2e8f0' }} />
                                                    <div style={{ width: '28px', height: '10px', borderRadius: '0 0 8px 8px', background: '#e2e8f0' }} />
                                                </div>
                                            )}
                                            {selectedNotch === 'single' && (
                                                <div style={{ width: '36px', height: '10px', borderRadius: '0 0 10px 10px', background: '#e2e8f0', margin: '0 auto 12px' }} />
                                            )}

                                            {/* QR Code */}
                                            {qrCodeDataUrls.sample ? (
                                                <img src={qrCodeDataUrls.sample} alt="QR Code" style={{ width: '80px', height: '80px', margin: '0 auto 12px', display: 'block' }} />
                                            ) : (
                                                <div style={{ width: '80px', height: '80px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>QR Code</span>
                                                </div>
                                            )}

                                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                                                {selectedEvent?.event_name || 'EVENT NAME'}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '16px' }}>
                                                {selectedEvent?.start_date ? new Date(selectedEvent.start_date).toLocaleDateString() : ''}
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '12px' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e2e8f0' }} />
                                                <div style={{ textAlign: 'left' }}>
                                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                                                        {selectedAttendee?.name || selectedAttendee?.full_name || 'ATTENDEE NAME'}
                                                    </div>
                                                    <div style={{ fontSize: '10px', color: printDesign.color }}>
                                                        {selectedAttendee?.company || selectedAttendee?.organization || 'Company / Title'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{
                                                background: printDesign.color, color: 'white',
                                                padding: '10px 20px', borderRadius: '8px',
                                                fontSize: '13px', fontWeight: 700, marginTop: '12px'
                                            }}>
                                                {printDesign.frontDesign.badgeType}
                                            </div>
                                        </div>
                                    )}

                                    {printSide === 'both' && <div style={{ height: '20px' }} />}

                                    {(printSide === 'back' || printSide === 'both') && (
                                        <div style={{
                                            width: '200px', margin: '0 auto', padding: '20px',
                                            borderRadius: '10px', textAlign: 'center',
                                            background: `linear-gradient(135deg, ${printDesign.color} 0%, ${printDesign.color}dd 100%)`
                                        }}>
                                            {/* Notch */}
                                            {selectedNotch === 'double' && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                    <div style={{ width: '28px', height: '10px', borderRadius: '0 0 8px 8px', background: 'rgba(255,255,255,0.3)' }} />
                                                    <div style={{ width: '28px', height: '10px', borderRadius: '0 0 8px 8px', background: 'rgba(255,255,255,0.3)' }} />
                                                </div>
                                            )}
                                            {selectedNotch === 'single' && (
                                                <div style={{ width: '36px', height: '10px', borderRadius: '0 0 10px 10px', background: 'rgba(255,255,255,0.3)', margin: '0 auto 12px' }} />
                                            )}

                                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'white', marginBottom: '6px', textTransform: 'uppercase' }}>
                                                {selectedEvent?.event_name || 'Event'}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', marginBottom: '20px' }}>
                                                {printDesign.frontDesign.badgeType}
                                            </div>

                                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', marginBottom: '10px' }}>SPONSORS</div>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} style={{ width: '40px', height: '20px', background: 'rgba(255,255,255,0.25)', borderRadius: '4px' }} />
                                                ))}
                                            </div>

                                            <div style={{ marginTop: '20px', fontSize: '9px', color: 'rgba(255,255,255,0.7)' }}>
                                                www.event.com
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowPrintModal(false)}
                                style={{
                                    padding: '12px 24px', border: '1.5px solid #e2e8f0', borderRadius: '8px',
                                    background: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                                }}
                            >Cancel</button>
                            <button
                                onClick={handlePrint}
                                style={{
                                    padding: '12px 24px', border: 'none', borderRadius: '8px',
                                    background: printDesign.color, color: 'white',
                                    fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                <Printer size={18} /> Print {printQuantity > 1 ? `${printQuantity} Badges` : 'Badge'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScanPrint;
