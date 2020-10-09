import fillBooleanArray from './fillBooleanArray';

describe('filterBooleanArray', () => {
  it('should be filtered array', () => {
    expect(
      fillBooleanArray([
        { test: 'test', test1: 'test1' },
        'test2',
        { test3: 'test3', test4: 'test4' },
      ]),
    ).toEqual([
      {
        test: true,
        test1: true,
      },
      true,
      { test3: true, test4: true },
    ]);
  });

  it('should be filtered object', () => {
    expect(fillBooleanArray({ test: 'test', test1: 'test1' })).toEqual([
      {
        test: true,
        test1: true,
      },
    ]);
  });

  it('should be filtered string', () => {
    expect(fillBooleanArray('test')).toEqual([true]);
  });
});
