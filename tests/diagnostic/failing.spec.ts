import { test, expect } from '@playwright/test';
import { signIn } from '../helpers';

// Навмисно неправильне твердження. Не запускати в основному наборі!
test('Крок 7. Діагностика: навмисна помилка 7 замість 6', async ({ page }) => {
  await signIn(page);
  await expect(page.locator('.inventory_item')).toHaveCount(7, { timeout: 3_000 });
});
