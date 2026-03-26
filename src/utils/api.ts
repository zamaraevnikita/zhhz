// ══════════════════════════════════════════════════════════════════════
// MOCK MODE — бэкенд не нужен!
// Все вызовы fetchApi перенаправляются в mockApi.ts (localStorage).
// Чтобы вернуть реальный бэкенд — раскомментируйте блок ниже.
// ══════════════════════════════════════════════════════════════════════

import { mockFetchApi } from './mockApi';

export const API_URL = import.meta.env.VITE_API_URL || '/api';

// Module-level logout callback — set by AuthContext on mount
let _logoutCallback: (() => void) | null = null;
export const setLogoutCallback = (cb: () => void) => {
    _logoutCallback = cb;
};

// All API calls go through the mock
export const fetchApi = mockFetchApi;

/* ── ORIGINAL fetchApi (uncomment to use real backend) ─────────────────
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

    if (response.status === 401) {
        localStorage.removeItem('periodica_token');
        if (_logoutCallback) _logoutCallback();
        throw new Error('Session expired. Please log in again.');
    }

    const data = await response.json();

    if (!response.ok) {
        if (data.details) {
            throw new Error(`${data.error}: ${JSON.stringify(data.details)}`);
        }
        throw new Error(data.error || 'API Error');
    }

    return data as T;
};
────────────────────────────────────────────────────────────────────── */
