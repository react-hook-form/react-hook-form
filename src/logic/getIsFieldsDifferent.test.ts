import getIsFieldsDifferent from './getIsFieldsDifferent';

describe('getIsFieldsDifferent', () => {
  it('should return false when two sets not match', () => {
    expect(
      getIsFieldsDifferent(
        [
          { id: 1, test: '123' },
          { id: 2, test: '455' },
          { id: 3, test: '455' },
        ],
        [{ test: '123' }, { test: '455' }, { test: '455' }],
      ),
    ).toBeTruthy();
    expect(getIsFieldsDifferent([], [])).toBeTruthy();
    expect(
      getIsFieldsDifferent(
        [
          { id: 1, test: '123' },
          { id: 3, test: '455' },
        ],
        [{ test: '123' }, { test: '455' }],
      ),
    ).toBeTruthy();
  });

  it('should return true when two sets matches', () => {
    expect(
      getIsFieldsDifferent(
        [
          { id: 1, test: '123' },
          { id: 2, test: '455' },
          { id: 3, test: '455' },
        ],
        [],
      ),
    ).toBeFalsy();
    expect(
      getIsFieldsDifferent(
        [
          { id: 1, test: '123' },
          { id: 2, test: '455' },
          { id: 3, test: '455' },
        ],
        [{ test: '123' }, { test: '455' }, { test: '455', test1: 'what' }],
      ),
    ).toBeFalsy();
    expect(getIsFieldsDifferent([{}], [])).toBeFalsy();
    expect(getIsFieldsDifferent([], [{}])).toBeFalsy();
  });
});
