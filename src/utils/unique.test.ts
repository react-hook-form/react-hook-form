import unique from './unique';

describe('unique', () => {
  it('should return filtered array when array value is falsy ', () => {
    expect(unique([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
    expect(unique([1, 2, false, 4])).toEqual([1, 2, 4]);
    expect(unique([1, 2, '', 4])).toEqual([1, 2, 4]);
    expect(unique([1, 2, undefined, 4])).toEqual([1, 2, 4]);
    expect(unique([0, 1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
  });
});
