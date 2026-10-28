import remove from '../../utils/remove';

describe('remove', () => {
  it('remove item accordingly', () => {
    expect(
      remove([, , { type: 'required', message: '', ref: 'test' }], 1),
    ).toEqual([undefined, { type: 'required', message: '', ref: 'test' }]);

    expect(
      remove([, , { type: 'required', message: '', ref: 'test' }], [1, 2]),
    ).toEqual([]);

    expect(
      remove([, , { type: 'required', message: '', ref: 'test' }], [0, 1]),
    ).toEqual([{ type: 'required', message: '', ref: 'test' }]);

    expect(
      remove(
        [
          ,
          ,
          { type: 'required', message: '', ref: 'test' },
          { type: 'required', message: '', ref: 'test' },
          null,
          ,
        ],
        [3, 2],
      ),
    ).toEqual([]);

    expect(
      remove(
        [
          ,
          ,
          { type: 'required', message: '', ref: 'test' },
          { type: 'required', message: '', ref: 'test' },
          null,
          ,
        ],
        [1, 4],
      ),
    ).toEqual([
      undefined,
      { type: 'required', message: '', ref: 'test' },
      { type: 'required', message: '', ref: 'test' },
      undefined,
    ]);

    expect(remove([true, true, true], [1])).toEqual([true, true]);
    expect(remove([true, true, true], [0])).toEqual([true, true]);

    expect(
      remove([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], [6, 7, 8, 9, 10, 11]),
    ).toEqual([0, 1, 2, 3, 4, 5]);
    expect(
      remove([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], [11, 10, 9, 8, 7, 6]),
    ).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('remove correctly with indexes which contains gap', () => {
    expect(
      remove(
        [
          ,
          ,
          { type: 'required', message: '', ref: 'test' },
          { type: 'required', message: '', ref: 'test' },
          null,
          { type: 'required', message: '', ref: 'test' },
          ,
          { type: 'required', message: '', ref: 'test' },
        ],
        [2, 5],
      ),
    ).toEqual([
      ,
      ,
      { type: 'required', message: '', ref: 'test' },
      null,
      ,
      { type: 'required', message: '', ref: 'test' },
    ]);
  });

  it('remove all items', () => {
    expect(
      remove(
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
            firstName: '3',
            lastName: 'Luo',
            id: '75309979-e340-49eb-8016-5f67bfb56c1c',
          },
          {
            firstName: '4',
            lastName: 'Luo',
            id: '75309979-e340-49eb-8016-5f67bfb56c1c',
          },
          {
            firstName: '5',
            lastName: 'Luo',
            id: '75309979-e340-49eb-8016-5f67bfb56c1c',
          },
          {
            firstName: '6',
            lastName: 'Luo',
            id: '75309979-e340-49eb-8016-5f67bfb56c1c',
          },
          {
            firstName: '7',
            lastName: 'Luo',
            id: '75309979-e340-49eb-8016-5f67bfb56c1c',
          },
          {
            firstName: '8',
            lastName: 'Luo',
            id: '75309979-e340-49eb-8016-5f67bfb56c1c',
          },
          {
            firstName: '9',
            lastName: 'Luo',
            id: '75309979-e340-49eb-8016-5f67bfb56c1c',
          },
        ],
        [0, 1, 2, 3, 4, 5, 6, 7, 8],
      ),
    ).toEqual([]);
  });

  it('ignore duplicated indexes', () => {
    expect(remove(['a', 'b', 'c', 'd'], [1, 1])).toEqual(['a', 'c', 'd']);
    expect(remove(['a', 'b', 'c', 'd'], [3, 1, 3, 1])).toEqual(['a', 'c']);
  });

  it('not change the indexes passed in', () => {
    const indexes = [3, 1];

    remove(['a', 'b', 'c', 'd'], indexes);

    expect(indexes).toEqual([3, 1]);
  });

  it('preserve valid falsy elements when removing items', () => {
    expect(remove([0, 1], 1)).toEqual([0]);
    expect(remove([1, 0], 0)).toEqual([0]);
    expect(remove([false, true], 1)).toEqual([false]);
    expect(remove([true, false], 0)).toEqual([false]);
    expect(remove(['', 'hello'], 1)).toEqual(['']);
    expect(remove(['hello', ''], 0)).toEqual(['']);
    expect(remove([0, false, ''], 1)).toEqual([0, '']);
  });

  it('preserve falsy elements when removing with empty indexes or from sparse arrays', () => {
    expect(remove([0], [])).toEqual([0]);
    expect(remove([false], [])).toEqual([false]);
    expect(remove([''], [])).toEqual(['']);

    expect(remove([, , 0, ,], 1)).toEqual([undefined, 0, undefined]);
    expect(remove([, , false, null], [0, 1])).toEqual([false, null]);
  });
});
