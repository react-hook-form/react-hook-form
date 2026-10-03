import stringToPath from '../../utils/stringToPath';

describe('stringToPath', () => {
  it('should convert string to path', () => {
    expect(stringToPath('test')).toEqual(['test']);

    expect(stringToPath('[test]]')).toEqual(['test']);

    expect(stringToPath('test.test[2].data')).toEqual([
      'test',
      'test',
      '2',
      'data',
    ]);

    expect(stringToPath('test.test["2"].data')).toEqual([
      'test',
      'test',
      '2',
      'data',
    ]);

    expect(stringToPath("test.test['test'].data")).toEqual([
      'test',
      'test',
      'test',
      'data',
    ]);

    expect(stringToPath('test.test.2.data')).toEqual([
      'test',
      'test',
      '2',
      'data',
    ]);
  });

  it('should return the cached path for a repeated input', () => {
    const path = stringToPath('cached.path[0].name');

    expect(stringToPath('cached.path[0].name')).toBe(path);
    expect(path).toEqual(['cached', 'path', '0', 'name']);
  });

  it('should evict the oldest entry once the cache is full', () => {
    const first = stringToPath('evict.first');

    for (let i = 0; i < 1000; i++) {
      stringToPath(`evict.filler${i}`);
    }

    const reparsed = stringToPath('evict.first');

    expect(reparsed).not.toBe(first);
    expect(reparsed).toEqual(['evict', 'first']);
  });
});
