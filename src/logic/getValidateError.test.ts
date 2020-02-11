import getValidateError from './getValidateError';

describe('getValidateError', () => {
  test('should return undefined when called with non string result', () => {
    expect(getValidateError(undefined)).toBeUndefined();
  });

  test('should return a proper error when called with a string', () => {
    expect(getValidateError('Test error message')).toEqual({
      message: 'Test error message',
      ref: undefined,
      type: 'validate',
      result: 'Test error message',
    });
  });

  test('should return a proper error when called with a boolean', () => {
    expect(getValidateError(false)).toEqual({
      message: '',
      ref: undefined,
      type: 'validate',
      result: false,
    });
  });
});
