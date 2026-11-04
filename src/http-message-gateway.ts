import type { MessageGateway } from './message-queue';
export class HttpMessageGateway implements MessageGateway {
  constructor(private baseUrl: string) { }
  async send(destination: string, text: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ destination, text }) });
    if (!response.ok) throw new Error('DELIVERY_HTTP_ERROR');
    const data: unknown = await response.json();
    if (typeof data !== 'object' || data === null || !('messageId' in data) || typeof data.messageId !== 'string' || data.messageId.length === 0) throw new Error('INVALID_DELIVERY_RESPONSE');
    return data.messageId;
  }
}
