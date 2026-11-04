import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { HttpMessageGateway } from '../src/http-message-gateway';
import { server, MESSAGE_URL } from './msw/server';
const gateway = new HttpMessageGateway('https://api.example.com');
describe('Part 2: HTTP notification gateway via MSW', () => {
  it('receives message ID (success)', async () => { await expect(gateway.send('a@b.ua', 'hello')).resolves.toBe('MSG-OK'); });
  it('rejects HTTP 503', async () => { server.use(http.post(MESSAGE_URL, () => new HttpResponse(null, { status: 503 }))); await expect(gateway.send('a@b.ua', 'hello')).rejects.toThrow('DELIVERY_HTTP_ERROR'); });
  it('rejects invalid JSON response contract', async () => { server.use(http.post(MESSAGE_URL, () => HttpResponse.json({ messageId: 42 }))); await expect(gateway.send('a@b.ua', 'hello')).rejects.toThrow('INVALID_DELIVERY_RESPONSE'); });
  it('passes expected JSON request body', async () => { let body: unknown; server.use(http.post(MESSAGE_URL, async ({ request }) => { body = await request.json(); return HttpResponse.json({ messageId: 'A' }); })); await gateway.send('recipient@test.ua', 'test text'); expect(body).toEqual({ destination: 'recipient@test.ua', text: 'test text' }); });
  it('rejects network outage', async () => { server.use(http.post(MESSAGE_URL, () => HttpResponse.error())); await expect(gateway.send('a@b.ua', 'hello')).rejects.toThrow(); });
});
