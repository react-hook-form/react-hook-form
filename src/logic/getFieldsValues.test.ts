import getFieldsValues from './getFieldsValues';

describe('getFieldsValues', () => {
  it('should return all fields value', () => {
    expect(
      getFieldsValues({
        current: {
          test: {
            __field: {
              name: 'test',
              ref: { name: 'test' },
              value: 'test',
            },
          },
          test1: {
            __field: {
              name: 'test1',
              ref: { name: 'test1' },
              value: 'test',
            },
          },
        },
      }),
    ).toEqual({
      test: 'test',
      test1: 'test',
    });
  });

  it('should return searched string with fields value', () => {
    expect(
      getFieldsValues({
        current: {
          test: {
            __field: {
              name: 'test',
              ref: { name: 'test' },
              value: 'test',
            },
          },
          tex: {
            __field: {
              name: 'test1',
              ref: { name: 'test1' },
              value: 'test',
            },
          },
          tex123: {
            __field: {
              name: 'test123',
              ref: { name: 'test123' },
              value: 'test',
            },
          },
        },
      }),
    ).toEqual({
      test: 'test',
      tex: 'test',
      tex123: 'test',
    });
  });

  it('should return searched array string with fields value', () => {
    expect(
      getFieldsValues({
        current: {
          test: {
            __field: {
              name: 'test',
              ref: { name: 'test' },
              value: 'test',
            },
          },
          tex: {
            __field: {
              name: 'tex',
              ref: { name: 'tex' },
              value: 'test',
            },
          },
          whattest123: {
            __field: {
              name: 'whattest123',
              ref: { name: 'test123' },
              value: 'test',
            },
          },
          156: {
            __field: {
              name: '156',
              ref: { name: 'test1456s' },
              value: 'test',
            },
          },
        },
      }),
    ).toEqual({
      156: 'test',
      test: 'test',
      tex: 'test',
      whattest123: 'test',
    });
  });

  it('should return unmounted values', () => {
    expect(
      getFieldsValues({
        current: {
          test: {
            __field: {
              name: 'test',
              ref: { name: 'test' },
              value: 'test',
            },
          },
          test1: {
            __field: {
              name: 'test1',
              ref: {
                name: 'test1',
              },
              value: 'test',
            },
          },
        },
      }),
    ).toEqual({
      test: 'test',
      test1: 'test',
    });
  });

  it('should return nested value', () => {
    expect(
      getFieldsValues({
        current: {
          ['test.test']: {
            __field: {
              name: 'test',
              ref: { name: 'test' },
              value: 'test',
            },
          },
          ['test.test1']: {
            __field: {
              name: 'test',
              ref: { name: 'test' },
              value: 'test',
            },
          },
        },
      }),
    ).toEqual({
      test: {
        test: 'test',
        test1: 'test',
      },
    });
  });
});
