import { test, expect } from '@playwright/test';
import { addProduct, signIn, toCents } from './helpers';

test.describe('Крок 4. Робота з каталогом', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('каталог містить рівно шість товарів', async ({ page }) => {
    await expect(page.locator('.inventory_item')).toHaveCount(6);
  });

  test('сортування за зростанням ціни (lohi)', async ({ page }) => {
    await page.getByTestId('product-sort-container').selectOption('lohi');
    await expect(page.locator('.inventory_item')).toHaveCount(6);
    await expect.poll(async () => {
      const prices = await page.getByTestId('inventory-item-price').allTextContents();
      const cents = prices.map(toCents);
      return cents.length === 6 && cents.every((x, i) => i === 0 || cents[i - 1] <= x);
    }).toBe(true);
  });

  test('додавання товару змінює лічильник кошика', async ({ page }) => {
    const badge = page.getByTestId('shopping-cart-badge');
    await expect(badge).toHaveCount(0);
    await addProduct(page, 'Sauce Labs Backpack');
    await expect(badge).toHaveText('1');
  });

  test('видалення товару очищує лічильник', async ({ page }) => {
    const badge = page.getByTestId('shopping-cart-badge');
    const item = page.locator('.inventory_item').filter({ hasText: 'Sauce Labs Bike Light' });
    await addProduct(page, 'Sauce Labs Bike Light');
    await expect(badge).toHaveText('1');
    await item.getByRole('button', { name: 'Remove' }).click();
    await expect(badge).toHaveCount(0);
    await expect(item.getByRole('button', { name: 'Add to cart' })).toBeVisible();
  });

  test('filter({hasText}) обирає товар незалежно від сортування', async ({ page }) => {
    await page.getByTestId('product-sort-container').selectOption('za');
    const backpack = page.locator('.inventory_item')
      .filter({ hasText: 'Sauce Labs Backpack' });
    await expect(backpack).toHaveCount(1);
    await expect(backpack.getByTestId('inventory-item-name'))
      .toHaveText('Sauce Labs Backpack');
  });
});
