import assignWatchFields from './assignWatchFields';

describe('assignWatchFields', () => {
  test('should return undefined when field values is empty object or undefined', () => {
    expect(assignWatchFields({}, '', {})).toEqual(undefined);
  });

  test('should return watched value and update watchFields', () => {
    const watchFields = {};
    expect(assignWatchFields({ test: '' }, 'test', watchFields)).toEqual('');
    expect(watchFields).toEqual({ test: true });
  });

  test('should get array fields value', () => {
    const watchFields = {};
    expect(
      assignWatchFields({ 'test[0]': '', 'test[1]': '' }, 'test', watchFields),
    ).toEqual(['', '']);
    expect(watchFields).toEqual({ 'test[0]': true, 'test[1]': true });
  });
});
