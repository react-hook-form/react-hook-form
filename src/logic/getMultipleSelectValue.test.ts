import getMultipleSelectValue from './getMultipleSelectValue';

describe('getMultipleSelectValue', () => {
  it('should return selected values', () => {
    // @ts-ignore
    expect(getMultipleSelectValue([{ selected: true, value: 'test' }])).toEqual(['test']);
  });
});
