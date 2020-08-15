import assignWatchFields from './assignWatchFields';

describe('assignWatchFields', () => {
  it('should return undefined when field values is empty object or undefined', () => {
    expect(assignWatchFields<any>({}, '', new Set(''), {})).toEqual(undefined);
  });

  it('should return watched value and update watchFields', () => {
    const watchFields = new Set();
    expect(
      assignWatchFields<any>({ test: '' }, 'test', watchFields as any, {}),
    ).toEqual('');
    expect(watchFields).toEqual(new Set(['test']));
  });

  it('should get array fields value', () => {
    const watchFields = new Set();
    expect(
      assignWatchFields<any>(
        { test: ['', ''] },
        'test',
        watchFields as any,
        {},
      ),
    ).toEqual(['', '']);
    expect(watchFields).toEqual(new Set(['test', 'test[0]', 'test[1]']));
  });

  it('should return default value correctly', () => {
    expect(
      assignWatchFields<any>({ a: true }, 'b', new Set(), { b: true } as any),
    ).toEqual(true);
  });

  it('should return undefined when there is no value match', () => {
    expect(
      assignWatchFields<any>({}, 'test', new Set(), 'test' as any),
    ).toEqual(undefined);
  });

  it('should not append to more watchFields when value is null or undefined', () => {
    const watchFields = new Set();

    expect(
      assignWatchFields<any>(
        {
          test: {
            test: null,
          },
        },
        'test.test',
        watchFields as any,
        'test' as any,
      ),
    ).toEqual(null);

    expect(watchFields).toEqual(new Set(['test.test']));

    expect(
      assignWatchFields<any>(
        {
          test: {
            test: undefined,
          },
        },
        'test.test',
        watchFields as any,
        'test' as any,
      ),
    ).toEqual(undefined);

    expect(watchFields).toEqual(new Set(['test.test']));

    expect(
      assignWatchFields<any>(
        {
          test: {
            test: '123',
          },
        },
        'test.test',
        watchFields as any,
        'test' as any,
      ),
    ).toEqual('123');

    expect(watchFields).toEqual(new Set(['test.test']));

    expect(
      assignWatchFields<any>(
        {
          test: {
            test: false,
          },
        },
        'test.test',
        watchFields as any,
        'test' as any,
      ),
    ).toEqual(false);

    expect(watchFields).toEqual(new Set(['test.test']));
  });
});
