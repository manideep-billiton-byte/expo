import React from 'react';
import { QrCode, Camera, LogOut, ChevronDown, Bell, Settings, Search, Clock, Users, Activity } from 'lucide-react';

const Scanner = () => {
    return (
        <div style={{ padding: '0px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>Qr Scanner</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Scan visitor badges to capture leads instantly</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '24px' }}>
                {/* Scanner Interface */}
                <div className="card" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                        <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '12px', borderRadius: '12px' }}>
                            <QrCode size={24} color="#2563eb" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Scan Visitor Badge</h3>
                            <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>Point your camera at the visitor's QR code badge</p>
                        </div>
                    </div>

                    <div style={{
                        aspectRatio: '16/9',
                        background: '#f8fafc',
                        borderRadius: '24px',
                        border: '2px dashed #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8',
                        gap: '16px',
                        marginBottom: '32px'
                    }}>
                        <Camera size={64} style={{ opacity: 0.5 }} />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '16px', fontWeight: 600, color: '#64748b' }}>Camera Preview</div>
                            <div style={{ fontSize: '14px' }}>Click the button below to start scanning</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button style={{
                            flex: 3,
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
                        }}>
                            <QrCode size={20} />
                            Start Scanning
                        </button>
                        <button style={{
                            flex: 1,
                            padding: '16px',
                            background: 'white',
                            color: '#1e293b',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            fontWeight: 600,
                            fontSize: '16px',
                            cursor: 'pointer'
                        }}>
                            + Manual Entry
                        </button>
                    </div>
                </div>

                {/* Recent Scans Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <Clock size={18} color="#64748b" />
                            <span style={{ fontWeight: 700, color: '#1e293b' }}>Recent Scans</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { name: 'Rajesh Kumar', company: 'Infosys', time: '2 mins ago' },
                                { name: 'Priya Sharma', company: 'TCS', time: '15 mins ago' },
                                { name: 'Amit Patel', company: 'Wipro', time: '32 mins ago' },
                                { name: 'Amit Patel', company: 'Wipro', time: '32 mins ago' },
                                { name: 'Amit Patel', company: 'Wipro', time: '32 mins ago' },
                                { name: 'Amit Patel', company: 'Wipro', time: '32 mins ago' },
                                { name: 'Amit Patel', company: 'Wipro', time: '32 mins ago' },
                                { name: 'Amit Patel', company: 'Wipro', time: '32 mins ago' }
                            ].map((scan, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#f8fafc', borderRadius: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0f2f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d89a4', fontWeight: 600, fontSize: '12px' }}>
                                        {scan.name[0]}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{scan.name}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{scan.company}</div>
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{scan.time}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card" style={{ padding: '24px' }}>
                        <h4 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>Today's Summary</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: '#64748b' }}>Total Scans</span>
                                <span style={{ fontWeight: 700, color: '#1e293b' }}>87</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: '#64748b' }}>Unique Visitors</span>
                                <span style={{ fontWeight: 700, color: '#1e293b' }}>72</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: '#64748b' }}>Avg. Score</span>
                                <span style={{ fontWeight: 700, color: '#10b981' }}>7.8</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '32px', paddingBottom: '24px' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Powered By Billiton</p>
            </div>
        </div>
    );
};

export default Scanner;
