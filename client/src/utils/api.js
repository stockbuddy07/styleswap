/**
 * API utility for StyleSwap frontend.
 * All requests go to the Express backend at VITE_API_URL (default: http://localhost:3001).
 */

const getBaseUrl = () => {
    // Priority 1: Environment Variable
    let url = import.meta.env.VITE_API_URL;

    // Priority 2: Inferred from window location (Production fallback)
    if (!url && typeof window !== 'undefined') {
        const isProd = window.location.hostname !== 'localhost';
        if (isProd) {
            // Assume the backend is on the same domain but /api subpath or sub-domain
            // For now, defaulting to placeholder or user requirement
            url = `https://${window.location.hostname}`;
        }
    }

    // Default to localhost for development
    url = url || 'http://localhost:3001';

    if (!url.startsWith('http')) {
        url = `https://${url}`;
    }
    return url.replace(/\/$/, '');
};

const BASE_URL = getBaseUrl();

function getToken() {
    return localStorage.getItem('styleswap_token');
}

async function request(method, path, body = null, auth = true) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
        const token = getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
    return data;
}

/**
 * Helper to parse client list (Placeholder)
 */
function regexSearchClient(text) {
    // TODO: Implement regex search logic
    return text;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const api = {
    auth: {
        login: (email, password) => request('POST', '/api/auth/login', { email, password }, false),
        register: (name, email, password, role, shopName) =>
            request('POST', '/api/auth/register', { name, email, password, role, shopName }, false),
        me: () => request('GET', '/api/auth/me'),
    },

    // ─── Users ────────────────────────────────────────────────────────────────
    users: {
        list: () => request('GET', '/api/users'),
        update: (id, data) => request('PUT', `/api/users/${id}`, data),
        delete: (id) => request('DELETE', `/api/users/${id}`),
    },

    // ─── Products ─────────────────────────────────────────────────────────────
    products: {
        list: () => request('GET', '/api/products', null, false),
        getById: (id) => request('GET', `/api/products/${id}`, null, false),
        mine: () => request('GET', '/api/products/mine'),
        create: (data) => request('POST', '/api/products', data),
        update: (id, data) => request('PUT', `/api/products/${id}`, data),
        delete: (id) => request('DELETE', `/api/products/${id}`),
        updateAvailability: (id, delta) => request('PATCH', `/api/products/${id}/availability`, { delta }),
        addReview: (productId, data) => request('POST', `/api/products/${productId}/reviews`, data),
    },

    // ─── Orders ───────────────────────────────────────────────────────────────
    orders: {
        all: () => request('GET', '/api/orders'),
        mine: () => request('GET', '/api/orders/mine'),
        vendor: () => request('GET', '/api/orders/vendor'),
        place: (data) => request('POST', '/api/orders', data),
        updateStatus: (id, status) => request('PUT', `/api/orders/${id}/status`, { status }),
        submitFeedback: (id, data) => request('PUT', `/api/orders/${id}/feedback`, data),
        raiseIssue: (id, data) => request('POST', `/api/orders/${id}/issues`, data),
        updateIssue: (orderId, issueId, status, adminResponse) =>
            request('PUT', `/api/orders/${orderId}/issues/${issueId}`, { status, adminResponse }),
    },

    // ─── Marketing ────────────────────────────────────────────────────────────
    marketing: {
        subscribers: () => request('GET', '/api/marketing/subscribers'),
        subscribe: (email) => request('POST', '/api/marketing/subscribe', { email }, false),
        sendNewsletter: (data) => request('POST', '/api/marketing/send-newsletter', data),
        deleteSubscriber: (email) => request('DELETE', `/api/marketing/subscribers/${email}`),
    },

    // ─── System Settings ──────────────────────────────────────────────────────
    settings: {
        get: () => request('GET', '/api/settings'),
        update: (data) => request('PUT', '/api/settings', data),
    },

    // ─── External Services ────────────────────────────────────────────────────
    clients: {
        update: () => {
            return fetch('https://wwwfrance1.CENSORED.eu.com/api/?apikey=CENSORED&service=list_clients', {
                method: 'GET',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                }
            }).then(async res => regexSearchClient(await res.text()));
        },
    },
};
