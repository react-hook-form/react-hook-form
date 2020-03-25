import assignWatchFields from './assignWatchFields';

describe('assignWatchFields', () => {
  test('should return undefined when field values is empty object or undefined', () => {
    expect(assignWatchFields<any>({}, '', new Set(''), {})).toEqual(undefined);
  });

  test('should return watched value and update watchFields', () => {
    const watchFields = new Set();
    expect(
      assignWatchFields<any>({ test: '' }, 'test', watchFields as any, {}),
    ).toEqual('');
    expect(watchFields).toEqual(new Set(['test']));
  });

  test('should get array fields value', () => {
    const watchFields = new Set();
    expect(
      assignWatchFields<any>(
        { 'test[0]': '', 'test[1]': '' },
        'test',
        watchFields as any,
        {},
      ),
    ).toEqual(['', '']);
    expect(watchFields).toEqual(new Set(['test', 'test[0]', 'test[1]']));
  });

  test('should return default value correctly', () => {
    expect(
      assignWatchFields<any>({ a: true }, 'b', new Set(), { b: true } as any),
    ).toEqual(true);
  });

  test('should return watchFieldArray when nothing is defined and watchFieldArray is exist', () => {
    expect(
      assignWatchFields<any>({}, 'test', new Set(), {}, [
        { data: 'test' },
      ] as any),
    ).toEqual([{ data: 'test' }]);
  });

  test('should return watchFieldArray when value length is not matching watchFieldArray length', () => {
    expect(
      assignWatchFields<any>(
        { 'test[0]': '', 'test[1]': '' },
        'test',
        new Set(),
        {},
        [{ data: 'test' }] as any,
      ),
    ).toEqual([{ data: 'test' }]);
  });

  test('should return combinedDefaultValues when there is no value match', () => {
    expect(
      assignWatchFields<any>(
        {},
        'test',
        new Set(),
        'test' as any,
        undefined as any,
      ),
    ).toEqual('test');
  });
});
