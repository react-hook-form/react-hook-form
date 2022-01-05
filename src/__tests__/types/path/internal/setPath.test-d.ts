import { expectType } from 'tsd';

import { PathString } from '../../../../types';
import {
  SetKey,
  SetPath,
  SplitPathString,
} from '../../../../types/path/internal';
import { _, HundredTuple, InfiniteType, Nested } from '../../__fixtures__';

/** {@link SetKey} */ {
  /** it should traverse an object */ {
    const actual = _ as SetKey<{ foo: number; bar: string }, 'foo'>;
    expectType<number>(actual);
  }

  /** it should traverse an index signature */ {
    const actual = _ as SetKey<Record<string, number>, string>;
    expectType<number>(actual);
  }

  /** it should traverse a numeric index signature */ {
    const actual = _ as SetKey<Record<number, string>, `${number}`>;
    expectType<string>(actual);
  }

  /** it should traverse an object with numeric keys */ {
    const actual = _ as SetKey<{ 0: number }, '0'>;
    expectType<number>(actual);
  }

  /** it should traverse a tuple */ {
    const actual = _ as SetKey<[boolean, string], '1'>;
    expectType<string>(actual);
  }

  /** it should traverse an array */ {
    const actual = _ as SetKey<boolean[], '42'>;
    expectType<boolean>(actual);
  }

  /** it should handle optional keys */ {
    const actual = _ as SetKey<{ foo?: number }, 'foo'>;
    expectType<number | undefined>(actual);
  }

  /** it should handle optional indexes */ {
    const actual = _ as SetKey<[foo?: number], '0'>;
    expectType<number | undefined>(actual);
  }

  /** it should evaluate to never if the key is not valid */ {
    const actual = _ as SetKey<{ foo: string }, 'foobar'>;
    expectType<never>(actual);
  }

  /** it should evaluate to never if the key is out of bounds */ {
    const actual = _ as SetKey<[string], '1'>;
    expectType<never>(actual);
  }

  /** it should work on path unions */ {
    const actual = _ as SetKey<
      { foo: { foo: string }; bar: { bar: string } },
      'foo' | 'bar'
    >;
    expectType<{ foo: string } & { bar: string }>(actual);
  }

  /** it should evaluate to never if one of the keys doesn't exist */ {
    const actual = _ as SetKey<{ foo: number }, 'foo' | 'bar'>;
    expectType<never>(actual);
  }

  /** it shouldn't add null if the type may be null */ {
    const actual = _ as SetKey<null | { foo: string }, 'foo'>;
    expectType<string>(actual);
  }

  /** it shouldn't add undefined if the type may be undefined */ {
    const actual = _ as SetKey<undefined | { foo: string }, 'foo'>;
    expectType<string>(actual);
  }

  /** it shouldn't add null and undefined if the type may be null or undefined */ {
    const actual = _ as SetKey<null | undefined | { foo: string }, 'foo'>;
    expectType<string>(actual);
  }

  /** it should evaluate to never if the type is not traversable */ {
    const actual = _ as SetKey<string, 'foo'>;
    expectType<never>(actual);
  }

  /** it should evaluate to never if the key is non-numeric */ {
    const actual = _ as SetKey<string[], 'foo'>;
    expectType<never>(actual);
  }

  /** it should work on unions of object */ {
    const actual = _ as SetKey<
      { foo: { foo: string } } | { foo: { bar: string } },
      'foo'
    >;
    expectType<{ foo: string } & { bar: string }>(actual);
  }

  /** it should work on unions of object and tuple */ {
    const actual = _ as SetKey<{ 0: { foo: string } } | [{ bar: string }], '0'>;
    expectType<{ foo: string } & { bar: string }>(actual);
  }

  /** it should work on unions of object and array */ {
    const actual = _ as SetKey<
      { 0: { foo: string } } | Array<{ bar: string }>,
      '0'
    >;
    expectType<{ foo: string } & { bar: string }>(actual);
  }

  /** it should work on unions of tuple and array */ {
    const actual = _ as SetKey<[{ foo: string }] | Array<{ bar: string }>, '0'>;
    expectType<{ foo: string } & { bar: string }>(actual);
  }

  /** it should evaluate to never if the key doesn't exist in one of the types */ {
    const actual = _ as SetKey<{ foo: number } | { bar: string }, 'foo'>;
    expectType<never>(actual);
  }

  /** it should evaluate to never if the key is out of bounds in one of the types */ {
    const actual = _ as SetKey<[] | [number], '0'>;
    expectType<never>(actual);
  }

  /** it should evaluate to never if the type is null or undefined */ {
    const actual = _ as SetKey<null | undefined, string>;
    expectType<never>(actual);
  }

  /** it should evaluate to any if the type is any */ {
    const actual = _ as SetKey<any, string>;
    expectType<any>(actual);
  }

  /** it should access methods on primitives */ {
    const actual = _ as SetKey<string, 'toString'>;
    expectType<() => string>(actual);
  }

  /** it should access methods on arrays */ {
    const actual = _ as SetKey<number[], 'toString'>;
    expectType<() => string>(actual);
  }

  /** it should access methods on tuples */ {
    const actual = _ as SetKey<[number], 'toString'>;
    expectType<() => string>(actual);
  }
}

