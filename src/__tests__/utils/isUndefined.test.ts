import isUndefined from '../../utils/isUndefined';

describe('isUndefined', () => {
  it('return true when it is an undefined value', () => {
    expect(isUndefined(undefined)).toBeTruthy();
  });

  it('return false when it is not an undefined value', () => {
    expect(isUndefined(null)).toBeFalsy();
    expect(isUndefined('')).toBeFalsy();
    expect(isUndefined('undefined')).toBeFalsy();
    expect(isUndefined(0)).toBeFalsy();
    expect(isUndefined([])).toBeFalsy();
    expect(isUndefined({})).toBeFalsy();
  });
});
