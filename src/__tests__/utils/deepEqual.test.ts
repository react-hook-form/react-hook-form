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

  it('should return true when comparing invalid Date objects', () => {
    expect(deepEqual(new Date('invalid'), new Date('abc'))).toBeTruthy();
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

  it('should return true when comparing NaN values', () => {
    expect(deepEqual(NaN, NaN)).toBeTruthy();

    // Object NaN
    expect(deepEqual({ value: NaN }, { value: NaN })).toBeTruthy();

    // Array NaN
    expect(deepEqual([NaN], [NaN])).toBeTruthy();

    // Nested Structures NaN
    expect(
      deepEqual(
        { user: { age: NaN, name: 'test' } },
        { user: { age: NaN, name: 'test' } },
      ),
    ).toBeTruthy();

    // Mixed with other values
    expect(
      deepEqual({ a: NaN, b: 1, c: 'test' }, { a: NaN, b: 1, c: 'test' }),
    ).toBeTruthy();
  });

  it('should return false when comparing NaN with other values', () => {
    expect(deepEqual({ value: NaN }, { value: 0 })).toBeFalsy();
    expect(deepEqual({ value: NaN }, { value: undefined })).toBeFalsy();
    expect(deepEqual({ value: NaN }, { value: null })).toBeFalsy();
    expect(deepEqual({ value: NaN }, { value: 'NaN' })).toBeFalsy();
    expect(deepEqual([NaN], [0])).toBeFalsy();
  });

  describe('objects with .equals() method', () => {
    class ValueObject {
      constructor(public value: string) {}
      equals(other: any): boolean {
        return other instanceof ValueObject && this.value === other.value;
      }
    }

    it('should compare objects with .equals() method using value equality', () => {
      const obj1 = new ValueObject('2025-01-01');
      const obj2 = new ValueObject('2025-01-01');
      const obj3 = new ValueObject('2025-01-02');

      expect(deepEqual(obj1, obj2)).toBeTruthy();
      expect(deepEqual(obj1, obj3)).toBeFalsy();
    });

    it('should compare nested objects with .equals() method', () => {
      const date1 = new ValueObject('2025-01-01');
      const date2 = new ValueObject('2025-01-01');
      const date3 = new ValueObject('2025-01-02');

      expect(
        deepEqual({ date: date1, name: 'test' }, { date: date2, name: 'test' }),
      ).toBeTruthy();

      expect(
        deepEqual({ date: date1, name: 'test' }, { date: date3, name: 'test' }),
      ).toBeFalsy();
    });

    it('should compare objects with .equals() in arrays', () => {
      const date1 = new ValueObject('2025-01-01');
      const date2 = new ValueObject('2025-01-01');
      const date3 = new ValueObject('2025-01-02');

      expect(deepEqual([date1], [date2])).toBeTruthy();
      expect(deepEqual([date1], [date3])).toBeFalsy();
    });

    it('should handle objects with .equals() transitioning to/from null', () => {
      const date = new ValueObject('2025-01-01');

      expect(deepEqual({ value: date }, { value: null })).toBeFalsy();
      expect(deepEqual({ value: null }, { value: date })).toBeFalsy();
    });

    it('should handle deeply nested structures with .equals()', () => {
      const date1 = new ValueObject('2025-01-01');
      const date2 = new ValueObject('2025-01-01');
      const date3 = new ValueObject('2025-01-02');

      const nested1 = {
        user: {
          profile: {
            dates: [date1],
          },
        },
      };

      const nested2 = {
        user: {
          profile: {
            dates: [date2],
          },
        },
      };

      const nested3 = {
        user: {
          profile: {
            dates: [date3],
          },
        },
      };

      expect(deepEqual(nested1, nested2)).toBeTruthy();
      expect(deepEqual(nested1, nested3)).toBeFalsy();
    });

    it('should handle mixed objects with and without .equals()', () => {
      const date1 = new ValueObject('2025-01-01');
      const date2 = new ValueObject('2025-01-01');

      expect(
        deepEqual(
          { date: date1, name: 'John', age: 30 },
          { date: date2, name: 'John', age: 30 },
        ),
      ).toBeTruthy();

      expect(
        deepEqual(
          { date: date1, name: 'John', age: 30 },
          { date: date2, name: 'Jane', age: 30 },
        ),
      ).toBeFalsy();
    });

    it('should handle objects with .equals() that have no enumerable properties', () => {
      class TemporalLike {
        private _value: string;

        constructor(value: string) {
          this._value = value;
        }

        equals(other: any): boolean {
          return other instanceof TemporalLike && this._value === other._value;
        }

        toString(): string {
          return this._value;
        }
      }

      const temp1 = new TemporalLike('2025-01-01');
      const temp2 = new TemporalLike('2025-01-01');
      const temp3 = new TemporalLike('2025-01-02');

      expect(deepEqual(temp1, temp2)).toBeTruthy();
      expect(deepEqual(temp1, temp3)).toBeFalsy();

      expect(deepEqual({ date: temp1 }, { date: temp2 })).toBeTruthy();

      expect(deepEqual({ date: temp1 }, { date: temp3 })).toBeFalsy();
    });
  });
});
