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
 */
export const apiFetch = (endpoint, options = {}) => {
    return fetch(getApiUrl(endpoint), options);
};

export default { getApiUrl, apiFetch };
