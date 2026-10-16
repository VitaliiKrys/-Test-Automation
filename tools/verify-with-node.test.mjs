// Додаткова локальна перевірка без сторонніх npm-пакетів.
// НЕ замінює лабораторне тестування у Vitest.
import test from 'node:test';
import assert from 'node:assert/strict';
import { isPalindrome } from '../src/palindrome.ts';
import { celsiusToFahrenheit } from '../src/temperature.ts';

const palindromeCases = [
  ['palindrome word', 'Пилип', true],
  ['phrase with spaces', 'Козак з казок', true],
  ['Ukrainian case normalization', 'Я несу гусеня', true],
  ['tabs and line breaks', 'Я\tнесу\nгусеня', true],
  ['non-palindrome word', 'Програма', false],
  ['non-palindrome phrase', 'Привіт світ', false],
  ['one character', 'Ї', true],
  ['numeric string', '12321', true],
  ['punctuation preserved', 'Аба!', false],
  ['unicode code points', '😀а😀', true],
];

for (const [name, input, expected] of palindromeCases) {
  test(`palindrome: ${name}`, () => assert.equal(isPalindrome(input), expected));
}

for (const [name, input] of [
  ['empty string', ''],
  ['spaces only', '   '],
  ['whitespace only', '\t \n'],
]) {
  test(`palindrome rejects: ${name}`, () => {
    assert.throws(() => isPalindrome(input), /EMPTY_STRING/);
  });
}

test('temperature: 0 C -> 32 F', () =>
  assert.equal(celsiusToFahrenheit(0), 32),
);
test('temperature: 100 C -> 212 F', () =>
  assert.equal(celsiusToFahrenheit(100), 212),
);
test('temperature: -40 C -> -40 F', () =>
  assert.equal(celsiusToFahrenheit(-40), -40),
);
test('temperature rejects NaN', () => {
  assert.throws(
    () => celsiusToFahrenheit(Number.NaN),
    /INVALID_TEMPERATURE/,
  );
});
