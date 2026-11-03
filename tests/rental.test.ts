import { describe, expect, it } from 'vitest';
import { calculateRentalCharge, calculateUpfrontPayment, calculateRentalSummary } from '../src/rental';

describe('Варіант 9: розрахунок оренди', () => {
  it.each([0, -1, -15, 1.5, NaN, Infinity, -Infinity])('відхиляє %s діб', (days) => {
    expect(() => calculateRentalCharge(days)).toThrow('INVALID_DAYS');
  });

  it.each([{ days: 1, expected: 800 }, { days: 2, expected: 1600 }, { days: 6, expected: 4800 }])('базова оренда $days діб → $expected грн', ({ days, expected }) => {
    expect(calculateRentalCharge(days)).toBe(expected);
  });

  it.each([{ days: 7, expected: 5040 }, { days: 8, expected: 5760 }, { days: 29, expected: 20880 }])('знижка 10%: $days діб → $expected грн', ({ days, expected }) => {
    expect(calculateRentalCharge(days)).toBe(expected);
  });

  it.each([{ days: 29, expected: 20880 }, { days: 30, expected: 18000 }, { days: 31, expected: 18600 }])('знижка 25%: $days діб → $expected грн', ({ days, expected }) => {
    expect(calculateRentalCharge(days)).toBe(expected);
  });

  it.each([{ days: 1, expected: 2800 }, { days: 7, expected: 7040 }, { days: 30, expected: 20000 }])('платіж із заставою: $days діб → $expected грн', ({ days, expected }) => {
    expect(calculateUpfrontPayment(days)).toBe(expected);
  });

  it.each([
    { days: 1, returned: false, charge: 800, upfront: 2800, refund: 0, final: 2800 },
    { days: 1, returned: true, charge: 800, upfront: 2800, refund: 2000, final: 800 },
    { days: 7, returned: true, charge: 5040, upfront: 7040, refund: 2000, final: 5040 },
    { days: 30, returned: true, charge: 18000, upfront: 20000, refund: 2000, final: 18000 },
  ])('повернення застави: $days діб, returned=$returned', ({ days, returned, charge, upfront, refund, final }) => {
    const result = calculateRentalSummary(days, { returned });
    expect(result.rentalCharge).toBe(charge);
    expect(result.upfrontPayment).toBe(upfront);
    expect(result.deposit).toBe(2000);
    expect(result.refundedDeposit).toBe(refund);
    expect(result.paymentAfterRefund).toBe(final);
  });
  it('за замовчуванням заставу ще не повернуто', () => {
    expect(calculateRentalSummary(6).refundedDeposit).toBe(0);
  });
  it('відхиляє недійсну тривалість у підсумковому розрахунку', () => {
    expect(() => calculateRentalSummary(0, { returned: true })).toThrow('INVALID_DAYS');
  });
});
