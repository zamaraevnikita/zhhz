import request from 'supertest';
import app from '../app';
import { setupTestDb, clearDb, createTestUser, sampleOrderPayload } from './helpers';

const log = (msg: string) => console.log(`    🔹 ${msg}`);
const logOk = (msg: string) => console.log(`    ✅ ${msg}`);
const logRes = (res: any) => console.log(`    📨 Ответ: ${res.status} ${JSON.stringify(res.body).slice(0, 200)}`);

beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key-for-jest-do-not-use-in-prod';
    process.env.SMSAERO_EMAIL = 'test@test.com';
    process.env.SMSAERO_API_KEY = 'fake-api-key';
    await setupTestDb();
    console.log('\n📋 === ТЕСТЫ ЗАКАЗОВ ===\n');
});

beforeEach(async () => {
    await clearDb();
});

// ─── CREATE ───────────────────────────────────────────────────

describe('POST /api/orders (создание)', () => {
    it('401 — без авторизации', async () => {
        log('Создаём заказ без токена...');
        const res = await request(app).post('/api/orders').send(sampleOrderPayload());
        logRes(res);
        expect(res.status).toBe(401);
        logOk('Заказ нельзя создать без авторизации');
    });

    it('201 — успешное создание заказа', async () => {
        const user = await createTestUser();
        log(`Создаём заказ от ${user.phone}...`);
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${user.token}`)
            .send(sampleOrderPayload());
        logRes(res);
        expect(res.status).toBe(201);
        expect(res.body.status).toBe('PENDING');
        expect(res.body.totalAmount).toBe(4490);
        expect(res.body.items).toHaveLength(1);
        logOk(`Заказ создан: id=${res.body.id}, сумма=${res.body.totalAmount}, статус=${res.body.status}`);
    });

    it('400 — без товаров', async () => {
        const user = await createTestUser();
        log('Создаём заказ без items...');
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${user.token}`)
            .send({ totalAmount: 100 });
        logRes(res);
        expect(res.status).toBe(400);
        logOk('Zod: items обязателен');
    });

    it('400 — отрицательная сумма', async () => {
        const user = await createTestUser();
        log('Создаём заказ с отрицательной суммой -100...');
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${user.token}`)
            .send(sampleOrderPayload({ totalAmount: -100 }));
        logRes(res);
        expect(res.status).toBe(400);
        logOk('Zod: сумма должна быть положительной');
    });

    it('400 — > 200 товаров (JSON bomb)', async () => {
        const user = await createTestUser();
        const bigItems = Array.from({ length: 201 }, (_, i) => ({
            id: `item${i}`, type: 'photo', price: 10,
        }));
        log(`Создаём заказ с ${bigItems.length} товарами...`);
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${user.token}`)
            .send(sampleOrderPayload({ items: bigItems }));
        logRes(res);
        expect(res.status).toBe(400);
        logOk('Zod: максимум 200 товаров');
    });
});

// ─── READ ─────────────────────────────────────────────────────

describe('GET /api/orders (список)', () => {
    it('200 — пользователь видит только свои заказы', async () => {
        const user1 = await createTestUser({ phone: '+79001111111' });
        const user2 = await createTestUser({ phone: '+79002222222' });
        log('Создаём по заказу для двух пользователей...');
        await request(app).post('/api/orders').set('Authorization', `Bearer ${user1.token}`)
            .send(sampleOrderPayload());
        await request(app).post('/api/orders').set('Authorization', `Bearer ${user2.token}`)
            .send(sampleOrderPayload());

        log(`Запрашиваем список заказов от User1 (${user1.phone})...`);
        const res = await request(app).get('/api/orders').set('Authorization', `Bearer ${user1.token}`);
        logRes(res);
        expect(res.body).toHaveLength(1);
        logOk('User1 видит только свой 1 заказ');
    });

    it('200 — ADMIN видит ВСЕ заказы', async () => {
        const user = await createTestUser({ phone: '+79001111111' });
        const admin = await createTestUser({ phone: '+79002222222', role: 'ADMIN' });
        await request(app).post('/api/orders').set('Authorization', `Bearer ${user.token}`)
            .send(sampleOrderPayload());
        await request(app).post('/api/orders').set('Authorization', `Bearer ${admin.token}`)
            .send(sampleOrderPayload());

        log('ADMIN запрашивает список всех заказов...');
        const res = await request(app).get('/api/orders').set('Authorization', `Bearer ${admin.token}`);
        logRes(res);
        expect(res.body).toHaveLength(2);
        logOk(`ADMIN видит все ${res.body.length} заказа`);
    });
});

