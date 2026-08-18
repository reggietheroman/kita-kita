import { render, screen } from '@testing-library/react-native';

import HomeScreen from '@/app/(tabs)/index';
import { useAttendance } from '@/hooks/use-attendance';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/hooks/use-attendance', () => ({
  useAttendance: jest.fn(),
}));

const mockedUseAttendance = jest.mocked(useAttendance);

describe('<HomeScreen />', () => {
  test('shows the unique check-in count against the expected list size', async () => {
    mockedUseAttendance.mockReturnValue({
      attendees: [
        { id: 'EMP001', firstName: 'Jane', lastName: 'Doe', checkedInAt: '2026-08-18T00:00:00.000Z' },
        { id: 'EMP002', firstName: 'John', lastName: 'Smith', checkedInAt: null },
      ],
      loaded: true,
      checkedInCount: 1,
      importCsv: jest.fn(),
      addPerson: jest.fn(),
      evaluateQr: jest.fn(),
      confirmCheckIn: jest.fn(),
      resetCheckIns: jest.fn(),
    });

    await render(<HomeScreen />);

    expect(screen.getByText('1')).toBeOnTheScreen();
    expect(screen.getByText('of 2 expected')).toBeOnTheScreen();
  });
});
