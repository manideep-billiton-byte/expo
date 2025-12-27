import React, { useState, useEffect } from 'react';
import Header from './Header';

const Layout = ({ children, activeScreen, onNavigate }) => {
    const [isTopNavCollapsed, setIsTopNavCollapsed] = useState(false);

    // Update CSS variables when toggle state changes
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--header-height', isTopNavCollapsed ? '64px' : '140px');
    }, [isTopNavCollapsed]);

    return (
        <div className="layout-wrapper">
            <div className="main-content">
                <Header
                    activeScreen={activeScreen}
                    onNavigate={onNavigate}
                    isNavCollapsed={isTopNavCollapsed}
                    onToggleNav={() => setIsTopNavCollapsed(!isTopNavCollapsed)}
                />
                <div className="content-area">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
