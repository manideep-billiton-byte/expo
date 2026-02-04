import React, { useState, useEffect } from 'react';
import { X, Eye, RotateCcw } from 'lucide-react';

const StallSelector = ({
    totalStalls,
    stallTypes,
    onSave,
    onClose,
    initialAssignments = {}
}) => {
    const [assignments, setAssignments] = useState(initialAssignments);
    const [selectedStallType, setSelectedStallType] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);

    // Calculate grid dimensions based on total stalls
    const getGridDimensions = () => {
        const sqrt = Math.sqrt(totalStalls);
        const cols = Math.ceil(sqrt);
        const rows = Math.ceil(totalStalls / cols);
        return { rows, cols };
    };

    const { rows, cols } = getGridDimensions();

    // Count assignments for each stall type
    const getAssignmentCounts = () => {
        const counts = {};
        stallTypes.forEach(type => {
            counts[type.name] = 0;
        });

        Object.values(assignments).forEach(typeName => {
            if (counts[typeName] !== undefined) {
                counts[typeName]++;
            }
        });

        return counts;
    };

    const assignmentCounts = getAssignmentCounts();

    // Handle stall click
    const handleStallClick = (stallNumber) => {
        if (!selectedStallType) {
            alert('Please select a stall type first');
            return;
        }

        const currentAssignment = assignments[stallNumber];

        // If clicking on already assigned stall of same type, unassign it
        if (currentAssignment === selectedStallType.name) {
            const newAssignments = { ...assignments };
            delete newAssignments[stallNumber];
            setAssignments(newAssignments);
            return;
        }

        // If clicking on stall assigned to different type, don't allow
        if (currentAssignment && currentAssignment !== selectedStallType.name) {
            alert(`Stall ${stallNumber} is already assigned to ${currentAssignment}. Unselect it first.`);
            return;
        }

        // Check if we've reached the limit for this stall type
        const currentCount = assignmentCounts[selectedStallType.name] || 0;
        if (currentCount >= selectedStallType.limit) {
            alert(`Cannot assign more stalls. ${selectedStallType.name} limit: ${selectedStallType.limit}`);
            return;
        }

        // Assign the stall
        setAssignments({
            ...assignments,
            [stallNumber]: selectedStallType.name
        });
    };

    // Get stall color
    const getStallColor = (stallNumber) => {
        const typeName = assignments[stallNumber];
        if (!typeName) return '#ffffff'; // white for unassigned

        const type = stallTypes.find(t => t.name === typeName);
        return type ? type.color : '#ffffff';
    };

    // Validate assignments
    const validateAssignments = () => {
        const errors = [];

        stallTypes.forEach(type => {
            const count = assignmentCounts[type.name] || 0;
            if (count !== type.limit) {
                errors.push(`${type.name}: ${count}/${type.limit} stalls selected (${type.limit - count} ${count < type.limit ? 'more needed' : 'too many'})`);
            }
        });

        return errors;
    };

    // Handle save
    const handleSave = () => {
        const errors = validateAssignments();

        if (errors.length > 0) {
            setValidationErrors(errors);
            alert('Please complete all stall type assignments:\n\n' + errors.join('\n'));
            return;
        }

        const payload = {
            totalStalls,
            stallTypes,
            assignments
        };

        onSave(payload);
    };

    // Handle reset
    const handleReset = () => {
        if (confirm('Are you sure you want to reset all stall assignments?')) {
            setAssignments({});
            setSelectedStallType(null);
        }
    };

    // Render stall grid
    const renderStallGrid = (isPreview = false) => {
        const stalls = [];
        for (let i = 1; i <= totalStalls; i++) {
            const color = getStallColor(i);
            const isSelected = assignments[i] !== undefined;
            const isCurrentTypeSelected = selectedStallType && assignments[i] === selectedStallType.name;

            stalls.push(
                <div
                    key={i}
                    onClick={() => !isPreview && handleStallClick(i)}
                    style={{
                        width: '100%',
                        aspectRatio: '1',
                        backgroundColor: color,
                        border: isSelected ? `2px solid ${color}` : '2px solid #cbd5e1',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: totalStalls > 200 ? '9px' : totalStalls > 100 ? '11px' : '13px',
                        fontWeight: 600,
                        color: isSelected ? '#ffffff' : '#64748b',
                        cursor: isPreview ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isCurrentTypeSelected ? `0 0 0 3px ${color}40` : 'none',
                        transform: isCurrentTypeSelected && !isPreview ? 'scale(1.05)' : 'scale(1)',
                        opacity: isSelected ? 1 : 0.7
                    }}
                    onMouseEnter={(e) => {
                        if (!isPreview && !isSelected) {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.borderColor = selectedStallType ? selectedStallType.color : '#94a3b8';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isPreview && !isSelected) {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                        }
                    }}
                >
                    {i}
                </div>
            );
        }

        return stalls;
    };

    return (
        <>
            {/* Main Modal */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 2000,
                backdropFilter: 'blur(4px)',
                padding: '20px'
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    width: '95%',
                    maxWidth: '1400px',
                    maxHeight: '95vh',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }} onClick={e => e.stopPropagation()}>

                    {/* Header */}
                    <div style={{
                        padding: '24px 32px',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h2 style={{
                                fontSize: '24px',
                                fontWeight: 700,
                                color: '#0f172a',
                                margin: 0
                            }}>
                                Interactive Stall Selection
                            </h2>
                            <p style={{
                                fontSize: '14px',
                                color: '#64748b',
                                marginTop: '4px',
                                marginBottom: 0
                            }}>
                                Select stalls by clicking on the grid below
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#94a3b8',
                                padding: '8px'
                            }}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '32px'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '300px 1fr',
                            gap: '32px',
                            height: '100%'
                        }}>
                            {/* Left Panel - Stall Types */}
                            <div>
                                <h3 style={{
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    color: '#1e293b',
                                    marginBottom: '16px'
                                }}>
                                    Stall Types
                                </h3>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px'
                                }}>
                                    {stallTypes.map(type => {
                                        const count = assignmentCounts[type.name] || 0;
                                        const isSelected = selectedStallType?.name === type.name;
                                        const isComplete = count === type.limit;

                                        return (
                                            <div
                                                key={type.name}
                                                onClick={() => setSelectedStallType(type)}
                                                style={{
                                                    padding: '16px',
                                                    border: isSelected ? `2px solid ${type.color}` : '2px solid #e2e8f0',
                                                    borderRadius: '12px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    background: isSelected ? `${type.color}10` : 'white',
                                                    position: 'relative'
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    marginBottom: '8px'
                                                }}>
                                                    <div style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '8px',
                                                        backgroundColor: type.color,
                                                        flexShrink: 0
                                                    }} />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{
                                                            fontSize: '15px',
                                                            fontWeight: 600,
                                                            color: '#1e293b'
                                                        }}>
                                                            {type.name}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            color: '#64748b'
                                                        }}>
                                                            ₹{type.price.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    color: isComplete ? '#10b981' : '#64748b',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <span>Selected: {count} / {type.limit}</span>
                                                    {isComplete && (
                                                        <span style={{ color: '#10b981' }}>✓</span>
                                                    )}
                                                </div>

                                                {/* Progress Bar */}
                                                <div style={{
                                                    marginTop: '8px',
                                                    height: '4px',
                                                    backgroundColor: '#f1f5f9',
                                                    borderRadius: '2px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        height: '100%',
                                                        width: `${(count / type.limit) * 100}%`,
                                                        backgroundColor: type.color,
                                                        transition: 'width 0.3s'
                                                    }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Validation Errors */}
                                {validationErrors.length > 0 && (
                                    <div style={{
                                        marginTop: '20px',
                                        padding: '12px',
                                        backgroundColor: '#fef2f2',
                                        border: '1px solid #fecaca',
                                        borderRadius: '8px'
                                    }}>
                                        <div style={{
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            color: '#dc2626',
                                            marginBottom: '8px'
                                        }}>
                                            Incomplete Assignments:
                                        </div>
                                        {validationErrors.map((error, idx) => (
                                            <div key={idx} style={{
                                                fontSize: '12px',
                                                color: '#dc2626',
                                                marginBottom: '4px'
                                            }}>
                                                • {error}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right Panel - Stall Grid */}
                            <div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '16px'
                                }}>
                                    <h3 style={{
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        color: '#1e293b',
                                        margin: 0
                                    }}>
                                        Stall Layout ({totalStalls} stalls)
                                    </h3>

                                    {selectedStallType && (
                                        <div style={{
                                            padding: '8px 16px',
                                            backgroundColor: `${selectedStallType.color}20`,
                                            border: `1px solid ${selectedStallType.color}`,
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            color: selectedStallType.color
                                        }}>
                                            Selecting: {selectedStallType.name}
                                        </div>
                                    )}
                                </div>

                                {/* Stall Grid */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                                    gap: totalStalls > 200 ? '4px' : totalStalls > 100 ? '6px' : '8px',
                                    padding: '20px',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    maxHeight: '600px',
                                    overflowY: 'auto'
                                }}>
                                    {renderStallGrid()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: '20px 32px',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <button
                            onClick={handleReset}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 20px',
                                background: 'white',
                                border: '1.5px solid #e2e8f0',
                                borderRadius: '10px',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#ef4444',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                        >
                            <RotateCcw size={16} />
                            Reset All
                        </button>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setShowPreview(true)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 20px',
                                    background: 'white',
                                    border: '1.5px solid #e2e8f0',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: '#475569',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                            >
                                <Eye size={16} />
                                Preview
                            </button>

                            <button
                                onClick={onClose}
                                style={{
                                    padding: '12px 20px',
                                    background: 'white',
                                    border: '1.5px solid #e2e8f0',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: '#475569',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSave}
                                style={{
                                    padding: '12px 24px',
                                    background: '#2563eb',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2563eb'}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 3000,
                    backdropFilter: 'blur(4px)',
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        width: '90%',
                        maxWidth: '1200px',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }} onClick={e => e.stopPropagation()}>

                        {/* Preview Header */}
                        <div style={{
                            padding: '24px 32px',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h2 style={{
                                    fontSize: '24px',
                                    fontWeight: 700,
                                    color: '#0f172a',
                                    margin: 0
                                }}>
                                    Stall Layout Preview
                                </h2>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#64748b',
                                    marginTop: '4px',
                                    marginBottom: 0
                                }}>
                                    Read-only view of your stall configuration
                                </p>
                            </div>
                            <button
                                onClick={() => setShowPreview(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#94a3b8',
                                    padding: '8px'
                                }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Preview Content */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '32px'
                        }}>
                            {/* Legend */}
                            <div style={{
                                marginBottom: '24px',
                                padding: '20px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0'
                            }}>
                                <h3 style={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: '#1e293b',
                                    marginBottom: '12px'
                                }}>
                                    Legend
                                </h3>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '16px'
                                }}>
                                    {stallTypes.map(type => (
                                        <div key={type.name} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '6px',
                                                backgroundColor: type.color
                                            }} />
                                            <span style={{
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                color: '#1e293b'
                                            }}>
                                                {type.name}
                                            </span>
                                            <span style={{
                                                fontSize: '13px',
                                                color: '#64748b'
                                            }}>
                                                (₹{type.price.toLocaleString()})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Preview Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                                gap: totalStalls > 200 ? '4px' : totalStalls > 100 ? '6px' : '8px',
                                padding: '20px',
                                backgroundColor: '#1e293b',
                                borderRadius: '12px',
                                maxHeight: '500px',
                                overflowY: 'auto'
                            }}>
                                {renderStallGrid(true)}
                            </div>
                        </div>

                        {/* Preview Footer */}
                        <div style={{
                            padding: '20px 32px',
                            borderTop: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                onClick={() => setShowPreview(false)}
                                style={{
                                    padding: '12px 24px',
                                    background: '#2563eb',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default StallSelector;
