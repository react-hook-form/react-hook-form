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

  it('should return false when two TypedArrays not match', () => {
    expect(
      deepEqual(
        new TextEncoder().encode('12'),
        new TextEncoder().encode('123'),
      ),
    ).toBeFalsy();
    expect(
      deepEqual(
        new TextEncoder().encode('123'),
        new TextEncoder().encode('455'),
      ),
    ).toBeFalsy();
  });

  it('should return true when two TypedArrays match', () => {
    expect(
      deepEqual(
        new TextEncoder().encode('123'),
        new TextEncoder().encode('123'),
      ),
    ).toBeTruthy();
    expect(
      deepEqual(new TextEncoder().encode(''), new TextEncoder().encode('')),
    ).toBeTruthy();
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
});
