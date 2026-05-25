import filterOutFalsy from '../../utils/compact';

describe('filterOutFalsy', () => {
  it('should return filtered array when array value is falsy ', () => {
    expect(filterOutFalsy([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
    expect(filterOutFalsy([1, 2, false, 4])).toEqual([1, 2, 4]);
    expect(filterOutFalsy([1, 2, '', 4])).toEqual([1, 2, 4]);
    expect(filterOutFalsy([1, 2, undefined, 4])).toEqual([1, 2, 4]);
    expect(filterOutFalsy([0, 1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
  });

  it('should correctly handle sparse arrays', () => {
    const sparse = [1, , undefined, 2];
    expect(filterOutFalsy(sparse)).toEqual([1, 2]);
  });

  it('should return an empty array when all values are falsy', () => {
    expect(filterOutFalsy([0, '', null, false, NaN, undefined])).toEqual([]);
  });
});
