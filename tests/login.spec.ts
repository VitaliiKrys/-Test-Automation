import { test, expect } from '@playwright/test';
import { USERS } from './data';

// Кожен тест отримує нову сторінку/контекст: сценарії незалежні.
test.describe('Крок 3. Вхід до системи', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('коректні дані відкривають каталог', async ({ page }) => {
    await page.getByPlaceholder('Username').fill(USERS.standard.username);
    await page.getByPlaceholder('Password').fill(USERS.standard.password);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/inventory\.html(?:[?#]|$)/);
    await expect(page.getByText('Products', { exact: true })).toBeVisible();
  });

  test('заблокований користувач отримує помилку без переходу', async ({ page }) => {
    await page.getByTestId('username').fill(USERS.locked.username);
    await page.getByTestId('password').fill(USERS.locked.password);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByTestId('error')).toBeVisible();
    await expect(page.getByTestId('error')).toContainText(/locked out/i);
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('порожні поля: ім’я користувача обов’язкове', async ({ page }) => {
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByTestId('error')).toContainText(/Username is required/i);
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('неправильний пароль не дозволяє увійти', async ({ page }) => {
    await page.getByTestId('username').fill(USERS.standard.username);
    await page.getByTestId('password').fill('wrong_password');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByTestId('error')).toContainText(/do not match/i);
    await expect(page).not.toHaveURL(/inventory\.html/);
  });
});
