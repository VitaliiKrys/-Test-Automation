import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server, RATE_URL } from './msw/server';
import { HttpRateProvider } from '../src/rate-provider';
const provider = new HttpRateProvider('https://api.example.com');
describe('Part 1: rate provider + MSW', () => {
  it('reads rate on HTTP 200', async () => { await expect(provider.getRate('USD', 'UAH')).resolves.toBe(41.25); });
  it('rejects HTTP 503', async () => { server.use(http.get(RATE_URL, () => new HttpResponse(null, { status: 503 }))); await expect(provider.getRate('USD', 'UAH')).rejects.toThrow('RATE_UNAVAILABLE'); });
  it('rejects a string rate', async () => { server.use(http.get(RATE_URL, () => HttpResponse.json({ rate: '41.25' }))); await expect(provider.getRate('USD', 'UAH')).rejects.toThrow('INVALID_RATE_FORMAT'); });
  it('passes currency parameters', async () => { let captured: URL | undefined; server.use(http.get(RATE_URL, ({ request }) => { captured = new URL(request.url); return HttpResponse.json({ rate: 1 }); })); await provider.getRate('EUR', 'PLN'); expect(captured?.searchParams.get('from')).toBe('EUR'); expect(captured?.searchParams.get('to')).toBe('PLN'); });
  it('handles network error', async () => { server.use(http.get(RATE_URL, () => HttpResponse.error())); await expect(provider.getRate('USD', 'UAH')).rejects.toThrow(); });
});
