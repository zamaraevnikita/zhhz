import request from 'supertest';
import app from '../app';
import { setupTestDb, clearDb, createTestUser } from './helpers';

const log = (msg: string) => console.log(`    🔹 ${msg}`);
const logOk = (msg: string) => console.log(`    ✅ ${msg}`);
const logRes = (res: any) => console.log(`    📨 Ответ: ${res.status} ${JSON.stringify(res.body).slice(0, 200)}`);

const originalFetch = global.fetch;
beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key-for-jest-do-not-use-in-prod';
    process.env.SMSAERO_EMAIL = 'test@test.com';
    process.env.SMSAERO_API_KEY = 'fake-api-key';
    process.env.SMSAERO_SIGN = 'Test';

    global.fetch = jest.fn().mockResolvedValue({
        json: async () => ({ success: true, data: { id: 123 } }),
    }) as any;

    await setupTestDb();
    console.log('\n📋 === ТЕСТЫ АВТОРИЗАЦИИ ===\n');
});

afterAll(() => {
    global.fetch = originalFetch;
});

beforeEach(async () => {
    await clearDb();
    (global.fetch as jest.Mock).mockClear();
});

// ─── REQUEST OTP ──────────────────────────────────────────────

describe('POST /api/auth/request-otp', () => {
    it('400 — без номера телефона', async () => {
        log('Отправляем request-otp без поля phone...');
        const res = await request(app).post('/api/auth/request-otp').send({});
        logRes(res);
        expect(res.status).toBe(400);
        logOk('Сервер вернул 400 — номер обязателен');
    });

    it('400 — неверный формат номера', async () => {
        log('Отправляем request-otp с коротким номером "123"...');
        const res = await request(app).post('/api/auth/request-otp').send({ phone: '123' });
        logRes(res);
        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Invalid phone');
        logOk('Сервер вернул 400 — формат номера невалиден');
    });

    it('200 — OTP отправлен для валидного номера', async () => {
        log('Отправляем request-otp для +79001234567...');
        const res = await request(app).post('/api/auth/request-otp').send({ phone: '+79001234567' });
        logRes(res);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(global.fetch).toHaveBeenCalledTimes(1);
        logOk('SMS Aero вызван 1 раз, OTP отправлен');
    });

    it('200 — OTP с данными регистрации (имя, email, пароль)', async () => {
        log('Отправляем request-otp с name, email, password...');
        const res = await request(app).post('/api/auth/request-otp').send({
            phone: '+79009876543',
            name: 'Никита',
            email: 'nik@example.com',
            password: 'mypassword123',
        });
        logRes(res);
        expect(res.status).toBe(200);
        logOk('Сервер принял данные регистрации вместе с OTP');
    });

    it('400 — пароль длиннее 72 символов (bcrypt лимит)', async () => {
        log('Отправляем request-otp с паролем в 73 символа...');
        const res = await request(app).post('/api/auth/request-otp').send({
            phone: '+79001234567',
            password: 'a'.repeat(73),
        });
        logRes(res);
        expect(res.status).toBe(400);
        logOk('Сервер вернул 400 — защита от bcrypt DoS');
    });

    it('500 — нет креденшалов SMS Aero', async () => {
        const oldEmail = process.env.SMSAERO_EMAIL;
        process.env.SMSAERO_EMAIL = '';
        log('Отправляем request-otp без SMSAERO_EMAIL...');
        const res = await request(app).post('/api/auth/request-otp').send({ phone: '+79001234567' });
        logRes(res);
        expect(res.status).toBe(500);
        process.env.SMSAERO_EMAIL = oldEmail;
        logOk('Сервер вернул 500 — SMS провайдер не настроен');
    });

    it('400 — SMS Aero вернул ошибку', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            json: async () => ({ success: false, message: 'Insufficient balance' }),
        });
        log('Отправляем request-otp, мокаем ошибку SMS Aero...');
        const res = await request(app).post('/api/auth/request-otp').send({ phone: '+79001234567' });
        logRes(res);
        expect(res.status).toBe(400);
        logOk('Сервер проксирует ошибку SMS провайдера');
    });
});

// ─── VERIFY OTP ───────────────────────────────────────────────

