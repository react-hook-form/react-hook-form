import getFieldsValues from './getFieldsValues';
import getFieldValue from './getFieldValue';

jest.mock('./getFieldValue');

describe('getFieldsValues', () => {
  it('should return all fields value', () => {
    // @ts-ignore
    getFieldValue.mockImplementation(() => 'test');
    expect(
      getFieldsValues({
        current: {
          test: {
            name: 'test',
            ref: { name: 'test' },
          },
          test1: {
            name: 'test1',
            ref: { name: 'test1' },
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
      getFieldsValues(
        {
          current: {
            test: {
              name: 'test',
              ref: { name: 'test' },
            },
            tex: {
              name: 'test1',
              ref: { name: 'test1' },
            },
            tex123: {
              name: 'test123',
              ref: { name: 'test123' },
            },
          },
        },
        false,
        'test',
      ),
    ).toEqual({
      test: 'test',
    });
  });

  it('should return searched array string with fields value', () => {
    expect(
      getFieldsValues(
        {
          current: {
            test: {
              name: 'test',
              ref: { name: 'test' },
            },
            tex: {
              name: 'test1',
              ref: { name: 'test1' },
            },
            test123: {
              name: 'test123',
              ref: { name: 'test123' },
            },
            test1456: {
              name: '146',
              ref: { name: 'test1' },
            },
          },
        },
        false,
        ['test', 'tex'],
      ),
    ).toEqual({
      test: 'test',
      tex: 'test',
    });
  });

  it('should return unmounted values', () => {
    expect(
      getFieldsValues({
        current: {
          test: {
            name: 'test',
            ref: { name: 'test' },
          },
        },
      }),
    ).toEqual({
      test: 'test',
      test1: 'test',
    });
  });

  it('should combined unmounted flat form values with form values', () => {
    // @ts-ignore
    getFieldValue.mockImplementation(() => 'test');
    expect(
      getFieldsValues({
        current: {
          test: {
            name: 'test',
            ref: { name: 'test' },
          },
        },
      }),
    ).toEqual({
      test: 'test',
      test1: 'test',
      test2: {
        test: 'test1',
      },
    });
  });
});
