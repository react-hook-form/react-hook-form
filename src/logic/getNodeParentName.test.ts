import getFieldArrayParentName from './getNodeParentName';

describe('getFieldArrayParentName', () => {
  it('should return parent name when name is field array', () => {
    expect(getFieldArrayParentName('test[0]')).toBe('test');
    expect(getFieldArrayParentName('test[0].data[0]')).toBe('test');
    expect(getFieldArrayParentName('test.data[0]')).toBe('test.data');
  });

  it('should return empty string when name is not field array', () => {
    expect(getFieldArrayParentName('test')).toBe('');
  });
});
