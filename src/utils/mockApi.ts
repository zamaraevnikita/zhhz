/**
 * MOCK API — полная заглушка бэкенда.
 * Все данные хранятся в localStorage, бэкенд не нужен.
 */

// Simple unique ID generator (no uuid dependency needed)
const generateId = (): string =>
    crypto.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

// ── localStorage helpers ─────────────────────────────────────────────
const STORE_KEYS = {
    projects: 'mock_projects',
    orders: 'mock_orders',
    layouts: 'mock_layouts',
    designTemplates: 'mock_design_templates',
};

function loadStore<T>(key: string, fallback: T[] = []): T[] {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function saveStore<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
}

// ── Simulated delay ──────────────────────────────────────────────────
const delay = (ms = 80) => new Promise(r => setTimeout(r, ms));

// ── Route matching helpers ───────────────────────────────────────────
type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RouteMatch {
    params: Record<string, string>;
}

function matchRoute(pattern: string, path: string): RouteMatch | null {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');
    if (patternParts.length !== pathParts.length) return null;
    const params: Record<string, string> = {};
    for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(':')) {
            params[patternParts[i].slice(1)] = pathParts[i];
        } else if (patternParts[i] !== pathParts[i]) {
            return null;
        }
    }
    return { params };
}

// ── MOCK fetchApi ────────────────────────────────────────────────────
export const mockFetchApi = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    await delay();

    const method: Method = ((options.method || 'GET') as string).toUpperCase() as Method;
    const body = options.body ? JSON.parse(options.body as string) : undefined;

    // Strip leading slash
    const path = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

    console.log(`[MOCK API] ${method} /${path}`, body ?? '');

    // ── AUTH ──────────────────────────────────────────────────────────
    // Auth is handled in AuthContext directly, but handle /auth/me for session restore
    if (path === 'auth/me') {
        return {
            user: {
                id: 'mock-user-id',
                phone: '+7 (999) 000-00-00',
                name: 'Тестовый Пользователь',
                email: 'test@example.com',
                role: 'USER',
            },
        } as T;
    }

    // ── PROJECTS ─────────────────────────────────────────────────────
    if (path === 'projects' && method === 'GET') {
        return loadStore(STORE_KEYS.projects) as T;
    }

    if (path === 'projects' && method === 'POST') {
        const projects = loadStore<any>(STORE_KEYS.projects);
        const newProject = {
            id: generateId(),
            userId: 'mock-user-id',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            previewUrl: '',
            pageCount: body.spreads?.length ? body.spreads.length * 2 : 24,
            ...body,
        };
        projects.unshift(newProject);
        saveStore(STORE_KEYS.projects, projects);
        return newProject as T;
    }

    if (path === 'projects/claim' && method === 'PATCH') {
        // No-op in mock — just return success
        return { success: true } as T;
    }

    let m = matchRoute('projects/:id', path);
    if (m) {
        const projects = loadStore<any>(STORE_KEYS.projects);
        const idx = projects.findIndex((p: any) => p.id === m!.params.id);

        if (method === 'GET') {
            if (idx === -1) throw new Error('Project not found');
            return projects[idx] as T;
        }

        if (method === 'PUT') {
            if (idx === -1) throw new Error('Project not found');
            projects[idx] = { ...projects[idx], ...body, updatedAt: new Date().toISOString() };
            saveStore(STORE_KEYS.projects, projects);
            return projects[idx] as T;
        }

        if (method === 'DELETE') {
            if (idx !== -1) {
                projects.splice(idx, 1);
                saveStore(STORE_KEYS.projects, projects);
            }
            return { success: true } as T;
        }
    }

    // ── ORDERS ───────────────────────────────────────────────────────
    if (path === 'orders' && method === 'GET') {
        return loadStore(STORE_KEYS.orders) as T;
    }

    if (path === 'orders' && method === 'POST') {
        const orders = loadStore<any>(STORE_KEYS.orders);
        const newOrder = {
            id: generateId(),
            userId: 'mock-user-id',
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...body,
        };
        orders.unshift(newOrder);
        saveStore(STORE_KEYS.orders, orders);
        return newOrder as T;
    }

    m = matchRoute('orders/:id', path);
    if (m && method === 'GET') {
        const orders = loadStore<any>(STORE_KEYS.orders);
        const order = orders.find((o: any) => o.id === m!.params.id);
        if (!order) throw new Error('Order not found');
        return order as T;
    }

    m = matchRoute('orders/:id/status', path);
    if (m && method === 'PATCH') {
        const orders = loadStore<any>(STORE_KEYS.orders);
        const idx = orders.findIndex((o: any) => o.id === m!.params.id);
        if (idx !== -1) {
            orders[idx] = { ...orders[idx], status: body.status, updatedAt: new Date().toISOString() };
            saveStore(STORE_KEYS.orders, orders);
            return orders[idx] as T;
        }
        throw new Error('Order not found');
    }

    // ── LAYOUTS ──────────────────────────────────────────────────────
    if (path === 'layouts' && method === 'GET') {
        return loadStore(STORE_KEYS.layouts) as T;
    }

    if (path === 'layouts' && method === 'POST') {
        const layouts = loadStore<any>(STORE_KEYS.layouts);
        const existing = layouts.findIndex((l: any) => l.id === body.id);
        if (existing !== -1) {
            layouts[existing] = { ...layouts[existing], ...body };
        } else {
            layouts.push({ ...body, createdAt: new Date().toISOString() });
        }
        saveStore(STORE_KEYS.layouts, layouts);
        return body as T;
    }

    m = matchRoute('layouts/:id', path);
    if (m && method === 'DELETE') {
        const layouts = loadStore<any>(STORE_KEYS.layouts);
        saveStore(STORE_KEYS.layouts, layouts.filter((l: any) => l.id !== m!.params.id));
        return { success: true } as T;
    }

    // ── DESIGN TEMPLATES ─────────────────────────────────────────────
    if (path === 'design-templates' && method === 'GET') {
        return loadStore(STORE_KEYS.designTemplates) as T;
    }

    if (path === 'design-templates' && method === 'POST') {
        const templates = loadStore<any>(STORE_KEYS.designTemplates);
        const newTmpl = { id: generateId(), createdAt: new Date().toISOString(), ...body };
        templates.push(newTmpl);
        saveStore(STORE_KEYS.designTemplates, templates);
        return newTmpl as T;
    }

    m = matchRoute('design-templates/:id', path);
    if (m) {
        const templates = loadStore<any>(STORE_KEYS.designTemplates);

        if (method === 'PUT') {
            const idx = templates.findIndex((t: any) => t.id === m!.params.id);
            if (idx !== -1) {
                templates[idx] = { ...templates[idx], ...body };
                saveStore(STORE_KEYS.designTemplates, templates);
                return templates[idx] as T;
            }
            throw new Error('Design template not found');
        }

        if (method === 'DELETE') {
            saveStore(STORE_KEYS.designTemplates, templates.filter((t: any) => t.id !== m!.params.id));
            return undefined as T;
        }
    }

    // ── FALLBACK ─────────────────────────────────────────────────────
    console.warn(`[MOCK API] Unhandled route: ${method} /${path}`);
    return {} as T;
};
