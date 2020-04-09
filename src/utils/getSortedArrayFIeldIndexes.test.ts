import getSortItems from './getSortedArrayFieldIndexes';

describe('getSortItems', () => {
  it('should sort removed item correctly', () => {
    expect(getSortItems([1, 2, 3, 4], 0, [2, 3])).toEqual([1, 2]);
    expect(getSortItems([2, 3, 4], 0, [2, 3])).toEqual([2]);
    expect(getSortItems([1, 3, 5], 0, [3])).toEqual([1, 4]);
    expect(getSortItems([1], 0, [1])).toEqual([]);
    expect(getSortItems([4], 0, [4])).toEqual([]);
    expect(getSortItems([4, 1], 0, [4])).toEqual([1]);
    expect(getSortItems([1, 2, 3, 4, 5], 0, [4])).toEqual([1, 2, 3, 4]);
    expect(getSortItems([0, 1], 0, [1])).toEqual([0]);
  });

  it('should prepend and resort the indexes', () => {
    expect(getSortItems([1, 2, 3, 4], 2)).toEqual([0, 1, 3, 4, 5, 6]);
    expect(getSortItems([2, 4, 8, 9], 2)).toEqual([0, 1, 4, 6, 10, 11]);
  });
});