describe('GET /api/orders/:id (один заказ)', () => {
    it('403 — чужой пользователь', async () => {
        const owner = await createTestUser({ phone: '+79001111111' });
        const other = await createTestUser({ phone: '+79002222222' });
        const createRes = await request(app).post('/api/orders')
            .set('Authorization', `Bearer ${owner.token}`)
            .send(sampleOrderPayload());
        log(`User2 пытается просмотреть заказ User1 (${createRes.body.id})...`);
        const res = await request(app).get(`/api/orders/${createRes.body.id}`)
            .set('Authorization', `Bearer ${other.token}`);
        logRes(res);
        expect(res.status).toBe(403);
        logOk('Доступ запрещён — 403');
    });

    it('404 — несуществующий заказ', async () => {
        const user = await createTestUser();
        log('Запрашиваем несуществующий заказ...');
        const res = await request(app).get('/api/orders/non-existent-id')
            .set('Authorization', `Bearer ${user.token}`);
        logRes(res);
        expect(res.status).toBe(404);
        logOk('Заказ не найден — 404');
    });
});

// ─── UPDATE STATUS ────────────────────────────────────────────

describe('PATCH /api/orders/:id/status (обновление статуса)', () => {
    it('403 — обычный пользователь не может менять статус', async () => {
        const user = await createTestUser();
        const createRes = await request(app).post('/api/orders')
            .set('Authorization', `Bearer ${user.token}`)
            .send(sampleOrderPayload());
        log('Обычный пользователь пытается сменить статус...');
        const res = await request(app)
            .patch(`/api/orders/${createRes.body.id}/status`)
            .set('Authorization', `Bearer ${user.token}`)
            .send({ status: 'PROCESSING' });
        logRes(res);
        expect(res.status).toBe(403);
        logOk('Только ADMIN может менять статус заказа');
    });

    it('200 — ADMIN обновляет статус', async () => {
        const user = await createTestUser({ phone: '+79001111111' });
        const admin = await createTestUser({ phone: '+79002222222', role: 'ADMIN' });
        const createRes = await request(app).post('/api/orders')
            .set('Authorization', `Bearer ${user.token}`)
            .send(sampleOrderPayload());
        log(`ADMIN меняет статус заказа ${createRes.body.id} на PROCESSING...`);
        const res = await request(app)
            .patch(`/api/orders/${createRes.body.id}/status`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ status: 'PROCESSING' });
        logRes(res);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('PROCESSING');
        logOk(`Статус обновлён: ${res.body.status}`);
    });

    it('400 — невалидный статус', async () => {
        const admin = await createTestUser({ role: 'ADMIN' });
        const createRes = await request(app).post('/api/orders')
            .set('Authorization', `Bearer ${admin.token}`)
            .send(sampleOrderPayload());
        log('ADMIN пытается установить невалидный статус "CANCELLED"...');
        const res = await request(app)
            .patch(`/api/orders/${createRes.body.id}/status`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ status: 'CANCELLED' });
        logRes(res);
        expect(res.status).toBe(400);
        logOk('Zod: статус должен быть из PENDING/PROCESSING/SHIPPED/DELIVERED');
    });
});
