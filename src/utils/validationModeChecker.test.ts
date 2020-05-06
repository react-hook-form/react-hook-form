import validationModeChecker from './validationModeChecker';
import { VALIDATION_MODE } from '../constants';

describe('validationModeChecker', () => {
  it('should return correct mode', () => {
    expect(validationModeChecker(VALIDATION_MODE.onBlur)).toEqual({
      isOnSubmit: false,
      isOnBlur: true,
      isOnChange: false,
      isOnAll: false,
    });

    expect(validationModeChecker(VALIDATION_MODE.onChange)).toEqual({
      isOnSubmit: false,
      isOnBlur: false,
      isOnChange: true,
      isOnAll: false,
    });

    expect(validationModeChecker(VALIDATION_MODE.onSubmit)).toEqual({
      isOnSubmit: true,
      isOnBlur: false,
      isOnChange: false,
      isOnAll: false,
    });

    expect(validationModeChecker(undefined)).toEqual({
      isOnSubmit: true,
      isOnBlur: false,
      isOnChange: false,
      isOnAll: false,
    });

    expect(validationModeChecker(VALIDATION_MODE.all)).toEqual({
      isOnSubmit: false,
      isOnBlur: false,
      isOnChange: false,
      isOnAll: true,
    });
  });
});
