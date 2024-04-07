import isSetObject from '../../utils/isSetObject';

describe('isSetObject', () => {
  it('should return true when it is a set object', () => {
    expect(isSetObject(new Set())).toBeTruthy();
    expect(isSetObject(new Set([1, 2, 3]))).toBeTruthy();
  });

  it('should return false when it is not a set object', () => {
    expect(isSetObject({})).toBeFalsy();
    expect(isSetObject([])).toBeFalsy();
    expect(isSetObject(new Date())).toBeFalsy();
  });
});
