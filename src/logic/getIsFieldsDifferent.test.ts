import getIsFieldsDifferent from './getIsFieldsDifferent';

describe('getIsFieldsDifferent', () => {
  it('should return true when two sets not match', () => {
    expect(
      getIsFieldsDifferent(
        [{ test: '123' }, { test: '455' }, { test: '455' }],
        [],
      ),
    ).toBeTruthy();
    expect(
      getIsFieldsDifferent(
        [{ test: '123' }, { test: '455' }, { test: '455' }],
        [{ test: '123' }, { test: '455' }, { test: '455', test1: 'what' }],
      ),
    ).toBeTruthy();
    expect(getIsFieldsDifferent([{}], [])).toBeTruthy();
    expect(getIsFieldsDifferent([], [{}])).toBeTruthy();
  });

  it('should return true when two sets matches', () => {
    expect(
      getIsFieldsDifferent(
        [{ name: 'useFieldArray' }],
        [{ name: 'useFieldArray' }],
      ),
    ).toBeFalsy();
    expect(
      getIsFieldsDifferent(
        [{ test: '123' }, { test: '455' }, { test: '455' }],
        [{ test: '123' }, { test: '455' }, { test: '455' }],
      ),
    ).toBeFalsy();
    expect(getIsFieldsDifferent([], [])).toBeFalsy();
    expect(
      getIsFieldsDifferent(
        [{ test: '123' }, { test: '455' }],
        [{ test: '123' }, { test: '455' }],
      ),
    ).toBeFalsy();
  });
});
