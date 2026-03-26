import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { get, run, runTransaction } from '../db';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');

// ---------------------------------------------------------------------------
// OTP store (used only during REGISTRATION to verify phone ownership)
// ---------------------------------------------------------------------------
interface OtpEntry {
    code: string;
    expiresAt: number;
    attempts: number;
    // Pending registration data — saved here until phone is verified
    pendingName?: string;
    pendingEmail?: string;
    pendingPasswordHash?: string;
}
const otpStore = new Map<string, OtpEntry>();

const MAX_OTP_ATTEMPTS = 5;
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ---------------------------------------------------------------------------
// POST /api/auth/request-otp
// Accepts optional profile data for new registrations.
// ---------------------------------------------------------------------------
export const requestOtp = async (req: Request, res: Response) => {
    const { phone, name, email, password } = req.body;

    if (!phone || typeof phone !== 'string') {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10 || cleaned.length > 15) {
        return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Generate cryptographically random 4-digit OTP
    const otp = String(crypto.randomInt(1000, 9999));

    // If password provided, hash it now so we store only the hash
    let pendingPasswordHash: string | undefined;
    if (password && typeof password === 'string') {
        // Prevent Bcrypt DOS
        if (password.length > 72) {
            return res.status(400).json({ error: 'Password is too long (max 72 characters)' });
        }
        pendingPasswordHash = await bcrypt.hash(password, 12);
    }

    otpStore.set(phone, {
        code: otp,
        expiresAt: Date.now() + OTP_TTL_MS,
        attempts: 0,
        pendingName: name || undefined,
        pendingEmail: email || undefined,
        pendingPasswordHash,
    });

    // --- SMS Stub / Integration ---
    const isDev = process.env.NODE_ENV !== 'production';
    
    if (isDev) {
        console.log('--------------------------------------------------');
        console.log(`[DEV MODE] SMS OTP for ${phone}: ${otp}`);
        console.log('--------------------------------------------------');
    } else {
        try {
            const smsAeroEmail = process.env.SMSAERO_EMAIL;
            const smsAeroKey = process.env.SMSAERO_API_KEY;
            const smsAeroSign = process.env.SMSAERO_SIGN || "SMS Aero";

            if (!smsAeroEmail || !smsAeroKey) {
                console.error('[SMS Aero] Missing credentials in .env');
                return res.status(500).json({ error: 'Внутренняя ошибка сервиса отправки СМС' });
            }

            // Compliant text message
            const text = `Код для входа на сайт Review.com: ${otp}. Никому не сообщайте этот код.`;

            const basicAuth = Buffer.from(`${smsAeroEmail}:${smsAeroKey}`).toString('base64');
            const url = `https://gate.smsaero.ru/v2/sms/send?number=${phone}&text=${encodeURIComponent(text)}&sign=${encodeURIComponent(smsAeroSign)}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${basicAuth}`
                }
            });

            const data = await response.json();
            if (!data.success) {
                console.error('[SMS Aero API Error]:', data.message);
                return res.status(400).json({ error: 'Не удалось отправить СМС на данный номер. Проверьте правильность ввода.' });
            }

            console.log(`[SMS Aero] Successfully sent OTP to ${phone}`);
        } catch (e) {
            console.error('[SMS Aero Network Error]:', e);
            return res.status(500).json({ error: 'Сервис отправки СМС временно недоступен' });
        }
    }

    res.json({ message: 'OTP sent successfully', success: true });
};

