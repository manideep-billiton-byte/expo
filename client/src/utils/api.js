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
 * Automatically adds Content-Type header for JSON requests
 * Returns the Response object for backward compatibility
 */
export const apiFetch = (endpoint, options = {}) => {
    // Add default headers for JSON requests
    const headers = {
        ...options.headers,
    };

    // If there's a body and no Content-Type is set, add JSON Content-Type
    if (options.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    return fetch(getApiUrl(endpoint), {
        ...options,
        headers,
    });
};

export default { getApiUrl, apiFetch };
