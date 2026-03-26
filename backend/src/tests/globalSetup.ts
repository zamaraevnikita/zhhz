import { initDb } from '../db';

export default async function globalSetup() {
    // Set test environment variables
    process.env.JWT_SECRET = 'test-secret-key-for-jest-do-not-use-in-prod';
    process.env.NODE_ENV = 'test';
    process.env.SMSAERO_EMAIL = '';
    process.env.SMSAERO_API_KEY = '';

    // Initialize DB schema
    await initDb();
}
