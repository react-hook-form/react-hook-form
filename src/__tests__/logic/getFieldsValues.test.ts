import getFieldsValues from '../../logic/getFieldsValues';

describe('getFieldsValues', () => {
  it('should return all fields value', () => {
    expect(
      getFieldsValues({
        test: {
          _f: {
            name: 'test',
            ref: { name: 'test' },
            value: 'test',
          },
        },
        test1: {
          _f: {
            name: 'test1',
            ref: { name: 'test1' },
            value: 'test',
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
        test: {
          _f: {
            name: 'test',
            ref: { name: 'test' },
            value: 'test',
          },
        },
        tex: {
          _f: {
            name: 'test1',
            ref: { name: 'test1' },
            value: 'test',
          },
        },
        tex123: {
          _f: {
            name: 'test123',
            ref: { name: 'test123' },
            value: 'test',
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
        test: {
          _f: {
            name: 'test',
            ref: { name: 'test' },
            value: 'test',
          },
        },
        tex: {
          _f: {
            name: 'tex',
            ref: { name: 'tex' },
            value: 'test',
          },
        },
        whattest123: {
          _f: {
            name: 'whattest123',
            ref: { name: 'test123' },
            value: 'test',
          },
        },
        156: {
          _f: {
            name: '156',
            ref: { name: 'test1456s' },
            value: 'test',
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
        test: {
          _f: {
            name: 'test',
            ref: { name: 'test' },
            value: 'test',
          },
        },
        test1: {
          _f: {
            name: 'test1',
            ref: {
              name: 'test1',
            },
            value: 'test',
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
        ['test.test']: {
          _f: {
            name: 'test',
            ref: { name: 'test' },
            value: 'test',
          },
        },
        ['test.test1']: {
          _f: {
            name: 'test',
            ref: { name: 'test' },
            value: 'test',
          },
        },
      }),
    ).toEqual({
      test: {
        test: 'test',
        test1: 'test',
      },
    });

    expect(
      getFieldsValues({
        users: [
          {
            name: {
              _f: {
                ref: {
                  name: 'users.0.name',
                },
                name: 'users.0.name',
                value: '1',
              },
            },
            company: {
              _f: {
                ref: {
                  name: 'users.0.company',
                },
                name: 'users.0.company',
                value: {
                  name: '2',
                },
              },
            },
          },
        ] as any,
      }),
    ).toEqual({
      users: [
        {
          company: {
            name: '2',
          },
          name: '1',
        },
      ],
    });
  });

  it('should work with nested fieldsRef object', () => {
    expect(
      getFieldsValues(
        {
          test2: {
            // @ts-ignore
            test: {
              _f: {
                name: 'test.test',
                ref: { name: 'test.test' },
                value: 'test',
              },
            },
            test1: {
              _f: {
                name: 'test.test1',
                ref: { name: 'test.test1' },
                value: 'test',
              },
            },
          },
        },
        {},
      ),
    ).toEqual({
      test2: {
        test: 'test',
        test1: 'test',
      },
    });
  });

  it('should work with array fieldsRef object', () => {
    expect(
      getFieldsValues(
        {
          // @ts-ignore
          test2: [
            {
              _f: {
                name: 'test.test',
                ref: { name: 'test.test' },
                value: 'test',
              },
            },
            {
              _f: {
                name: 'test.test1',
                ref: { name: 'test.test1' },
                value: 'test',
              },
            },
          ],
        },
        {},
      ),
    ).toEqual({
      test2: ['test', 'test'],
    });
  });

  it('should return undefined for disabled input', () => {
    expect(
      getFieldsValues({
        test1: {
          _f: {
            name: 'test.test',
            ref: { name: 'test.test', disabled: true },
            value: 'test',
          },
        },
      }),
    ).toEqual({ test1: undefined });
  });
});
