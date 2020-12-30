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
      getCheckboxValue([
        {
          name: 'bill',
          checked: true,
          value: '3',
          attributes: { value: '3' },
        } as any,
      ]),
    ).toEqual({ value: '3', isValid: true });
  });

  it('should return true if single checkbox is checked and has no value', () => {
    expect(
      getCheckboxValue([
        { name: 'bill', checked: true, attributes: {} } as any,
      ]),
    ).toEqual({ value: true, isValid: true });
  });

  it('should return true if single checkbox is checked and has empty value', () => {
    expect(
      getCheckboxValue([
        {
          name: 'bill',
          checked: true,
          value: '',
          attributes: { value: 'test' },
        } as any,
      ]),
    ).toEqual({ value: true, isValid: true });
    expect(
      getCheckboxValue([
        {
          name: 'bill',
          checked: true,
          attributes: { value: 'test' },
        } as any,
      ]),
    ).toEqual({ value: true, isValid: true });
  });

  it('should return false if single checkbox is un-checked', () => {
    expect(
      getCheckboxValue([
        {
          name: 'bill',
          checked: false,
          attributes: {},
        } as any,
      ]),
    ).toEqual({ value: false, isValid: false });
  });

  it('should return multiple selected values', () => {
    expect(
      getCheckboxValue([
        {
          name: 'bill',
          checked: true,
          value: '2',
          attributes: { value: '2' },
        } as any,
        {
          name: 'bill',
          checked: true,
          value: '3',
          attributes: { value: '3' },
        } as any,
      ]),
    ).toEqual({ value: ['2', '3'], isValid: true });
  });

  it('should return values for checked boxes only', () => {
    expect(
      getCheckboxValue([
        {
          name: 'bill',
          checked: false,
          value: '2',
          attributes: { value: '2' },
        } as any,
        {
          name: 'bill',
          checked: true,
          value: '3',
          attributes: { value: '3' },
        } as any,
        {
          name: 'bill',
          checked: false,
          value: '4',
          attributes: { value: '4' },
        } as any,
      ]),
    ).toEqual({ value: ['3'], isValid: true });
  });

  it('should return empty array for multi checkbox with no checked box', () => {
    expect(
      getCheckboxValue([
        {
          name: 'bill',
          checked: false,
          value: '2',
          attributes: { value: '2' },
        } as any,
        {
          name: 'bill',
          checked: false,
          value: '3',
          attributes: { value: '3' },
        } as any,
      ]),
    ).toEqual({ value: [], isValid: false });
  });

  it('should not return error when check box ref is undefined', () => {
    expect(
      getCheckboxValue([
        undefined as any,
        {
          name: 'bill',
          checked: false,
          value: '2',
          attributes: { value: '2' },
        } as any,
      ]),
    ).toEqual({ value: [], isValid: false });
  });
});
