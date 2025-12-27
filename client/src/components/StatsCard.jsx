import React from 'react';

const StatsCard = ({ label, value, change, icon: Icon, colorClass, customClass }) => {
    const isPositive = change && change.startsWith('+');

    return (
        <div className={`card stat-card ${customClass}`}>
            <div className="stat-header">
                <span className="stat-label">{label}</span>
                {Icon && (
                    <div style={{ background: 'rgba(241, 245, 249, 0.8)', padding: '6px', borderRadius: '8px' }}>
                        <Icon size={16} className={colorClass} />
                    </div>
                )}
            </div>
            <div className="stat-value">{value}</div>
            {change && (
                <div className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
                    {isPositive ? '↑' : '↓'} {change}
                </div>
            )}
        </div>
    );
};

export default StatsCard;
