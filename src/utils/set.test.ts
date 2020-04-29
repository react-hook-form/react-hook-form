import { isKey } from './set';

describe('isKey', () => {
  it('should return false if it is array', () => {
    expect(isKey([])).toBeFalsy();
  });
  it('should return true when it is not a deep key', () => {
    expect(isKey('test')).toBeTruthy();
    expect(isKey('fooBar')).toBeTruthy();
  });
  it('should return false when it is a deep key', () => {
    expect(isKey('test.foo')).toBeFalsy();
    expect(isKey('test.foo[0]')).toBeFalsy();
    expect(isKey('test[1]')).toBeFalsy();
    expect(isKey('test.foo[0].bar')).toBeFalsy();
  });
});
