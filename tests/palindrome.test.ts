import { describe, expect, it } from 'vitest';
import { isPalindrome } from '../src/palindrome';

describe('isPalindrome — варіант №9', () => {
  it('повертає true для паліндромного слова', () => {
    // Arrange
    const input = 'Пилип';
    // Act
    const result = isPalindrome(input);
    // Assert
    expect(result).toBe(true);
  });

  it('розпізнає паліндромну фразу з пробілами', () => {
    expect(isPalindrome('Козак з казок')).toBe(true);
  });

  it('не враховує регістр українських літер', () => {
    expect(isPalindrome('Я несу гусеня')).toBe(true);
  });

  it('не враховує табуляції та перенесення рядків', () => {
    expect(isPalindrome('Я\tнесу\nгусеня')).toBe(true);
  });

  it('повертає false для звичайного непаліндромного слова', () => {
    expect(isPalindrome('Програма')).toBe(false);
  });

  it('повертає false для непаліндромного речення', () => {
    expect(isPalindrome('Привіт світ')).toBe(false);
  });

  it('вважає один символ паліндромом — нижня межа довжини', () => {
    expect(isPalindrome('Ї')).toBe(true);
  });

  it('визначає паліндром із цифр як рядок', () => {
    expect(isPalindrome('12321')).toBe(true);
  });

  it('не ігнорує пунктуацію, оскільки цього не вимагає умова', () => {
    expect(isPalindrome('Аба!')).toBe(false);
  });

  it('порівнює складені Unicode-символи за кодовими точками', () => {
    expect(isPalindrome('😀а😀')).toBe(true);
  });

  it('генерує виняток для порожнього рядка', () => {
    expect(() => isPalindrome('')).toThrow('EMPTY_STRING');
  });

  it('генерує виняток для рядка лише з пробілів', () => {
    expect(() => isPalindrome('   ')).toThrow('EMPTY_STRING');
  });

  it('генерує виняток для рядка лише з табуляцій і переносів', () => {
    expect(() => isPalindrome('\t \n')).toThrow('EMPTY_STRING');
  });
});
