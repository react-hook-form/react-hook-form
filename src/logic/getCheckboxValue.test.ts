import getCheckboxValue from './getCheckboxValue';

describe('getCheckboxValue', () => {
  it('should return default value if not valid or empty options', () => {
    expect(getCheckboxValue(undefined)).toEqual({
      value: false,
      isValid: false,
    });
  });

  it('should return checked value if single checkbox is checked', () => {
    expect(
      getCheckboxValue([{ ref: { name: 'bill', checked: true, value: '3' } }]),
    ).toEqual({ value: '3', isValid: true });
  });

  it('should return true if single checkbox is checked and has no value', () => {
    expect(
      getCheckboxValue([{ ref: { name: 'bill', checked: true } }]),
    ).toEqual({ value: true, isValid: true });
  });

  it('should return false if single checkbox is un-checked', () => {
    expect(
      getCheckboxValue([{ ref: { name: 'bill', checked: false, value: '1' } }]),
    ).toEqual({ value: false, isValid: false });
  });

  it('should return multiple selected values', () => {
    expect(
      getCheckboxValue([
        { ref: { name: 'bill', checked: true, value: '2' } },
        { ref: { name: 'bill', checked: true, value: '3' } },
      ]),
    ).toEqual({ value: ['2', '3'], isValid: true });
  });
  it('should return values for checked boxes only', () => {
    expect(
      getCheckboxValue([
        { ref: { name: 'bill', checked: false, value: '2' } },
        { ref: { name: 'bill', checked: true, value: '3' } },
        { ref: { name: 'bill', checked: false, value: '4' } },
      ]),
    ).toEqual({ value: ['3'], isValid: true });
  });
  it('should return empty array for multi checkbox with no checked box', () => {
    expect(
      getCheckboxValue([
        { ref: { name: 'bill', checked: false, value: '2' } },
        { ref: { name: 'bill', checked: false, value: '3' } },
      ]),
    ).toEqual({ value: [], isValid: false });
  });
});
