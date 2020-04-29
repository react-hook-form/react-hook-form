import getFieldValue from './getFieldValue';

jest.mock('./getRadioValue', () => ({
  default: () => ({
    value: 2,
  }),
}));
jest.mock('./getMultipleSelectValue', () => ({
  default: () => 3,
}));

describe('getFieldValue', () => {
  it('should return correct value when type is radio', () => {
    expect(
      getFieldValue(
        {
          test: {
            ref: 'test',
          },
        },
        {
          type: 'radio',
          name: 'test',
        },
      ),
    ).toBe(2);
  });

  it('should return teh correct select value when type is select-multiple', () => {
    expect(
      getFieldValue(
        {
          test: {
            ref: {
              name: 'bill',
              value: 'test',
            },
          },
        },
        {
          type: 'select-multiple',
          name: 'bill',
        },
      ),
    ).toBe(3);
  });

  it('should return checked value if type is checked', () => {
    expect(
      getFieldValue(
        {
          test: {
            ref: {
              name: 'bill',
              value: 'test',
            },
          },
        },
        {
          type: 'checkbox',
          checked: 'test',
        },
      ),
    ).toBeTruthy();
  });

  it('should return checked if type is checked without value', () => {
    expect(
      getFieldValue(
        {
          test: {
            ref: {
              name: 'bill',
            },
          },
        },
        {
          type: 'checkbox',
          checked: true,
        },
      ),
    ).toBeTruthy();
  });

  it('should return it value for other types', () => {
    expect(
      getFieldValue(
        {
          test: {
            ref: {
              name: 'bill',
              value: 'test',
            },
          },
        },
        {
          type: 'text',
          value: 'value',
        },
      ),
    ).toBe('value');
  });

  it('should return empty string when radio input value is not found', () => {
    expect(
      getFieldValue(
        {},
        {
          type: 'radio',
          value: 'value',
          name: 'test',
        },
      ),
    ).toEqual('');
  });

  it('should return false when checkbox is not checked', () => {
    expect(
      getFieldValue(
        {
          test: {
            ref: {
              checked: false,
            },
          },
        },
        {
          type: 'checkbox',
          value: 'value',
          name: 'test',
        },
      ),
    ).toBeFalsy();
  });
});
