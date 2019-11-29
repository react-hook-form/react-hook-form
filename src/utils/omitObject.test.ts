import omitObject from './omitObject';

describe('omitObject', () => {
  it('should omit object correct', () => {
    expect(omitObject({ test: 'what', test1: 'test1' }, 'test')).toEqual({
      test1: 'test1',
    });
  });
});
