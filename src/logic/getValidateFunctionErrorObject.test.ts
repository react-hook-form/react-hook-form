import getValidateFunctionErrorObject from './getValidateFunctionErrorObject';

test('should return undefined when called with non string result', () => {
  expect(
    getValidateFunctionErrorObject(undefined, {}, () => {}),
  ).toBeUndefined();
});

test('should return error and called nativeError', () => {
  const nativeError = jest.fn();
  expect(getValidateFunctionErrorObject('test', {}, nativeError)).toEqual({
    message: 'test',
    ref: {},
    type: 'validate',
  });
  expect(nativeError).toBeCalled();
});
