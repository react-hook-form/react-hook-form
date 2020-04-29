import flatArray from './flatArray';

describe('flatArray', () => {
  it('should flat array', () => {
    expect(flatArray([1, 2, [3, 4, 5]])).toEqual([1, 2, 3, 4, 5]);
  });
});
