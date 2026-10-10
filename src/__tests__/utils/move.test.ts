import move from '../../utils/move';

describe('move', () => {
  it('be able to move element of array', () => {
    const data = [
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
    ];
    move(data, 0, 2);
    expect(data).toEqual([
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
        firstName: '1',
        lastName: 'Luo',
        id: '75309979-e340-49eb-8016-5f67bfb56c1c',
      },
    ]);
  });

  it('be able to move element backward in the array', () => {
    const data = ['a', 'b', 'c'];
    move(data, 2, 0);
    expect(data).toEqual(['c', 'a', 'b']);
  });

  it('be a no-op when moving an index to itself', () => {
    const data = ['a', 'b', 'c'];
    move(data, 1, 1);
    expect(data).toEqual(['a', 'b', 'c']);
  });

  it('return empty array when data passed was not an array', () => {
    // @ts-expect-error we want to test function on non-array input
    expect(move({}, 0, 3)).toEqual([]);
  });

  it('move nested item with empty slot', () => {
    expect(move([{ subFields: [{ test: '1' }] }], 0, 1)).toEqual([
      undefined,
      { subFields: [{ test: '1' }] },
    ]);

    expect(move([{ subFields: [{ test: '1' }] }], 0, 2)).toEqual([
      undefined,
      undefined,
      { subFields: [{ test: '1' }] },
    ]);
  });
});
