import set from '../../utils/set';

describe('set', () => {
  it('should set the correct values', () => {
    const test1 = { a: [{ b: { c: 3 } }] };
    expect(
      set({
        object: test1,
        name: 'a[0].b.c',
        value: 4,
      }),
    ).toEqual(4);
    expect(test1.a[0].b.c).toEqual(4);

    const test2 = { foo: { bar: 'baz' } };
    expect(
      set({
        object: test2,
        name: 'foo.arr[0]',
        value: 3,
      }),
    ).toEqual(3);
    expect(test2).toEqual({
      foo: {
        bar: 'baz',
        arr: [3],
      },
    });

    const test3 = { foo: { bar: 'baz' } };
    expect(
      set({
        object: test3,
        name: 'foo.arr["1"]',
        value: true,
      }),
    ).toEqual(true);
    expect(test3).toEqual({
      foo: {
        bar: 'baz',
        arr: [, true],
      },
    });

    const test4 = { foo: { bar: 'baz' } };
    expect(
      set({
        object: test4,
        name: 'foo.obj.key',
        value: 'test',
      }),
    ).toEqual('test');
    expect(test4).toEqual({
      foo: {
        bar: 'baz',
        obj: { key: 'test' },
      },
    });

    const test5 = { foo: 1 };
    expect(
      set({
        object: test5,
        name: 'foo.obj.key',
        value: 3,
      }),
    ).toEqual(3);
    expect(test5).toEqual({
      foo: {
        obj: {
          key: 3,
        },
      },
    });

    const test6 = {};
    expect(
      set({
        object: test6,
        name: 'foo.arr[0].obj.key',
        value: 1,
      }),
    ).toEqual(1);
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
    set({
      object: {},
      name: '__proto__[test2]',
      value: '456',
    });
    expect(Object.prototype).toEqual({});
  });
});
