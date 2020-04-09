import getSortItems from './getSortRemovedItems';

describe('getSortItems', () => {
  it('should sort removed item correctly', () => {
    expect(getSortItems([1, 2, 3, 4], [2, 3])).toEqual([1, 2]);
    expect(getSortItems([2, 3, 4], [2, 3])).toEqual([2]);
    expect(getSortItems([1, 3, 5], [3])).toEqual([1, 4]);
    expect(getSortItems([1], [1])).toEqual([]);
    expect(getSortItems([4], [4])).toEqual([]);
    expect(getSortItems([4, 1], [4])).toEqual([1]);
    expect(getSortItems([1, 2, 3, 4, 5], [4])).toEqual([1, 2, 3, 4]);
    expect(getSortItems([0, 1], [1])).toEqual([0]);
  });
});
