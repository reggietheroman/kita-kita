import { expect, test } from '@playwright/test';
import {
  fillAndCreateMeeting,
  resetAppState,
  SAMPLE_MEETINGS,
  setupDialogHandler,
} from './helpers/test-utils';

test.describe('Meeting Management Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    setupDialogHandler(page, 'accept');
    await resetAppState(page);
  });

  test('validates form fields when creating a meeting with missing or invalid inputs', async ({ page }) => {
    await page.getByLabel('Add meeting').filter({ visible: true }).click();
    await expect(page.getByText('Create meeting', { exact: true }).filter({ visible: true })).toBeVisible();

    // 1. Submit empty form
    await page.getByRole('button', { name: 'Create', exact: true }).filter({ visible: true }).click();
    await expect(
      page.getByText('Meeting name, date, start time, end time, and location are required.').filter({ visible: true }),
    ).toBeVisible();

    // 2. Submit with end time earlier than start time
    await page.getByPlaceholder('Meeting name').filter({ visible: true }).fill('Invalid Time Meeting');
    await page.getByPlaceholder('Date (YYYY-MM-DD)').filter({ visible: true }).fill('2026-08-20');
    await page.getByPlaceholder('Start time (HH:mm)').filter({ visible: true }).fill('14:00');
    await page.getByPlaceholder('End time (HH:mm)').filter({ visible: true }).fill('10:00');
    await page.getByPlaceholder('Location').filter({ visible: true }).fill('Room 101');
    await page.getByRole('button', { name: 'Create', exact: true }).filter({ visible: true }).click();

    await expect(page.getByText('End time must be later than start time.').filter({ visible: true })).toBeVisible();
  });

  test('creates a meeting and displays details', async ({ page }) => {
    await fillAndCreateMeeting(page, SAMPLE_MEETINGS.generalAssembly);

    // Verify detail screen components
    await expect(page.getByText(SAMPLE_MEETINGS.generalAssembly.name).filter({ visible: true })).toBeVisible();
    await expect(page.getByText(SAMPLE_MEETINGS.generalAssembly.location).filter({ visible: true })).toBeVisible();
    await expect(page.getByText('0 of 0 expected').filter({ visible: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Scan attendee QR' }).filter({ visible: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Manage people' }).filter({ visible: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Meeting actions' }).filter({ visible: true })).toBeVisible();

    // Navigate back to home list
    await page.getByLabel('Back').filter({ visible: true }).click();
    await expect(page.getByPlaceholder('Search meetings').filter({ visible: true })).toBeVisible();
    await expect(page.getByText(SAMPLE_MEETINGS.generalAssembly.name).filter({ visible: true })).toBeVisible();
  });

  test('searches and filters meetings on the home screen', async ({ page }) => {
    // Create two meetings
    await fillAndCreateMeeting(page, SAMPLE_MEETINGS.generalAssembly);
    await page.getByLabel('Back').filter({ visible: true }).click();

    await fillAndCreateMeeting(page, SAMPLE_MEETINGS.techSync);
    await page.getByLabel('Back').filter({ visible: true }).click();

    await expect(page.getByText('2 meetings').filter({ visible: true })).toBeVisible();
    await expect(page.getByText(SAMPLE_MEETINGS.generalAssembly.name).filter({ visible: true })).toBeVisible();
    await expect(page.getByText(SAMPLE_MEETINGS.techSync.name).filter({ visible: true })).toBeVisible();

    // Filter by name
    const searchInput = page.getByPlaceholder('Search meetings').filter({ visible: true });
    await searchInput.fill('Tech');
    await expect(page.getByText(SAMPLE_MEETINGS.techSync.name).filter({ visible: true })).toBeVisible();
    await expect(page.getByText(SAMPLE_MEETINGS.generalAssembly.name).filter({ visible: true })).toBeHidden();

    // Clear filter
    await searchInput.fill('');
    await expect(page.getByText(SAMPLE_MEETINGS.generalAssembly.name).filter({ visible: true })).toBeVisible();
    await expect(page.getByText(SAMPLE_MEETINGS.techSync.name).filter({ visible: true })).toBeVisible();
  });

  test('edits an existing meeting details', async ({ page }) => {
    await fillAndCreateMeeting(page, SAMPLE_MEETINGS.generalAssembly);
    await page.getByLabel('Back').filter({ visible: true }).click();

    // Click Edit button on the meeting card
    await page.getByLabel('Edit').filter({ visible: true }).first().click();
    await expect(page.getByText('Edit meeting', { exact: true }).filter({ visible: true })).toBeVisible();

    // Update location and name
    const updatedName = 'General Assembly 2026 (Updated)';
    const updatedLocation = 'Main Hall B';
    await page.getByPlaceholder('Name').filter({ visible: true }).fill(updatedName);
    await page.getByPlaceholder('Location').filter({ visible: true }).fill(updatedLocation);

    // Click Save (confirm dialog is auto-accepted by test setup)
    await page.getByLabel('Save').filter({ visible: true }).click();

    // Should return to meeting list with updated info
    await expect(page.getByText(updatedName).filter({ visible: true })).toBeVisible();
    await expect(page.getByText(new RegExp(updatedLocation)).filter({ visible: true })).toBeVisible();
  });

  test('deletes a meeting from the meeting card row', async ({ page }) => {
    await fillAndCreateMeeting(page, SAMPLE_MEETINGS.generalAssembly);
    await page.getByLabel('Back').filter({ visible: true }).click();

    await expect(page.getByText(SAMPLE_MEETINGS.generalAssembly.name).filter({ visible: true })).toBeVisible();

    // Click Delete button on meeting card (auto-accepted by dialog handler)
    await page.getByRole('button', { name: 'Delete' }).filter({ visible: true }).click();

    // Verify meeting is removed
    await expect(page.getByText(SAMPLE_MEETINGS.generalAssembly.name).filter({ visible: true })).toBeHidden();
    await expect(page.getByText('No meetings yet.').filter({ visible: true })).toBeVisible();
  });

  test('deletes a meeting from the Meeting Actions sub-screen', async ({ page }) => {
    await fillAndCreateMeeting(page, SAMPLE_MEETINGS.generalAssembly);

    // Go to Meeting actions
    await page.getByRole('button', { name: 'Meeting actions' }).filter({ visible: true }).click();
    await expect(page.getByText('Meeting actions', { exact: true }).filter({ visible: true })).toBeVisible();

    // Click Delete meeting button
    await page.getByRole('button', { name: 'Delete meeting' }).filter({ visible: true }).click();

    // Should navigate back to home screen and meeting should be deleted
    await expect(page.getByPlaceholder('Search meetings').filter({ visible: true })).toBeVisible();
    await expect(page.getByText('No meetings yet.').filter({ visible: true })).toBeVisible();
  });
});
