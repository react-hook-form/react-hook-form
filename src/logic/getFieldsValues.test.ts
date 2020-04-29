import getFieldsValues from './getFieldsValues';
import getFieldValue from './getFieldValue';

jest.mock('./getFieldValue');

describe('getFieldValue', () => {
  it('should return undefined when nothing found', () => {
    expect(
      getFieldsValues(
        {
          test: {
            ref: {
              name: 'test1',
            },
          },
        },
        'test',
      ),
    ).toEqual({});
  });

  it('should return the value of seraching item with name', () => {
    // @ts-ignore
    getFieldValue.mockImplementation(() => 3);
    expect(
      getFieldsValues(
        {
          test: {
            ref: {
              name: 'test1',
            },
          },
        },
        'test1',
      ),
    ).toBe(3);
  });

  it('should return array of result when search term is array', () => {
    // @ts-ignore
    getFieldValue.mockImplementation(() => 3);
    expect(
      getFieldsValues(
        {
          test: {
            ref: {
              name: 'test1',
            },
          },
          test3: {
            ref: {
              name: 'test2',
            },
          },
          test2: {
            ref: {
              name: 'test3',
            },
          },
        },
        ['test1', 'test2', 'test3'],
      ),
    ).toEqual({ test1: 3, test2: 3, test3: 3 });
  });

  it('should return all result when nothing is specified', () => {
    // @ts-ignore
    getFieldValue.mockImplementation(() => 3);
    expect(
      getFieldsValues(
        {
          test: {
            ref: {
              name: 'test1',
            },
          },
          test1: {
            ref: {
              name: 'test2',
            },
          },
          test2: {
            ref: {
              name: 'test3',
            },
          },
          test3: {
            ref: {
              name: 'test4',
            },
          },
        },
      ),
    ).toEqual({ test3: 3, test1: 3, test2: 3, test4: 3 });
  });
});
