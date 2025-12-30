import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Star } from 'lucide-react';

const Login = ({ onLogin, loginType = 'master' }) => {
    // Support for exhibitor and visitor login types
    const isExhibitorLogin = loginType === 'exhibitor';
    const isVisitorLogin = loginType === 'visitor';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isExhibitorLogin) {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password, type: 'exhibitor' }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('userEmail', data.user.email);
                    localStorage.setItem('userType', data.userType || 'exhibitor');
                    localStorage.setItem('exhibitorId', data.user.id);
                    localStorage.setItem('exhibitorName', data.user.name);
                    if (rememberMe) {
                        localStorage.setItem('rememberMe', 'true');
                    }
                    onLogin();
                } else {
                    setError(data.error || 'Invalid email or password');
                }
            } else if (isVisitorLogin) {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password, type: 'visitor' }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('userEmail', data.user.email);
                    localStorage.setItem('userType', data.userType || 'visitor');
                    localStorage.setItem('visitorId', data.user.id);
                    localStorage.setItem('visitorName', data.user.name);
                    if (rememberMe) {
                        localStorage.setItem('rememberMe', 'true');
                    }
                    onLogin();
                } else {
                    setError(data.error || 'Invalid email or password');
                }
            } else if (loginType === 'master') {
                // Master admin login
                if (email === 'billiton@123' && password === '123456') {
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('userEmail', email);
                    localStorage.setItem('userType', 'master');
                    if (rememberMe) {
                        localStorage.setItem('rememberMe', 'true');
                    }
                    onLogin();
                } else {
                    setError('Invalid email or password');
                }
            } else {
                // Organization login
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password, type: 'organization' }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('userEmail', data.user.email);
                    localStorage.setItem('userType', data.userType || 'organization');
                    localStorage.setItem('organizationId', data.user.id);
                    localStorage.setItem('organizationName', data.user.name);
                    if (rememberMe) {
                        localStorage.setItem('rememberMe', 'true');
                    }
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
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            width: '100%',
            background: 'linear-gradient(135deg, #e0f2fe 0%, #fce7f3 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background decorative shapes */}
            <div style={{
                position: 'absolute',
                top: '-50px',
                left: '-50px',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'rgba(59, 130, 246, 0.1)',
                filter: 'blur(60px)'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-50px',
                right: '-50px',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'rgba(236, 72, 153, 0.1)',
                filter: 'blur(60px)'
            }} />

            {/* Left Section - Marketing/Information */}
            <div style={{
                flex: '2',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '60px',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{
                    maxWidth: '600px',
                    width: '100%'
                }}>
                    <h1 style={{
                        fontSize: '56px',
                        fontWeight: 800,
                        color: '#1e40af',
                        margin: '0 0 24px 0',
                        lineHeight: '1.2'
                    }}>
                        Event Management
                    </h1>
                    <p style={{
                        fontSize: '20px',
                        color: '#475569',
                        margin: '0 0 60px 0',
                        lineHeight: '1.6'
                    }}>
                        Create, manage, and celebrate unforgettable events with our powerful platform
                    </p>

                    {/* Illustration Area */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.5)',
                        borderRadius: '24px',
                        padding: '40px',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        marginBottom: '60px',
                        position: 'relative',
                        minHeight: '300px'
                    }}>
                        {/* Card illustration */}
                        <div style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '20px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                            position: 'relative'
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
                                height: '40px',
                                borderRadius: '8px 8px 0 0',
                                margin: '-20px -20px 20px -20px',
                                display: 'flex',
                                alignItems: 'center',
                                paddingLeft: '12px',
                                gap: '8px'
                            }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '12px',
                                marginBottom: '20px'
                            }}>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} style={{
                                        height: '60px',
                                        background: '#f1f5f9',
                                        borderRadius: '8px'
                                    }} />
                                ))}
                            </div>
                            {/* People icons */}
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                alignItems: 'center'
                            }}>
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: i % 2 === 0 ? '#fce7f3' : '#e2e8f0',
                                        border: '2px solid white',
                                        marginLeft: i > 1 ? '-12px' : '0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        color: '#64748b'
                                    }}>👤</div>
                                ))}
                            </div>
                        </div>

                        {/* Floating icons */}
                        <div style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: '#fbbf24',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)'
                        }}>
                            🔔
                        </div>
                        <div style={{
                            position: 'absolute',
                            top: '70px',
                            right: '20px',
                            background: '#3b82f6',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}>
                            ⭐
                        </div>

                        {/* Decorative shapes */}
                        <div style={{
                            position: 'absolute',
                            bottom: '40px',
                            left: '40px',
                            width: '60px',
                            height: '60px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                            opacity: 0.6,
                            transform: 'rotate(45deg)'
                        }} />
                    </div>

                    {/* Statistics */}
                    <div style={{
                        display: 'flex',
                        gap: '48px',
                        justifyContent: 'flex-start'
                    }}>
                        <div>
                            <div style={{
                                fontSize: '36px',
                                fontWeight: 800,
                                color: '#1e40af',
                                marginBottom: '8px'
                            }}>50K+</div>
                            <div style={{
                                fontSize: '14px',
                                color: '#64748b',
                                fontWeight: 500
                            }}>Events Created</div>
                        </div>
                        <div>
                            <div style={{
                                fontSize: '36px',
                                fontWeight: 800,
                                color: '#1e40af',
                                marginBottom: '8px'
                            }}>2M+</div>
                            <div style={{
                                fontSize: '14px',
                                color: '#64748b',
                                fontWeight: 500
                            }}>Attendees</div>
                        </div>
                        <div>
                            <div style={{
                                fontSize: '36px',
                                fontWeight: 800,
                                color: '#1e40af',
                                marginBottom: '8px'
                            }}>99%</div>
                            <div style={{
                                fontSize: '14px',
                                color: '#64748b',
                                fontWeight: 500
                            }}>Satisfaction</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section - Login Form */}
            <div style={{
                flex: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Floating dot */}
                <div style={{
                    position: 'absolute',
                    top: '40px',
                    left: '40px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#ec4899',
                    boxShadow: '0 0 20px rgba(236, 72, 153, 0.5)'
                }} />

                <div style={{
                    background: 'white',
                    borderRadius: '24px',
                    padding: '48px',
                    width: '100%',
                    maxWidth: '420px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                    position: 'relative'
                }}>
                    {/* Powered By Badge */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#fce7f3',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#ec4899',
                        marginBottom: '32px'
                    }}>
                        <Star size={14} fill="#ec4899" />
                        Powered By Billiton
                    </div>

                    <h2 style={{
                        fontSize: '32px',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #ec4899 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        margin: '0 0 8px 0'
                    }}>
                        Welcome Back
                    </h2>
                    <p style={{
                        fontSize: '14px',
                        color: '#64748b',
                        margin: '0 0 32px 0'
                    }}>
                        {isExhibitorLogin ? 'Exhibitor Login - Sign in to manage your stall' : 
                         isVisitorLogin ? 'Visitor Login - Sign in to access events' :
                         loginType === 'organization' ? 'Organization Login - Sign in to manage your events' : 
                         'Sign in to manage your amazing events'}
                    </p>

                    <form onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <Mail size={20} color="#94a3b8" style={{
                                    position: 'absolute',
                                    left: '16px',
                                    zIndex: 1
                                }} />
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px 14px 48px',
                                        borderRadius: '12px',
                                        border: '1.5px solid #e2e8f0',
                                        outline: 'none',
                                        fontSize: '14px',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <Lock size={20} color="#94a3b8" style={{
                                    position: 'absolute',
                                    left: '16px',
                                    zIndex: 1
                                }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '14px 48px 14px 48px',
                                        borderRadius: '12px',
                                        border: '1.5px solid #e2e8f0',
                                        outline: 'none',
                                        fontSize: '14px',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '16px',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '4px'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
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
                                marginBottom: '20px'
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Remember Me & Forgot Password */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '32px'
                        }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: '#475569'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        cursor: 'pointer',
                                        accentColor: '#3b82f6'
                                    }}
                                />
                                Remember me
                            </label>
                            <a href="#" style={{
                                fontSize: '14px',
                                color: '#ec4899',
                                textDecoration: 'none',
                                fontWeight: 500
                            }}>
                                Forgot password?
                            </a>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '16px',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            onMouseOver={(e) => {
                                if (!loading) {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!loading) {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                                }
                            }}
                        >
                            {loading ? 'LOGGING IN...' : 'LOG IN'}
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </form>

                    {/* Additional Links */}
                    <div style={{
                        marginTop: '32px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        <div style={{
                            fontSize: '14px',
                            color: '#64748b'
                        }}>
                            For Demo
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                            {loginType === 'master' && (
                                <>
                                    <a 
                                        href="?type=organization"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            window.location.href = '?type=organization';
                                        }}
                                        style={{
                                            fontSize: '14px',
                                            color: '#3b82f6',
                                            textDecoration: 'none',
                                            fontWeight: 600
                                        }}
                                    >
                                        Organization Login
                                    </a>
                                    <a 
                                        href="?type=exhibitor"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            window.location.href = '?type=exhibitor';
                                        }}
                                        style={{
                                            fontSize: '14px',
                                            color: '#3b82f6',
                                            textDecoration: 'none',
                                            fontWeight: 600
                                        }}
                                    >
                                        Exhibitor Login
                                    </a>
                                    <a 
                                        href="?type=visitor"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            window.location.href = '?type=visitor';
                                        }}
                                        style={{
                                            fontSize: '14px',
                                            color: '#3b82f6',
                                            textDecoration: 'none',
                                            fontWeight: 600
                                        }}
                                    >
                                        Visitor Login
                                    </a>
                                </>
                            )}
                            {(loginType === 'organization' || loginType === 'exhibitor' || loginType === 'visitor') && (
                                <a 
                                    href={window.location.pathname}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        window.location.href = window.location.pathname;
                                    }}
                                    style={{
                                        fontSize: '14px',
                                        color: '#3b82f6',
                                        textDecoration: 'none',
                                        fontWeight: 600
                                    }}
                                >
                                    Master Admin Login
                                </a>
                            )}
                        </div>
                        <a href="#" style={{
                            fontSize: '14px',
                            color: '#ec4899',
                            textDecoration: 'none',
                            fontWeight: 600
                        }}>
                            Contact Us
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
