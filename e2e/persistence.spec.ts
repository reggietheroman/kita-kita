import { expect, test } from '@playwright/test';
import {
  fillAndAddAttendee,
  fillAndCreateMeeting,
  resetAppState,
  SAMPLE_ATTENDEES,
  SAMPLE_MEETINGS,
  setupDialogHandler,
  waitForAppReady,
} from './helpers/test-utils';

test.describe('Encrypted Storage and App State Persistence', () => {
  test.beforeEach(async ({ page }) => {
    setupDialogHandler(page, 'accept');
    await resetAppState(page);
  });

  test('persists meeting and attendee records across hard page reload', async ({ page }) => {
    // 1. Create a meeting
    await fillAndCreateMeeting(page, SAMPLE_MEETINGS.generalAssembly);

    // 2. Add attendees
    await fillAndAddAttendee(page, SAMPLE_ATTENDEES.juan);
    await fillAndAddAttendee(page, SAMPLE_ATTENDEES.maria);

    // Navigate back to Home
    await page.getByLabel('Back').filter({ visible: true }).click(); // Back from People to Meeting details
    await page.getByLabel('Back').filter({ visible: true }).click(); // Back from Meeting details to Home

    await expect(page.getByPlaceholder('Search meetings').filter({ visible: true })).toBeVisible();
    await expect(page.getByText(SAMPLE_MEETINGS.generalAssembly.name).filter({ visible: true })).toBeVisible();
    await expect(page.getByText('0 / 2').filter({ visible: true })).toBeVisible();

    // 3. Trigger hard browser reload
    await page.reload();
    await waitForAppReady(page);

    // 4. Verify data survived reload
    await expect(page.getByText(SAMPLE_MEETINGS.generalAssembly.name).filter({ visible: true })).toBeVisible();
    await expect(page.getByText('0 / 2').filter({ visible: true })).toBeVisible();

    // Open meeting and check attendees
    await page.getByLabel('Open').filter({ visible: true }).click();
    await expect(page.getByText(SAMPLE_MEETINGS.generalAssembly.name).filter({ visible: true })).toBeVisible();
    await expect(page.getByText('0 of 2 expected').filter({ visible: true })).toBeVisible();

    await page.getByRole('button', { name: 'Manage people' }).filter({ visible: true }).click();
    await expect(page.getByText('Juan Dela Cruz').filter({ visible: true })).toBeVisible();
    await expect(page.getByText('Maria Santos').filter({ visible: true })).toBeVisible();
  });
});
