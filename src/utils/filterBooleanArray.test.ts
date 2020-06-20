import { filterBooleanArray } from './filterBooleanArray';

describe('filterBooleanArray', () => {
  it('should be filtered array', () => {
    expect(
      filterBooleanArray([
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
    expect(filterBooleanArray({ test: 'test', test1: 'test1' })).toEqual([
      {
        test: true,
        test1: true,
      },
    ]);
  });

  it('should be filtered string', () => {
    expect(filterBooleanArray('test')).toEqual([true]);
  });
});
