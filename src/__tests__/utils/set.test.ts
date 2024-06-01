import set from '../../utils/set';

describe('set', () => {
  it('should set the correct values', () => {
    const test1 = { a: [{ b: { c: 3 } }] };
    expect(set(test1, 'a[0].b.c', 4)).toEqual(4);
    expect(test1.a[0].b.c).toEqual(4);

    const test2 = { foo: { bar: 'baz' } };
    expect(set(test2, 'foo.arr[0]', 3)).toEqual(3);
    expect(test2).toEqual({
      foo: {
        bar: 'baz',
        arr: [3],
      },
    });

    const test3 = { foo: { bar: 'baz' } };
    expect(set(test3, 'foo.arr["1"]', true)).toEqual(true);
    expect(test3).toEqual({
      foo: {
        bar: 'baz',
        arr: [, true],
      },
    });

    const test4 = { foo: { bar: 'baz' } };
    expect(set(test4, 'foo.obj.key', 'test')).toEqual('test');
    expect(test4).toEqual({
      foo: {
        bar: 'baz',
        obj: { key: 'test' },
      },
    });

    const test5 = { foo: 1 };
    expect(set(test5, 'foo.obj.key', 3)).toEqual(3);
    expect(test5).toEqual({
      foo: {
        obj: {
          key: 3,
        },
      },
    });

    const test6 = {};
    expect(set(test6, 'foo.arr[0].obj.key', 1)).toEqual(1);
    expect(test6).toEqual({
      foo: {
        arr: [
          {
            obj: {
              key: 1,
            },
          },
        ],
      },
    });
  });

  it('should not populate prototype', () => {
    set({}, '__proto__[test2]', '456');
    expect(Object.prototype).toEqual({});
  });
});
