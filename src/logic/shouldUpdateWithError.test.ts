import shouldUpdateWithError from './shouldUpdateWithError';

describe('shouldUpdateWithError', () => {
  it('should return false when onSubmitModeNotSubmitted set to true', () => {
    expect(
      shouldUpdateWithError({
        errors: {},
        name: 'test',
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
        errors: {},
        name: 'test',
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
        errors: {},
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
        errors: {},
        name: 'test',
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
        errors: { test: 'test' },
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
        errors: { test: 'test' },
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
        errors: { test: { type: 'test' } },
        name: 'test',
        error: { test: { type: 'bill' } },
        mode: '',
        onSubmitModeNotSubmitted: false,
        type: 'test',
      }),
    ).toBeTruthy();

    expect(
      shouldUpdateWithError({
        errors: { test: { message: 'test' } },
        name: 'test',
        error: { test: { message: 'bill' } },
        mode: '',
        onSubmitModeNotSubmitted: false,
        type: 'test',
      }),
    ).toBeTruthy();
  });
});
