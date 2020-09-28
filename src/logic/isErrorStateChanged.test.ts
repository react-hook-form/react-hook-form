import isErrorStateChanged from './isErrorStateChanged';

describe('isErrorChanged', () => {
  it('should return true when error message empty and error exists', () => {
    expect(
      isErrorStateChanged({
        errors: {},
        name: 'test',
        error: { test: 'test' } as any,
        validFields: {},
        fieldsWithValidation: {},
      }),
    ).toBeTruthy();
  });

  it('should return false when form is valid and field is valid', () => {
    expect(
      isErrorStateChanged({
        errors: {},
        name: 'test',
        error: undefined,
        validFields: {},
        fieldsWithValidation: {},
      }),
    ).toBeFalsy();
  });

  it('should return true when error disappeared', () => {
    expect(
      isErrorStateChanged({
        errors: { test: 'test' } as any,
        name: 'test',
        error: undefined,
        validFields: {},
        fieldsWithValidation: {},
      }),
    ).toBeTruthy();
  });

  it('should return true when error return and not found in error message', () => {
    expect(
      isErrorStateChanged({
        errors: { test: 'test' } as any,
        name: '',
        error: { data: 'bill' } as any,
        validFields: {},
        fieldsWithValidation: {},
      }),
    ).toBeTruthy();
  });

  it('should return true when error type or message not match in error message', () => {
    expect(
      isErrorStateChanged({
        errors: { test: { type: 'test' } } as any,
        name: 'test',
        error: { test: { type: 'bill' } } as any,
        validFields: {},
        fieldsWithValidation: {},
      }),
    ).toBeTruthy();
  });

  it('should return false if nothing matches', () => {
    expect(
      isErrorStateChanged({
        errors: { test: { message: 'test', type: 'input' } } as any,
        name: 'test',
        error: { type: 'input', message: 'test' },
        validFields: {},
        fieldsWithValidation: {},
      }),
    ).toBeFalsy();
  });

  it('should not clear error when it is set manually', () => {
    expect(
      isErrorStateChanged({
        errors: {
          test: { message: 'test', type: 'input' },
        } as any,
        name: 'test',
        error: { type: 'input', message: 'test' },
        validFields: {},
        fieldsWithValidation: {},
      }),
    ).toBeFalsy();
  });

  it('should return true when new validate field is been introduced', () => {
    expect(
      isErrorStateChanged({
        errors: { test: { message: 'test', type: 'input' } } as any,
        name: 'test1',
        error: undefined,
        validFields: { test: true } as any,
        fieldsWithValidation: { test1: true } as any,
      }),
    ).toBeTruthy();
  });

  it('should return false when same valid input been triggered', () => {
    expect(
      isErrorStateChanged({
        errors: { test: { message: 'test', type: 'input' } } as any,
        name: 'test',
        error: undefined,
        validFields: { test: true } as any,
        fieldsWithValidation: { test: true } as any,
      }),
    ).toBeTruthy();
  });

  it('should return true when schema errors is different', () => {
    expect(
      isErrorStateChanged({
        errors: { test: { message: 'test', type: 'input' } } as any,
        name: 'test',
        error: undefined,
        validFields: {},
        fieldsWithValidation: {},
      }),
    ).toBeTruthy();
  });
});
