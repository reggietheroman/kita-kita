import { Alert, Platform } from 'react-native';

import { confirmAction } from '@/lib/confirm';

describe('confirmAction', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Platform.OS = originalOS;
    jest.restoreAllMocks();
  });

  test('shows cancel and confirm on native', () => {
    Platform.OS = 'ios';
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const onConfirm = jest.fn();

    confirmAction({
      title: 'Save changes?',
      message: 'Update this meeting on this device.',
      confirmLabel: 'Save',
      onConfirm,
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Save changes?',
      'Update this meeting on this device.',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancel', style: 'cancel' }),
        expect.objectContaining({ text: 'Save' }),
      ]),
    );
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
