import jwt from 'jsonwebtoken';
import { initDb, run, get } from '../db';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jest-do-not-use-in-prod';

/**
 * Initialize the test database (ensures tables exist).
 */
export async function setupTestDb() {
    await initDb();
}

/**
 * Clear all data from the database between tests.
 */
export async function clearDb() {
    await run(`DELETE FROM \`Order\``);
    await run(`DELETE FROM Project`);
    await run(`DELETE FROM LayoutTemplate`);
    await run(`DELETE FROM User`);
}

/**
 * Create a test user directly in the database and return a valid JWT token.
 */
export async function createTestUser(overrides: {
    id?: string;
    phone?: string;
    name?: string;
    email?: string;
    role?: string;
    password?: string;
} = {}) {
    const id = overrides.id || uuidv4();
    const phone = overrides.phone || `+7900${Math.floor(1000000 + Math.random() * 9000000)}`;
    const name = overrides.name || 'Test User';
    const email = overrides.email || null;
    const role = overrides.role || 'USER';
    const passwordHash = overrides.password
        ? await bcrypt.hash(overrides.password, 4) // Low rounds for speed in tests
        : null;

    await run(
        `INSERT INTO User (id, phone, name, email, passwordHash, role) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, phone, name, email, passwordHash, role]
    );

    const token = jwt.sign({ userId: id, role }, JWT_SECRET, { expiresIn: '1h' });

    return { id, phone, name, email, role, token };
}

/**
 * Generate a valid JWT token for the given userId and role.
 */
export function generateToken(userId: string, role: string = 'USER') {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '1h' });
}

/**
 * A sample project payload for creating projects.
 */
export function sampleProjectPayload(overrides: Record<string, any> = {}) {
    return {
        name: 'Test Project',
        themeId: 'memories',
        isCustom: false,
        spreads: [
            {
                id: 'sp1',
                leftPage: {
                    id: 'lp1',
                    type: 'cover',
                    layoutId: 'full_photo',
                    content: {},
                    slotSettings: {},
                    backgroundColor: '#ffffff',
                },
                rightPage: {
                    id: 'rp1',
                    type: 'content',
                    layoutId: 'full_photo',
                    content: {},
                    slotSettings: {},
                    backgroundColor: '#ffffff',
                },
            },
        ],
        price: '4 490 ₽',
        ...overrides,
    };
}

/**
 * A sample layout payload.
 */
export function sampleLayoutPayload(overrides: Record<string, any> = {}) {
    return {
        id: `layout-${uuidv4().slice(0, 8)}`,
        name: 'Test Layout',
        slots: [
            { id: 'slot1', type: 'image' as const, className: '' },
            { id: 'slot2', type: 'text' as const, className: '' },
        ],
        ...overrides,
    };
}

/**
 * A sample order payload.
 */
export function sampleOrderPayload(overrides: Record<string, any> = {}) {
    return {
        totalAmount: 4490,
        items: [
            { id: 'item1', type: 'photo' as const, price: 4490 },
        ],
        customerName: 'Иван Иванов',
        customerPhone: '+79001234567',
        ...overrides,
    };
}
