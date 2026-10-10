import getFieldValue from '../../logic/getFieldValue';
import type { Field } from '../../types';

jest.mock('../../logic/getRadioValue', () => ({
  __esModule: true,
  default: () => ({
    value: 2,
  }),
}));

jest.mock('../../logic/getCheckboxValue', () => ({
  __esModule: true,
  default: () => ({
    value: 'testValue',
  }),
}));

describe('getFieldValue', () => {
  it('return correct value when type is radio', () => {
    expect(
      getFieldValue({
        name: 'test',
        ref: {
          type: 'radio',
          name: 'test',
        },
      }),
    ).toBe(2);
  });

  it('return the correct value when type is checkbox', () => {
    expect(
      getFieldValue({
        name: 'test',
        ref: {
          name: 'test',
          type: 'checkbox',
        },
      }),
    ).toBe('testValue');
  });

  it('return it value for other types', () => {
    expect(
      getFieldValue({
        name: 'test',
        ref: {
          type: 'text',
          name: 'bill',
          value: 'value',
        },
      }),
    ).toBe('value');
  });

  it('return empty string when radio input value is not found', () => {
    expect(getFieldValue({ ref: {} } as Field['_f'])).toEqual(undefined);
  });

  it('return files for input type file', () => {
    expect(
      getFieldValue({
        name: 'test',
        ref: {
          type: 'file',
          name: 'test',
          files: null,
        },
      }),
    ).toEqual(null);
  });

  it('return undefined when input is not found', () => {
    expect(
      getFieldValue({
        name: 'test',
        ref: {
          name: 'file',
          files: null,
        },
      }),
    ).toEqual(undefined);
  });
});
