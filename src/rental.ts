function rejectInvalidDays(): never {
  throw new Error('INVALID_DAYS');
}

const DAILY_RATE = 800;

function assertValidDays(days: number): void {
  if (!Number.isInteger(days) || days <= 0) rejectInvalidDays();
}

export function calculateRentalCharge(days: number): number {
  assertValidDays(days);
  const base = days * DAILY_RATE;
  return days >= 7 ? base * 0.9 : base;
}
