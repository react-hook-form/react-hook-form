import getFieldArrayParentName from './getFieldArrayParentName';

describe('getFieldArrayParentName', () => {
  it('should return parent name when name is field array', () => {
    expect(getFieldArrayParentName('test[0]')).toBe('test');
  });

  it('should return empty string when name is not field array', () => {
    expect(getFieldArrayParentName('test')).toBe('');
  });
});
