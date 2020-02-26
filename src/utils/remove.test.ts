import remove from './remove';

test('should remove item accordingly', () => {
  expect(
    remove([, , { type: 'required', message: '', ref: 'test' }], 1),
  ).toEqual([undefined, { type: 'required', message: '', ref: 'test' }]);

  expect(
    remove([, , { type: 'required', message: '', ref: 'test' }], [1, 2]),
  ).toEqual([undefined]);

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
  ).toEqual([, , null, ,]);

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
    ,
    { type: 'required', message: '', ref: 'test' },
    { type: 'required', message: '', ref: 'test' },
    ,
  ]);
});
