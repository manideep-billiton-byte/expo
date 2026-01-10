import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Camera, LogOut, ChevronDown, Bell, Settings, Search, Clock, Users, Activity, X, ScanText, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import Tesseract from 'tesseract.js';
import AfterScan from './AfterScan';

const Scanner = ({ onBack }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [scannedData, setScannedData] = useState(null);
    const [showAfterScan, setShowAfterScan] = useState(false);
    const [currentScanType, setCurrentScanType] = useState('QR_SCAN'); // 'QR_SCAN' or 'OCR'
    const [recentScans, setRecentScans] = useState([]);
    const [cameraError, setCameraError] = useState(null);
    const [showTypeCodeModal, setShowTypeCodeModal] = useState(false); // For manual code entry
    const [manualCode, setManualCode] = useState(''); // Manual code input
    const html5QrCodeRef = useRef(null);
    const scannerInitialized = useRef(false);
    const scanTimeoutRef = useRef(null); // Added: timeout ref for scan timeout

    // OCR State
    const [activeTab, setActiveTab] = useState('qr'); // 'qr' | 'ocr'
    const [ocrImage, setOcrImage] = useState(null);
    const [ocrProcessing, setOcrProcessing] = useState(false);
    const [ocrStatus, setOcrStatus] = useState('');
    const fileInputRef = useRef(null);

    // Camera State for OCR
    const [showCamera, setShowCamera] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        // Load recent scans from API
        loadRecentScans();

        return () => {
            // Cleanup scanner on unmount
            if (html5QrCodeRef.current && scannerInitialized.current) {
                try {
                    html5QrCodeRef.current.stop().catch(err => console.log('Scanner stop error:', err));
                } catch (e) {
                    console.log('Scanner cleanup error:', e);
                }
            }
        };
    }, []);

    const loadRecentScans = async () => {
        try {
            const exhibitorId = localStorage.getItem('exhibitorId');
            const response = await fetch(`/api/leads?exhibitorId=${exhibitorId}`);
            if (response.ok) {
                const leads = await response.json();
                setRecentScans(leads.slice(0, 8)); // Get latest 8 scans
            }
        } catch (error) {
            console.error('Error loading recent scans:', error);
        }
    };

    const startScanning = async () => {
        setCameraError(null);
        setIsScanning(true);
        // Clear any previous timeout
        if (scanTimeoutRef.current) {
            clearTimeout(scanTimeoutRef.current);
            scanTimeoutRef.current = null;
        }
        // Set a 15-second timeout to stop scanning if no QR is detected
        scanTimeoutRef.current = setTimeout(() => {
            if (html5QrCodeRef.current && scannerInitialized.current) { // Check if scanner is still active
                console.warn('⚠️ Scan timed out after 15 seconds');
                alert('Scanning timed out. Please ensure the QR code is clearly visible and try again.');
                stopScanning();
            }
        }, 15000);

        try {
            const html5QrCode = new Html5Qrcode("qr-reader");
            html5QrCodeRef.current = html5QrCode;
            scannerInitialized.current = true;

            // MAXIMUM PERFORMANCE config for sub-5-second scanning
            const config = {
                fps: 60, // Maximum FPS for instant detection
                qrbox: { width: 300, height: 300 }, // Larger box for easier targeting
                aspectRatio: 1.0,
                disableFlip: false,
                formatsToSupport: [0], // 0 = QR_CODE only (faster than scanning all formats)
                experimentalFeatures: {
                    useBarCodeDetectorIfSupported: true // Use native browser detector if available
                },
                videoConstraints: {
                    facingMode: { ideal: "environment" },
                    width: { ideal: 1280 }, // HD quality for better detection
                    height: { ideal: 720 },
                    focusMode: { ideal: "continuous" },
                    advanced: [
                        { focusMode: "continuous" },
                        { zoom: 1.0 }
                    ]
                }
            };

            // Try to get available cameras first
            try {
                const devices = await Html5Qrcode.getCameras();
                console.log('📸 Available cameras:', devices);

                if (devices && devices.length > 0) {
                    // Prefer rear camera (environment) for better scanning
                    let cameraId = devices[0].id;
                    const rearCamera = devices.find(device =>
                        device.label && (
                            device.label.toLowerCase().includes('back') ||
                            device.label.toLowerCase().includes('rear') ||
                            device.label.toLowerCase().includes('environment')
                        )
                    );
                    if (rearCamera) {
                        cameraId = rearCamera.id;
                        console.log('✅ Using rear camera:', rearCamera.label);
                    } else {
                        console.log('📱 Using camera:', devices[0].label);
                    }

                    await html5QrCode.start(
                        cameraId,
                        config,
                        (decodedText, decodedResult) => {
                            console.log('⚡ QR Code detected:', decodedText);
                            // Clear timeout on success
                            if (scanTimeoutRef.current) {
                                clearTimeout(scanTimeoutRef.current);
                                scanTimeoutRef.current = null;
                            }
                            handleScanSuccess(decodedText);
                        },
                        (errorMessage) => {
                            // Scanning in progress, no QR detected yet
                        }
                    );
                    console.log('✅ Scanner started with 60 FPS');
                } else {
                    throw new Error('No cameras found');
                }
            } catch (cameraError) {
                console.log('⚠️ Camera enumeration failed, using facingMode:', cameraError.message);
                // Fallback to facingMode
                await html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    (decodedText, decodedResult) => {
                        console.log('⚡ QR Code detected:', decodedText);
                        if (scanTimeoutRef.current) {
                            clearTimeout(scanTimeoutRef.current);
                            scanTimeoutRef.current = null;
                        }
                        handleScanSuccess(decodedText);
                    },
                    (errorMessage) => {
                        // Scanning in progress
                    }
                );
                console.log('✅ Scanner started (fallback mode)');
            }
        } catch (err) {
            console.error('Error starting scanner:', err);
            let errorMsg = 'Unable to access camera. ';

            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                errorMsg += 'Please allow camera access in your browser settings.';
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                errorMsg += 'No camera found on this device.';
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                errorMsg += 'Camera is already in use by another application.';
            } else {
                errorMsg += 'Please check browser permissions and try again.';
            }

            setCameraError(errorMsg);
            setIsScanning(false);
            scannerInitialized.current = false;
            if (scanTimeoutRef.current) { // Clear timeout if scanner fails to start
                clearTimeout(scanTimeoutRef.current);
                scanTimeoutRef.current = null;
            }
        }
    };

    const stopScanning = async () => {
        if (html5QrCodeRef.current && scannerInitialized.current) {
            try {
                await html5QrCodeRef.current.stop();
                console.log('Scanner stopped successfully');
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
        }
        setIsScanning(false);
        scannerInitialized.current = false;
    };

    const handleScanSuccess = async (decodedText) => {
        // Stop scanning
        await stopScanning();

        console.log('🎯 Scanned QR code:', decodedText);
        console.log('🎯 Code starts with VIS-:', decodedText.startsWith('VIS-'));

        // Check if it's a unique code format (e.g., VIS-XXXXXXXX)
        if (decodedText.startsWith('VIS-')) {
            // alert(`Debug: Scanning visitor code ${decodedText}`); // Commented out to reduce noise, enable if needed
            console.log('✅ Detected visitor code format, fetching details...');
            // Fetch visitor details from API using unique code
            try {
                const API_BASE = import.meta.env.VITE_API_BASE || '';
                const apiUrl = `${API_BASE}/api/visitors/code/${decodedText}`;
                console.log('🌐 API URL:', apiUrl);

                const response = await fetch(apiUrl);
                console.log('🌐 API Response Status:', response.status, response.statusText);

                if (response.ok) {
                    const result = await response.json();
                    console.log('📦 API Response Data:', result);

                    if (result.success && result.visitor) {
                        console.log('✅ Visitor found:', result.visitor);
                        // Format visitor data for display
                        const visitorData = {
                            name: `${result.visitor.first_name || ''} ${result.visitor.last_name || ''}`.trim(),
                            email: result.visitor.email,
                            phone: result.visitor.mobile,
                            company: result.visitor.organization,
                            designation: result.visitor.designation,
                            eventName: result.visitor.event_name,
                            uniqueCode: result.visitor.unique_code
                        };

                        setScannedData(visitorData);
                        setCurrentScanType('QR_SCAN');
                        // Save immediately to database
                        saveScannedVisitorImmediately(visitorData, 'QR_SCAN');
                        setShowAfterScan(true);
                        return;
                    } else {
                        console.error('❌ Invalid response structure:', result);
                        alert('Invalid response from server. Please contact support.');
                        return;
                    }
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('❌ API Error:', response.status, errorData);
                    alert(`Invalid or expired QR code.\n\nError: ${errorData.message || errorData.error || 'Visitor not found'}\n\nPlease ask the visitor to re-register or contact support.`);
                    return;
                }
            } catch (error) {
                console.error('❌ Error fetching visitor data:', error);
                alert(`Failed to fetch visitor details.\n\nError: ${error.message}\n\nPlease check:\n1. Server is running\n2. Network connection\n3. API endpoint is accessible`);
                return;
            }
        } else {
            console.log('⚠️ Not a visitor code (does not start with VIS-), trying JSON parse...');
        }

        // Try to parse as JSON (backward compatibility for old QR codes)
        try {
            const visitorData = JSON.parse(decodedText);
            // Check if it's a visitor QR code
            if (visitorData.name || visitorData.email) {
                setScannedData(visitorData);
                setCurrentScanType('QR_SCAN');
                // Save immediately to database
                saveScannedVisitorImmediately(visitorData, 'QR_SCAN');
                setShowAfterScan(true);
                return;
            }
        } catch (e) {
            // Not JSON, treat as regular lead scan
        }

        // Regular lead scan - show AfterScan form
        const parsedScannedData = typeof decodedText === 'string' ? { rawData: decodedText } : decodedText;
        setScannedData(decodedText);
        setCurrentScanType('QR_SCAN');
        // Save immediately to database  
        saveScannedVisitorImmediately(parsedScannedData, 'QR_SCAN');
        setShowAfterScan(true);
    };

    const handleAfterScanClose = () => {
        setShowAfterScan(false);
        setScannedData(null);
        setCurrentScanType('QR_SCAN'); // Reset to default
        // Reload recent scans to show newly added lead
        loadRecentScans();
    };

    const handleLeadSaved = (lead) => {
        // Add to recent scans
        setRecentScans(prev => [lead, ...prev.slice(0, 7)]);
    };

    // Save scanned visitor data immediately to database
    const saveScannedVisitorImmediately = async (visitorData, scanType, ocrText = null) => {
        try {
            const exhibitorId = localStorage.getItem('exhibitorId');
            const eventId = localStorage.getItem('eventId');

            const payload = {
                exhibitorId: exhibitorId ? parseInt(exhibitorId) : null,
                eventId: eventId ? parseInt(eventId) : null,
                visitorId: visitorData?.visitorId || null,
                scanType: scanType, // 'QR_SCAN' or 'OCR'
                visitorName: visitorData?.name || visitorData?.fullName || null,
                visitorEmail: visitorData?.email || null,
                visitorPhone: visitorData?.phone || visitorData?.mobile || null,
                visitorCompany: visitorData?.company || visitorData?.organization || null,
                visitorDesignation: visitorData?.designation || null,
                visitorUniqueCode: visitorData?.uniqueCode || null,
                ocrRawText: ocrText || null,
                notes: null,
                interestLevel: null
            };

            console.log(`📝 Saving ${scanType} scan immediately:`, payload);

            const response = await fetch('/api/scanned-visitors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                console.log(`✅ ${scanType} scan saved successfully to exhibitor_scanned_visitors`);
            } else {
                console.error(`❌ Failed to save ${scanType} scan:`, result);
            }
        } catch (error) {
            console.error('Error saving scanned visitor immediately:', error);
        }
    };

    // Handle manual code entry
    const handleManualCodeSubmit = async () => {
        const code = manualCode.trim().toUpperCase();
        if (!code) {
            alert('Please enter a visitor code');
            return;
        }

        // Add VIS- prefix if not present
        const fullCode = code.startsWith('VIS-') ? code : `VIS-${code}`;

        setShowTypeCodeModal(false);
        setManualCode('');
        // Reuse the existing scan success handler
        await handleScanSuccess(fullCode);
    };

    // OCR Handlers
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            setOcrImage(imageUrl);
            processOcrImage(imageUrl);
        }
    };

    const startOcrCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setCameraStream(stream);
            setShowCamera(true);

            // Wait for video element to be available
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (err) {
            console.error('Camera access error:', err);
            alert('Unable to access camera. Please check permissions and try again.');
        }
    };

    const stopOcrCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setShowCamera(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);

            canvas.toBlob((blob) => {
                const imageUrl = URL.createObjectURL(blob);
                setOcrImage(imageUrl);
                stopOcrCamera();
                processOcrImage(imageUrl);
            }, 'image/jpeg', 0.95);
        }
    };

    const processOcrImage = async (imageUrl) => {
        setOcrProcessing(true);
        setOcrStatus('Initializing OCR engine...');

        try {
            // Enhanced Tesseract configuration for better accuracy
            const result = await Tesseract.recognize(
                imageUrl,
                'eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setOcrStatus(`Scanning... ${Math.round(m.progress * 100)}%`);
                        }
                    },
                    // Better OCR settings
                    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@._+- ',
                }
            );

            const text = result.data.text;
            console.log('=== RAW OCR TEXT ===');
            console.log(text);
            console.log('=== END RAW TEXT ===');

            // Convert to lowercase for case-insensitive matching
            const lowerText = text.toLowerCase();

            // SUPER FLEXIBLE EMAIL EXTRACTION
            const emailPatterns = [
                /([a-zA-Z0-9._+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,})/gi,
                /([a-z0-9._+-]+\s*@\s*[a-z0-9._-]+\s*\.\s*[a-z]{2,})/gi,
                /([a-z0-9._+-]+[@＠][a-z0-9._-]+[\.。][a-z]{2,})/gi,
            ];

            let emails = [];
            for (const pattern of emailPatterns) {
                const matches = text.match(pattern) || [];
                emails = emails.concat(matches);
            }

            // Also search for common email indicators
            const lines = text.split(/[\n\r]+/);
            for (const line of lines) {
                // Look for @ symbol followed by domain
                if (/@/.test(line) && /\.[a-z]{2,}/i.test(line)) {
                    // Try to extract email-like pattern
                    const emailMatch = line.match(/([a-z0-9._+-]+@[a-z0-9._-]+\.[a-z]{2,})/i);
                    if (emailMatch) {
                        emails.push(emailMatch[0]);
                    }
                }
            }

            emails = [...new Set(emails.map(e => e.trim()))]; // Remove duplicates and trim
            console.log('Found emails:', emails);

            // SUPER FLEXIBLE PHONE NUMBER EXTRACTION
            const phonePatterns = [
                /\+?\d{1,3}[-.\s]?\d{10}/g, // International format
                /\+?\d{1,3}[-.\s]?\d{5}[-.\s]?\d{5}/g, // Split 5-5
                /\+?\d{1,3}[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g, // Standard
                /\d{10}/g, // Plain 10 digits
                /\d{5}[-.\s]?\d{5}/g, // 5-5 split
            ];

            let phones = [];
            for (const pattern of phonePatterns) {
                const matches = text.match(pattern) || [];
                phones = phones.concat(matches);
            }

            // Also look for phone indicators
            for (const line of lines) {
                // Look for lines with lots of digits
                const digitMatch = line.match(/\d{5,}/g);
                if (digitMatch) {
                    phones = phones.concat(digitMatch);
                }
            }

            // Clean and validate phones
            const validPhones = phones
                .map(p => p.replace(/\D/g, ''))
                .filter((p, idx, arr) => arr.indexOf(p) === idx) // unique
                .filter(p => p.length >= 10)
                .map(p => {
                    // Format Indian numbers
                    if (p.length === 10) {
                        return '+91 ' + p;
                    }
                    if (p.length === 12 && p.startsWith('91')) {
                        return '+' + p.slice(0, 2) + ' ' + p.slice(2);
                    }
                    return p;
                });

            console.log('Found phones:', validPhones);

            // NAME EXTRACTION - Multiple strategies
            const filteredLines = lines.filter(line => line.trim().length > 0);
            let potentialName = '';

            console.log('All lines:', filteredLines);

            // Strategy 1: Look for capitalized name (usually at top)
            for (const line of filteredLines) {
                const trimmed = line.trim();

                // Skip emails, phones, URLs, and long numbers
                if (/@/.test(trimmed) || /\d{5,}/.test(trimmed) || /www|http/i.test(trimmed)) continue;

                // Skip company keywords
                if (/(pvt|ltd|inc|corp|solutions|technologies|group|enterprises|company|limited|services|private)/i.test(trimmed)) continue;

                const words = trimmed.split(/\s+/);

                // Look for 2-4 word names with capitals
                if (words.length >= 2 && words.length <= 4) {
                    // Check if looks like a name
                    const looksLikeName = words.every(word =>
                        word.length > 1 && /^[A-Z]/.test(word)
                    );

                    if (looksLikeName) {
                        potentialName = trimmed;
                        break;
                    }
                }
            }

            // Strategy 2: First line without numbers/symbols
            if (!potentialName) {
                for (const line of filteredLines) {
                    const trimmed = line.trim();
                    if (/@/.test(trimmed) || /\d{5,}/.test(trimmed)) continue;
                    if (/(pvt|ltd|inc|corp|services|private|limited)/i.test(trimmed)) continue;
                    const words = trimmed.split(/\s+/);
                    if (words.length >= 2 && words.length <= 5) {
                        potentialName = trimmed;
                        break;
                    }
                }
            }

            console.log('Extracted name:', potentialName);

            const parsedData = {
                name: potentialName || '',
                email: emails[0] || '',
                phone: validPhones[0] || '',
                company: '',
                designation: '',
                notes: `OCR Text:\n${text}`,
                source: 'OCR Scan'
            };

            console.log('=== FINAL PARSED DATA ===');
            console.log(parsedData);

            // Alert with what was found
            const found = [];
            if (parsedData.name) found.push('Name');
            if (parsedData.email) found.push('Email');
            if (parsedData.phone) found.push('Phone');

            if (found.length === 0) {
                alert('❌ No contact details extracted.\n\nTips:\n• Ensure good lighting\n• Hold steady\n• Card should be clear & flat\n\nCheck console (F12) for raw OCR text.');
                setOcrProcessing(false);
                setOcrStatus('');
                return;
            } else if (found.length < 3) {
                console.warn(`⚠️ Partial extraction: ${found.join(', ')}`);
                // Still show the form even if partial
            }

            setScannedData(parsedData);
            setCurrentScanType('OCR');
            // Save immediately to database with raw OCR text
            saveScannedVisitorImmediately(parsedData, 'OCR', text);
            setShowAfterScan(true);

        } catch (err) {
            console.error('OCR Error:', err);
            alert('❌ OCR failed. Please try again with better image quality.');
        } finally {
            setOcrProcessing(false);
            setOcrStatus('');
        }
    };

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const scannedTime = new Date(timestamp);
        const diffMs = now - scannedTime;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} mins ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hours ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} days ago`;
    };

    return (
        <div style={{ padding: '0px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>Qr Scanner</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Scan visitor badges to capture leads instantly</p>
                </div>
            </div>

            {/* Scanner Interface */}
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '24px', width: 'fit-content' }}>
                <button
                    onClick={() => { setActiveTab('qr'); setIsScanning(false); }}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        border: 'none',
                        background: activeTab === 'qr' ? 'white' : 'transparent',
                        color: activeTab === 'qr' ? '#2563eb' : '#64748b',
                        fontWeight: 600,
                        fontSize: '14px',
                        cursor: 'pointer',
                        boxShadow: activeTab === 'qr' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    <QrCode size={16} />
                    QR Scanner
                </button>
                <button
                    onClick={() => { setActiveTab('ocr'); if (isScanning) stopScanning(); }}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        border: 'none',
                        background: activeTab === 'ocr' ? 'white' : 'transparent',
                        color: activeTab === 'ocr' ? '#2563eb' : '#64748b',
                        fontWeight: 600,
                        fontSize: '14px',
                        cursor: 'pointer',
                        boxShadow: activeTab === 'ocr' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    <ScanText size={16} />
                    OCR Scanner
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '24px' }}>
                {/* Scanner Interface */}
                <div className="card" style={{ padding: '32px' }}>

                    {activeTab === 'qr' ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                                <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '12px', borderRadius: '12px' }}>
                                    <QrCode size={24} color="#2563eb" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Scan Visitor Badge</h3>
                                    <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>Point your camera at the visitor's QR code badge</p>
                                </div>
                            </div>

                            {/* Camera Preview / QR Reader */}
                            {/* ... (Existing QR UI wrapper logic) ... */}
                        </>
                    ) : (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                                <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '12px', borderRadius: '12px' }}>
                                    <ScanText size={24} color="#2563eb" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Business Card OCR Scanner</h3>
                                    <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>Scan business cards to automatically extract contact details</p>
                                </div>
                            </div>

                            <div style={{
                                background: '#f8fafc',
                                border: '2px dashed #cbd5e1',
                                borderRadius: '16px',
                                padding: '40px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '300px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    capture="environment" // Hint to mobile browsers to use camera
                                    onChange={handleFileChange}
                                />

                                {ocrProcessing ? (
                                    <>
                                        <Loader2 size={48} className="animate-spin" color="#3b82f6" />
                                        <p style={{ marginTop: '16px', fontWeight: 600, color: '#1e293b' }}>Processing Business Card...</p>
                                        <p style={{ fontSize: '14px', color: '#64748b' }}>{ocrStatus}</p>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ background: '#e0f2fe', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
                                            <Upload size={32} color="#0284c7" />
                                        </div>
                                        <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                                            Upload Business Card
                                        </h4>
                                        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', maxWidth: '300px' }}>
                                            Drag and drop or click to upload an image of the business card
                                        </p>

                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button style={{
                                                padding: '10px 20px',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0',
                                                background: 'white',
                                                color: '#1e293b',
                                                fontWeight: 600,
                                                fontSize: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                                onClick={(e) => { e.stopPropagation(); startOcrCamera(); }}
                                            >
                                                <Camera size={16} /> Use Camera
                                            </button>
                                            <button style={{
                                                padding: '10px 20px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: '#10b981',
                                                color: 'white',
                                                fontWeight: 600,
                                                fontSize: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                            >
                                                <ImageIcon size={16} /> Choose Image
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div style={{ marginTop: '24px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                                    <Users size={14} /> Name Detection
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                                    <ScanText size={14} /> Email Extraction
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                                    <Activity size={14} /> Phone Numbers
                                </div>
                            </div>
                        </>
                    )}


                    {/* Camera Preview / QR Reader */}
                    {activeTab === 'qr' && (
                        <div style={{
                            aspectRatio: '16/9',
                            background: '#f8fafc',
                            borderRadius: '24px',
                            border: isScanning ? '2px solid #2563eb' : '2px dashed #e2e8f0',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94a3b8',
                            gap: '16px',
                            marginBottom: '32px',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            {/* Placeholder shown when not scanning */}
                            {!isScanning && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '16px',
                                    zIndex: 1,
                                    background: '#f8fafc'
                                }}>
                                    <Camera size={64} style={{ opacity: 0.5 }} />
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#64748b' }}>Camera Preview</div>
                                        <div style={{ fontSize: '14px' }}>Click the button below to start scanning</div>
                                    </div>
                                    {cameraError && (
                                        <div style={{
                                            background: '#fef2f2',
                                            color: '#dc2626',
                                            padding: '12px 20px',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            maxWidth: '80%',
                                            textAlign: 'center'
                                        }}>
                                            {cameraError}
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* QR Reader Container - Html5Qrcode will render the camera here */}
                            <div
                                id="qr-reader"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    display: isScanning ? 'block' : 'none'
                                }}
                            ></div>
                            {isScanning && (
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '200px',
                                    height: '200px',
                                    border: '2px solid #2563eb',
                                    borderRadius: '16px',
                                    boxShadow: '0 0 0 1000px rgba(0,0,0,0.5)',
                                    pointerEvents: 'none',
                                    zIndex: 2
                                }}>
                                    <div className="scanner-line" style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '2px',
                                        background: '#2563eb',
                                        animation: 'scan 2s infinite alternate'
                                    }}></div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'qr' && (
                        <div style={{ display: 'flex', gap: '16px' }}>
                            {!isScanning ? (
                                <>
                                    <button
                                        onClick={startScanning}
                                        style={{
                                            flex: 2,
                                            padding: '16px',
                                            background: '#2563eb',
                                            color: 'white',
                                            borderRadius: '12px',
                                            fontWeight: 600,
                                            fontSize: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '12px',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <QrCode size={20} />
                                        Start Scanning
                                    </button>
                                    <button
                                        onClick={() => setShowTypeCodeModal(true)}
                                        style={{
                                            flex: 1,
                                            padding: '16px',
                                            background: '#10b981',
                                            color: 'white',
                                            borderRadius: '12px',
                                            border: 'none',
                                            fontWeight: 600,
                                            fontSize: '16px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <Search size={18} />
                                        Type Code
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={stopScanning}
                                    style={{
                                        flex: 1,
                                        padding: '16px',
                                        background: '#ef4444',
                                        color: 'white',
                                        borderRadius: '12px',
                                        fontWeight: 600,
                                        fontSize: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '12px',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <X size={20} />
                                    Stop Scanning
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Recent Scans Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <Clock size={18} color="#64748b" />
                            <span style={{ fontWeight: 700, color: '#1e293b' }}>Recent Scans</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                            {recentScans.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '14px' }}>
                                    No scans yet
                                </div>
                            ) : (
                                recentScans.map((scan, idx) => (
                                    <div key={scan.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#f8fafc', borderRadius: '12px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '12px' }}>
                                            {scan.name ? scan.name[0].toUpperCase() : '?'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{scan.name || 'Unknown'}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{scan.company || 'No company'}</div>
                                        </div>
                                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                                            {formatTimeAgo(scan.scanned_at || scan.created_at)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="card" style={{ padding: '24px' }}>
                        <h4 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>Today's Summary</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: '#64748b' }}>Total Scans</span>
                                <span style={{ fontWeight: 700, color: '#1e293b' }}>{recentScans.length}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: '#64748b' }}>Unique Visitors</span>
                                <span style={{ fontWeight: 700, color: '#1e293b' }}>{recentScans.length}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: '#64748b' }}>Avg. Score</span>
                                <span style={{ fontWeight: 700, color: '#10b981' }}>
                                    {recentScans.length > 0
                                        ? (recentScans.reduce((acc, s) => acc + (s.rating || 0), 0) / recentScans.length).toFixed(1)
                                        : '0.0'
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '32px', paddingBottom: '24px' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Powered By Billiton</p>
            </div>

            {/* After Scan Modal */}
            {showAfterScan && (
                <>
                    {typeof scannedData === 'object' && scannedData.name ? (
                        // Visitor QR Code Scanned - Show Details
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            minHeight: '100vh', // Ensure full height
                            height: '100%', // Fallback
                            background: 'rgba(0, 0, 0, 0.85)', // Darker background for visibility
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 9999, // Super high z-index
                            backdropFilter: 'blur(4px)',
                            padding: '20px', // Add padding to prevent edge touching
                            boxSizing: 'border-box'
                        }}>
                            <div style={{
                                background: 'white',
                                borderRadius: '24px',
                                padding: '32px',
                                width: '100%', // Full width on mobile
                                maxWidth: '500px',
                                maxHeight: '90vh', // Prevent overflow
                                overflowY: 'auto', // Allow scrolling if content is tall
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                position: 'relative' // Ensure content stacking
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Visitor Details</h2>
                                    <button
                                        onClick={handleAfterScanClose}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#94a3b8',
                                            padding: '4px'
                                        }}
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div style={{
                                    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                                    padding: '24px',
                                    borderRadius: '16px',
                                    marginBottom: '24px',
                                    textAlign: 'center',
                                    color: 'white'
                                }}>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 16px',
                                        fontSize: '32px',
                                        fontWeight: 700
                                    }}>
                                        {scannedData.name.charAt(0).toUpperCase()}
                                    </div>
                                    <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0' }}>{scannedData.name}</h3>
                                    <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>{scannedData.designation || 'Visitor'}</p>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {scannedData.company && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                                            <div style={{ background: '#e0f2fe', padding: '8px', borderRadius: '8px' }}>
                                                <Users size={20} color="#0284c7" />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Company</div>
                                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{scannedData.company}</div>
                                            </div>
                                        </div>
                                    )}

                                    {scannedData.email && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                                            <div style={{ background: '#fef3c7', padding: '8px', borderRadius: '8px' }}>
                                                <Activity size={20} color="#f59e0b" />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Email</div>
                                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{scannedData.email}</div>
                                            </div>
                                        </div>
                                    )}

                                    {scannedData.phone && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                                            <div style={{ background: '#dcfce7', padding: '8px', borderRadius: '8px' }}>
                                                <Activity size={20} color="#10b981" />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Phone</div>
                                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{scannedData.phone}</div>
                                            </div>
                                        </div>
                                    )}

                                    {scannedData.eventName && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                                            <div style={{ background: '#fce7f3', padding: '8px', borderRadius: '8px' }}>
                                                <Activity size={20} color="#ec4899" />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Event</div>
                                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{scannedData.eventName}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleAfterScanClose}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        background: '#2563eb',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: 600,
                                        fontSize: '16px',
                                        cursor: 'pointer',
                                        marginTop: '24px'
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Regular Lead Scan - Show AfterScan Form
                        <AfterScan
                            scannedData={scannedData}
                            scanType={currentScanType}
                            onClose={handleAfterScanClose}
                            onSave={handleLeadSaved}
                        />
                    )}
                </>
            )}

            {/* OCR Camera Preview Modal */}
            {showCamera && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: '#000',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000
                }}>
                    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />

                        <canvas ref={canvasRef} style={{ display: 'none' }} />

                        {/* Camera overlay and controls */}
                        <div style={{
                            position: 'absolute',
                            bottom: '40px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: '20px',
                            alignItems: 'center'
                        }}>
                            <button
                                onClick={stopOcrCamera}
                                style={{
                                    padding: '12px 24px',
                                    background: 'rgba(239, 68, 68, 0.9)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={capturePhoto}
                                style={{
                                    width: '70px',
                                    height: '70px',
                                    borderRadius: '50%',
                                    background: 'white',
                                    border: '4px solid rgba(37, 99, 235, 0.8)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                }}
                            >
                                <Camera size={32} color="#2563eb" />
                            </button>
                        </div>

                        {/* Guide overlay */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '95%',
                            aspectRatio: '1.6',
                            border: '4px dashed rgba(255, 255, 255, 0.8)',
                            borderRadius: '16px',
                            pointerEvents: 'none'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '-50px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'rgba(0, 0, 0, 0.8)',
                                color: 'white',
                                padding: '12px 20px',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: 600,
                                whiteSpace: 'nowrap'
                            }}>
                                📇 Position business card within frame
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Type Code Modal */}
            {showTypeCodeModal && (
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
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        width: '400px',
                        maxWidth: '90vw',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>Enter Visitor Code</h3>
                            <button
                                onClick={() => { setShowTypeCodeModal(false); setManualCode(''); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
                            >
                                <X size={20} color="#64748b" />
                            </button>
                        </div>

                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
                            Enter the visitor code from their badge (e.g., VIS-CGAEDCYF)
                        </p>

                        <input
                            type="text"
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                            placeholder="VIS-XXXXXXXX"
                            style={{
                                width: '100%',
                                padding: '16px',
                                fontSize: '18px',
                                fontWeight: 600,
                                fontFamily: 'monospace',
                                border: '2px solid #e2e8f0',
                                borderRadius: '12px',
                                textAlign: 'center',
                                letterSpacing: '2px',
                                marginBottom: '16px',
                                boxSizing: 'border-box'
                            }}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleManualCodeSubmit(); }}
                            autoFocus
                        />

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => { setShowTypeCodeModal(false); setManualCode(''); }}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    background: '#f1f5f9',
                                    color: '#64748b',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    fontSize: '16px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleManualCodeSubmit}
                                style={{
                                    flex: 2,
                                    padding: '14px',
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Search size={18} />
                                Find Visitor
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Scanner;
