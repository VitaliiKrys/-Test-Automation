import { describe, expect, it } from 'vitest';
import { calculateRentalCharge } from '../src/rental';

describe('Варіант 9: розрахунок оренди', () => {
  it.each([0, -1, -15, 1.5, NaN, Infinity, -Infinity])('відхиляє %s діб', (days) => {
    expect(() => calculateRentalCharge(days)).toThrow('INVALID_DAYS');
  });

  it.each([{ days: 1, expected: 800 }, { days: 2, expected: 1600 }, { days: 6, expected: 4800 }])('базова оренда $days діб → $expected грн', ({ days, expected }) => {
    expect(calculateRentalCharge(days)).toBe(expected);
  });
});
