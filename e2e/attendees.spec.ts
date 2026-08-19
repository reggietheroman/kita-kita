import { expect, test } from '@playwright/test';
import {
  fillAndAddAttendee,
  fillAndCreateMeeting,
  resetAppState,
  SAMPLE_ATTENDEES,
  SAMPLE_MEETINGS,
  setupDialogHandler,
} from './helpers/test-utils';

test.describe('Attendee Management and Privacy Compliance', () => {
  test.beforeEach(async ({ page }) => {
    setupDialogHandler(page, 'accept');
    await resetAppState(page);
    await fillAndCreateMeeting(page, SAMPLE_MEETINGS.generalAssembly);
  });

  test('adds attendees and verifies PII masking on the people list', async ({ page }) => {
    await fillAndAddAttendee(page, SAMPLE_ATTENDEES.juan);

    // Verify name and ID are displayed
    await expect(page.getByText('Juan Dela Cruz').filter({ visible: true })).toBeVisible();
    await expect(page.getByText('EMP-001').filter({ visible: true })).toBeVisible();

    // Verify PII is masked (RA 10173 & NPC Compliance)
    // juan.delacruz@example.com -> j***@example.com
    await expect(page.getByText('j***@example.com').filter({ visible: true })).toBeVisible();
    await expect(page.getByText('juan.delacruz@example.com')).toBeHidden();

    // +639000000001 -> +639***001
    await expect(page.getByText('+639***001').filter({ visible: true })).toBeVisible();
    await expect(page.getByText('+639000000001')).toBeHidden();
  });

  test('filters attendee list by name or ID using search', async ({ page }) => {
    await fillAndAddAttendee(page, SAMPLE_ATTENDEES.juan);
    await fillAndAddAttendee(page, SAMPLE_ATTENDEES.maria);

    await expect(page.getByText('Juan Dela Cruz').filter({ visible: true })).toBeVisible();
    await expect(page.getByText('Maria Santos').filter({ visible: true })).toBeVisible();

    // Search by name
    const searchInput = page.getByPlaceholder('Search people').filter({ visible: true });
    await searchInput.fill('Maria');
    await expect(page.getByText('Maria Santos').filter({ visible: true })).toBeVisible();
    await expect(page.getByText('Juan Dela Cruz').filter({ visible: true })).toBeHidden();

    // Search by ID
    await searchInput.fill('EMP-001');
    await expect(page.getByText('Juan Dela Cruz').filter({ visible: true })).toBeVisible();
    await expect(page.getByText('Maria Santos').filter({ visible: true })).toBeHidden();

    // Clear search
    await searchInput.fill('');
    await expect(page.getByText('Juan Dela Cruz').filter({ visible: true })).toBeVisible();
    await expect(page.getByText('Maria Santos').filter({ visible: true })).toBeVisible();
  });

  test('edits attendee contact information', async ({ page }) => {
    await fillAndAddAttendee(page, SAMPLE_ATTENDEES.juan);

    // Click Edit button for attendee row
    await page.getByLabel('Edit').filter({ visible: true }).first().click();
    await expect(page.getByText('Edit person', { exact: true }).filter({ visible: true })).toBeVisible();

    // Update last name
    await page.getByPlaceholder('Last name').filter({ visible: true }).fill('Dela Cruz-Reyes');

    // Save changes (confirm dialog auto-accepted)
    await page.getByLabel('Save').filter({ visible: true }).click();

    // Verify updated attendee on list
    await expect(page.getByText('Juan Dela Cruz-Reyes').filter({ visible: true })).toBeVisible();
  });

  test('opens encrypted attendee QR view', async ({ page }) => {
    await fillAndAddAttendee(page, SAMPLE_ATTENDEES.juan);

    // Click QR button
    await page.getByRole('button', { name: 'QR', exact: true }).filter({ visible: true }).first().click();

    // Check QR screen header and container
    await expect(page.getByText('Juan Dela Cruz').filter({ visible: true })).toBeVisible();
    await expect(page.getByText('EMP-001').filter({ visible: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Share' }).filter({ visible: true })).toBeVisible();
  });

  test('deletes an attendee from the meeting', async ({ page }) => {
    await fillAndAddAttendee(page, SAMPLE_ATTENDEES.juan);
    await expect(page.getByText('Juan Dela Cruz').filter({ visible: true })).toBeVisible();

    // Click Delete button on attendee row
    await page.getByRole('button', { name: 'Delete' }).filter({ visible: true }).first().click();

    // Verify attendee removed
    await expect(page.getByText('Juan Dela Cruz').filter({ visible: true })).toBeHidden();
    await expect(page.getByText('No attendees yet.').filter({ visible: true })).toBeVisible();
  });
});
