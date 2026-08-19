import { expect, test } from '@playwright/test';
import {
  fillAndAddAttendee,
  fillAndCreateMeeting,
  resetAppState,
  SAMPLE_ATTENDEES,
  SAMPLE_MEETINGS,
  setupDialogHandler,
} from './helpers/test-utils';

test.describe('Attendance and Meeting Actions', () => {
  test.beforeEach(async ({ page }) => {
    setupDialogHandler(page, 'accept');
    await resetAppState(page);
    await fillAndCreateMeeting(page, SAMPLE_MEETINGS.generalAssembly);
  });

  test('displays initial attendance status as Out and 0 checked-in count', async ({ page }) => {
    await fillAndAddAttendee(page, SAMPLE_ATTENDEES.juan);
    await fillAndAddAttendee(page, SAMPLE_ATTENDEES.maria);

    // Verify attendee status labels in People list
    await expect(page.getByText('Out').filter({ visible: true }).first()).toBeVisible();

    // Navigate back to Meeting details screen
    await page.getByLabel('Back').filter({ visible: true }).click();

    // Check attendance summary: 0 of 2 expected
    await expect(page.getByText('0 of 2 expected').filter({ visible: true })).toBeVisible();

    // Navigate back to Home screen
    await page.getByLabel('Back').filter({ visible: true }).click();

    // Check count on meeting card: 0 / 2
    await expect(page.getByText('0 / 2').filter({ visible: true })).toBeVisible();
  });

  test('verifies meeting actions screen navigation and transfer options', async ({ page }) => {
    // Navigate to Meeting actions
    await page.getByRole('button', { name: 'Meeting actions' }).filter({ visible: true }).click();
    await expect(page.getByText('Meeting actions', { exact: true }).filter({ visible: true })).toBeVisible();

    // Verify available action buttons
    await expect(page.getByRole('button', { name: 'Show attendance QR' }).filter({ visible: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Copy meeting QR' }).filter({ visible: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Scan from another device' }).filter({ visible: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear check-ins' }).filter({ visible: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete meeting' }).filter({ visible: true })).toBeVisible();

    // Check Show attendance QR screen
    await page.getByRole('button', { name: 'Show attendance QR' }).filter({ visible: true }).click();
    await expect(page.getByText('Attendance sync QR').filter({ visible: true })).toBeVisible();

    // Back to Actions
    await page.getByLabel('Back').filter({ visible: true }).click();

    // Check Copy meeting QR screen
    await page.getByRole('button', { name: 'Copy meeting QR' }).filter({ visible: true }).click();
    await expect(page.getByText('Copy meeting QR').filter({ visible: true })).toBeVisible();
  });

  test('clears attendance check-ins through meeting actions', async ({ page }) => {
    await fillAndAddAttendee(page, SAMPLE_ATTENDEES.juan);
    await page.getByLabel('Back').filter({ visible: true }).click();

    // Go to Meeting actions
    await page.getByRole('button', { name: 'Meeting actions' }).filter({ visible: true }).click();

    // Trigger clear check-ins (confirm dialog is auto-accepted)
    await page.getByRole('button', { name: 'Clear check-ins' }).filter({ visible: true }).click();

    // Navigate back to meeting details and check attendance
    await page.getByLabel('Back').filter({ visible: true }).click();
    await expect(page.getByText('0 of 1 expected').filter({ visible: true })).toBeVisible();
  });
});
