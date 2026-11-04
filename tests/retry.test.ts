import { describe, it, expect, vi, afterEach } from 'vitest';
import { withRetry } from '../src/retry';
afterEach(() => vi.useRealTimers());
describe('Part 1: withRetry', () => {
  it('returns successful first attempt immediately', async () => { const f = vi.fn().mockResolvedValue('ok'); await expect(withRetry(f, 3, 2000)).resolves.toBe('ok'); expect(f).toHaveBeenCalledOnce(); });
  it('retries once after 2000 ms', async () => { vi.useFakeTimers(); const f = vi.fn().mockRejectedValueOnce(new Error('TIMEOUT')).mockResolvedValueOnce('ok'); const promise = withRetry(f, 3, 2000); await vi.advanceTimersByTimeAsync(2000); await expect(promise).resolves.toBe('ok'); expect(f).toHaveBeenCalledTimes(2); });
  it('rejects after three failed attempts', async () => { vi.useFakeTimers(); const f = vi.fn().mockRejectedValue(new Error('TIMEOUT')); const promise = withRetry(f, 3, 2000); const assertion = expect(promise).rejects.toThrow('TIMEOUT'); await vi.advanceTimersByTimeAsync(4000); await assertion; expect(f).toHaveBeenCalledTimes(3); });
  it.each([0, -1, 1.5])('rejects invalid attempts %s', async (n) => { await expect(withRetry(async () => 1, n, 100)).rejects.toThrow('INVALID_ATTEMPTS'); });
});
