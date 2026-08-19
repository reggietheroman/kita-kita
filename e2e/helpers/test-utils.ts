import { expect, type Page } from '@playwright/test';

export interface MeetingData {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
}

export interface AttendeeData {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
}

export const SAMPLE_MEETINGS: Record<string, MeetingData> = {
  generalAssembly: {
    name: 'General Assembly 2026',
    date: '2026-08-20',
    startTime: '09:00',
    endTime: '12:00',
    location: 'Auditorium Hall A',
  },
  techSync: {
    name: 'Tech Team Sync',
    date: '2026-08-21',
    startTime: '14:00',
    endTime: '15:00',
    location: 'Conference Room 2',
  },
};

export const SAMPLE_ATTENDEES: Record<string, AttendeeData> = {
  juan: {
    id: 'EMP-001',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    email: 'juan.delacruz@example.com',
    phoneNumber: '+639000000001',
  },
  maria: {
    id: 'EMP-002',
    firstName: 'Maria',
    lastName: 'Santos',
    email: 'maria.santos@example.com',
    phoneNumber: '+639000000002',
  },
  pedro: {
    id: 'EMP-003',
    firstName: 'Pedro',
    lastName: 'Penduko',
  },
};

/**
 * Ensures the app has loaded stored state and rendered main content.
 */
export async function waitForAppReady(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.getByPlaceholder('Search meetings').filter({ visible: true })).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Loading meetings…')).toBeHidden({ timeout: 15000 });
}

/**
 * Clears local storage state to give tests a clean slate.
 */
export async function resetAppState(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  await waitForAppReady(page);
}

/**
 * Sets up automated confirmation/alert dialog handling.
 */
export function setupDialogHandler(page: Page, action: 'accept' | 'dismiss' = 'accept'): void {
  page.on('dialog', async (dialog) => {
    if (action === 'accept') {
      await dialog.accept();
    } else {
      await dialog.dismiss();
    }
  });
}

/**
 * Helper to create a meeting from the Home screen.
 */
export async function fillAndCreateMeeting(page: Page, meeting: MeetingData): Promise<void> {
  // Click Add meeting button in header
  await page.getByLabel('Add meeting').filter({ visible: true }).click();
  await expect(page.getByText('Create meeting', { exact: true }).filter({ visible: true })).toBeVisible();

  // Fill in meeting fields
  await page.getByPlaceholder('Meeting name').filter({ visible: true }).fill(meeting.name);
  await page.getByPlaceholder('Date (YYYY-MM-DD)').filter({ visible: true }).fill(meeting.date);
  await page.getByPlaceholder('Start time (HH:mm)').filter({ visible: true }).fill(meeting.startTime);
  await page.getByPlaceholder('End time (HH:mm)').filter({ visible: true }).fill(meeting.endTime);
  await page.getByPlaceholder('Location').filter({ visible: true }).fill(meeting.location);

  // Click Create in header
  await page.getByRole('button', { name: 'Create', exact: true }).filter({ visible: true }).click();

  // Should navigate to Meeting Details screen
  await expect(page.getByRole('button', { name: 'Scan attendee QR' }).filter({ visible: true })).toBeVisible();
  await expect(page.getByText(meeting.name).filter({ visible: true })).toBeVisible();
}

/**
 * Helper to add an attendee to the current meeting.
 */
export async function fillAndAddAttendee(page: Page, attendee: AttendeeData): Promise<void> {
  // If on Meeting details screen, navigate to People screen
  const managePeopleButton = page.getByRole('button', { name: 'Manage people' }).filter({ visible: true });
  if (await managePeopleButton.isVisible().catch(() => false)) {
    await managePeopleButton.click();
  }
  await expect(page.getByPlaceholder('Search people').filter({ visible: true })).toBeVisible();

  // Click Add person button
  await page.getByLabel('Add person').filter({ visible: true }).click();
  await expect(page.getByText('Add person', { exact: true }).filter({ visible: true })).toBeVisible();

  // Fill attendee fields
  await page.getByPlaceholder('ID').filter({ visible: true }).fill(attendee.id);
  await page.getByPlaceholder('First name').filter({ visible: true }).fill(attendee.firstName);
  await page.getByPlaceholder('Last name').filter({ visible: true }).fill(attendee.lastName);
  if (attendee.email) {
    await page.getByPlaceholder('Email (optional)').filter({ visible: true }).fill(attendee.email);
  }
  if (attendee.phoneNumber) {
    await page.getByPlaceholder('Phone (optional, +63...)').filter({ visible: true }).fill(attendee.phoneNumber);
  }

  // Click Save/Add in header
  await page.getByLabel('Add person').filter({ visible: true }).click();

  // Should return to People screen and show new attendee
  await expect(page.getByText(`${attendee.firstName} ${attendee.lastName}`).filter({ visible: true })).toBeVisible();
}

/** Opens the attendee check-in scanner from meeting detail. */
export async function openAttendeeScanner(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Scan attendee QR' }).filter({ visible: true }).click();
}

/** Opens the transfer scanner from meeting actions. */
export async function openTransferScanner(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Meeting actions' }).filter({ visible: true }).click();
  await expect(page.getByText('Meeting actions', { exact: true }).filter({ visible: true })).toBeVisible();
  await page.getByRole('button', { name: 'Scan from another device' }).filter({ visible: true }).click();
}
