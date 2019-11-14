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
      getFieldValue({
        type: 'radio',
        name: 'test',
      }),
    ).toBe(2);
  });

  it('should return teh correct select value when type is select-multiple', () => {
    expect(
      getFieldValue({
        type: 'select-multiple',
        name: 'bill',
      }),
    ).toBe(3);
  });

  it('should return the correct value when type is checkbox', () => {
    expect(
      getFieldValue({
        type: 'checkbox',
        name: 'test',
      }),
    ).toBe('testValue');
  });

  it('should return it value for other types', () => {
    expect(
      getFieldValue({
        type: 'text',
        value: 'value',
      }),
    ).toBe('value');
  });

  it('should return empty string when radio input value is not found', () => {
    expect(
      getFieldValue({
        type: 'radio',
        value: 'value',
        name: 'test',
      }),
    ).toEqual('');
  });

  it('should return false when checkbox input value is not found', () => {
    expect(
      getFieldValue({
        type: 'checkbox',
        value: 'value',
        name: 'test',
      }),
    ).toBeFalsy();
  });

  it('should return files for input type file', () => {
    expect(
      getFieldValue({
        type: 'file',
        files: 'files',
      }),
    ).toEqual('files');
  });
});
