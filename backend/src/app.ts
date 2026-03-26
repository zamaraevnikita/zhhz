import dotenv from 'dotenv';
dotenv.config(); // Must run BEFORE other imports that read process.env at module level

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import projectsRoutes from './routes/projects.routes';
import ordersRoutes from './routes/orders.routes';
import layoutsRoutes from './routes/layouts.routes';

const app = express();
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// --- CORS (must come BEFORE helmet to avoid conflicts) ---
app.use(cors({
    origin: CORS_ORIGIN.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// --- Security Headers ---
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// --- Rate Limiters (disabled in test environment) ---
if (process.env.NODE_ENV !== 'test') {
    // Global Rate Limiter (anti DoS)
    const globalLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 300,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Too many requests, please try again later.' },
    });
    app.use(globalLimiter);

    // Strict Rate Limiter for auth (anti brute force)
    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 10,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Too many auth attempts, please try again later.' },
    });
    app.use('/api/auth', authLimiter);
}

// --- Body Parser ---
app.use(express.json({ limit: '50mb' }));

// --- Global Error Dumper (dev only, disabled in tests) ---
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    app.use((req, res, next) => {
        const originalSend = res.json;
        res.json = function (body) {
            if (res.statusCode >= 400) {
                console.error(`[HTTP ${res.statusCode}] ${req.method} ${req.url} ->`, JSON.stringify(body));
            }
            return originalSend.call(this, body);
        };
        next();
    });
}

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/layouts', layoutsRoutes);

// --- Health Check ---
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', time: new Date() });
});

export default app;
