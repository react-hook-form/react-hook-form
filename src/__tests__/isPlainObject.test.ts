import isPlainObject from '../utils/isPlainObject';
import noop from '../utils/noop';

describe('isPlainObject', function () {
  it('identify plan object or not', function () {
    function test() {
      return {
        test: noop,
      };
    }

    expect(isPlainObject(Object.create({}))).toBeTruthy();
    expect(isPlainObject(Object.create(Object.prototype))).toBeTruthy();
    expect(isPlainObject({ foo: 'bar' })).toBeTruthy();
    expect(isPlainObject({})).toBeTruthy();
    expect(isPlainObject(Object.create(null))).toBeFalsy();
    expect(!isPlainObject(/foo/)).toBeTruthy();
    expect(!isPlainObject(function () {})).toBeTruthy();
    expect(!isPlainObject(['foo', 'bar'])).toBeTruthy();
    expect(!isPlainObject([])).toBeTruthy();
    expect(!isPlainObject(test)).toBeTruthy();
    expect(isPlainObject({ constructor: 'Ferrari' })).toBeTruthy();
    expect(isPlainObject({ constructor: 123 })).toBeTruthy();
    expect(isPlainObject({ hasOwnProperty: true })).toBeTruthy();

    class CustomClass {
      a = 1;
    }
    expect(isPlainObject(new CustomClass())).toBeFalsy();
    expect(
      isPlainObject(Object.assign(new CustomClass(), { constructor: Object })),
    ).toBeFalsy();
  });
});
