import getValidateErrorObject from './getValidateErrorObject';

test('should return undefined when called with non string result', () => {
  expect(getValidateErrorObject(undefined, {}, () => {})).toBeUndefined();
});

test('should return error and called nativeError', () => {
  const nativeError = jest.fn();
  expect(getValidateErrorObject('test', {}, nativeError)).toEqual({
    message: 'test',
    ref: {},
    type: 'validate',
  });
  expect(nativeError).toBeCalled();
});
