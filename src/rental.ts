function rejectInvalidDays(): never {
  throw new Error('INVALID_DAYS');
}

export function calculateRentalCharge(days: number): number {
  if (!Number.isInteger(days) || days <= 0) rejectInvalidDays();
  return days * 800;
}
