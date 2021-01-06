import isErrorStateChanged from './isErrorStateChanged';

describe('isErrorChanged', () => {
  it('should return true when error message empty and error exists', () => {
    expect(
      isErrorStateChanged({
        errors: {},
        name: 'test',
        error: { type: 'test' },
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
      isErrorStateChanged<{ test: string }>({
        errors: {
          test: {
            type: 'test',
          },
        },
        name: 'test',
        error: undefined,
        validFields: {},
        fieldsWithValidation: {},
      }),
    ).toBeTruthy();
  });

  it('should return true when error return and not found in error message', () => {
    expect(
      isErrorStateChanged<{
        test: string;
      }>({
        errors: {
          test: {
            type: 'test',
          },
        },
        name: '',
        error: { type: 'bill' },
        validFields: {},
        fieldsWithValidation: {},
      }),
    ).toBeTruthy();
  });

  it('should return true when error type or message not match in error message', () => {
    expect(
      isErrorStateChanged<{
        test: string;
      }>({
        errors: { test: { type: 'test' } },
        name: 'test',
        error: { type: 'bill' },
        validFields: {},
        fieldsWithValidation: {},
      }),
    ).toBeTruthy();
  });

  it('should return false if nothing matches', () => {
    expect(
      isErrorStateChanged<{
        test: string;
      }>({
        errors: { test: { message: 'test', type: 'input' } },
        name: 'test',
        error: { type: 'input', message: 'test' },
        validFields: {},
        fieldsWithValidation: {},
      }),
    ).toBeFalsy();
  });

  it('should not clear error when it is set manually', () => {
    expect(
      isErrorStateChanged<{
        test: string;
      }>({
        errors: {
          test: { message: 'test', type: 'input' },
        },
        name: 'test',
        error: { type: 'input', message: 'test' },
        validFields: {},
        fieldsWithValidation: {},
      }),
    ).toBeFalsy();
  });

  it('should return true when new validate field is been introduced', () => {
    expect(
      isErrorStateChanged<{
        test: string;
        test1: string;
      }>({
        errors: { test: { message: 'test', type: 'input' } },
        name: 'test1',
        error: undefined,
        validFields: { test: true },
        fieldsWithValidation: { test1: true },
      }),
    ).toBeTruthy();
  });

  it('should return false when same valid input been triggered', () => {
    expect(
      isErrorStateChanged<{
        test: string;
      }>({
        errors: { test: { message: 'test', type: 'input' } },
        name: 'test',
        error: undefined,
        validFields: { test: true },
        fieldsWithValidation: { test: true },
      }),
    ).toBeTruthy();
  });

  it('should return true when schema errors is different', () => {
    expect(
      isErrorStateChanged<{
        test: string;
      }>({
        errors: { test: { message: 'test', type: 'input' } },
        name: 'test',
        error: undefined,
        validFields: {},
        fieldsWithValidation: {},
      }),
    ).toBeTruthy();
  });
});
