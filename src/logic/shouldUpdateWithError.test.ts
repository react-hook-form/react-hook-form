import shouldUpdateWithError from './shouldUpdateWithError';

describe('shouldUpdateWithError', () => {
  it('should return true when error message empty and error exists', () => {
    expect(
      shouldUpdateWithError({
        errors: {},
        name: 'test',
        error: { test: 'test' },
        validFields: new Set(),
      }),
    ).toBeTruthy();
  });

  it('should return true when error disappeared', () => {
    expect(
      shouldUpdateWithError({
        errors: { test: 'test' },
        name: 'test',
        error: {},
        validFields: new Set(),
      }),
    ).toBeTruthy();
  });

  it('should return true when error return and not found in error message', () => {
    expect(
      shouldUpdateWithError({
        errors: { test: 'test' },
        name: '',
        error: { data: 'bill' },
        validFields: new Set(),
      }),
    ).toBeTruthy();
  });

  it('should return true when error type or message not match in error message', () => {
    expect(
      shouldUpdateWithError({
        errors: { test: { type: 'test' } },
        name: 'test',
        error: { test: { type: 'bill' } },
        validFields: new Set(),
      }),
    ).toBeTruthy();
  });

  it('should return false if nothing matches', () => {
    expect(
      shouldUpdateWithError({
        errors: { test: { message: 'test', type: 'input' } },
        name: 'test',
        error: { test: { type: 'input', message: 'test' } },
        validFields: new Set(),
      }),
    ).toBeFalsy();
  });
});
