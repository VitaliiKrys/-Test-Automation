import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { login, makeOrderPayload } from './helpers';
import { expectSchema } from './schema';
import { orderSchema } from './schemas/order.schema';
describe('Part 2 (variant 9): Idempotency-Key', () => {
  let app: ReturnType<typeof createApp>; let token: string;
  beforeEach(async () => { app = createApp(); token = await login(app); });
  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
  it('first POST 201, identical repeated POST 200 with same id', async () => {
    const first = await request(app).post('/orders').set(auth(token)).set('Idempotency-Key', 'K-1').send(makeOrderPayload());
    const second = await request(app).post('/orders').set(auth(token)).set('Idempotency-Key', 'K-1').send(makeOrderPayload());
    expect(first.status).toBe(201); expect(second.status).toBe(200); expect(first.body.id).toBe(second.body.id);
    expect(second.headers.location).toBe(`/orders/${first.body.id}`);
    expectSchema(second.body, orderSchema); // response structure strict, extra properties forbidden
    const list = await request(app).get('/orders').set(auth(token));
    expect(list.status).toBe(200); expect(list.body).toHaveLength(1); // side effect
  });
  it('same key with different payload returns 409 without new order', async () => {
    await request(app).post('/orders').set(auth(token)).set('Idempotency-Key', 'K-2').send(makeOrderPayload());
    const conflict = await request(app).post('/orders').set(auth(token)).set('Idempotency-Key', 'K-2').send(makeOrderPayload({ items: [{ sku: 'B', price: 800, qty: 1 }] }));
    expect(conflict.status).toBe(409); expect(conflict.body.code).toBe('IDEMPOTENCY_CONFLICT');
    expect((await request(app).get('/orders').set(auth(token))).body).toHaveLength(1);
  });
  it('different keys allow separate orders', async () => {
    const a = await request(app).post('/orders').set(auth(token)).set('Idempotency-Key', 'K-A').send(makeOrderPayload());
    const b = await request(app).post('/orders').set(auth(token)).set('Idempotency-Key', 'K-B').send(makeOrderPayload());
    expect(a.body.id).not.toBe(b.body.id); expect((await request(app).get('/orders').set(auth(token))).body).toHaveLength(2);
  });
  it('keys are scoped per user', async () => {
    const alice = await login(app, 'alice@example.com');
    const a = await request(app).post('/orders').set(auth(alice)).set('Idempotency-Key', 'SHARED').send(makeOrderPayload());
    const b = await request(app).post('/orders').set(auth(token)).set('Idempotency-Key', 'SHARED').send(makeOrderPayload());
    expect(a.status).toBe(201); expect(b.status).toBe(201); expect(a.body.id).not.toBe(b.body.id);
    expect((await request(app).get(`/orders/${a.body.id}`).set(auth(token))).status).toBe(404);
  });
  it.each([{ name: 'no token', header: undefined }, { name: 'invalid token', header: 'Bearer wrong' }, { name: 'bad authorization format', header: 'invalid' }])('rejects $name on idempotent POST', async ({ header }) => {
    const q = request(app).post('/orders').set('Idempotency-Key', 'K-3').send(makeOrderPayload()); if (header) q.set('Authorization', header); expect((await q).status).toBe(401);
  });
  it('empty key produces 400', async () => { const res = await request(app).post('/orders').set(auth(token)).set('Idempotency-Key', '  ').send(makeOrderPayload()); expect(res.status).toBe(400); expect(res.body.code).toBe('INVALID_IDEMPOTENCY_KEY'); });
  it('key may be reused after deleting original order', async () => { const a = await request(app).post('/orders').set(auth(token)).set('Idempotency-Key', 'K-DELETE').send(makeOrderPayload()); await request(app).delete(`/orders/${a.body.id}`).set(auth(token)); const b = await request(app).post('/orders').set(auth(token)).set('Idempotency-Key', 'K-DELETE').send(makeOrderPayload()); expect(b.status).toBe(201); expect(b.body.id).not.toBe(a.body.id); });
  it('fresh createApp ensures no cross-test contamination', async () => { const fresh = createApp(); const freshToken = await login(fresh); const r = await request(fresh).get('/orders').set(auth(freshToken)); expect(r.body).toHaveLength(0); });
  it('repeat without a key intentionally creates a different order', async () => {
    const first = await request(app).post('/orders').set(auth(token)).send(makeOrderPayload());
    const second = await request(app).post('/orders').set(auth(token)).send(makeOrderPayload());
    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(first.body.id).not.toBe(second.body.id);
    const list = await request(app).get('/orders').set(auth(token));
    expect(list.body).toHaveLength(2);
  });
  it('the same key still returns a single order after several repetitions', async () => {
    const ids: string[] = [];
    for (let i = 0; i < 3; i++) {
      const response = await request(app).post('/orders').set(auth(token)).set('Idempotency-Key', 'K-THREE').send(makeOrderPayload());
      expect(response.status).toBe(i === 0 ? 201 : 200);
      ids.push(response.body.id);
    }
    expect(new Set(ids).size).toBe(1);
    expect((await request(app).get('/orders').set(auth(token))).body).toHaveLength(1);
  });

});
