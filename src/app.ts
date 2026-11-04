import express from 'express';
import { randomUUID } from 'node:crypto';
type Tier = 'basic' | 'silver' | 'gold';
export interface Item { sku: string; price: number; qty: number; }
interface Order { id: string; ownerId: string; tier: Tier; items: Item[]; subtotal: number; total: number; createdAt: string; }
interface User { id: string; email: string; password: string; tier: Tier; }
const USERS: User[] = [
  { id: 'u1', email: 'alice@example.com', password: 'Secret123', tier: 'gold' },
  { id: 'u2', email: 'bob@example.com', password: 'Secret123', tier: 'basic' },
];
const DISCOUNTS: Record<Tier, number> = { basic: 0, silver: 0.05, gold: 0.1 };
const round2 = (x: number) => Math.round(x * 100) / 100;
const toPublic = ({ ownerId, ...publicOrder }: Order) => publicOrder;
export function createApp() {
  const app = express();
  app.use(express.json());
  const tokens = new Map<string, string>();
  const orders = new Map<string, Order>();
  const idempotency = new Map<string, { orderId: string; fingerprint: string;}>();
  app.post('/auth/login', (req, res) => {
    const user = USERS.find(u => u.email === req.body?.email && u.password === req.body?.password);
    if (!user) return res.status(401).json({ code: 'INVALID_CREDENTIALS' });
    const token = randomUUID(); tokens.set(token, user.id); return res.json({ accessToken: token });
  });
  app.use('/orders', (req, res, next) => {
    const auth = req.header('Authorization');
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined;
    const id = token ? tokens.get(token) : undefined;
    const user = USERS.find(u => u.id === id);
    if (!user) return res.status(401).json({ code: 'UNAUTHORIZED' });
    res.locals.user = user; next();
  });
  app.post('/orders', (req, res) => {
    const user = res.locals.user as User;
    const items: unknown = req.body?.items;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ code: 'EMPTY_ORDER' });
    for (const item of items) {
      if (!item || typeof item !== 'object' || typeof item.sku !== 'string' || !item.sku.trim()) return res.status(400).json({ code: 'INVALID_SKU' });
      if (typeof item.price !== 'number' || !Number.isFinite(item.price) || item.price < 0) return res.status(400).json({ code: 'INVALID_PRICE' });
      if (!Number.isInteger(item.qty) || item.qty <= 0) return res.status(400).json({ code: 'INVALID_QTY' });
    }
    const validItems: Item[] = items.map((i: Item) => ({ sku: i.sku, price: i.price, qty: i.qty }));
    const rawKey = req.get('Idempotency-Key');
    if (rawKey !== undefined && !rawKey.trim()) return res.status(400).json({ code: 'INVALID_IDEMPOTENCY_KEY' });
    const scopeKey = rawKey ? `${user.id}:${rawKey.trim()}` : undefined;
    const fingerprint = JSON.stringify(validItems);
    if (scopeKey) {
      const existing = idempotency.get(scopeKey);
      if (existing) {
        if (existing.fingerprint !== fingerprint) return res.status(409).json({ code: 'IDEMPOTENCY_CONFLICT' });
        const saved = orders.get(existing.orderId);
        if (saved) return res.status(200).location(`/orders/${saved.id}`).json(toPublic(saved));
        idempotency.delete(scopeKey);
      }
    }
    const subtotal = round2(validItems.reduce((total, item) => total + item.price * item.qty, 0));
    let rate = DISCOUNTS[user.tier];
    if (subtotal >= 2000) rate += 0.05;
    const afterDiscount = round2(subtotal * (1 - Math.min(rate, 0.25)));
    const total = round2(afterDiscount + (afterDiscount >= 1000 ? 0 : 60));
    const order: Order = { id: randomUUID(), ownerId: user.id, tier: user.tier, items: validItems, subtotal, total, createdAt: new Date().toISOString() };
    orders.set(order.id, order);
    if (scopeKey) idempotency.set(scopeKey, { orderId: order.id, fingerprint });
    return res.status(201).location(`/orders/${order.id}`).json(toPublic(order));
  });
  app.get('/orders', (req, res) => {
    const own = [...orders.values()].filter(order => order.ownerId === (res.locals.user as User).id);
    return res.json(own.map(toPublic));
  });
  app.get('/orders/:id', (req, res) => {
    const order = orders.get(req.params.id);
    if (!order || order.ownerId !== (res.locals.user as User).id) return res.status(404).json({ code: 'NOT_FOUND' });
    return res.json(toPublic(order));
  });
  app.delete('/orders/:id', (req, res) => {
    const order = orders.get(req.params.id);
    if (!order || order.ownerId !== (res.locals.user as User).id) return res.status(404).json({ code: 'NOT_FOUND' });
    orders.delete(order.id);
    for (const [key, v] of idempotency) if (v.orderId === order.id) idempotency.delete(key);
    return res.status(204).end();
  });
  return app;
}
