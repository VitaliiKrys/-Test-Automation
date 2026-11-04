import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { login, makeOrderPayload } from './helpers';
import { orderSchema } from './schemas/order.schema';
import { expectSchema } from './schema';
describe('Part 1: POST /orders — five levels of assertions', () => {
  let app: ReturnType<typeof createApp>; let token: string;
  beforeEach(async () => { app = createApp(); token = await login(app); });
  it('201; Location; calculated total; strict schema; side effect', async () => {
    const created = await request(app).post('/orders').set('Authorization', `Bearer ${token}`).send(makeOrderPayload());
    expect(created.status).toBe(201); expect(created.headers.location).toBe(`/orders/${created.body.id}`); expect(created.body.total).toBe(560);
    expectSchema(created.body, orderSchema);
    const found = await request(app).get(`/orders/${created.body.id}`).set('Authorization', `Bearer ${token}`);
    expect(found.status).toBe(200); expect(found.body).toEqual(created.body);
  });
  it.each([
    { label: 'empty', items: [], code: 'EMPTY_ORDER' },
    { label: 'negative price', items: [{ sku: 'A', price: -1, qty: 1 }], code: 'INVALID_PRICE' },
    { label: 'zero qty', items: [{ sku: 'A', price: 10, qty: 0 }], code: 'INVALID_QTY' },
    { label: 'fraction qty', items: [{ sku: 'A', price: 10, qty: 1.5 }], code: 'INVALID_QTY' },
    { label: 'missing sku', items: [{ price: 10, qty: 1 }], code: 'INVALID_SKU' },
  ])('$label => 400 $code', async ({ items, code }) => { const res = await request(app).post('/orders').set('Authorization', `Bearer ${token}`).send({ items }); expect(res.status).toBe(400); expect(res.body.code).toBe(code); });
  it('applies gold discount and shipping on first order', async () => { const gold = await login(app, 'alice@example.com'); const res = await request(app).post('/orders').set('Authorization', `Bearer ${gold}`).send(makeOrderPayload()); expect(res.body.total).toBe(510); });
  it('for subtotal 2000 applies tier discount and free shipping', async () => { const gold = await login(app, 'alice@example.com'); const res = await request(app).post('/orders').set('Authorization', `Bearer ${gold}`).send(makeOrderPayload({ items: [{ sku: 'X', price: 2000, qty: 1 }] })); expect(res.body.total).toBe(1700); });
});
describe('Part 1: authentication and authorization', () => {
  it.each([{ label: 'without token', header: undefined }, { label: 'fake token', header: 'Bearer fake-token' }, { label: 'bad prefix', header: 'bad-token' }])('$label returns 401', async ({ header }) => { const app = createApp(); const q = request(app).get('/orders'); if (header) q.set('Authorization', header); expect((await q).status).toBe(401); });
  it('other user cannot fetch order (404, not 403)', async () => { const app = createApp(); const alice = await login(app, 'alice@example.com'); const bob = await login(app); const a = await request(app).post('/orders').set('Authorization', `Bearer ${alice}`).send(makeOrderPayload()); const r = await request(app).get(`/orders/${a.body.id}`).set('Authorization', `Bearer ${bob}`); expect(r.status).toBe(404); });
  it('list only contains own orders', async () => { const app = createApp(); const alice = await login(app, 'alice@example.com'); const bob = await login(app); await request(app).post('/orders').set('Authorization', `Bearer ${alice}`).send(makeOrderPayload()); await request(app).post('/orders').set('Authorization', `Bearer ${bob}`).send(makeOrderPayload()); const r = await request(app).get('/orders').set('Authorization', `Bearer ${bob}`); expect(r.status).toBe(200); expect(r.body).toHaveLength(1); });
  it('DELETE returns 204 without text; repeated DELETE returns 404', async () => { const app = createApp(); const token = await login(app); const headers = { Authorization: `Bearer ${token}` }; const c = await request(app).post('/orders').set(headers).send(makeOrderPayload()); const url = `/orders/${c.body.id}`; const a = await request(app).delete(url).set(headers); expect(a.status).toBe(204); expect(a.text).toBe(''); expect((await request(app).delete(url).set(headers)).status).toBe(404); expect((await request(app).get(url).set(headers)).status).toBe(404); });
});
