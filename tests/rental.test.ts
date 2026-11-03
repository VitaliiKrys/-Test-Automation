import { describe, expect, it } from 'vitest';
import { calculateRentalCharge } from '../src/rental';

describe('Варіант 9: розрахунок оренди', () => {
  it.each([0, -1, -15, 1.5, NaN, Infinity, -Infinity])('відхиляє %s діб', (days) => {
    expect(() => calculateRentalCharge(days)).toThrow('INVALID_DAYS');
  });
});
