import getFieldsValues from '../../logic/getFieldsValues';

describe('getFieldsValues', () => {
  it('should return all fields value', () => {
    expect(
      getFieldsValues(
        {
          current: {
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
          },
        },
        { current: {} },
      ),
    ).toEqual({
      test: 'test',
      test1: 'test',
    });
  });

  it('should return searched string with fields value', () => {
    expect(
      getFieldsValues(
        {
          current: {
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
          },
        },
        { current: {} },
      ),
    ).toEqual({
      test: 'test',
      tex: 'test',
      tex123: 'test',
    });
  });

  it('should return searched array string with fields value', () => {
    expect(
      getFieldsValues(
        {
          current: {
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
          },
        },
        { current: {} },
      ),
    ).toEqual({
      156: 'test',
      test: 'test',
      tex: 'test',
      whattest123: 'test',
    });
  });

  it('should return unmounted values', () => {
    expect(
      getFieldsValues(
        {
          current: {
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
          },
        },
        { current: {} },
      ),
    ).toEqual({
      test: 'test',
      test1: 'test',
    });
  });

  it('should return nested value', () => {
    expect(
      getFieldsValues(
        {
          current: {
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
          },
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        test: 'test',
        test1: 'test',
      },
    });
  });

  it('should work with nested fieldsRef object', () => {
    expect(
      getFieldsValues(
        {
          current: {
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
        },
        { current: {} },
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
          current: {
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
        },
        { current: {} },
      ),
    ).toEqual({
      test2: ['test', 'test'],
    });
  });

  it('should shallow merge with default values', () => {
    expect(
      getFieldsValues(
        {
          current: {
            test1: {
              _f: {
                name: 'test.test',
                ref: { name: 'test.test' },
                value: 'test',
              },
            },
            // @ts-ignore
            test2: [],
          },
        },
        {
          current: {
            test: 'data',
            test2: [
              {
                test: 'test',
              },
            ],
          },
        },
      ),
    ).toEqual({ test1: 'test', test: 'data', test2: [] });
  });
});
