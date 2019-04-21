import shouldUpdateWithError from './shouldUpdateWithError';

describe('shouldUpdateWithError', () => {
  it('should return false when onSubmitModeNotSubmitted set to true', () => {
    expect(
      shouldUpdateWithError({
        errorMessages: {},
        name,
        error: { test: 'test' },
        mode: '',
        onSubmitModeNotSubmitted: true,
        type: 'test',
      }),
    ).toBeFalsy();
  });

  it('should return false when type is onBlur and and type is not blur', () => {
    expect(
      shouldUpdateWithError({
        errorMessages: {},
        name,
        error: { test: 'test' },
        mode: 'onBlur',
        onSubmitModeNotSubmitted: false,
        type: 'input',
      }),
    ).toBeFalsy();
  });

  it('should return false when error message and error both empty', () => {
    expect(
      shouldUpdateWithError({
        errorMessages: {},
        name: '',
        error: {},
        mode: '',
        onSubmitModeNotSubmitted: false,
        type: 'test',
      }),
    ).toBeFalsy();
  });

  it('should return true when error message empty and error exists', () => {
    expect(
      shouldUpdateWithError({
        errorMessages: {},
        name,
        error: { test: 'test' },
        mode: '',
        onSubmitModeNotSubmitted: false,
        type: 'test',
      }),
    ).toBeTruthy();
  });

  it('should return true when error disappeared', () => {
    expect(
      shouldUpdateWithError({
        errorMessages: { test: 'test' },
        name: 'test',
        error: {},
        mode: '',
        onSubmitModeNotSubmitted: false,
        type: 'test',
      }),
    ).toBeTruthy();
  });

  it('should return true when error return and not found in error message', () => {
    expect(
      shouldUpdateWithError({
        errorMessages: { test: 'test' },
        name: '',
        error: { data: 'bill' },
        mode: '',
        onSubmitModeNotSubmitted: false,
        type: 'test',
      }),
    ).toBeTruthy();
  });

  it('should return true when error type or message not match in error message', () => {
    expect(
      shouldUpdateWithError({
        errorMessages: { test: { type: 'test' } },
        name: '',
        error: { test: { type: 'bill' } },
        mode: '',
        onSubmitModeNotSubmitted: false,
        type: 'test',
      }),
    ).toBeTruthy();

    expect(
      shouldUpdateWithError({
        errorMessages: { test: { message: 'test' } },
        name: '',
        error: { test: { message: 'bill' } },
        mode: '',
        onSubmitModeNotSubmitted: false,
        type: 'test',
      }),
    ).toBeTruthy();
  });
});
