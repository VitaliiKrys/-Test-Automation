import { test, expect, type Page } from '@playwright/test';
import { addProduct, goToCheckoutOverview, money, signIn, toCents } from './helpers';

/**
 * Варіант 9. Перевірка підсумку на сторінці checkout-step-two.html.
 * Підсумкова сума = вартість товарів + податок із відображеного UI.
 * Обчислення виконуються в цілих центах, щоб уникнути похибок float.
 */
async function checkOverviewTotals(page: Page, productNames: string[]): Promise<void> {
  const items = page.getByTestId('inventory-item');
  await expect(items).toHaveCount(productNames.length);

  // Склад замовлення має відповідати списку доданих товарів.
  for (const name of productNames) {
    await expect(items.filter({ hasText: name })).toHaveCount(1);
  }

  // Ціни у кошику підсумовуємо незалежно від відображеного "Item total".
  const rawPrices = await page.getByTestId('inventory-item-price').allTextContents();
  expect(rawPrices).toHaveLength(productNames.length);
  const expectedSubtotal = rawPrices.reduce((sum, value) => sum + toCents(value), 0);

  const subtotal = page.getByTestId('subtotal-label');
  const tax = page.getByTestId('tax-label');
  const total = page.getByTestId('total-label');

  // Ретраї-асерти синхронізуються з динамічним UI, без waitForTimeout.
  await expect(subtotal).toHaveText(`Item total: $${money(expectedSubtotal)}`);
  await expect(tax).toContainText(/^Tax: \$\d+\.\d{2}$/);
  await expect(total).toContainText(/^Total: \$\d+\.\d{2}$/);

  await expect.poll(async () => {
    const taxCents = toCents(await tax.innerText());
    const totalCents = toCents(await total.innerText());
    return totalCents - expectedSubtotal - taxCents;
  }, { message: 'Загальна сума = підсумок товарів + податок' }).toBe(0);
}

test.describe('Варіант 9. Перевірка суми замовлення', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('один товар: subtotal і total обчислено коректно', async ({ page }) => {
    const products = ['Sauce Labs Backpack'];
    await addProduct(page, products[0]);
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
    await goToCheckoutOverview(page);
    await checkOverviewTotals(page, products);
  });

  test('три різні товари: загальна сума відповідає позиціям і податку', async ({ page }) => {
    const products = [
      'Sauce Labs Bike Light',
      'Sauce Labs Backpack',
      'Sauce Labs Bolt T-Shirt',
    ];
    for (const name of products) await addProduct(page, name);
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('3');
    await goToCheckoutOverview(page);
    await checkOverviewTotals(page, products);
  });
});
