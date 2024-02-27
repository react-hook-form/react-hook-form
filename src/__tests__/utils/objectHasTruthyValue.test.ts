import objectHasTruthyValue from '../../utils/objectHasTruthyValue';

describe('objectHasTruthyValue', () => {
  it('should return false when value is an empty object, null, undefined or only falsy values', () => {
    expect(objectHasTruthyValue({})).toBeFalsy();
    expect(objectHasTruthyValue(null)).toBeFalsy();
    expect(objectHasTruthyValue(undefined)).toBeFalsy();
    expect(objectHasTruthyValue({ bar: false })).toBeFalsy();
  });

  it('should return true when at least one property of the object is truthy', () => {
    expect(objectHasTruthyValue({ foo: false, bar: true })).toBeTruthy();
    expect(objectHasTruthyValue({ bar: true })).toBeTruthy();
    expect(objectHasTruthyValue({ foo: 'test' })).toBeTruthy();
  });
});
