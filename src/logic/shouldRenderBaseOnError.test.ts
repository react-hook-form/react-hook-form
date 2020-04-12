import shouldRenderBaseOnError from './shouldRenderBaseOnError';

describe('shouldUpdateWithError', () => {
  it('should return true when error message empty and error exists', () => {
    expect(
      shouldRenderBaseOnError({
        errors: {},
        name: 'test',
        error: { test: 'test' } as any,
        validFields: new Set(),
        fieldsWithValidation: new Set(),
      }),
    ).toBeTruthy();
  });

  it('should return false when form is valid and field is valid', () => {
    expect(
      shouldRenderBaseOnError({
        errors: {},
        name: 'test',
        error: {},
        validFields: new Set(),
        fieldsWithValidation: new Set(),
      }),
    ).toBeFalsy();
  });

  it('should return true when error disappeared', () => {
    expect(
      shouldRenderBaseOnError({
        errors: { test: 'test' } as any,
        name: 'test',
        error: {},
        validFields: new Set(),
        fieldsWithValidation: new Set(),
      }),
    ).toBeTruthy();
  });

  it('should return true when error return and not found in error message', () => {
    expect(
      shouldRenderBaseOnError({
        errors: { test: 'test' } as any,
        name: '',
        error: { data: 'bill' } as any,
        validFields: new Set(),
        fieldsWithValidation: new Set(),
      }),
    ).toBeTruthy();
  });

  it('should return true when error type or message not match in error message', () => {
    expect(
      shouldRenderBaseOnError({
        errors: { test: { type: 'test' } } as any,
        name: 'test',
        error: { test: { type: 'bill' } } as any,
        validFields: new Set(),
        fieldsWithValidation: new Set(),
      }),
    ).toBeTruthy();
  });

  it('should return false if nothing matches', () => {
    expect(
      shouldRenderBaseOnError({
        errors: { test: { message: 'test', type: 'input' } } as any,
        name: 'test',
        error: { test: { type: 'input', message: 'test' } } as any,
        validFields: new Set(),
        fieldsWithValidation: new Set(),
      }),
    ).toBeFalsy();
  });

  it('should not clear error when it is set manually', () => {
    expect(
      shouldRenderBaseOnError({
        errors: {
          test: { isManual: true, message: 'test', type: 'input' },
        } as any,
        name: 'test',
        error: { test: { type: 'input', message: 'test' } } as any,
        validFields: new Set(),
        fieldsWithValidation: new Set(),
      }),
    ).toBeFalsy();
  });

  it('should return true when new validate field is been introduced', () => {
    expect(
      shouldRenderBaseOnError({
        errors: { test: { message: 'test', type: 'input' } } as any,
        name: 'test1',
        error: {},
        validFields: new Set(['test']),
        fieldsWithValidation: new Set(['test1']),
      }),
    ).toBeTruthy();
  });

  it('should return false when same valid input been triggered', () => {
    expect(
      shouldRenderBaseOnError({
        errors: { test: { message: 'test', type: 'input' } } as any,
        name: 'test',
        error: {},
        validFields: new Set(['test']),
        fieldsWithValidation: new Set(['test']),
      }),
    ).toBeFalsy();
  });

  it('should return true when schema errors is different', () => {
    expect(
      shouldRenderBaseOnError({
        errors: { test: { message: 'test', type: 'input' } } as any,
        name: 'test',
        error: {},
        validFields: new Set(),
        fieldsWithValidation: new Set(),
      }),
    ).toBeTruthy();
  });
});
