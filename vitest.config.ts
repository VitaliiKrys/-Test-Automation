import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Дозволяє describe/it/expect як глобальні назви в тестах.
    globals: true,
    // Перевіряємо звичайну функцію, тож DOM не потрібен.
    environment: 'node',
    // Запускаємо файли тестів із каталогу tests.
    include: ['tests/**/*.test.ts'],
    coverage: {
      // Покриття збираємо вбудованим рушієм V8.
      provider: 'v8',
      // Показуємо результат у терміналі та створюємо HTML-звіт.
      reporter: ['text', 'html'],
      // Враховуємо лише вихідні модулі, а не файли тестів.
      include: ['src/**/*.ts'],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 100,
      },
    },
  },
});
