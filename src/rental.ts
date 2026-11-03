function rejectInvalidDays(): never {
  throw new Error('INVALID_DAYS');
}

const DAILY_RATE = 800;

function assertValidDays(days: number): void {
  if (!Number.isInteger(days) || days <= 0) rejectInvalidDays();
}

export function calculateRentalCharge(days: number): number {
  assertValidDays(days);
  return days * DAILY_RATE;
}
