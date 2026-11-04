export async function withRetry<T>(action: () => Promise<T>, attempts = 3, delayMs = 1000): Promise<T> {
  if (!Number.isInteger(attempts) || attempts <= 0) throw new Error('INVALID_ATTEMPTS');
  if (!Number.isFinite(delayMs) || delayMs < 0) throw new Error('INVALID_DELAY');
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try { return await action(); }
    catch (error) { lastError = error; if (i < attempts - 1) await new Promise<void>(resolve => setTimeout(resolve, delayMs)); }
  }
  throw lastError;
}
