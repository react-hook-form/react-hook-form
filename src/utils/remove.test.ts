import remove from './remove';

test('should remove item accordingly', () => {
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
    { type: 'required', message: '', ref: 'test' },
    { type: 'required', message: '', ref: 'test' },
  ]);

  expect(remove([true, true, true], [1])).toEqual([true, true]);
  expect(remove([true, true, true], [0])).toEqual([true, true]);
});

test('should remove all items', () => {
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
