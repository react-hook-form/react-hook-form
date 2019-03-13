import getFieldValue from './getFieldValue';

jest.mock('./getRadioValue', () => () => ({ value: 2 }));
jest.mock('./getMultipleSelectValue', () => () => 3);

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

  it('should return checked status if type is checked', () => {
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
});
