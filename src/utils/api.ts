// In dev: Vite proxy forwards /api to localhost:4000 (no CORS issues)
// In prod: set VITE_API_URL to absolute URL of the deployed backend
export const API_URL = import.meta.env.VITE_API_URL || '/api';

// Module-level logout callback — set by AuthContext on mount
let _logoutCallback: (() => void) | null = null;
export const setLogoutCallback = (cb: () => void) => {
    _logoutCallback = cb;
};

export const fetchApi = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const token = localStorage.getItem('periodica_token');

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    // Auto-logout on 401 (expired/invalid token)
    if (response.status === 401) {
        localStorage.removeItem('periodica_token');
        if (_logoutCallback) _logoutCallback();
        throw new Error('Session expired. Please log in again.');
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'API Error');
    }

    return data as T;
};
