import assignWatchFields from './assignWatchFields';

describe('assignWatchFields', () => {
  it('should return undefined when field values is empty object or undefined', () => {
    expect(assignWatchFields<any>({}, '', {}, new Set(''))).toEqual(undefined);
  });

  it('should return watched value and update watchFields', () => {
    const watchFields = new Set<string>();
    expect(
      assignWatchFields<any>({ test: '' }, 'test', {}, watchFields),
    ).toEqual('');
    expect(watchFields).toEqual(new Set(['test']));
  });

  it('should get array fields value', () => {
    const watchFields = new Set<string>();
    expect(
      assignWatchFields<any>({ test: ['', ''] }, 'test', {}, watchFields),
    ).toEqual(['', '']);
    expect(watchFields).toEqual(new Set(['test', 'test[0]', 'test[1]']));
  });

  it('should return default value correctly', () => {
    expect(
      assignWatchFields<any>({ a: true }, 'b', { b: true }, new Set()),
    ).toEqual(true);
  });

  it('should return undefined when there is no value match', () => {
    expect(assignWatchFields<any>({}, 'test', 'test', new Set())).toEqual(
      undefined,
    );
  });

  it('should not append to more watchFields when value is null or undefined', () => {
    const watchFields = new Set<string>();

    expect(
      assignWatchFields<any>(
        {
          test: {
            test: null,
          },
        },
        'test.test',
        'test',
        watchFields,
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
        'test',
        watchFields,
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
        'test',
        watchFields,
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
        'test',
        watchFields,
      ),
    ).toEqual(false);

    expect(watchFields).toEqual(new Set(['test.test']));
  });
});
