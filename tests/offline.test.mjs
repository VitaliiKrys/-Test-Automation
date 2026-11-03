import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRentalCharge, calculateUpfrontPayment, calculateRentalSummary } from '../src/rental.ts';

for (const days of [0, -1, -15, 1.5, NaN, Infinity, -Infinity]) {
  test(`Некоректні дні ${days} → INVALID_DAYS`, () => {
    assert.throws(() => calculateRentalCharge(days), /INVALID_DAYS/);
  });
}
for (const [days, expected] of [[1, 800], [2, 1600], [6, 4800]]) {
  test(`Базова оренда: ${days} діб → ${expected} грн`, () => {
    assert.equal(calculateRentalCharge(days), expected);
  });
}
for (const [days, expected] of [[7, 5040], [8, 5760], [29, 20880]]) {
  test(`Знижка 10%: ${days} діб → ${expected} грн`, () => {
    assert.equal(calculateRentalCharge(days), expected);
  });
}
for (const [days, expected] of [[29, 20880], [30, 18000], [31, 18600]]) {
  test(`Знижка 25%: ${days} діб → ${expected} грн`, () => {
    assert.equal(calculateRentalCharge(days), expected);
  });
}
for (const [days, expected] of [[1, 2800], [7, 7040], [30, 20000]]) {
  test(`Попередня оплата: ${days} діб → ${expected} грн`, () => {
    assert.equal(calculateUpfrontPayment(days), expected);
  });
}
for (const [days, returned, charge, upfront, refund, final] of [
  [1, false, 800, 2800, 0, 2800],
  [1, true, 800, 2800, 2000, 800],
  [7, true, 5040, 7040, 2000, 5040],
  [30, true, 18000, 20000, 2000, 18000],
]) {
  test(`Повернення: ${days} діб, returned=${returned}`, () => {
    const result = calculateRentalSummary(days, { returned });
    assert.equal(result.rentalCharge, charge);
    assert.equal(result.upfrontPayment, upfront);
    assert.equal(result.deposit, 2000);
    assert.equal(result.refundedDeposit, refund);
    assert.equal(result.paymentAfterRefund, final);
  });
}
test('За замовчуванням заставу не повернуто', () => {
  assert.equal(calculateRentalSummary(6).refundedDeposit, 0);
});
test('Не можна сформувати підсумок на 0 діб', () => {
  assert.throws(() => calculateRentalSummary(0, { returned: true }), /INVALID_DAYS/);
});
