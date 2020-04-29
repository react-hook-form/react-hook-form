import getMultipleSelectValue from './getMultipleSelectValue';

describe('getMultipleSelectValue', () => {
  it('should return selected values', () => {
    expect(
      // @ts-ignore
      getMultipleSelectValue([{ selected: true, value: 'test' }]),
    ).toEqual(['test']);
  });
});
