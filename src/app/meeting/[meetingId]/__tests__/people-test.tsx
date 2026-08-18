import { render, screen } from '@testing-library/react-native';

import MeetingPeopleScreen from '@/app/meeting/[meetingId]/people';
import { useMeetings } from '@/hooks/use-meetings';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ meetingId: 'meeting-1' }),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
  File: jest.fn(),
}));

jest.mock('@/hooks/use-meetings', () => ({
  useMeetings: jest.fn(),
}));

const mockedUseMeetings = jest.mocked(useMeetings);

describe('<MeetingPeopleScreen />', () => {
  test('shows a searchable attendee list without an add form', async () => {
    mockedUseMeetings.mockReturnValue({
      loaded: true,
      records: [
        {
          meeting: {
            id: 'meeting-1',
            name: 'Weekly Standup',
            startsAt: '2026-08-18T00:00:00.000Z',
            endsAt: '2026-08-18T01:00:00.000Z',
            location: 'Room 1',
          },
          attendees: [
            { id: 'EMP001', firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', checkedInAt: null },
          ],
        },
      ],
      selectedMeetingId: 'meeting-1',
      selectedRecord: undefined,
      meetingKeys: {},
      checkedInCount: jest.fn().mockReturnValue(0),
      selectMeeting: jest.fn(),
      createMeetingRecord: jest.fn(),
      updateMeetingRecord: jest.fn(),
      deleteMeetingRecord: jest.fn(),
      importCsv: jest.fn(),
      addPerson: jest.fn(),
      updatePerson: jest.fn(),
      removePerson: jest.fn(),
      confirmCheckIn: jest.fn(),
      resetCheckIns: jest.fn(),
      createAttendeeQr: jest.fn(),
      evaluateAttendeeQr: jest.fn(),
      buildCloneTransferQrs: jest.fn(),
      buildSyncTransferQrs: jest.fn(),
      applyTransferFrames: jest.fn(),
    });

    await render(<MeetingPeopleScreen />);

    expect(screen.getByText('Jane Doe')).toBeOnTheScreen();
    expect(screen.getByPlaceholderText('Search people')).toBeOnTheScreen();
    expect(screen.getByText('Add')).toBeOnTheScreen();
    expect(screen.getByText('Edit')).toBeOnTheScreen();
    expect(screen.getByText('Delete')).toBeOnTheScreen();
    expect(screen.getByText('Back')).toBeOnTheScreen();
    expect(screen.queryByPlaceholderText('First name')).toBeNull();
    expect(screen.queryByText('Add person')).toBeNull();
  });
});
