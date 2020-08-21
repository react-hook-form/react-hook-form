import insert from './insert';

describe('insert', () => {
  it('should insert value at specific index in array', () => {
    expect(insert([1, 3, 4], 1, 2)).toEqual([1, 2, 3, 4]);
    expect(
      insert(
        [
          {
            firstName: '1',
            lastName: 'Luo',
            id: '75309979-e340-49eb-8016-5f67bfb56c1c',
          },
          {
            firstName: '2',
            lastName: 'Luo',
            id: '75309979-e340-49eb-8016-5f67bfb56c1c',
          },
          {
            firstName: '4',
            lastName: 'Luo',
            id: '75309979-e340-49eb-8016-5f67bfb56c1c',
          },
        ],
        2,
        {
          firstName: '3',
          lastName: 'Luo',
          id: '75309979-e340-49eb-8016-5f67bfb56c1c',
        },
      ),
    ).toEqual([
      {
        firstName: '1',
        lastName: 'Luo',
        id: '75309979-e340-49eb-8016-5f67bfb56c1c',
      },
      {
        firstName: '2',
        lastName: 'Luo',
        id: '75309979-e340-49eb-8016-5f67bfb56c1c',
      },
      {
        firstName: '3',
        lastName: 'Luo',
        id: '75309979-e340-49eb-8016-5f67bfb56c1c',
      },
      {
        firstName: '4',
        lastName: 'Luo',
        id: '75309979-e340-49eb-8016-5f67bfb56c1c',
      },
    ]);
  });

  it('should insert undefined as value when value to be inserted is falsy', () => {
    expect(insert([1, 2, 4], 2)).toEqual([1, 2, undefined, 4]);
    expect(insert([1, 2, 4], 2, 0)).toEqual([1, 2, undefined, 4]);
    expect(insert([1, 2, 4], 2, false as any)).toEqual([1, 2, undefined, 4]);
    expect(insert([1, 2, 4], 2, '' as any)).toEqual([1, 2, undefined, 4]);
    expect(insert([1, 2, 4], 2, undefined as any)).toEqual([
      1,
      2,
      undefined,
      4,
    ]);
  });

  it('should spread value when it is an array at one deep-level', () => {
    expect(insert([1, 2], 2, [3, 4])).toEqual([1, 2, 3, 4]);
    expect(insert([1, 2], 2, [3, [4]])).toEqual([1, 2, 3, [4]]);
  });
});
