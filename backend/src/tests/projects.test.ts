import request from 'supertest';
import app from '../app';
import { setupTestDb, clearDb, createTestUser, sampleProjectPayload } from './helpers';

const log = (msg: string) => console.log(`    🔹 ${msg}`);
const logOk = (msg: string) => console.log(`    ✅ ${msg}`);
const logRes = (res: any) => console.log(`    📨 Ответ: ${res.status} ${JSON.stringify(res.body).slice(0, 200)}`);

beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key-for-jest-do-not-use-in-prod';
    process.env.SMSAERO_EMAIL = 'test@test.com';
    process.env.SMSAERO_API_KEY = 'fake-api-key';
    await setupTestDb();
    console.log('\n📋 === ТЕСТЫ ПРОЕКТОВ ===\n');
});

beforeEach(async () => {
    await clearDb();
});

// ─── CREATE ───────────────────────────────────────────────────

describe('POST /api/projects (создание)', () => {
    it('201 — создание проекта с авторизацией', async () => {
        const user = await createTestUser();
        log(`Создаём проект от имени пользователя ${user.phone}...`);
        const res = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${user.token}`)
            .send(sampleProjectPayload());
        logRes(res);
        expect(res.status).toBe(201);
        expect(res.body.userId).toBe(user.id);
        expect(res.body.spreads).toHaveLength(1);
        logOk(`Проект создан: id=${res.body.id}, name="${res.body.name}", spreads=${res.body.spreads.length}`);
    });

    it('201 — гостевой проект (без авторизации)', async () => {
        log('Создаём проект без токена (гость)...');
        const res = await request(app).post('/api/projects').send(sampleProjectPayload());
        logRes(res);
        expect(res.status).toBe(201);
        expect(res.body.userId).toBeNull();
        logOk(`Проект создан как гостевой: id=${res.body.id}, userId=null`);
    });

    it('400 — без имени проекта', async () => {
        const user = await createTestUser();
        log('Создаём проект без имени...');
        const res = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${user.token}`)
            .send({ themeId: 'memories' });
        logRes(res);
        expect(res.status).toBe(400);
        logOk('Zod валидация: имя обязательно');
    });

    it('400 — имя длиннее 100 символов', async () => {
        const user = await createTestUser();
        const longName = 'a'.repeat(101);
        log(`Создаём проект с именем в ${longName.length} символов...`);
        const res = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${user.token}`)
            .send(sampleProjectPayload({ name: longName }));
        logRes(res);
        expect(res.status).toBe(400);
        logOk('Zod валидация: максимум 100 символов');
    });

    it('400 — > 150 разворотов (JSON bomb защита)', async () => {
        const user = await createTestUser();
        const bigSpreads = Array.from({ length: 151 }, (_, i) => ({
            id: `sp${i}`,
            leftPage: { id: `lp${i}`, type: 'content', layoutId: null, content: {}, slotSettings: {}, backgroundColor: '#fff' },
            rightPage: { id: `rp${i}`, type: 'content', layoutId: null, content: {}, slotSettings: {}, backgroundColor: '#fff' },
        }));
        log(`Создаём проект с ${bigSpreads.length} разворотами...`);
        const res = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${user.token}`)
            .send(sampleProjectPayload({ spreads: bigSpreads }));
        logRes(res);
        expect(res.status).toBe(400);
        logOk('Zod валидация: максимум 150 разворотов');
    });
});

// ─── READ ─────────────────────────────────────────────────────

