import request from 'supertest';
import app from '../app';
import { setupTestDb, clearDb, createTestUser, sampleLayoutPayload } from './helpers';

const log = (msg: string) => console.log(`    🔹 ${msg}`);
const logOk = (msg: string) => console.log(`    ✅ ${msg}`);
const logRes = (res: any) => console.log(`    📨 Ответ: ${res.status} ${JSON.stringify(res.body).slice(0, 200)}`);

beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key-for-jest-do-not-use-in-prod';
    process.env.SMSAERO_EMAIL = 'test@test.com';
    process.env.SMSAERO_API_KEY = 'fake-api-key';
    await setupTestDb();
    console.log('\n📋 === ТЕСТЫ МАКЕТОВ (LAYOUTS) ===\n');
});

beforeEach(async () => {
    await clearDb();
});

// ─── READ ─────────────────────────────────────────────────────

describe('GET /api/layouts (чтение)', () => {
    it('401 — без авторизации', async () => {
        log('Запрашиваем макеты без токена...');
        const res = await request(app).get('/api/layouts');
        logRes(res);
        expect(res.status).toBe(401);
        logOk('Доступ запрещён без авторизации');
    });

    it('200 — пустой массив когда нет макетов', async () => {
        const user = await createTestUser();
        log('Запрашиваем макеты (пустая база)...');
        const res = await request(app).get('/api/layouts')
            .set('Authorization', `Bearer ${user.token}`);
        logRes(res);
        expect(res.body).toEqual([]);
        logOk('Получен пустой массив');
    });

    it('200 — макеты возвращаются после создания', async () => {
        const admin = await createTestUser({ role: 'ADMIN' });
        const payload = sampleLayoutPayload();
        await request(app).post('/api/layouts')
            .set('Authorization', `Bearer ${admin.token}`)
            .send(payload);
        log('Запрашиваем макеты после создания одного...');
        const res = await request(app).get('/api/layouts')
            .set('Authorization', `Bearer ${admin.token}`);
        logRes(res);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].slots).toHaveLength(2);
        logOk(`Получен 1 макет: name="${res.body[0].name}", slots=${res.body[0].slots.length}`);
    });
});

// ─── CREATE ───────────────────────────────────────────────────

describe('POST /api/layouts (создание)', () => {
    it('403 — обычный пользователь не может создать', async () => {
        const user = await createTestUser();
        log('Обычный user пытается создать макет...');
        const res = await request(app).post('/api/layouts')
            .set('Authorization', `Bearer ${user.token}`)
            .send(sampleLayoutPayload());
        logRes(res);
        expect(res.status).toBe(403);
        logOk('Только ADMIN может создавать макеты');
    });

    it('200 — ADMIN создаёт макет', async () => {
        const admin = await createTestUser({ role: 'ADMIN' });
        const payload = sampleLayoutPayload();
        log(`ADMIN создаёт макет "${payload.name}"...`);
        const res = await request(app).post('/api/layouts')
            .set('Authorization', `Bearer ${admin.token}`)
            .send(payload);
        logRes(res);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        logOk(`Макет создан: id=${res.body.id}`);
    });

    it('200 — upsert: обновление существующего макета', async () => {
        const admin = await createTestUser({ role: 'ADMIN' });
        const payload = sampleLayoutPayload();
        log(`Создаём макет "${payload.name}"...`);
        await request(app).post('/api/layouts')
            .set('Authorization', `Bearer ${admin.token}`)
            .send(payload);

        const updated = { ...payload, name: 'Обновлённый макет' };
        log(`Обновляем тот же макет (id=${payload.id}) с новым именем...`);
        const res = await request(app).post('/api/layouts')
            .set('Authorization', `Bearer ${admin.token}`)
            .send(updated);
        logRes(res);
        expect(res.status).toBe(200);

        log('Проверяем, что макет обновился, а не добавился...');
        const getRes = await request(app).get('/api/layouts')
            .set('Authorization', `Bearer ${admin.token}`);
        expect(getRes.body).toHaveLength(1);
        expect(getRes.body[0].name).toBe('Обновлённый макет');
        logOk(`Upsert работает: name="${getRes.body[0].name}", count=1`);
    });

    it('400 — > 50 слотов (JSON bomb)', async () => {
        const admin = await createTestUser({ role: 'ADMIN' });
        const bigSlots = Array.from({ length: 51 }, (_, i) => ({
            id: `slot${i}`, type: 'image', className: '',
        }));
        log(`Создаём макет с ${bigSlots.length} слотами...`);
        const res = await request(app).post('/api/layouts')
            .set('Authorization', `Bearer ${admin.token}`)
            .send(sampleLayoutPayload({ slots: bigSlots }));
        logRes(res);
        expect(res.status).toBe(400);
        logOk('Zod: максимум 50 слотов');
    });

    it('400 — невалидный тип слота', async () => {
        const admin = await createTestUser({ role: 'ADMIN' });
        log('Создаём макет со слотом type="video" (невалидный)...');
        const res = await request(app).post('/api/layouts')
            .set('Authorization', `Bearer ${admin.token}`)
            .send(sampleLayoutPayload({ slots: [{ id: 'slot1', type: 'video', className: '' }] }));
        logRes(res);
        expect(res.status).toBe(400);
        logOk('Zod: тип слота должен быть "image" или "text"');
    });
});

// ─── DELETE ───────────────────────────────────────────────────

describe('DELETE /api/layouts/:id (удаление)', () => {
    it('403 — обычный пользователь не может удалить', async () => {
        const user = await createTestUser();
        log('Обычный user пытается удалить макет...');
        const res = await request(app).delete('/api/layouts/some-id')
            .set('Authorization', `Bearer ${user.token}`);
        logRes(res);
        expect(res.status).toBe(403);
        logOk('Только ADMIN может удалять макеты');
    });

    it('200 — ADMIN удаляет макет + проверка', async () => {
        const admin = await createTestUser({ role: 'ADMIN' });
        const payload = sampleLayoutPayload();
        await request(app).post('/api/layouts')
            .set('Authorization', `Bearer ${admin.token}`)
            .send(payload);
        log(`ADMIN удаляет макет ${payload.id}...`);
        const res = await request(app).delete(`/api/layouts/${payload.id}`)
            .set('Authorization', `Bearer ${admin.token}`);
        logRes(res);
        expect(res.status).toBe(200);

        log('Проверяем, что макет удалён...');
        const getRes = await request(app).get('/api/layouts')
            .set('Authorization', `Bearer ${admin.token}`);
        expect(getRes.body).toHaveLength(0);
        logOk('Макет удалён, список пуст');
    });

    it('404 — несуществующий макет', async () => {
        const admin = await createTestUser({ role: 'ADMIN' });
        log('ADMIN пытается удалить несуществующий макет...');
        const res = await request(app).delete('/api/layouts/non-existent-id')
            .set('Authorization', `Bearer ${admin.token}`);
        logRes(res);
        expect(res.status).toBe(404);
        logOk('Макет не найден — 404');
    });
});
