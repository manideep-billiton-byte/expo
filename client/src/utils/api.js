// API Configuration for different environments
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Get the full API URL for a given endpoint
 * In development: uses proxy (/api/...)
 * In production: uses VITE_API_URL environment variable
 */
export const getApiUrl = (endpoint) => {
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // In production, prepend the API base URL
    if (API_BASE_URL) {
        return `${API_BASE_URL}${cleanEndpoint}`;
    }

    // In development, use relative path (Vite proxy handles it)
    return cleanEndpoint;
};

/**
 * Wrapper for fetch with API URL handling
 * Automatically handles JSON requests and responses
 */
export const apiFetch = async (endpoint, options = {}) => {
    // Add default headers for JSON requests
    const headers = {
        ...options.headers,
    };

    // If there's a body and no Content-Type is set, add JSON Content-Type
    if (options.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(getApiUrl(endpoint), {
        ...options,
        headers,
    });

    // Parse JSON response
    const data = await response.json();

    // If response is not ok, throw an error with the response data
    if (!response.ok) {
        const error = new Error(data.error || data.message || 'API request failed');
        error.data = data;
        throw error;
    }

    return data;
};

export default { getApiUrl, apiFetch };
