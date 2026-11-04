import type { RateProvider } from './order-service';
export class HttpRateProvider implements RateProvider {
  constructor(private baseUrl: string) { }
  async getRate(from: string, to: string): Promise<number> {
    const response = await fetch(`${this.baseUrl}/rate?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    if (!response.ok) throw new Error('RATE_UNAVAILABLE');
    const data: unknown = await response.json();
    if (typeof data !== 'object' || data === null || !('rate' in data) || typeof data.rate !== 'number' || !Number.isFinite(data.rate)) throw new Error('INVALID_RATE_FORMAT');
    return data.rate;
  }
}
