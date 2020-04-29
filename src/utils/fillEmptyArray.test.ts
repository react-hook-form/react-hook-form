import fillEmptyArray from './fillEmptyArray';

describe('fillEmptyArray', () => {
  it('shoudl return an array of null or empty array when value is an array', () => {
    expect(fillEmptyArray([1])).toEqual([null]);
    expect(fillEmptyArray([])).toEqual([]);
    expect(fillEmptyArray(['2', true])).toEqual([null, null]);
    expect(fillEmptyArray([{}, {}])).toEqual([null, null]);
    expect(fillEmptyArray([[], [3]])).toEqual([null, null]);
  });

  it('shoudl return null when value is not an array', () => {
    expect(fillEmptyArray(1)).toEqual(null);
    expect(fillEmptyArray({})).toEqual(null);
    expect(fillEmptyArray('')).toEqual(null);
    expect(fillEmptyArray(true)).toEqual(null);
  });
});
