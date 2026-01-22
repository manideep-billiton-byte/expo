import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Check, User, Mail, Smartphone, Building2, MapPin, ChevronRight, CheckCircle2, Download } from 'lucide-react';
import { apiFetch } from '../utils/api';

const PublicVisitorRegistration = () => {
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [generatedQR, setGeneratedQR] = useState('');
    const [uniqueCode, setUniqueCode] = useState('');
    const [eventDetails, setEventDetails] = useState({
        id: '',
        name: '',
        date: ''
    });

    const [visitorData, setVisitorData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        gender: '',
        age: '',
        organization: '',
        designation: '',
        visitorCategory: 'General Visitor'
    });

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (token) {
            // Fetch event details using the token
            fetchEventByToken(token);
        } else {
            // Fallback to URL params (for backward compatibility)
            setEventDetails({
                id: urlParams.get('eventId') || '',
                name: urlParams.get('eventName') || 'Event',
                date: urlParams.get('eventDate') || ''
            });
        }
    }, []);

    const fetchEventByToken = async (token) => {
        try {
            const response = await apiFetch(`/api/events/by-token/${token}`);
            if (response.ok) {
                const event = await response.json();
                setEventDetails({
                    id: event.id,
                    name: event.event_name || event.name,
                    date: event.start_date ? new Date(event.start_date).toLocaleDateString() : ''
                });
            } else {
                console.error('Event not found');
                setEventDetails({
                    id: '',
                    name: 'Event',
                    date: ''
                });
            }
        } catch (error) {
            console.error('Failed to fetch event details:', error);
            setEventDetails({
                id: '',
                name: 'Event',
                date: ''
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setVisitorData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...visitorData,
                eventId: eventDetails.id || null,
                validDates: 'all',
                communication: {
                    whatsapp: true,
                    email: true,
                    sms: true
                }
            };

            const resp = await apiFetch('/api/visitors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!resp.ok) {
                const data = await resp.json();
                throw new Error(data.error || 'Failed to register');
            }

            const responseData = await resp.json();
            const visitorCode = responseData.uniqueCode;
            setUniqueCode(visitorCode);

            // Generate QR Code with ONLY the unique code
            try {
                const qrDataUrl = await QRCode.toDataURL(visitorCode, {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#1e293b',
                        light: '#ffffff'
                    }
                });
                setGeneratedQR(qrDataUrl);
            } catch (err) {
                console.error('QR Generation failed', err);
            }

            setShowSuccess(true);
        } catch (err) {
            console.error('Registration failed', err);
            alert('Failed to register: ' + err.message);
        } finally {
            setLoading(false);
        }
    };


    const downloadQR = () => {
        if (!generatedQR) return;
        const a = document.createElement('a');
        a.href = generatedQR;
        a.download = `visitor_pass_${visitorData.firstName}_${visitorData.lastName}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (showSuccess) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                padding: '20px'
            }}>
                <div style={{
                    background: 'white',
                    padding: '48px',
                    borderRadius: '24px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    maxWidth: '600px',
                    width: '100%',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: '#dcfce7',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px'
                    }}>
                        <CheckCircle2 size={40} color="#10b981" />
                    </div>
                    <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '12px' }}>Registration Successful!</h2>
                    <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '32px' }}>
                        Thank you for registering for <strong>{eventDetails.name}</strong>. Your visitor pass is ready!
                    </p>

                    {/* QR Code Display */}
                    {generatedQR && (
                        <div style={{
                            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                            padding: '32px',
                            borderRadius: '16px',
                            marginBottom: '32px',
                            border: '2px dashed #cbd5e1'
                        }}>
                            <p style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>Your Visitor Pass QR Code</p>

                            {/* Display Unique Code */}
                            <div style={{
                                background: 'white',
                                padding: '16px',
                                borderRadius: '12px',
                                marginBottom: '20px',
                                border: '2px solid #2563eb'
                            }}>
                                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>Your Unique Code</p>
                                <p style={{ fontSize: '32px', fontWeight: 800, color: '#2563eb', letterSpacing: '2px', fontFamily: 'monospace' }}>{uniqueCode}</p>
                            </div>

                            <div style={{
                                background: 'white',
                                padding: '20px',
                                borderRadius: '12px',
                                display: 'inline-block',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}>
                                <img src={generatedQR} alt="Visitor QR Code" style={{ width: '280px', height: '280px', display: 'block' }} />
                            </div>
                            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '16px', marginBottom: '20px' }}>
                                Show this QR code at the event entrance or to exhibitors
                            </p>
                            <button
                                onClick={downloadQR}
                                style={{
                                    padding: '12px 24px',
                                    background: '#2563eb',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Download size={18} />
                                Download QR Code
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => window.location.href = '/'}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: '#64748b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            padding: '40px 20px'
        }}>
            <div style={{
                maxWidth: '600px',
                margin: '0 auto',
                background: 'white',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                    padding: '40px',
                    color: 'white',
                    textAlign: 'center'
                }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px 0' }}>{eventDetails.name}</h1>
                    <p style={{ opacity: 0.9, fontSize: '16px' }}>Visitor Registration Form</p>
                    {eventDetails.date && (
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            marginTop: '16px',
                            fontSize: '14px'
                        }}>
                            Date: {eventDetails.date}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '40px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>First Name *</label>
                            <input
                                required
                                type="text"
                                name="firstName"
                                value={visitorData.firstName}
                                onChange={handleChange}
                                placeholder="John"
                                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>Last Name *</label>
                            <input
                                required
                                type="text"
                                name="lastName"
                                value={visitorData.lastName}
                                onChange={handleChange}
                                placeholder="Doe"
                                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>Email Address *</label>
                        <input
                            required
                            type="email"
                            name="email"
                            value={visitorData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', outline: 'none' }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>Mobile Number *</label>
                        <input
                            required
                            type="tel"
                            name="mobile"
                            value={visitorData.mobile}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                            style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', outline: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>Gender</label>
                            <select
                                name="gender"
                                value={visitorData.gender}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', outline: 'none', background: 'white' }}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>Age Group</label>
                            <select
                                name="age"
                                value={visitorData.age}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', outline: 'none', background: 'white' }}
                            >
                                <option value="">Select Age</option>
                                <option value="18-25">18-25</option>
                                <option value="26-40">26-40</option>
                                <option value="41-60">41-60</option>
                                <option value="60+">60+</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>Organization / Company</label>
                        <input
                            type="text"
                            name="organization"
                            value={visitorData.organization}
                            onChange={handleChange}
                            placeholder="Acme Corp"
                            style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', outline: 'none' }}
                        />
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>Designation</label>
                        <input
                            type="text"
                            name="designation"
                            value={visitorData.designation}
                            onChange={handleChange}
                            placeholder="Software Engineer"
                            style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', outline: 'none' }}
                        />
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? 'Processing...' : 'Register Now'}
                        {!loading && <ChevronRight size={20} />}
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#94a3b8' }}>
                        Powered By Billiton
                    </p>
                </form>
            </div>
        </div>
    );
};

export default PublicVisitorRegistration;
