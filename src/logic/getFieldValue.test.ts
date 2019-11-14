import getFieldValue from './getFieldValue';

jest.mock('./getRadioValue', () => ({
  default: () => ({
    value: 2,
  }),
}));

jest.mock('./getMultipleSelectValue', () => ({
  default: () => 3,
}));

jest.mock('./getCheckboxValue', () => ({
  default: () => ({
    value: 'testValue',
  }),
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

  it('should return the correct value when type is checkbox', () => {
    expect(
      getFieldValue(
        {
          test: { ref: 'test' },
        },
        {
          type: 'checkbox',
          name: 'test',
        },
      ),
    ).toBe('testValue');
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

  it('should return false when checkbox input value is not found', () => {
    expect(
      getFieldValue(
        {},
        {
          type: 'checkbox',
          value: 'value',
          name: 'test',
        },
      ),
    ).toBeFalsy();
  });

  it('should return files for input type file', () => {
    expect(
      getFieldValue(
        {
          test: {
            ref: {
              files: 'files',
            },
          },
        },
        {
          type: 'file',
          files: 'files',
        },
      ),
    ).toEqual('files');
  });
});
