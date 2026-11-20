import { test, expect } from '@playwright/test';
import { USERS } from '../data';

const mode = process.env.PW_WAIT_MODE;
const variants = ['short', 'auto', 'long'];
if (!mode || !variants.includes(mode)) {
  throw new Error('PW_WAIT_MODE має бути short, auto або long. Використайте npm run experiment.');
}

test(`Крок 6. Порівняння очікування: ${mode}`, async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('username').fill(USERS.slow.username);
  await page.getByTestId('password').fill(USERS.slow.password);
  await page.getByRole('button', { name: 'Login' }).click({ noWaitAfter: true });

  if (mode === 'auto') {
    await expect(page).toHaveURL(/\/inventory\.html(?:[?#]|$)/, { timeout: 20_000 });
  } else {
    // Явні паузи навмисно містяться ТІЛЬКИ в експерименті, не в основних тестах.
    await page.waitForTimeout(mode === 'short' ? 1_000 : 5_000);
    expect(page.url()).toMatch(/\/inventory\.html(?:[?#]|$)/);
  }
});
