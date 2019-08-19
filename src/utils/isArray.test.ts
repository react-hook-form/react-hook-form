import isArray from './isArray';

describe('isArray', () => {
  it('should return true when value is an object', () => {
    expect(isArray([])).toBeTruthy();
    expect(isArray(['foo', 'bar'])).toBeTruthy();
  });

  it('should return false when value is not an object or is null', () => {
    expect(isArray(null)).toBeFalsy();
    expect(isArray(undefined)).toBeFalsy();
    expect(isArray(-1)).toBeFalsy();
    expect(isArray(0)).toBeFalsy();
    expect(isArray(1)).toBeFalsy();
    expect(isArray('')).toBeFalsy();
    expect(isArray({})).toBeFalsy();
    expect(isArray({ foo: 'bar' })).toBeFalsy();
    expect(isArray(() => null)).toBeFalsy();
  });
});
