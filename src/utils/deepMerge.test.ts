import { deepMerge } from './deepMerge';

describe('deepMerge', () => {
  it('should deep merge object correctly', () => {
    expect(
      deepMerge(
        { test: { value: 1, data: { test: 1 } } },
        { test: { value2: 2 } },
      ),
    ).toEqual({
      test: { value: 1, value2: 2, data: { test: 1 } },
    });

    expect(deepMerge({ test: { value: 1 } }, {})).toEqual({
      test: { value: 1 },
    });

    expect(deepMerge({}, { test: [{ value: '1' }] })).toEqual({
      test: [{ value: '1' }],
    });

    expect(deepMerge({ data: {} }, { test: [{ value: '1' }] })).toEqual({
      data: {},
      test: [{ value: '1' }],
    });
  });

  it('should overwrite array value ', () => {
    expect(
      deepMerge({ test: [{ value: '2' }] }, { test: [{ value: '1' }] }),
    ).toEqual({
      test: [{ value: '1' }],
    });
  });

  it('should overwrite different data type', () => {
    expect(deepMerge({ test: [{ value: '2' }] }, { test: {} })).toEqual({
      test: {},
    });
  });

  it('should not merge object with date type', () => {
    expect(
      deepMerge({ test: new Date() }, { test: new Date('1999-02-02') }),
    ).toEqual({
      test: new Date('1999-02-02'),
    });
  });

  it('should deep merge array values  ', () => {
    expect(deepMerge([{ hey: 'test' }], [{ id: 'id', text: '' }])).toEqual([
      { hey: 'test', id: 'id', text: '' },
    ]);

    expect(deepMerge([{ id: 'id', text: '' }], [{ hey: 'test' }])).toEqual([
      { hey: 'test', id: 'id', text: '' },
    ]);

    expect(
      deepMerge(
        {
          test: [{ id: 'id', text: '' }],
        },
        {
          test: [{ hey: 'test' }],
        },
      ),
    ).toEqual({
      test: [{ hey: 'test', id: 'id', text: '' }],
    });
  });
});
