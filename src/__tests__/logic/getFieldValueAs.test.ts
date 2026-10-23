import getFieldValueAs from '../../logic/getFieldValueAs';

describe('getFieldValueAs', () => {
  it('return undefined when value is undefined', () => {
    expect(
      getFieldValueAs(undefined, {
        ref: {
          name: 'test',
        },
        name: 'test',
        valueAsNumber: true,
        valueAsDate: false,
      }),
    ).toBeUndefined();
  });
  it('return null when value is empty string and valueAsDate is true', () => {
    expect(
      getFieldValueAs('', {
        ref: {
          name: 'test',
        },
        name: 'test',
        valueAsNumber: false,
        valueAsDate: true,
      }),
    ).toBeNull();
  });

  it('return Date object when value is a valid date string and valueAsDate is true', () => {
    expect(
      getFieldValueAs('2021-01-01', {
        ref: {
          name: 'test',
        },
        name: 'test',
        valueAsNumber: false,
        valueAsDate: true,
      }),
    ).toEqual(new Date('2021-01-01'));
  });
});
