import isDateObject from '../../utils/isDateObject';

describe('isDateObject', () => {
  it('should return true when value is a Date object', () => {
    expect(isDateObject(new Date())).toBe(true);
  });

  it('should return false when value is not a Date object', () => {
    expect(isDateObject('2021-01-01')).toBe(false);
    expect(isDateObject(1609459200000)).toBe(false);
    expect(isDateObject({})).toBe(false);
    expect(isDateObject(null)).toBe(false);
    expect(isDateObject(undefined)).toBe(false);
    expect(isDateObject([])).toBe(false);
    expect(isDateObject(() => {})).toBe(false);
  });
});
