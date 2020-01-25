import compareObject from './compareObject';

test('should return true when object are the same', () => {
  expect(compareObject({ min: 'test' }, { min: 'test' })).toBeTruthy();
  expect(compareObject({ min: true }, { min: true })).toBeTruthy();
});

test('should return false when object are not the same', () => {
  expect(compareObject({ min: 'test' }, { min: 'test1' })).toBeFalsy();
  expect(compareObject({ min: true }, { min: false })).toBeFalsy();
});