describe('POST /api/auth/verify-otp', () => {
    it('400 — без кода', async () => {
        log('Отправляем verify-otp без поля code...');
        const res = await request(app).post('/api/auth/verify-otp').send({ phone: '+79001234567' });
        logRes(res);
        expect(res.status).toBe(400);
        logOk('Сервер вернул 400 — код обязателен');
    });

    it('401 — OTP не запрашивался', async () => {
        log('Отправляем verify-otp для номера без запрошенного OTP...');
        const res = await request(app).post('/api/auth/verify-otp').send({ phone: '+79999999999', code: '1234' });
        logRes(res);
        expect(res.status).toBe(401);
        logOk('Сервер вернул 401 — код не запрашивался');
    });

    it('401 — неверный код (OTP store работает)', async () => {
        log('Запрашиваем OTP для +79001112233...');
        await request(app).post('/api/auth/request-otp').send({ phone: '+79001112233', name: 'NewUser' });
        log('Пробуем верифицировать с неверным кодом "0000"...');
        const badRes = await request(app).post('/api/auth/verify-otp').send({ phone: '+79001112233', code: '0000' });
        logRes(badRes);
        expect(badRes.status).toBe(401);
        expect(badRes.body.error).toContain('Неверный код');
        logOk('Сервер вернул 401 — неверный код, OTP store работает корректно');
    });
});

// ─── LOGIN ────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
    it('400 — без пароля', async () => {
        log('Отправляем login без поля password...');
        const res = await request(app).post('/api/auth/login').send({ phone: '+79001234567' });
        logRes(res);
        expect(res.status).toBe(400);
        logOk('Сервер вернул 400 — пароль обязателен');
    });

    it('401 — пользователь не существует', async () => {
        log('Логинимся с несуществующим номером...');
        const res = await request(app).post('/api/auth/login').send({ phone: '+79999999999', password: 'whatever' });
        logRes(res);
        expect(res.status).toBe(401);
        logOk('Сервер вернул 401 — пользователь не найден');
    });

    it('401 — неверный пароль', async () => {
        await createTestUser({ phone: '+79001234567', password: 'correct-pass' });
        log('Логинимся с неверным паролем...');
        const res = await request(app).post('/api/auth/login').send({ phone: '+79001234567', password: 'wrong-pass' });
        logRes(res);
        expect(res.status).toBe(401);
        logOk('Сервер вернул 401 — пароль не совпадает');
    });

    it('200 — успешный логин', async () => {
        await createTestUser({ phone: '+79001234567', password: 'correct-pass', name: 'Никита' });
        log('Логинимся с правильным паролем...');
        const res = await request(app).post('/api/auth/login').send({ phone: '+79001234567', password: 'correct-pass' });
        logRes(res);
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.name).toBe('Никита');
        logOk(`Логин успешен, токен: ${res.body.token.slice(0, 20)}...`);
    });

    it('401 — пароль не задан у пользователя', async () => {
        await createTestUser({ phone: '+79001234567' });
        log('Логинимся в аккаунт без пароля...');
        const res = await request(app).post('/api/auth/login').send({ phone: '+79001234567', password: 'whatever' });
        logRes(res);
        expect(res.status).toBe(401);
        expect(res.body.error).toContain('пароль не задан');
        logOk('Сервер вернул 401 — пароль не установлен');
    });

    it('401 — пароль > 72 символов', async () => {
        log('Логинимся с паролем в 73 символа...');
        const res = await request(app).post('/api/auth/login').send({ phone: '+79001234567', password: 'a'.repeat(73) });
        logRes(res);
        expect(res.status).toBe(401);
        logOk('Сервер вернул 401 — защита от bcrypt DoS');
    });
});

// ─── ME ───────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
    it('401 — без токена', async () => {
        log('Запрашиваем /me без Authorization header...');
        const res = await request(app).get('/api/auth/me');
        logRes(res);
        expect(res.status).toBe(401);
        logOk('Доступ запрещён без токена');
    });

    it('200 — данные пользователя с токеном', async () => {
        const user = await createTestUser({ name: 'Никита', phone: '+79001234567' });
        log(`Запрашиваем /me с токеном пользователя ${user.name}...`);
        const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${user.token}`);
        logRes(res);
        expect(res.status).toBe(200);
        expect(res.body.user.id).toBe(user.id);
        logOk(`Получили данные: id=${res.body.user.id}, name=${res.body.user.name}`);
    });

    it('401 — невалидный токен', async () => {
        log('Запрашиваем /me с поддельным токеном...');
        const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer fake-token-123');
        logRes(res);
        expect(res.status).toBe(401);
        logOk('Сервер отклонил поддельный токен');
    });
});
