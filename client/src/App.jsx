import React, { useState, useEffect } from 'react';
import Index from './Index';
import Login from './components/Login';
import ExhibitorDashboard from './components/ExhibitorDashboard';
import VisitorDashboard from './components/VisitorDashboard';
import PublicVisitorRegistration from './components/PublicVisitorRegistration';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loginType, setLoginType] = useState('master'); // 'master', 'organization', 'exhibitor', 'visitor'
    const [userType, setUserType] = useState('master');
    const [isRegistering, setIsRegistering] = useState(false);

    useEffect(() => {
        // Clear authentication on app load - users must login each time
        localStorage.removeItem('isAuthenticated');
        setIsAuthenticated(false);

        // Check URL params for login type
        const urlParams = new URLSearchParams(window.location.search);
        const loginTypeParam = urlParams.get('type');
        if (loginTypeParam === 'organization') {
            setLoginType('organization');
        } else if (loginTypeParam === 'exhibitor') {
            setLoginType('exhibitor');
        } else if (loginTypeParam === 'visitor') {
            setLoginType('visitor');
        }

        if (urlParams.get('action') === 'register') {
            setIsRegistering(true);
        }

        setLoading(false);
    }, []);

    const handleLogin = () => {
        const storedUserType = localStorage.getItem('userType') || 'master';
        setUserType(storedUserType);
        setIsAuthenticated(true);
        // Clear URL params after login
        window.history.replaceState({}, document.title, window.location.pathname);
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userType');
        localStorage.removeItem('activeScreen');
        localStorage.removeItem('organizationId');
        localStorage.removeItem('organizationName');
        localStorage.removeItem('exhibitorId');
        localStorage.removeItem('exhibitorName');
        localStorage.removeItem('visitorId');
        localStorage.removeItem('visitorName');
        localStorage.removeItem('rememberMe');
        setIsAuthenticated(false);
        setUserType('master');
        setLoginType('master');
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '18px',
                color: '#64748b'
            }}>
                Loading...
            </div>
        );
    }

    if (isRegistering) {
        return <PublicVisitorRegistration />;
    }

    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} loginType={loginType} />;
    }

    // Route to appropriate dashboard based on user type
    if (userType === 'visitor') {
        return <VisitorDashboard onLogout={handleLogout} />;
    }

    if (userType === 'exhibitor') {
        return <ExhibitorDashboard onLogout={handleLogout} />;
    }

    return <Index onLogout={handleLogout} userType={userType} />;
}

export default App
