import deepEqual from '../../utils/deepEqual';

describe('deepEqual', () => {
  it('should return false when two sets not match', () => {
    expect(
      deepEqual([{ test: '123' }, { test: '455' }, { test: '455' }], []),
    ).toBeFalsy();

    expect(
      deepEqual(
        [{ test: '123' }, { test: '455' }, { test: '455' }],
        [{ test: '123' }, { test: '455' }, { test: '455', test1: 'what' }],
      ),
    ).toBeFalsy();

    expect(deepEqual([{}], [])).toBeFalsy();

    expect(deepEqual([], [{}])).toBeFalsy();
    expect(deepEqual(new Date(), new Date('1999'))).toBeFalsy();

    expect(
      deepEqual(
        {
          unknown: undefined,
          userName: '',
          fruit: '',
        },
        {
          userName: '',
          fruit: '',
          break: {},
        },
      ),
    ).toBeFalsy();
  });

  it('should return false when either type is primitive', () => {
    expect(deepEqual(null, [])).toBeFalsy();
    expect(deepEqual([], null)).toBeFalsy();
    expect(deepEqual({}, undefined)).toBeFalsy();
    expect(deepEqual(undefined, {})).toBeFalsy();
  });

  it('should return true when two sets matches', () => {
    expect(
      deepEqual([{ name: 'useFieldArray' }], [{ name: 'useFieldArray' }]),
    ).toBeTruthy();

    expect(
      deepEqual(
        [{ test: '123' }, { test: '455' }, { test: '455' }],
        [{ test: '123' }, { test: '455' }, { test: '455' }],
      ),
    ).toBeTruthy();

    expect(deepEqual({}, {})).toBeTruthy();

    expect(deepEqual([], [])).toBeTruthy();

    expect(
      deepEqual(
        [{ test: '123' }, { test: '455' }],
        [{ test: '123' }, { test: '455' }],
      ),
    ).toBeTruthy();

    expect(
      deepEqual(
        [
          {
            test: '123',
            nestedArray: [{ test: '123' }, { test: '455' }, { test: '455' }],
          },
          {
            test: '455',
            nestedArray: [{ test: '123' }, { test: '455' }, { test: '455' }],
          },
        ],
        [
          {
            test: '123',
            nestedArray: [{ test: '123' }, { test: '455' }, { test: '455' }],
          },
          {
            test: '455',
            nestedArray: [{ test: '123' }, { test: '455' }, { test: '455' }],
          },
        ],
      ),
    ).toBeTruthy();
  });

  it('should compare date time object valueOf', () => {
    expect(
      deepEqual({ test: new Date('1990') }, { test: new Date('1990') }),
    ).toBeTruthy();
  });

  it('should compare set object', () => {
    expect(deepEqual(new Set([1, 2]), new Set([2, 1]))).toBeTruthy();

    expect(deepEqual(new Set([1, 2]), new Set([1, 1, 2]))).toBeTruthy();

    expect(deepEqual(new Set([[1, 2]]), new Set([[1, 3, 2]]))).toBeFalsy();

    expect(
      deepEqual(
        new Set([
          { test: '123' },
          {
            test: [
              1,
              2,
              {
                test: '345',
              },
            ],
          },
          1,
          2,
        ]),
        new Set([
          {
            test: [
              1,
              2,
              {
                test: '345',
              },
            ],
          },
          1,
          2,
          { test: '123' },
        ]),
      ),
    ).toBeTruthy();
  });
});