describe('GET /api/projects (чтение)', () => {
    it('200 — пустой массив для гостя', async () => {
        log('Запрашиваем список проектов без авторизации...');
        const res = await request(app).get('/api/projects');
        logRes(res);
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
        logOk('Гость получает пустой массив');
    });

    it('200 — только свои проекты', async () => {
        const user1 = await createTestUser({ phone: '+79001111111' });
        const user2 = await createTestUser({ phone: '+79002222222' });
        log('Создаём по проекту для двух разных пользователей...');
        await request(app).post('/api/projects').set('Authorization', `Bearer ${user1.token}`)
            .send(sampleProjectPayload({ name: 'Проект User1' }));
        await request(app).post('/api/projects').set('Authorization', `Bearer ${user2.token}`)
            .send(sampleProjectPayload({ name: 'Проект User2' }));

        log(`Запрашиваем список от имени User1 (${user1.phone})...`);
        const res = await request(app).get('/api/projects').set('Authorization', `Bearer ${user1.token}`);
        logRes(res);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].name).toBe('Проект User1');
        logOk('User1 видит только свой проект');
    });
});

describe('GET /api/projects/:id (чтение одного)', () => {
    it('404 — несуществующий проект', async () => {
        const user = await createTestUser();
        log('Запрашиваем проект с несуществующим id...');
        const res = await request(app).get('/api/projects/non-existent-id')
            .set('Authorization', `Bearer ${user.token}`);
        logRes(res);
        expect(res.status).toBe(404);
        logOk('Проект не найден — 404');
    });

    it('200 — владелец видит свой проект', async () => {
        const user = await createTestUser();
        const createRes = await request(app).post('/api/projects')
            .set('Authorization', `Bearer ${user.token}`)
            .send(sampleProjectPayload());
        log(`Запрашиваем проект ${createRes.body.id} от владельца...`);
        const res = await request(app).get(`/api/projects/${createRes.body.id}`)
            .set('Authorization', `Bearer ${user.token}`);
        logRes(res);
        expect(res.status).toBe(200);
        logOk(`Владелец получил проект: name="${res.body.name}"`);
    });

    it('403 — чужой пользователь не может просмотреть', async () => {
        const owner = await createTestUser({ phone: '+79001111111' });
        const other = await createTestUser({ phone: '+79002222222' });
        const createRes = await request(app).post('/api/projects')
            .set('Authorization', `Bearer ${owner.token}`)
            .send(sampleProjectPayload());
        log(`User2 пытается просмотреть проект User1 (${createRes.body.id})...`);
        const res = await request(app).get(`/api/projects/${createRes.body.id}`)
            .set('Authorization', `Bearer ${other.token}`);
        logRes(res);
        expect(res.status).toBe(403);
        logOk('Доступ запрещён — 403 Forbidden');
    });

    it('200 — ADMIN видит любой проект', async () => {
        const owner = await createTestUser({ phone: '+79001111111' });
        const admin = await createTestUser({ phone: '+79002222222', role: 'ADMIN' });
        const createRes = await request(app).post('/api/projects')
            .set('Authorization', `Bearer ${owner.token}`)
            .send(sampleProjectPayload());
        log(`ADMIN пытается просмотреть проект User1 (${createRes.body.id})...`);
        const res = await request(app).get(`/api/projects/${createRes.body.id}`)
            .set('Authorization', `Bearer ${admin.token}`);
        logRes(res);
        expect(res.status).toBe(200);
        logOk('ADMIN имеет доступ к чужому проекту');
    });
});

// ─── UPDATE ───────────────────────────────────────────────────

