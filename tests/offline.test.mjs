import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRentalCharge } from '../src/rental.ts';

for (const days of [0, -1, -15, 1.5, NaN, Infinity, -Infinity]) {
  test(`Некоректні дні ${days} → INVALID_DAYS`, () => {
    assert.throws(() => calculateRentalCharge(days), /INVALID_DAYS/);
  });
}
