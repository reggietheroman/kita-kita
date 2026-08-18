import { render, screen } from '@testing-library/react-native';

import HomeScreen from '@/app/(tabs)/index';
import { useMeetings } from '@/hooks/use-meetings';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock('@/hooks/use-meetings', () => ({
  useMeetings: jest.fn(),
}));

const mockedUseMeetings = jest.mocked(useMeetings);

describe('<HomeScreen />', () => {
  test('shows a searchable meeting list with row actions', async () => {
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
            { id: 'EMP001', firstName: 'Jane', lastName: 'Doe', checkedInAt: '2026-08-18T00:00:00.000Z' },
            { id: 'EMP002', firstName: 'John', lastName: 'Smith', checkedInAt: null },
          ],
        },
      ],
      selectedMeetingId: null,
      selectedRecord: undefined,
      meetingKeys: {},
      checkedInCount: jest.fn().mockReturnValue(1),
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

    await render(<HomeScreen />);

    expect(screen.getByText('Weekly Standup')).toBeOnTheScreen();
    expect(screen.getByText('1 / 2')).toBeOnTheScreen();
    expect(screen.getByPlaceholderText('Search meetings')).toBeOnTheScreen();
    expect(screen.getByLabelText('Add meeting')).toBeOnTheScreen();
    expect(screen.getByLabelText('Open')).toBeOnTheScreen();
    expect(screen.getByLabelText('Edit')).toBeOnTheScreen();
    expect(screen.getByText('Delete')).toBeOnTheScreen();
    expect(screen.queryByText('Create new meeting')).toBeNull();
  });
});
