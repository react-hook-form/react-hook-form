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
});
