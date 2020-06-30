// @ts-nocheck
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
          current: {
            test: {
              ref: {
                type: 'radio',
              },
            },
          },
        },
        'test',
      ),
    ).toBe(2);
  });

  it('should return the correct select value when type is select-multiple', () => {
    expect(
      getFieldValue(
        {
          current: {
            test: {
              ref: {
                type: 'select-multiple',
                name: 'test',
                value: 'test',
              },
            },
          },
        },
        'test',
      ),
    ).toBe(3);
  });

  it('should return the correct value when type is checkbox', () => {
    expect(
      getFieldValue(
        {
          current: {
            test: {
              ref: {
                name: 'test',
                type: 'checkbox',
              },
            },
          },
        },
        'test',
      ),
    ).toBe('testValue');
  });

  it('should return it value for other types', () => {
    expect(
      getFieldValue(
        {
          current: {
            test: {
              ref: {
                type: 'text',
                name: 'bill',
                value: 'value',
              },
            },
          },
        },
        'test',
      ),
    ).toBe('value');
  });

  it('should return empty string when radio input value is not found', () => {
    expect(getFieldValue({ current: {} }, '')).toEqual(undefined);
  });

  it('should return false when checkbox input value is not found', () => {
    expect(
      getFieldValue(
        { current: {} },
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
          current: {
            test: {
              ref: {
                type: 'file',
                name: 'test',
                files: 'files',
              },
            },
          },
        },
        'test',
      ),
    ).toEqual('files');
  });

  it('should return undefined when input is not found', () => {
    expect(
      getFieldValue(
        {
          current: {
            test: {
              ref: {
                files: 'files',
              },
            },
          },
        },
        {},
      ),
    ).toEqual(undefined);
  });

  it('should return unmount field value when field is not found', () => {
    expect(
      getFieldValue(
        {
          current: {
            test: {
              ref: {
                files: 'files',
              },
            },
          },
        },
        'what',
        { current: { what: 'data' } },
      ),
    ).toEqual('data');
  });
});
