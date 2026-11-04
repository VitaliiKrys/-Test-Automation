import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OrderService } from '../src/order-service';
import type { RateProvider, OrderRepository, Notifier } from '../src/order-service';
import { InMemoryOrderRepository } from './fakes/in-memory-repository';
describe('Part 1: OrderService — stubs, spies and fakes', () => {
  let rates: RateProvider; let repo: OrderRepository; let notifier: Notifier; let service: OrderService;
  beforeEach(() => { rates = { getRate: vi.fn().mockResolvedValue(41) }; repo = { save: vi.fn().mockResolvedValue(undefined), findById: vi.fn() }; notifier = { send: vi.fn().mockResolvedValue(undefined) }; service = new OrderService(rates, repo, notifier); });
  it('converts USD into UAH', async () => { expect((await service.placeOrder({ id: 'A-1', amountUsd: 100, email: 'a@b.ua' })).amountUah).toBe(4100); });
  it('interacts with the notifier once', async () => { await service.placeOrder({ id: 'A-2', amountUsd: 10, email: 'a@b.ua' }); expect(notifier.send).toHaveBeenCalledOnce(); expect(notifier.send).toHaveBeenCalledWith('a@b.ua', expect.stringContaining('410')); });
  it.each([0, -1, Number.NaN])('rejects invalid amount %s without side effects', async (amountUsd) => { await expect(service.placeOrder({ id: 'A-3', amountUsd, email: 'a@b.ua' })).rejects.toThrow('INVALID_AMOUNT'); expect(rates.getRate).not.toHaveBeenCalled(); expect(repo.save).not.toHaveBeenCalled(); });
  it('checks state with a fake repository', async () => { const fake = new InMemoryOrderRepository(); await new OrderService(rates, fake, notifier).placeOrder({ id: 'A-4', amountUsd: 50, email: 'a@b.ua' }); expect((await fake.findById('A-4'))?.amountUah).toBe(2050); expect(fake.size).toBe(1); });
  it('does not save or notify when rates unavailable', async () => { rates.getRate = vi.fn().mockRejectedValue(new Error('RATE_UNAVAILABLE')); const fake = new InMemoryOrderRepository(); await expect(new OrderService(rates, fake, notifier).placeOrder({ id: 'A-5', amountUsd: 1, email: 'a@b.ua' })).rejects.toThrow('RATE_UNAVAILABLE'); expect(fake.size).toBe(0); expect(notifier.send).not.toHaveBeenCalled(); });
  it('rejects invalid rate', async () => { rates.getRate = vi.fn().mockResolvedValue(0); await expect(service.placeOrder({ id: 'A-6', amountUsd: 1, email: 'a@b.ua' })).rejects.toThrow('INVALID_RATE'); });
  it('propagates notification failure after saving', async () => { notifier.send = vi.fn().mockRejectedValue(new Error('MAIL_FAILED')); await expect(service.placeOrder({ id: 'A-7', amountUsd: 10, email: 'a@b.ua' })).rejects.toThrow('MAIL_FAILED'); expect(repo.save).toHaveBeenCalledOnce(); });
  it('uses the mocked clock', async () => { vi.useFakeTimers(); try { vi.setSystemTime(new Date('2026-03-15T10:00:00.000Z')); const r = await service.placeOrder({ id: 'A-8', amountUsd: 2, email: 'a@b.ua' }); expect(r.createdAt).toBe('2026-03-15T10:00:00.000Z'); } finally { vi.useRealTimers(); } });
});
