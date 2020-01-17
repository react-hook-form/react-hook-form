import getIsFieldsDifferent from './getIsFieldsDifferent';

describe('getIsFieldsDifferent', () => {
  it('should return true when two sets not match', () => {
    expect(
      getIsFieldsDifferent(
        [
          { id: 1, test: '123' },
          { id: 2, test: '455' },
          { id: 3, test: '455' },
        ],
        [],
      ),
    ).toBeTruthy();
    expect(
      getIsFieldsDifferent(
        [
          { id: 1, test: '123' },
          { id: 2, test: '455' },
          { id: 3, test: '455' },
        ],
        [{ test: '123' }, { test: '455' }, { test: '455', test1: 'what' }],
      ),
    ).toBeTruthy();
    expect(getIsFieldsDifferent([{}], [])).toBeTruthy();
    expect(getIsFieldsDifferent([], [{}])).toBeTruthy();
  });

  it('should return true when two sets matches', () => {
    expect(
      getIsFieldsDifferent(
        [{ name: 'useFieldArray', id: '92dff77b-ae9f-4847-817a-8d72b5623a1e' }],
        [{ name: 'useFieldArray' }],
      ),
    ).toBeFalsy();
    expect(
      getIsFieldsDifferent(
        [
          { id: 1, test: '123' },
          { id: 2, test: '455' },
          { id: 3, test: '455' },
        ],
        [{ test: '123' }, { test: '455' }, { test: '455' }],
      ),
    ).toBeFalsy();
    expect(getIsFieldsDifferent([], [])).toBeFalsy();
    expect(
      getIsFieldsDifferent(
        [
          { id: 1, test: '123' },
          { id: 3, test: '455' },
        ],
        [{ test: '123' }, { test: '455' }],
      ),
    ).toBeFalsy();
  });
});
