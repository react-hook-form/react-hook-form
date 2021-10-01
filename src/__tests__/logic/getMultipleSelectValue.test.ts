import getMultipleSelectValue from '../../logic/getMultipleSelectValue';

describe('getMultipleSelectValue', () => {
  it('should return selected values', () => {
    expect(
      getMultipleSelectValue([
        { selected: true, value: 'test' } as HTMLOptionElement,
      ]),
    ).toEqual(['test']);
  });
});
