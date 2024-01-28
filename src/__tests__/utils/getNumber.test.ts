import getNumber from '../../utils/getNumber';

describe('convertStringToNumber', () => {
  it('should return undefined for non-numeric values', () => {
    expect(getNumber('abc')).toBeUndefined();
  });

  it('should return the number for valid numeric strings', () => {
    expect(getNumber('123')).toBe(123);
    expect(getNumber('0')).toBe(0);
    expect(getNumber('-123')).toBe(-123);
    expect(getNumber('12.34')).toBe(12.34);
  });

  it('should return undefined for strings with non-numeric characters', () => {
    expect(getNumber('123abc')).toBeUndefined();
    expect(getNumber('12.3.4')).toBeUndefined();
    expect(getNumber('-12-3')).toBeUndefined();
  });
});
