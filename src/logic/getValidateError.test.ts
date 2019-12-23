import getValidateError from './getValidateError';

test('should return undefined when called with non string result', () => {
  expect(getValidateError(undefined, () => {})).toBeUndefined();
});
