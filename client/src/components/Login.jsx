import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Shield, Building2, Store, User, CheckCircle } from 'lucide-react';
import { apiFetch } from '../utils/api';

const Login = ({ onLogin, loginType: initialLoginType = 'master' }) => {
    const [selectedRole, setSelectedRole] = useState(initialLoginType);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const roles = [
        {
            id: 'master',
            label: 'Master Admin',
            icon: Shield,
            color: '#10b981',
            bgColor: '#ecfdf5',
            borderColor: '#d1fae5'
        },
        {
            id: 'organization',
            label: 'Organization',
            icon: Building2,
            color: '#8b5cf6',
            bgColor: '#f5f3ff',
            borderColor: '#ede9fe'
        },
        {
            id: 'exhibitor',
            label: 'Exhibitor',
            icon: Store,
            color: '#f59e0b',
            bgColor: '#fef3c7',
            borderColor: '#fde68a'
        },
        {
            id: 'visitor',
            label: 'Visitor',
            icon: User,
            color: '#0d9488',
            bgColor: '#f0fdfa',
            borderColor: '#ccfbf1'
        }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const isExhibitorLogin = selectedRole === 'exhibitor';
            const isVisitorLogin = selectedRole === 'visitor';

            if (isExhibitorLogin) {
                const response = await apiFetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, type: 'exhibitor' }),
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('userEmail', data.user.email);
                    localStorage.setItem('userType', data.userType || 'exhibitor');
                    localStorage.setItem('exhibitorId', data.user.id);
                    localStorage.setItem('exhibitorName', data.user.name);
                    // Store event info for QR validation
                    if (data.user.eventId) {
                        localStorage.setItem('eventId', data.user.eventId);
                        localStorage.setItem('eventName', data.user.eventName || '');
                    }
                    if (rememberMe) localStorage.setItem('rememberMe', 'true');
                    onLogin();
                } else {
                    setError(data.error || 'Invalid email or password');
                }
            } else if (isVisitorLogin) {
                const response = await apiFetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, type: 'visitor' }),
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('userEmail', data.user.email);
                    localStorage.setItem('userType', data.userType || 'visitor');
                    localStorage.setItem('visitorId', data.user.id);
                    localStorage.setItem('visitorName', data.user.name);
                    if (rememberMe) localStorage.setItem('rememberMe', 'true');
                    onLogin();
                } else {
                    setError(data.error || 'Invalid email or password');
                }
            } else if (selectedRole === 'master') {
                if (email === 'billiton@123' && password === '123456') {
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('userEmail', email);
                    localStorage.setItem('userType', 'master');
                    if (rememberMe) localStorage.setItem('rememberMe', 'true');
                    onLogin();
                } else {
                    setError('Invalid email or password');
                }
            } else {
                const response = await apiFetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, type: 'organization' }),
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('userEmail', data.user.email);
                    localStorage.setItem('userType', data.userType || 'organization');
                    localStorage.setItem('organizationId', data.user.id);
                    localStorage.setItem('organizationName', data.user.name);
                    if (rememberMe) localStorage.setItem('rememberMe', 'true');
                    onLogin();
                } else {
                    setError(data.error || 'Invalid email or password');
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Failed to login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%', flexDirection: window.innerWidth <= 768 ? 'column' : 'row' }}>
            {/* Left Panel - Authentication */}
            <div style={{
                flex: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: window.innerWidth <= 768 ? '24px 20px' : '40px',
                background: 'white',
                position: 'relative',
                minHeight: window.innerWidth <= 768 ? '100vh' : 'auto'
            }}>
                {/* Subtle glow effects */}
                <div style={{
                    position: 'absolute',
                    top: '-100px',
                    left: '-100px',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(13, 148, 136, 0.1) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                    pointerEvents: 'none',
                    display: window.innerWidth <= 768 ? 'none' : 'block'
                }} />

                <div style={{ maxWidth: '480px', width: '100%', position: 'relative', zIndex: 1 }}>
                    {/* Back to Home Link */}
                    <a href="/" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#64748b',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 500,
                        marginBottom: window.innerWidth <= 768 ? '24px' : '32px'
                    }}>
                        ← Back to Home
                    </a>

                    {/* Logo */}
                    <div style={{ marginBottom: window.innerWidth <= 768 ? '24px' : '32px' }}>
                        <div style={{
                            fontSize: window.innerWidth <= 768 ? '22px' : '24px',
                            fontWeight: 800,
                            color: '#0d9488',
                            marginBottom: '8px'
                        }}>
                            EventHub
                        </div>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>
                            Welcome back! Please sign in to continue
                        </div>
                    </div>

                    {/* Role Selection Cards */}
                    <div style={{ marginBottom: window.innerWidth <= 768 ? '24px' : '32px' }}>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#475569',
                            marginBottom: '16px'
                        }}>
                            Select your role
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '12px'
                        }}>
                            {roles.map((role) => {
                                const isSelected = selectedRole === role.id;
                                const RoleIcon = role.icon;
                                return (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => setSelectedRole(role.id)}
                                        style={{
                                            padding: window.innerWidth <= 768 ? '14px' : '16px',
                                            borderRadius: '12px',
                                            border: `2px solid ${isSelected ? role.color : '#e2e8f0'}`,
                                            background: isSelected ? role.bgColor : 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px',
                                            position: 'relative',
                                            minHeight: '44px'
                                        }}
                                        onMouseOver={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.borderColor = '#0d9488';
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)';
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.borderColor = '#e2e8f0';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }
                                        }}
                                    >
                                        {isSelected && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px'
                                            }}>
                                                <CheckCircle size={16} color={role.color} fill={role.color} />
                                            </div>
                                        )}
                                        <div style={{
                                            width: window.innerWidth <= 768 ? '36px' : '40px',
                                            height: window.innerWidth <= 768 ? '36px' : '40px',
                                            borderRadius: '10px',
                                            background: isSelected ? role.color : role.bgColor,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <RoleIcon size={window.innerWidth <= 768 ? 18 : 20} color={isSelected ? 'white' : role.color} />
                                        </div>
                                        <span style={{
                                            fontSize: window.innerWidth <= 768 ? '13px' : '14px',
                                            fontWeight: 600,
                                            color: isSelected ? role.color : '#475569'
                                        }}>
                                            {role.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#475569',
                                marginBottom: '8px'
                            }}>
                                Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} color="#94a3b8" style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)'
                                }} />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px 12px 44px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e2e8f0',
                                        outline: 'none',
                                        fontSize: window.innerWidth <= 768 ? '16px' : '14px',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#0d9488'}
                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#475569',
                                marginBottom: '8px'
                            }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} color="#94a3b8" style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)'
                                }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 44px 12px 44px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e2e8f0',
                                        outline: 'none',
                                        fontSize: window.innerWidth <= 768 ? '16px' : '14px',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#0d9488'}
                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        minHeight: '44px',
                                        minWidth: '44px'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div style={{
                                padding: '12px',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '8px',
                                color: '#dc2626',
                                fontSize: '14px',
                                marginBottom: '16px'
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Remember Me & Forgot Password */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '24px',
                            flexWrap: 'wrap',
                            gap: '12px'
                        }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: '#475569',
                                minHeight: '44px'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    style={{
                                        width: '18px',
                                        height: '18px',
                                        cursor: 'pointer',
                                        accentColor: '#0d9488'
                                    }}
                                />
                                Remember me
                            </label>
                            <a href="#" style={{
                                fontSize: '14px',
                                color: '#0d9488',
                                textDecoration: 'none',
                                fontWeight: 500,
                                minHeight: '44px',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                Forgot password?
                            </a>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: loading ? '#94a3b8' : '#0d9488',
                                border: 'none',
                                borderRadius: '10px',
                                color: 'white',
                                fontSize: '16px',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: '0 2px 8px rgba(13, 148, 136, 0.3)',
                                minHeight: '48px'
                            }}
                            onMouseOver={(e) => {
                                if (!loading) {
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(13, 148, 136, 0.4)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!loading) {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 2px 8px rgba(13, 148, 136, 0.3)';
                                }
                            }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div style={{
                        marginTop: '24px',
                        textAlign: 'center',
                        fontSize: '14px',
                        color: '#64748b'
                    }}>
                        Don't have an account?{' '}
                        <a href="#" style={{
                            color: '#0d9488',
                            textDecoration: 'none',
                            fontWeight: 600
                        }}>
                            Sign up
                        </a>
                    </div>
                </div>
            </div>

            {/* Right Panel - Hero Section (Hidden on Mobile) */}
            {window.innerWidth > 768 && (
                <div style={{
                    flex: '1',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Background glows */}
                    <div style={{
                        position: 'absolute',
                        top: '10%',
                        right: '-10%',
                        width: '500px',
                        height: '500px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
                        filter: 'blur(60px)'
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '-10%',
                        left: '-10%',
                        width: '400px',
                        height: '400px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                        filter: 'blur(60px)'
                    }} />

                    <div style={{ maxWidth: '520px', position: 'relative', zIndex: 1 }}>
                        <h1 style={{
                            fontSize: '48px',
                            fontWeight: 800,
                            lineHeight: '1.2',
                            marginBottom: '24px',
                            background: 'linear-gradient(135deg, #0d9488 0%, #3b82f6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            Event Management Like Never Before
                        </h1>
                        <p style={{
                            fontSize: '18px',
                            color: '#cbd5e1',
                            lineHeight: '1.6',
                            marginBottom: '40px'
                        }}>
                            Powerful tools to create, manage, and analyze your events with ease
                        </p>

                        {/* Features List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {[
                                'Real-time analytics and reporting',
                                'Seamless attendee management',
                                'Advanced lead tracking system',
                                'Multi-role access control'
                            ].map((feature, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px'
                                }}>
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: '#0d9488',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <CheckCircle size={14} color="white" />
                                    </div>
                                    <span style={{
                                        fontSize: '16px',
                                        color: '#e2e8f0',
                                        fontWeight: 500
                                    }}>
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Powered by */}
                        <div style={{
                            marginTop: '60px',
                            paddingTop: '32px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <div style={{
                                fontSize: '12px',
                                color: '#94a3b8',
                                marginBottom: '8px'
                            }}>
                                Powered by
                            </div>
                            <div style={{
                                fontSize: '20px',
                                fontWeight: 700,
                                color: 'white'
                            }}>
                                Billiton Services
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
