import React, { useState } from 'react';
import { Download, Copy, Share2, Check } from 'lucide-react';

const QRCodeDisplay = ({
    qrCodeUrl,
    qrCodeBase64,
    title = "QR Code",
    shareLink,
    uniqueCode,
    onDownload,
    onShare
}) => {
    const [copied, setCopied] = useState(false);

    // Determine QR source (prefer base64, fallback to URL)
    const qrSrc = qrCodeBase64
        ? `data:image/png;base64,${qrCodeBase64}`
        : qrCodeUrl;

    // Download QR code as PNG
    const handleDownload = () => {
        if (onDownload) {
            onDownload();
            return;
        }

        const link = document.createElement('a');
        link.href = qrSrc;
        link.download = `${title.replace(/\s+/g, '_')}_QR.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Copy link to clipboard
    const handleCopyLink = async () => {
        if (shareLink) {
            try {
                await navigator.clipboard.writeText(shareLink);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy link:', err);
            }
        }
    };

    // Share QR code
    const handleShare = async () => {
        if (onShare) {
            onShare();
            return;
        }

        if (navigator.share && shareLink) {
            try {
                await navigator.share({
                    title: title,
                    text: `Check out this ${title}`,
                    url: shareLink
                });
            } catch (err) {
                console.log('Share cancelled or failed:', err);
            }
        } else {
            // Fallback: copy to clipboard
            handleCopyLink();
        }
    };

    // If no QR image, still show the share link and actions
    if (!qrSrc && !shareLink) {
        return (
            <div style={styles.container}>
                <div style={styles.noQr}>
                    <p>QR Code not available</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h3 style={styles.title}>📱 {title}</h3>
                {uniqueCode && (
                    <div style={styles.codeDisplay}>
                        <span style={styles.codeLabel}>Code:</span>
                        <span style={styles.codeValue}>{uniqueCode}</span>
                    </div>
                )}
            </div>

            {qrSrc ? (
                <div style={styles.qrWrapper}>
                    <div style={styles.qrContainer}>
                        <img
                            src={qrSrc}
                            alt={title}
                            style={styles.qrImage}
                        />
                    </div>
                </div>
            ) : (
                <div style={{
                    ...styles.qrWrapper,
                    padding: '40px',
                    background: 'white',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                        QR Code will be generated after event creation
                    </p>
                </div>
            )}

            {shareLink && (
                <div style={styles.linkContainer}>
                    <input
                        type="text"
                        value={shareLink}
                        readOnly
                        style={styles.linkInput}
                        onClick={(e) => e.target.select()}
                    />
                </div>
            )}


            <div style={styles.actions}>
                {qrSrc && (
                    <button
                        onClick={handleDownload}
                        style={styles.button}
                        title="Download QR Code"
                    >
                        <Download size={16} />
                        <span>Download</span>
                    </button>
                )}

                {shareLink && (
                    <button
                        onClick={handleCopyLink}
                        style={{
                            ...styles.button,
                            ...(copied ? styles.buttonSuccess : {})
                        }}
                        title="Copy Link"
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                )}

                {shareLink && (
                    <button
                        onClick={handleShare}
                        style={styles.button}
                        title="Share"
                    >
                        <Share2 size={16} />
                        <span>Share</span>
                    </button>
                )}
            </div>

            <p style={styles.hint}>
                Scan this QR code with a phone camera to access instantly
            </p>
        </div>
    );
};

const styles = {
    container: {
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
        border: '2px solid #10b981',
        borderRadius: '16px',
        padding: '24px',
        marginTop: '20px'
    },
    header: {
        marginBottom: '20px'
    },
    title: {
        fontSize: '18px',
        fontWeight: 600,
        color: '#047857',
        margin: '0 0 12px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    codeDisplay: {
        background: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #d1fae5',
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
        fontSize: '16px',
        fontWeight: 700,
        color: '#047857',
        fontFamily: 'monospace',
        letterSpacing: '1px'
    },
    qrWrapper: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px'
    },
    qrContainer: {
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        display: 'inline-block'
    },
    qrImage: {
        display: 'block',
        width: '200px',
        height: '200px',
        margin: '0 auto'
    },
    linkContainer: {
        marginBottom: '16px'
    },
    linkInput: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #d1fae5',
        borderRadius: '8px',
        fontSize: '13px',
        fontFamily: 'monospace',
        color: '#047857',
        background: 'white',
        cursor: 'pointer'
    },
    actions: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        flexWrap: 'wrap'
    },
    button: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        background: 'white',
        border: '2px solid #10b981',
        borderRadius: '8px',
        color: '#047857',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
        ':hover': {
            background: '#10b981',
            color: 'white'
        }
    },
    buttonSuccess: {
        background: '#10b981',
        color: 'white'
    },
    hint: {
        marginTop: '16px',
        fontSize: '12px',
        color: '#047857',
        textAlign: 'center',
        fontStyle: 'italic'
    },
    noQr: {
        padding: '40px',
        textAlign: 'center',
        color: '#6b7280'
    }
};

export default QRCodeDisplay;