/** {@link SetPath} */ {
  /** it should traverse an object */ {
    const actual = _ as SetPath<InfiniteType<number>, ['foo', 'foo', 'value']>;
    expectType<number>(actual);
  }

  /** it should traverse an index signature */ {
    const actual = _ as SetPath<Record<string, number>, [string]>;
    expectType<number>(actual);
  }

  /** it should traverse a numeric index signature */ {
    const actual = _ as SetPath<Record<number, string>, [`${number}`]>;
    expectType<string>(actual);
  }

  /** it should traverse a tuple */ {
    const actual = _ as SetPath<InfiniteType<boolean>, ['bar', '0', 'value']>;
    expectType<boolean>(actual);
  }

  /** it should traverse an array */ {
    const actual = _ as SetPath<InfiniteType<boolean>, ['baz', '42', 'value']>;
    expectType<boolean>(actual);
  }

  /** it should evaluate to never if the path is not valid */ {
    const actual = _ as SetPath<InfiniteType<string>, ['foobar']>;
    expectType<never>(actual);
  }

  /** it should be implemented tail recursively */ {
    const actual = _ as SetPath<InfiniteType<string>, HundredTuple<'foo'>>;
    expectType<InfiniteType<string>>(actual);
  }

  /** it should work on path unions */ {
    const actual = _ as SetPath<
      InfiniteType<number>,
      ['foo', 'foo'] | ['foo', 'value']
    >;
    expectType<number & InfiniteType<number>>(actual);
  }

  /** it should evaluate to never if one of the paths doesn't exist */ {
    const actual = _ as SetPath<
      InfiniteType<number>,
      ['foo', 'value'] | ['foo', 'foobar']
    >;
    expectType<never>(actual);
  }

  /** it shouldn't add null if the path contains a nullable */ {
    const actual = _ as SetPath<
      { foo: null | { bar: string } },
      ['foo', 'bar']
    >;
    expectType<string>(actual);
  }

  /** it shouldn't add undefined if the path contains an optional */ {
    const actual = _ as SetPath<{ foo?: { bar: string } }, ['foo', 'bar']>;
    expectType<string>(actual);
  }

  /** it should add undefined if the last key is optional */ {
    const actual = _ as SetPath<{ foo: { bar?: string } }, ['foo', 'bar']>;
    expectType<string | undefined>(actual);
  }

  /** it shouldn't add undefined if the path contains an undefineable */ {
    const actual = _ as SetPath<
      { foo: undefined | { bar: string } },
      ['foo', 'bar']
    >;
    expectType<string>(actual);
  }

  /** it should evaluate to undefined if the type is not traversable */ {
    const actual = _ as SetPath<string, ['foo']>;
    expectType<never>(actual);
  }

  /** it should work on type unions */ {
    const actual = _ as SetPath<
      InfiniteType<{ foo: string }> | InfiniteType<{ bar: string }>,
      ['foo', 'value']
    >;
    expectType<{ foo: string } & { bar: string }>(actual);
  }

  /** it should be never if the path doesn't exist in one of the types */ {
    const actual = _ as SetPath<
      InfiniteType<number> | Nested<string>,
      ['foo', 'value']
    >;
    expectType<never>(actual);
  }

  /** it should evaluate to any if the type is any */ {
    const actual = _ as SetPath<any, ['foo']>;
    expectType<any>(actual);
  }

  /** it should evaluate to any if it encounters any */ {
    const actual = _ as SetPath<{ foo: any }, ['foo', 'bar', 'baz']>;
    expectType<any>(actual);
  }

  /** it should not evaluate to any if it doesn't encounter any */ {
    const actual = _ as SetPath<{ foo: any }, ['bar', 'baz']>;
    expectType<never>(actual);
  }

  /** it should not create a union which is too complex to represent */ {
    const makeSetter =
      <T>() =>
      <PS extends PathString>(_: PS, value: SetPath<T, SplitPathString<PS>>) =>
        value;

    const setter = makeSetter<{ foo: string }>();

    const actual = setter('foo', 'bar');
    expectType<string>(actual);
  }
}
