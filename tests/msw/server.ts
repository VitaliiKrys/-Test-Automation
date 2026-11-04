import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
export const RATE_URL = 'https://api.example.com/rate';
export const MESSAGE_URL = 'https://api.example.com/messages';
export const server = setupServer(
  http.get(RATE_URL, () => HttpResponse.json({ rate: 41.25 })),
  http.post(MESSAGE_URL, () => HttpResponse.json({ messageId: 'MSG-OK' })),
);
