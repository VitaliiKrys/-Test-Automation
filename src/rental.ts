function rejectInvalidDays(): never {
  throw new Error('INVALID_DAYS');
}

export function calculateRentalCharge(days: number): number {
  return rejectInvalidDays();
}
