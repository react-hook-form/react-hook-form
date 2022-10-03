import isPlainObject from './isPlainObject';

describe('isPlainObject', function () {
  it('should identify plan object or not', function () {
    function test() {
      return {
        test: () => {},
      };
    }

    expect(isPlainObject(Object.create({}))).toBeTruthy();
    expect(isPlainObject(Object.create(Object.prototype))).toBeTruthy();
    expect(isPlainObject({ foo: 'bar' })).toBeTruthy();
    expect(isPlainObject({})).toBeTruthy();
    expect(isPlainObject(Object.create(null))).toBeTruthy();
    expect(!isPlainObject(/foo/)).toBeFalsy();
    expect(!isPlainObject(function () {})).toBeFalsy();
    expect(!isPlainObject(['foo', 'bar'])).toBeFalsy();
    expect(!isPlainObject([])).toBeFalsy();
    expect(!isPlainObject(test)).toBeFalsy();
  });
});
