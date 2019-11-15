import assignWatchFields from './assignWatchFields';

describe('assignWatchFields', () => {
  test('should return undefined when field values is empty object or undefined', () => {
    expect(assignWatchFields({}, '', new Set(''), {})).toEqual(undefined);
  });

  test('should return watched value and update watchFields', () => {
    const watchFields = new Set();
    expect(
      assignWatchFields({ test: '' }, 'test', watchFields as any, {}),
    ).toEqual('');
    expect(watchFields).toEqual(new Set(['test']));
  });

  test('should get array fields value', () => {
    const watchFields = new Set();
    expect(
      assignWatchFields(
        { 'test[0]': '', 'test[1]': '' },
        'test',
        watchFields as any,
        {},
      ),
    ).toEqual(['', '']);
    expect(watchFields).toEqual(new Set(['test[0]', 'test[1]']));
  });

  test('should return default value correctly', () => {
    expect(
      assignWatchFields({ a: true }, 'b', new Set(), { b: true } as any),
    ).toEqual(true);
  });
});
