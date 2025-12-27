import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, activeScreen, onNavigate }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isTopNavCollapsed, setIsTopNavCollapsed] = useState(false);

    // Update CSS variables when toggle state changes
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--sidebar-width', isSidebarCollapsed ? '80px' : '260px');
        root.style.setProperty('--header-height', isTopNavCollapsed ? '64px' : '140px');
    }, [isSidebarCollapsed, isTopNavCollapsed]);

    return (
        <div className="layout-wrapper">
            <Sidebar
                activeScreen={activeScreen}
                onNavigate={onNavigate}
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
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
