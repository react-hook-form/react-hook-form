import stringToPath from './stringToPath';

describe('stringToPath', () => {
  it('should convert string to path', () => {
    expect(stringToPath('test.test[2].data')).toEqual([
      'test',
      'test',
      2,
      'data',
    ]);

    expect(stringToPath('test.test["2"].data')).toEqual([
      'test',
      'test',
      '2',
      'data',
    ]);
  });
});
