import compareObject from './compareObject';

describe('compareObjects', () => {
  it('should return true when object are the same', () => {
    expect(compareObject({ min: 'test' }, { min: 'test' })).toBeTruthy();
    expect(compareObject({ min: true }, { min: true })).toBeTruthy();
  });

  it('should return false when object are not the same', () => {
    expect(compareObject({ min: 'test' }, { min: 'test1' })).toBeFalsy();
    expect(compareObject({ min: true }, { min: false })).toBeFalsy();
  });

  it('should return false when object length is not equal', () => {
    expect(
      compareObject({ min: 'test' }, { min: 'test', what: 'test' }),
    ).toBeFalsy();
  });
});
