/**
 * Перевіряє, чи є рядок паліндромом.
 * Регістр і пробільні символи не враховуються; пунктуація зберігається.
 * @throws Error('EMPTY_STRING') для порожнього або пробільного рядка.
 */
export function isPalindrome(input: string): boolean {
  const normalized = input.replace(/\s+/g, '').toLocaleLowerCase('uk-UA');

  if (normalized.length === 0) {
    throw new Error('EMPTY_STRING');
  }

  // Array.from коректно обробляє символи поза BMP, зокрема емодзі.
  return normalized === Array.from(normalized).reverse().join('');
}
