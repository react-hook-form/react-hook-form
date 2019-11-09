import getValidateError from './getValidateError';

test('should return undefined when called with non string result', () => {
  expect(getValidateError(undefined, {}, () => {})).toBeUndefined();
});

test('should return error and called nativeError', () => {
  const nativeError = jest.fn();
  expect(getValidateError('test', {}, nativeError)).toEqual({
    message: 'test',
    ref: {},
    type: 'validate',
  });
  expect(nativeError).toBeCalled();
});
