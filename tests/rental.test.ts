import { describe, expect, it } from 'vitest';
import { calculateRentalCharge, calculateUpfrontPayment } from '../src/rental';

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
});
