import getFieldsValues from './getFieldsValues';
import getFieldValue from './getFieldValue';

jest.mock('./getFieldValue');

describe('getFieldsValues', () => {
  it('should return all fields value', () => {
    // @ts-ignore
    getFieldValue.mockImplementation(() => 'test');
    expect(
      getFieldsValues(
        {
          current: {
            test: {
              ref: { name: 'test' },
            },
            test1: {
              ref: { name: 'test1' },
            },
          },
        },
        {},
        false,
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
              ref: { name: 'test' },
            },
            tex: {
              ref: { name: 'test1' },
            },
            tex123: {
              ref: { name: 'test1' },
            },
          },
        },
        {},
        false,
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
              ref: { name: 'test' },
            },
            tex: {
              ref: { name: 'test1' },
            },
            123: {
              ref: { name: 'test1' },
            },
            1456: {
              ref: { name: 'test1' },
            },
          },
        },
        {},
        false,
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
      getFieldsValues(
        {
          current: {
            test: {
              ref: { name: 'test' },
            },
          },
        },
        {
          test1: 'test',
        },
        false,
      ),
    ).toEqual({
      test: 'test',
      test1: 'test',
    });
  });

  it('should combined unmounted flat form values with form values', () => {
    // @ts-ignore
    getFieldValue.mockImplementation(() => 'test');
    expect(
      getFieldsValues(
        {
          current: {
            test: {
              ref: { name: 'test' },
            },
          },
        },
        {
          test1: 'test',
          test2: {
            test: 'test1',
          },
        },
        false,
      ),
    ).toEqual({
      test: 'test',
      test1: 'test',
      test2: {
        test: 'test1',
      },
    });
  });
});
