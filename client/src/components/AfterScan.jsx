import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, Building2, MapPin, Briefcase, Star, Calendar, FileText, ArrowLeft } from 'lucide-react';
import { apiFetch } from '../utils/api';

const AfterScan = ({ scannedData, scanType = 'QR_SCAN', onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        designation: '',
        city: '',
        state: '',
        country: '',
        industry: '',
        notes: '',
        rating: null,
        followUpDate: ''
    });

    const [saving, setSaving] = useState(false);

    // Auto-fill form with scanned data
    useEffect(() => {
        if (scannedData) {
            console.log('Scanned data received:', scannedData);

            // Parse QR code data if it's a JSON string
            let parsedData = scannedData;
            if (typeof scannedData === 'string') {
                try {
                    parsedData = JSON.parse(scannedData);
                } catch (e) {
                    console.log('QR data is not JSON, treating as plain text');
                }
            }

            // Auto-fill form fields based on available data
            setFormData({
                name: parsedData.name || parsedData.fullName || parsedData.first_name || '',
                email: parsedData.email || parsedData.primary_email || '',
                phone: parsedData.phone || parsedData.mobile || parsedData.primary_mobile || '',
                company: parsedData.company || parsedData.organization || '',
                designation: parsedData.designation || parsedData.title || parsedData.position || '',
                city: parsedData.city || parsedData.town || '',
                state: parsedData.state || '',
                country: parsedData.country || 'India',
                industry: parsedData.industry || '',
                notes: parsedData.notes || '',
                rating: parsedData.rating || null,
                followUpDate: parsedData.followUpDate || ''
            });
        }
    }, [scannedData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRatingClick = (rating) => {
        setFormData(prev => ({
            ...prev,
            rating: prev.rating === rating ? null : rating
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name) {
            alert('Name is required!');
            return;
        }

        setSaving(true);

        try {
            const exhibitorId = localStorage.getItem('exhibitorId');
            const eventId = localStorage.getItem('eventId');
            const organizationId = localStorage.getItem('organizationId');

            // Note: Scan data is already saved to exhibitor_scanned_visitors immediately when scan happens
            // This form now only saves to the leads table with any additional details user fills in

            // Save to leads table
            const leadData = {
                exhibitorId: exhibitorId ? parseInt(exhibitorId) : null,
                eventId: eventId ? parseInt(eventId) : null,
                organizationId: organizationId ? parseInt(organizationId) : null,
                name: formData.name,
                email: formData.email || null,
                phone: formData.phone || null,
                company: formData.company || null,
                designation: formData.designation || null,
                city: formData.city || null,
                state: formData.state || null,
                country: formData.country || null,
                industry: formData.industry || null,
                notes: formData.notes || null,
                rating: formData.rating || null,
                followUpDate: formData.followUpDate || null,
                source: scanType === 'OCR' ? 'OCR Scan' : 'QR Scan',
                status: 'New'
            };

            const response = await apiFetch('/api/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(leadData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert('Lead saved successfully!');
                if (onSave) onSave(result.lead);
                if (onClose) onClose();
            } else {
                alert('Failed to save lead: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error saving lead:', error);
            alert('Error saving lead. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
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
            zIndex: 1000,
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '20px',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px 32px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                    borderRadius: '20px 20px 0 0'
                }}>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'white', margin: 0 }}>
                            Lead Information
                        </h2>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', margin: '4px 0 0 0' }}>
                            Review and complete the scanned visitor details
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <X size={20} color="white" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {/* Name - Required */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                                <User size={16} color="#2563eb" />
                                Name <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    transition: 'all 0.2s'
                                }}
                                placeholder="Enter full name"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                                <Mail size={16} color="#2563eb" />
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    fontSize: '14px'
                                }}
                                placeholder="email@example.com"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                                <Phone size={16} color="#2563eb" />
                                Phone
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    fontSize: '14px'
                                }}
                                placeholder="+91 XXXXXXXXXX"
                            />
                        </div>

                        {/* Company */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                                <Building2 size={16} color="#2563eb" />
                                Company
                            </label>
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    fontSize: '14px'
                                }}
                                placeholder="Company name"
                            />
                        </div>

                        {/* Designation */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                                <Briefcase size={16} color="#2563eb" />
                                Designation
                            </label>
                            <input
                                type="text"
                                name="designation"
                                value={formData.designation}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    fontSize: '14px'
                                }}
                                placeholder="Job title"
                            />
                        </div>

                        {/* City */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                                <MapPin size={16} color="#2563eb" />
                                City
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    fontSize: '14px'
                                }}
                                placeholder="City"
                            />
                        </div>

                        {/* State */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                                <MapPin size={16} color="#2563eb" />
                                State
                            </label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    fontSize: '14px'
                                }}
                                placeholder="State"
                            />
                        </div>

                        {/* Country */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                                <MapPin size={16} color="#2563eb" />
                                Country
                            </label>
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    fontSize: '14px'
                                }}
                                placeholder="Country"
                            />
                        </div>

                        {/* Industry */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                                <Briefcase size={16} color="#2563eb" />
                                Industry
                            </label>
                            <input
                                type="text"
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    fontSize: '14px'
                                }}
                                placeholder="Industry"
                            />
                        </div>

                        {/* Follow-up Date */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                                <Calendar size={16} color="#2563eb" />
                                Follow-up Date
                            </label>
                            <input
                                type="date"
                                name="followUpDate"
                                value={formData.followUpDate}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        {/* Rating */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                                <Star size={16} color="#2563eb" />
                                Lead Rating
                            </label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {[1, 2, 3, 4, 5].map(rating => (
                                    <button
                                        key={rating}
                                        type="button"
                                        onClick={() => handleRatingClick(rating)}
                                        style={{
                                            padding: '10px 20px',
                                            border: formData.rating === rating ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                            borderRadius: '10px',
                                            background: formData.rating === rating ? '#eff6ff' : 'white',
                                            color: formData.rating === rating ? '#2563eb' : '#64748b',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {rating} ⭐
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                                <FileText size={16} color="#2563eb" />
                                Notes
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                                placeholder="Add any additional notes..."
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '14px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                background: 'white',
                                color: '#64748b',
                                fontWeight: 600,
                                fontSize: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <ArrowLeft size={20} />
                            Back to Scanner
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                flex: 2,
                                padding: '14px',
                                border: 'none',
                                borderRadius: '12px',
                                background: saving ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #3b82f6)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '16px',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <Save size={20} />
                            {saving ? 'Saving...' : 'Save Lead'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AfterScan;
