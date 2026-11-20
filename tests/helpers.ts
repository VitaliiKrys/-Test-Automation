import { expect, type Page } from '@playwright/test';
import { USERS, BUYER } from './data';

export async function signIn(
  page: Page,
  user: { username: string; password: string } = USERS.standard,
): Promise<void> {
  await page.goto('/');
  await page.getByTestId('username').fill(user.username);
  await page.getByTestId('password').fill(user.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/inventory\.html(?:[?#]|$)/);
  await expect(page.getByText('Products', { exact: true })).toBeVisible();
}

export async function addProduct(page: Page, productName: string): Promise<void> {
  const item = page.locator('.inventory_item').filter({ hasText: productName });
  await expect(item).toHaveCount(1);
  await item.getByRole('button', { name: 'Add to cart' }).click();
  await expect(item.getByRole('button', { name: 'Remove' })).toBeVisible();
}

export async function goToCheckoutOverview(page: Page): Promise<void> {
  await page.getByTestId('shopping-cart-link').click();
  await expect(page).toHaveURL(/\/cart\.html(?:[?#]|$)/);
  await page.getByRole('button', { name: 'Checkout' }).click();
  await expect(page).toHaveURL(/\/checkout-step-one\.html(?:[?#]|$)/);
  await page.getByTestId('firstName').fill(BUYER.firstName);
  await page.getByTestId('lastName').fill(BUYER.lastName);
  await page.getByTestId('postalCode').fill(BUYER.postalCode);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page).toHaveURL(/\/checkout-step-two\.html(?:[?#]|$)/);
}

export function toCents(amount: string): number {
  // Парсимо тільки суму в доларах, зберігаючи точність до цента.
  const match = amount.match(/\$\s*(\d+(?:\.\d{1,2})?)/);
  if (!match) throw new Error(`Не вдалося знайти суму у тексті: ${amount}`);
  const [dollars, fraction = ''] = match[1].split('.');
  return Number(dollars) * 100 + Number(fraction.padEnd(2, '0'));
}

export function money(cents: number): string {
  return (cents / 100).toFixed(2);
}
