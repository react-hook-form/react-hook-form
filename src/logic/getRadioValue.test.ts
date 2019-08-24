import getRadioValue from './getRadioValue';

describe('getRadioValue', () => {
  it('should return default value if not valid or empty options', () => {
    expect(getRadioValue(undefined)).toEqual({
      isValid: false,
      value: '',
    });
  });

  it('should return valid to true when value found', () => {
    expect(
      getRadioValue([
        { ref: { name: 'bill', checked: false, value: '1' } },
        { ref: { name: 'bill', checked: true, value: '2' } },
      ]),
    ).toEqual({
      isValid: true,
      value: '2',
    });
  });
});
