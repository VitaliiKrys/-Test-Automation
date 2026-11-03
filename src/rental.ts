function rejectInvalidDays(): never {
  throw new Error('INVALID_DAYS');
}

const DAILY_RATE = 800;

function assertValidDays(days: number): void {
  if (!Number.isInteger(days) || days <= 0) rejectInvalidDays();
}

const WEEK_DISCOUNT_DAYS = 7;
const MONTH_DISCOUNT_DAYS = 30;
const WEEK_DISCOUNT_RATE = 0.10;
const MONTH_DISCOUNT_RATE = 0.25;

function getDiscountRate(days: number): number {
  if (days >= MONTH_DISCOUNT_DAYS) return MONTH_DISCOUNT_RATE;
  if (days >= WEEK_DISCOUNT_DAYS) return WEEK_DISCOUNT_RATE;
  return 0;
}

export function calculateRentalCharge(days: number): number {
  assertValidDays(days);
  const base = days * DAILY_RATE;
  return base * (1 - getDiscountRate(days));
}

const REFUNDABLE_DEPOSIT = 2000;

export function calculateUpfrontPayment(days: number): number {
  return calculateRentalCharge(days) + REFUNDABLE_DEPOSIT;
}
