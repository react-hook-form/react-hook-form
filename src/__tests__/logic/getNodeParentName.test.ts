import getFieldArrayParentName from '../../logic/getNodeParentName';

describe('getFieldArrayParentName', () => {
  it('should return parent name when name is field array', () => {
    expect(getFieldArrayParentName('test.0')).toBe('test');
    expect(getFieldArrayParentName('test[0]')).toBe('test');
    expect(getFieldArrayParentName('test.0.data.0')).toBe('test');
    expect(getFieldArrayParentName('test.data.0')).toBe('test.data');
  });

  it('should return empty string when name is not field array', () => {
    expect(getFieldArrayParentName('test')).toBe('test');
    expect(getFieldArrayParentName('test0')).toBe('test0');
    expect(getFieldArrayParentName('te1st')).toBe('te1st');
  });
});