// ---------------------------------------------------------------------------
// POST /api/auth/login
// Traditional login: phone + password (no SMS required after registration).
// ---------------------------------------------------------------------------
export const login = async (req: Request, res: Response) => {
    const { phone, password } = req.body;

    if (!phone || !password || typeof password !== 'string') {
        return res.status(400).json({ error: 'Phone and password are required' });
    }

    // Prevent Bcrypt DOS
    if (password.length > 72) {
        return res.status(401).json({ error: 'Неверный телефон или пароль' });
    }

    try {
        const user = await get<any>(`SELECT * FROM User WHERE phone = ?`, [phone]);

        if (!user) {
            return res.status(401).json({ error: 'Неверный телефон или пароль' });
        }

        if (!user.passwordHash) {
            // User was created via OTP-only flow — no password set
            return res.status(401).json({ error: 'Для этого аккаунта пароль не задан. Войдите через SMS-код.' });
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            return res.status(401).json({ error: 'Неверный телефон или пароль' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            user: { id: user.id, phone: user.phone, name: user.name, email: user.email, role: user.role },
            token
        });
    } catch (error) {
        console.error('Login error', error instanceof Error ? error.message : 'Unknown error');
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ---------------------------------------------------------------------------
// POST /api/auth/verify-otp
// Used for: (a) new registration phone verification, (b) passwordless login.
// ---------------------------------------------------------------------------
export const verifyOtp = async (req: Request, res: Response) => {
    const { phone, code } = req.body;

    if (!phone || !code) {
        return res.status(400).json({ error: 'Phone and code are required' });
    }

    const entry = otpStore.get(phone);

    if (!entry) {
        return res.status(401).json({ error: 'Код не запрашивался для этого номера' });
    }

    if (Date.now() > entry.expiresAt) {
        otpStore.delete(phone);
        return res.status(401).json({ error: 'Код истёк. Запросите новый.' });
    }

    entry.attempts += 1;
    if (entry.attempts > MAX_OTP_ATTEMPTS) {
        otpStore.delete(phone);
        return res.status(429).json({ error: 'Слишком много попыток. Запросите новый код.' });
    }

    if (entry.code !== code) {
        return res.status(401).json({ error: 'Неверный код' });
    }

    // OTP correct — consume it
    otpStore.delete(phone);

    try {
        let user = await get<any>(`SELECT id, phone, name, email, role, passwordHash FROM User WHERE phone = ?`, [phone]);

        if (!user) {
            // Create new user using pending registration data
            const id = uuidv4();
            await runTransaction([
                {
                    sql: `INSERT INTO User (id, phone, name, email, passwordHash, role) VALUES (?, ?, ?, ?, ?, ?)`,
                    params: [id, phone, entry.pendingName || '', entry.pendingEmail || null, entry.pendingPasswordHash || null, 'USER']
                }
            ]);
            user = await get<any>(`SELECT id, phone, name, email, role FROM User WHERE id = ?`, [id]);
        } else {
            // Existing user: fill in missing profile data from pending entry
            const updates: string[] = [];
            const params: any[] = [];
            if (entry.pendingName && !user.name) { updates.push('name = ?'); params.push(entry.pendingName); }
            if (entry.pendingEmail && !user.email) { updates.push('email = ?'); params.push(entry.pendingEmail); }
            if (entry.pendingPasswordHash && !user.passwordHash) { updates.push('passwordHash = ?'); params.push(entry.pendingPasswordHash); }
            if (updates.length > 0) {
                params.push(user.id);
                // We use runTransaction here as well, in case we add more operations to this block later
                await runTransaction([
                    {
                        sql: `UPDATE User SET ${updates.join(', ')} WHERE id = ?`,
                        params
                    }
                ]);
                user = await get<any>(`SELECT id, phone, name, email, role FROM User WHERE id = ?`, [user.id]);
            }
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            user: { id: user.id, phone: user.phone, name: user.name, email: user.email, role: user.role },
            token
        });
    } catch (error) {
        console.error('Verify OTP Error:', error instanceof Error ? error.message : 'Unknown error');
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ---------------------------------------------------------------------------
// GET /api/auth/me — return current user from JWT
// ---------------------------------------------------------------------------
export const me = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthenticatedRequest).user!.userId;
        const user = await get<any>(`SELECT id, phone, name, email, role, createdAt FROM User WHERE id = ?`, [userId]);

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
