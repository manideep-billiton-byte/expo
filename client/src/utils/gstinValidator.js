/**
 * GSTIN Validation Utility
 * Provides frontend validation for GSTIN (Goods and Services Tax Identification Number)
 */

// Dummy GST number for demo mode (accepted without strict format validation)
const DUMMY_GST_NUMBER = '36AAACH7409R116';

/**
 * Validate GSTIN format
 * @param {string} gstin - GSTIN to validate
 * @returns {object} - Validation result with success flag and error message
 */
export function validateGSTINFormat(gstin) {
    if (!gstin || typeof gstin !== 'string') {
        return {
            isValid: false,
            error: 'GSTIN is required'
        };
    }

    const trimmedGSTIN = gstin.trim().toUpperCase();

    // GSTIN must be exactly 15 characters
    if (trimmedGSTIN.length !== 15) {
        return {
            isValid: false,
            error: 'GSTIN must be exactly 15 characters'
        };
    }

    // Allow the demo GST number without strict format validation
    if (trimmedGSTIN === DUMMY_GST_NUMBER) {
        return {
            isValid: true,
            error: null
        };
    }

    // GSTIN format: 2 digits (state code) + 10 alphanumeric (PAN) + 1 alphabet (entity type) + 1 alphabet (default 'Z') + 1 checksum digit
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    if (!gstinRegex.test(trimmedGSTIN)) {
        return {
            isValid: false,
            error: 'Invalid GSTIN format. Please enter a valid 15-digit GSTIN.'
        };
    }

    return {
        isValid: true,
        error: null
    };
}

/**
 * Extract state code from GSTIN
 * @param {string} gstin - GSTIN
 * @returns {string} - State code (first 2 digits)
 */
export function extractStateCode(gstin) {
    if (!gstin || gstin.length < 2) {
        return '';
    }
    return gstin.substring(0, 2);
}

/**
 * Extract PAN from GSTIN
 * @param {string} gstin - GSTIN
 * @returns {string} - PAN number (characters 3-12)
 */
export function extractPAN(gstin) {
    if (!gstin || gstin.length < 12) {
        return '';
    }
    return gstin.substring(2, 12);
}

/**
 * Format GSTIN for display (uppercase, trimmed)
 * @param {string} gstin - GSTIN
 * @returns {string} - Formatted GSTIN
 */
export function formatGSTIN(gstin) {
    if (!gstin) {
        return '';
    }
    return gstin.toUpperCase().trim();
}

/**
 * Get state name from state code
 * @param {string} stateCode - State code (first 2 digits of GSTIN)
 * @returns {string} - State name
 */
export function getStateName(stateCode) {
    const stateMapping = {
        '01': 'Jammu & Kashmir',
        '02': 'Himachal Pradesh',
        '03': 'Punjab',
        '04': 'Chandigarh',
        '05': 'Uttarakhand',
        '06': 'Haryana',
        '07': 'Delhi',
        '08': 'Rajasthan',
        '09': 'Uttar Pradesh',
        '10': 'Bihar',
        '11': 'Sikkim',
        '12': 'Arunachal Pradesh',
        '13': 'Nagaland',
        '14': 'Manipur',
        '15': 'Mizoram',
        '16': 'Tripura',
        '17': 'Meghalaya',
        '18': 'Assam',
        '19': 'West Bengal',
        '20': 'Jharkhand',
        '21': 'Odisha',
        '22': 'Chhattisgarh',
        '23': 'Madhya Pradesh',
        '24': 'Gujarat',
        '27': 'Maharashtra',
        '29': 'Karnataka',
        '30': 'Goa',
        '32': 'Kerala',
        '33': 'Tamil Nadu',
        '34': 'Puducherry',
        '35': 'Andaman and Nicobar Islands',
        '36': 'Telangana',
        '37': 'Andhra Pradesh'
    };

    return stateMapping[stateCode] || '';
}

/**
 * Verify GSTIN via API
 * @param {string} gstin - GSTIN to verify
 * @returns {Promise<object>} - Verification result
 */
export async function verifyGSTINViaAPI(gstin) {
    try {
        // First validate format on frontend
        const formatValidation = validateGSTINFormat(gstin);
        if (!formatValidation.isValid) {
            return {
                success: false,
                error: formatValidation.error
            };
        }

        const formattedGSTIN = formatGSTIN(gstin);

        const response = await fetch('/api/verify-gstin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ gstin: formattedGSTIN })
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Failed to verify GSTIN',
                errorCode: data.errorCode
            };
        }

        return data;

    } catch (error) {
        console.error('GSTIN verification error:', error);
        return {
            success: false,
            error: 'Network error. Please check your connection and try again.',
            errorCode: 'NETWORK_ERROR'
        };
    }
}
