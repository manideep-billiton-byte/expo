import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Index from './Index';
import Login from './components/Login';
import ExhibitorDashboard from './components/ExhibitorDashboard';
import VisitorDashboard from './components/VisitorDashboard';
import PublicVisitorRegistration from './components/PublicVisitorRegistration';
import QRCodePage from './components/QRCodePage';


function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loginType, setLoginType] = useState('master'); // 'master', 'organization', 'exhibitor', 'visitor'
    const [userType, setUserType] = useState('master');

    useEffect(() => {
        // DEBUG: Log valid routes and current path
        console.log('🔄 App Routing Debug:', {
            path: window.location.pathname,
            search: window.location.search,
            isAuthenticated,
            userType,
            timestamp: new Date().toISOString()
        });

        // Check if user is already authenticated (from localStorage)
        const storedAuth = localStorage.getItem('isAuthenticated');
        const storedUserType = localStorage.getItem('userType');

        if (storedAuth === 'true' && storedUserType) {
            // Restore authentication state
            setIsAuthenticated(true);
            setUserType(storedUserType);
            setLoginType(storedUserType);
        } else {
            // Not authenticated
            setIsAuthenticated(false);
        }

        // Check URL params for login type (only if not already authenticated)
        if (!storedAuth) {
            const urlParams = new URLSearchParams(window.location.search);
            const loginTypeParam = urlParams.get('type');
            if (loginTypeParam === 'organization') {
                setLoginType('organization');
            } else if (loginTypeParam === 'exhibitor') {
                setLoginType('exhibitor');
            } else if (loginTypeParam === 'visitor') {
                setLoginType('visitor');
            }
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


    return (
        <BrowserRouter>
            <Routes>
                {/* Public QR Code Pages - No authentication required */}
                <Route path="/qr/event/:id" element={<QRCodePage />} />
                <Route path="/qr/visitor/:id" element={<QRCodePage />} />

                {/* Public Registration */}
                <Route path="/register" element={<PublicVisitorRegistration />} />

                {/* Authenticated Routes */}
                <Route path="/*" element={
                    !isAuthenticated ? (
                        <Login onLogin={handleLogin} loginType={loginType} />
                    ) : userType === 'visitor' ? (
                        <VisitorDashboard onLogout={handleLogout} />
                    ) : userType === 'exhibitor' ? (
                        <ExhibitorDashboard onLogout={handleLogout} />
                    ) : (
                        <Index onLogout={handleLogout} userType={userType} />
                    )
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App
