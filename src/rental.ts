function rejectInvalidDays(): never {
  throw new Error('INVALID_DAYS');
}

const DAILY_RATE = 800;

function assertValidDays(days: number): void {
  if (!Number.isInteger(days) || days <= 0) rejectInvalidDays();
}

function getDiscountRate(days: number): number {
  return days >= 7 ? 0.10 : 0;
}

export function calculateRentalCharge(days: number): number {
  assertValidDays(days);
  const base = days * DAILY_RATE;
  return base * (1 - getDiscountRate(days));
}
