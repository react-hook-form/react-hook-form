import omitValidFields from './omitValidFields';

describe('omitValidFields', () => {
  it('should omit valid fields from errors', () => {
    expect(
      omitValidFields(
        {
          // @ts-ignore
          test: 'bill',
          // @ts-ignore
          test1: 'luo',
        },
        ['test'],
      ),
    ).toEqual({
      test1: 'luo',
    });
  });
});
