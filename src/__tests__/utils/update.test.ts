import update from '../../utils/update';

describe('update', () => {
  it('should update element at a valid index', () => {
    const data = [1, 2, 3];
    const result = update(data, 1, 99);

    expect(result).toEqual([1, 99, 3]);
    expect(result).toBe(data);
  });

  it('should update the first element', () => {
    const data = ['a', 'b', 'c'];
    const result = update(data, 0, 'z');

    expect(result).toEqual(['z', 'b', 'c']);
    expect(result).toBe(data);
  });

  it('should update the last element', () => {
    const data = [1, 2, 3];
    const result = update(data, 2, 100);

    expect(result).toEqual([1, 2, 100]);
    expect(result).toBe(data);
  });

  it('should work with object arrays', () => {
    const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const result = update(data, 0, { id: 999 });

    expect(result).toEqual([{ id: 999 }, { id: 2 }, { id: 3 }]);
    expect(result).toBe(data);
  });

  it('should work with nested arrays', () => {
    const data = [
      [1, 2],
      [3, 4],
    ];
    const result = update(data, 1, [5, 6]);

    expect(result).toEqual([
      [1, 2],
      [5, 6],
    ]);
    expect(result).toBe(data);
  });

  it('should work with a single-element array', () => {
    const data = ['only'];
    const result = update(data, 0, 'replaced');

    expect(result).toEqual(['replaced']);
    expect(result).toBe(data);
  });
});
