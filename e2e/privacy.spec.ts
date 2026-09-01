import { expect, test } from '@playwright/test';
import { resetAppState, setupDialogHandler } from './helpers/test-utils';

test.describe('Privacy notice', () => {
  test.beforeEach(async ({ page }) => {
    setupDialogHandler(page, 'accept');
    await resetAppState(page);
  });

  test('opens privacy screen from meetings list and shows local-first summary', async ({ page }) => {
    await page.getByRole('button', { name: 'Privacy' }).filter({ visible: true }).click();

    await expect(page.getByText('Privacy', { exact: true }).filter({ visible: true })).toBeVisible();
    await expect(page.getByText('Local-first storage').filter({ visible: true })).toBeVisible();
    await expect(page.getByText('Read full privacy policy').filter({ visible: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Support' }).filter({ visible: true })).toBeVisible();
  });

  test('returns to meetings list from privacy screen', async ({ page }) => {
    await page.getByRole('button', { name: 'Privacy' }).filter({ visible: true }).click();
    await expect(page.getByText('Local-first storage').filter({ visible: true })).toBeVisible();

    await page.getByLabel('Back').filter({ visible: true }).click();
    await expect(page.getByPlaceholder('Search meetings').filter({ visible: true })).toBeVisible();
  });
});