describe('PUT /api/projects/:id (обновление)', () => {
    it('401 — без авторизации', async () => {
        log('Обновляем проект без токена...');
        const res = await request(app).put('/api/projects/some-id').send({ name: 'Hacked' });
        logRes(res);
        expect(res.status).toBe(401);
        logOk('Обновление запрещено без авторизации');
    });

    it('200 — обновление своего проекта', async () => {
        const user = await createTestUser();
        const createRes = await request(app).post('/api/projects')
            .set('Authorization', `Bearer ${user.token}`)
            .send(sampleProjectPayload());
        log(`Обновляем имя проекта ${createRes.body.id}...`);
        const res = await request(app).put(`/api/projects/${createRes.body.id}`)
            .set('Authorization', `Bearer ${user.token}`)
            .send({ name: 'Новое имя' });
        logRes(res);
        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Новое имя');
        logOk(`Имя изменено: "${res.body.name}"`);
    });

    it('403 — чужой пользователь не может обновить', async () => {
        const owner = await createTestUser({ phone: '+79001111111' });
        const other = await createTestUser({ phone: '+79002222222' });
        const createRes = await request(app).post('/api/projects')
            .set('Authorization', `Bearer ${owner.token}`)
            .send(sampleProjectPayload());
        log(`User2 пытается обновить проект User1...`);
        const res = await request(app).put(`/api/projects/${createRes.body.id}`)
            .set('Authorization', `Bearer ${other.token}`)
            .send({ name: 'Hijacked!' });
        logRes(res);
        expect(res.status).toBe(403);
        logOk('Обновление запрещено — 403 Forbidden');
    });
});

// ─── DELETE ───────────────────────────────────────────────────

describe('DELETE /api/projects/:id (удаление)', () => {
    it('401 — без авторизации', async () => {
        log('Удаляем проект без токена...');
        const res = await request(app).delete('/api/projects/some-id');
        logRes(res);
        expect(res.status).toBe(401);
        logOk('Удаление запрещено без авторизации');
    });

    it('200 — удаление своего проекта + проверка 404', async () => {
        const user = await createTestUser();
        const createRes = await request(app).post('/api/projects')
            .set('Authorization', `Bearer ${user.token}`)
            .send(sampleProjectPayload());
        log(`Удаляем проект ${createRes.body.id}...`);
        const res = await request(app).delete(`/api/projects/${createRes.body.id}`)
            .set('Authorization', `Bearer ${user.token}`);
        logRes(res);
        expect(res.status).toBe(200);

        log('Проверяем, что проект действительно удалён...');
        const getRes = await request(app).get(`/api/projects/${createRes.body.id}`)
            .set('Authorization', `Bearer ${user.token}`);
        logRes(getRes);
        expect(getRes.status).toBe(404);
        logOk('Проект удалён и больше не доступен');
    });
});

// ─── CLAIM ────────────────────────────────────────────────────

describe('PATCH /api/projects/claim (привязка гостевых)', () => {
    it('200 — привязка гостевого проекта к аккаунту', async () => {
        log('Создаём гостевой проект...');
        const createRes = await request(app).post('/api/projects')
            .send(sampleProjectPayload({ name: 'Гостевой проект' }));
        const guestId = createRes.body.id;
        logRes(createRes);

        const user = await createTestUser();
        log(`Привязываем проект ${guestId} к пользователю ${user.phone}...`);
        const claimRes = await request(app).patch('/api/projects/claim')
            .set('Authorization', `Bearer ${user.token}`)
            .send({ projectIds: [guestId] });
        logRes(claimRes);
        expect(claimRes.body.claimed).toBe(1);

        log('Проверяем, что проект теперь принадлежит пользователю...');
        const getRes = await request(app).get(`/api/projects/${guestId}`)
            .set('Authorization', `Bearer ${user.token}`);
        expect(getRes.body.userId).toBe(user.id);
        logOk(`Проект привязан: userId=${getRes.body.userId}`);
    });

    it('200 — нельзя забрать чужой проект', async () => {
        const owner = await createTestUser({ phone: '+79001111111' });
        const thief = await createTestUser({ phone: '+79002222222' });
        const createRes = await request(app).post('/api/projects')
            .set('Authorization', `Bearer ${owner.token}`)
            .send(sampleProjectPayload());
        log(`User2 пытается claim проект User1 (${createRes.body.id})...`);
        const claimRes = await request(app).patch('/api/projects/claim')
            .set('Authorization', `Bearer ${thief.token}`)
            .send({ projectIds: [createRes.body.id] });
        logRes(claimRes);
        expect(claimRes.body.claimed).toBe(0);
        logOk('Claim отклонён — проект уже имеет владельца');
    });
});
