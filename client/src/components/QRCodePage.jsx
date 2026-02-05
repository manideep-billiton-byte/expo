import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Share2, Copy, Check, ArrowLeft, Calendar, MapPin, User, Mail, Phone, Building } from 'lucide-react';

const QRCodePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    // Determine type from URL path
    const type = window.location.pathname.includes('/qr/event/') ? 'event' : 'visitor';

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const endpoint = type === 'event'
                ? `/api/events/${id}`
                : `/api/visitors/${id}`;

            const response = await fetch(endpoint);
            if (!response.ok) throw new Error('Failed to fetch data');

            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getQRImageUrl = () => {
        if (!data) return null;

        const qrPath = type === 'event' ? data.qr_image_path : data.qr_code;
        if (!qrPath) return null;

        // If it's already a full URL, return it
        if (qrPath.startsWith('http')) return qrPath;

        // Otherwise, prepend the API base URL
        const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
        return `${baseUrl}${qrPath}`;
    };

    const getShareLink = () => {
        return window.location.href;
    };

    const handleDownload = () => {
        const qrUrl = getQRImageUrl();
        if (!qrUrl) return;

        const link = document.createElement('a');
        link.href = qrUrl;
        link.download = `${type}_${id}_QR.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(getShareLink());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: type === 'event' ? `Event: ${data.event_name}` : `Visitor: ${data.firstName} ${data.lastName}`,
            text: `Check out this ${type} QR code`,
            url: getShareLink()
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    handleCopyLink();
                }
            }
        } else {
            handleCopyLink();
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <p style={styles.loadingText}>Loading QR Code...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={styles.container}>
                <div style={styles.errorContainer}>
                    <h2 style={styles.errorTitle}>⚠️ Error</h2>
                    <p style={styles.errorText}>{error || 'Data not found'}</p>
                    <button onClick={() => navigate(-1)} style={styles.backButton}>
                        <ArrowLeft size={16} />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const qrImageUrl = getQRImageUrl();

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                {/* Header */}
                <div style={styles.header}>
                    <button onClick={() => navigate(-1)} style={styles.backButtonSmall}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 style={styles.title}>
                        {type === 'event' ? '🎫 Event QR Code' : '👤 Visitor QR Code'}
                    </h1>
                </div>

                {/* Info Card */}
                <div style={styles.infoCard}>
                    {type === 'event' ? (
                        <>
                            <h2 style={styles.infoTitle}>{data.event_name}</h2>
                            <div style={styles.infoGrid}>
                                <div style={styles.infoItem}>
                                    <Calendar size={16} color="#6b7280" />
                                    <span>{data.start_date ? new Date(data.start_date).toLocaleDateString() : 'TBD'}</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <MapPin size={16} color="#6b7280" />
                                    <span>{data.venue || 'Venue TBD'}</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <Building size={16} color="#6b7280" />
                                    <span>{data.city || 'City TBD'}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 style={styles.infoTitle}>{data.firstName} {data.lastName}</h2>
                            {data.unique_code && (
                                <div style={styles.uniqueCode}>
                                    <span style={styles.codeLabel}>Unique Code:</span>
                                    <span style={styles.codeValue}>{data.unique_code}</span>
                                </div>
                            )}
                            <div style={styles.infoGrid}>
                                {data.email && (
                                    <div style={styles.infoItem}>
                                        <Mail size={16} color="#6b7280" />
                                        <span>{data.email}</span>
                                    </div>
                                )}
                                {data.phone && (
                                    <div style={styles.infoItem}>
                                        <Phone size={16} color="#6b7280" />
                                        <span>{data.phone}</span>
                                    </div>
                                )}
                                {data.company && (
                                    <div style={styles.infoItem}>
                                        <Building size={16} color="#6b7280" />
                                        <span>{data.company}</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* QR Code Display */}
                <div style={styles.qrSection}>
                    {qrImageUrl ? (
                        <div style={styles.qrContainer}>
                            <img
                                src={qrImageUrl}
                                alt={`${type} QR Code`}
                                style={styles.qrImage}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                            <div style={{ ...styles.qrPlaceholder, display: 'none' }}>
                                <p>QR Code image not available</p>
                            </div>
                        </div>
                    ) : (
                        <div style={styles.qrPlaceholder}>
                            <p>QR Code will be generated soon</p>
                        </div>
                    )}

                    <p style={styles.qrHint}>
                        📱 Scan this QR code with your phone camera
                    </p>
                </div>

                {/* Action Buttons */}
                <div style={styles.actions}>
                    {qrImageUrl && (
                        <button onClick={handleDownload} style={styles.button}>
                            <Download size={18} />
                            <span>Download QR</span>
                        </button>
                    )}

                    <button
                        onClick={handleCopyLink}
                        style={{
                            ...styles.button,
                            ...(copied ? styles.buttonSuccess : {})
                        }}
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
                    </button>

                    <button onClick={handleShare} style={styles.buttonPrimary}>
                        <Share2 size={18} />
                        <span>Share</span>
                    </button>
                </div>

                {/* Share Link Display */}
                <div style={styles.linkContainer}>
                    <label style={styles.linkLabel}>Shareable Link:</label>
                    <input
                        type="text"
                        value={getShareLink()}
                        readOnly
                        style={styles.linkInput}
                        onClick={(e) => e.target.select()}
                    />
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    content: {
        maxWidth: '600px',
        width: '100%',
        background: 'white',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px'
    },
    backButtonSmall: {
        background: '#f3f4f6',
        border: 'none',
        borderRadius: '12px',
        padding: '10px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s'
    },
    title: {
        fontSize: '28px',
        fontWeight: 700,
        color: '#1f2937',
        margin: 0
    },
    infoCard: {
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        border: '2px solid #0ea5e9',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
    },
    infoTitle: {
        fontSize: '22px',
        fontWeight: 700,
        color: '#0c4a6e',
        margin: '0 0 16px 0'
    },
    uniqueCode: {
        background: 'white',
        padding: '12px 16px',
        borderRadius: '10px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    codeLabel: {
        fontSize: '14px',
        fontWeight: 500,
        color: '#6b7280'
    },
    codeValue: {
        fontSize: '18px',
        fontWeight: 700,
        color: '#0ea5e9',
        fontFamily: 'monospace',
        letterSpacing: '1px'
    },
    infoGrid: {
        display: 'grid',
        gap: '12px'
    },
    infoItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '14px',
        color: '#374151'
    },
    qrSection: {
        textAlign: 'center',
        marginBottom: '24px'
    },
    qrContainer: {
        background: 'white',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        display: 'inline-block',
        marginBottom: '16px'
    },
    qrImage: {
        width: '280px',
        height: '280px',
        display: 'block'
    },
    qrPlaceholder: {
        background: '#f3f4f6',
        padding: '60px 40px',
        borderRadius: '16px',
        color: '#6b7280',
        fontSize: '16px',
        marginBottom: '16px'
    },
    qrHint: {
        fontSize: '14px',
        color: '#6b7280',
        fontStyle: 'italic',
        margin: 0
    },
    actions: {
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap'
    },
    button: {
        flex: 1,
        minWidth: '140px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '14px 20px',
        background: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: 600,
        color: '#374151',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    buttonPrimary: {
        flex: 1,
        minWidth: '140px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '14px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: 600,
        color: 'white',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    buttonSuccess: {
        background: '#10b981',
        borderColor: '#10b981',
        color: 'white'
    },
    linkContainer: {
        marginTop: '24px'
    },
    linkLabel: {
        display: 'block',
        fontSize: '14px',
        fontWeight: 600,
        color: '#374151',
        marginBottom: '8px'
    },
    linkInput: {
        width: '100%',
        padding: '12px 16px',
        border: '2px solid #e5e7eb',
        borderRadius: '10px',
        fontSize: '14px',
        fontFamily: 'monospace',
        color: '#6b7280',
        background: '#f9fafb',
        cursor: 'pointer'
    },
    loadingContainer: {
        textAlign: 'center',
        padding: '60px 40px',
        background: 'white',
        borderRadius: '24px'
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '4px solid #f3f4f6',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 20px'
    },
    loadingText: {
        fontSize: '16px',
        color: '#6b7280'
    },
    errorContainer: {
        textAlign: 'center',
        padding: '60px 40px',
        background: 'white',
        borderRadius: '24px'
    },
    errorTitle: {
        fontSize: '24px',
        fontWeight: 700,
        color: '#ef4444',
        marginBottom: '12px'
    },
    errorText: {
        fontSize: '16px',
        color: '#6b7280',
        marginBottom: '24px'
    },
    backButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        background: '#667eea',
        border: 'none',
        borderRadius: '12px',
        color: 'white',
        fontSize: '15px',
        fontWeight: 600,
        cursor: 'pointer'
    }
};

export default QRCodePage;
