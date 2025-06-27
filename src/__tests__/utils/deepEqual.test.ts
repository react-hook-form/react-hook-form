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

  it('should be capable of comparing objects with circular references', () => {
    const a: any = { test: '123' };
    const b: any = { test: '123' };
    a.self = a;
    b.self = b;

    expect(deepEqual(a, b)).toBeTruthy();

    a.other = { test: '123' };
    b.other = { test: '456' };

    expect(deepEqual(a, b)).toBeFalsy();

    b.other.test = '123';

    a.other.parent = b;
    b.other.parent = a;

    expect(deepEqual(a, b)).toBeTruthy();

    b.other.parent = a.other;

    expect(deepEqual(a, b)).toBeFalsy();
  });
});
