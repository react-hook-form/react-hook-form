import getFieldValueAs from '../../logic/getFieldValueAs';

describe('getFieldValueAs', () => {
  it('should return undefined when value is undefined', () => {
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
  it('should return NaN when value is empty string ""', () => {
    expect(
      getFieldValueAs('', {
        ref: {
          name: 'test',
        },
        name: 'test',
        valueAsNumber: true,
        valueAsDate: false,
      }),
    ).toBeNaN();
  });
  it('should return NaN when value is whitespace string " "', () => {
    expect(
      getFieldValueAs(' ', {
        ref: {
          name: 'test',
        },
        name: 'test',
        valueAsNumber: true,
        valueAsDate: false,
      }),
    ).toBeNaN();
  });
});
