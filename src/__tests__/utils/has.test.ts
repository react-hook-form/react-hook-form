import has from '../../utils/has';

describe('has', () => {
  it('should detect paths that resolve to a value', () => {
    const test = {
      bill: [1, 2, 3],
      betty: { test: { test1: [{ test2: 'bill' }] } },
      'dotted.filled': 'content',
    };

    expect(has(test, 'bill')).toBeTruthy();
    expect(has(test, 'bill[0]')).toBeTruthy();
    expect(has(test, 'betty.test.test1[0].test2')).toBeTruthy();
    expect(has(test, 'dotted.filled')).toBeTruthy();
  });

  it('should detect paths that are absent', () => {
    const test = {
      bill: [1, 2, 3],
      betty: { test: 'test' },
    };

    expect(has(test, 'luo')).toBeFalsy();
    expect(has(test, 'bill[3]')).toBeFalsy();
    expect(has(test, 'betty.test.test1')).toBeFalsy();
    expect(has(test, 'dotted.empty')).toBeFalsy();
  });

  it('should detect a path that is present but holds an empty or nullish value', () => {
    const test = {
      empty: {},
      list: [],
      nothing: undefined,
      nullish: null,
    };

    expect(has(test, 'empty')).toBeTruthy();
    expect(has(test, 'list')).toBeTruthy();
    expect(has(test, 'nothing')).toBeTruthy();
    expect(has(test, 'nullish')).toBeTruthy();
  });

  it('should not report inherited properties', () => {
    expect(has({}, 'toString')).toBeFalsy();
    expect(has({}, 'constructor')).toBeFalsy();
    expect(has({}, '__proto__')).toBeFalsy();
    expect(has({ a: {} }, 'a.__proto__.b')).toBeFalsy();
  });

  it('should return false for an empty path or a non-traversable object', () => {
    expect(has({ bill: 'test' }, '')).toBeFalsy();
    expect(has({ bill: 'test' }, undefined)).toBeFalsy();
    expect(has({ bill: 'test' }, null)).toBeFalsy();
    expect(has(undefined, 'bill')).toBeFalsy();
    expect(has(null, 'bill')).toBeFalsy();
    expect(has('bill', 'bill')).toBeFalsy();
  });
});
