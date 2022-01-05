import { expectType } from 'tsd';

import { PathString } from '../../../../types';
import {
  GetKey,
  GetPath,
  SplitPathString,
} from '../../../../types/path/internal';
import { _, HundredTuple, InfiniteType, Nested } from '../../__fixtures__';

/** {@link GetKey} */ {
  /** it should traverse an object */ {
    const actual = _ as GetKey<{ foo: number; bar: string }, 'foo'>;
    expectType<number>(actual);
  }

  /** it should traverse an index signature */ {
    const actual = _ as GetKey<Record<string, number>, string>;
    expectType<number>(actual);
  }

  /** it should traverse a numeric index signature */ {
    const actual = _ as GetKey<Record<number, string>, `${number}`>;
    expectType<string>(actual);
  }

  /** it should traverse an object with numeric keys */ {
    const actual = _ as GetKey<{ 0: number }, '0'>;
    expectType<number>(actual);
  }

  /** it should traverse a tuple */ {
    const actual = _ as GetKey<[boolean, string], '1'>;
    expectType<string>(actual);
  }

  /** it should traverse an array */ {
    const actual = _ as GetKey<boolean[], '42'>;
    expectType<boolean>(actual);
  }

  /** it should handle optional keys */ {
    const actual = _ as GetKey<{ foo?: number }, 'foo'>;
    expectType<number | undefined>(actual);
  }

  /** it should handle optional indexes */ {
    const actual = _ as GetKey<[foo?: number], '0'>;
    expectType<number | undefined>(actual);
  }

  /** it should add undefined if the key is not valid */ {
    const actual = _ as GetKey<{ foo: string }, 'foobar'>;
    expectType<undefined>(actual);
  }

  /** it should evaluate to undefined if the key is out of bounds */ {
    const actual = _ as GetKey<[string], '1'>;
    expectType<undefined>(actual);
  }

  /** it should work on path unions */ {
    const actual = _ as GetKey<{ foo: number; bar: string }, 'foo' | 'bar'>;
    expectType<number | string>(actual);
  }

  /** it should add undefined if one of the keys doesn't exist */ {
    const actual = _ as GetKey<{ foo: number }, 'foo' | 'bar'>;
    expectType<number | undefined>(actual);
  }

  /** it should add null if the type may be null */ {
    const actual = _ as GetKey<null | { foo: string }, 'foo'>;
    expectType<string | null>(actual);
  }

  /** it should add undefined if the type may be undefined */ {
    const actual = _ as GetKey<undefined | { foo: string }, 'foo'>;
    expectType<string | undefined>(actual);
  }

  /** it should add null and undefined if the type may be null or undefined */ {
    const actual = _ as GetKey<null | undefined | { foo: string }, 'foo'>;
    expectType<string | null | undefined>(actual);
  }

  /** it should evaluate to undefined if the type is not traversable */ {
    const actual = _ as GetKey<string, 'foo'>;
    expectType<undefined>(actual);
  }

  /** it should evaluate to undefined if the key is non-numeric */ {
    const actual = _ as GetKey<string[], 'foo'>;
    expectType<undefined>(actual);
  }

  /** it should work on unions of object */ {
    const actual = _ as GetKey<{ foo: number } | { foo: string }, 'foo'>;
    expectType<number | string>(actual);
  }

  /** it should work on unions of object and tuple */ {
    const actual = _ as GetKey<{ 0: number } | [string], '0'>;
    expectType<number | string>(actual);
  }

  /** it should work on unions of object and array */ {
    const actual = _ as GetKey<{ 0: number } | string[], '0'>;
    expectType<number | string>(actual);
  }

  /** it should work on unions of tuple and array */ {
    const actual = _ as GetKey<[number] | string[], '0'>;
    expectType<number | string>(actual);
  }

  /** it should add undefined if the key doesn't exist in one of the types */ {
    const actual = _ as GetKey<{ foo: number } | { bar: string }, 'foo'>;
    expectType<number | undefined>(actual);
  }

  /** it should add undefined if the key is out of bounds in one of the types */ {
    const actual = _ as GetKey<[] | [number], '0'>;
    expectType<number | undefined>(actual);
  }

  /** it should evaluate to any if the type is any */ {
    const actual = _ as GetKey<any, string>;
    expectType<any>(actual);
  }

  /** it should access methods on primitives */ {
    const actual = _ as GetKey<string, 'toString'>;
    expectType<() => string>(actual);
  }

  /** it should access methods on arrays */ {
    const actual = _ as GetKey<number[], 'toString'>;
    expectType<() => string>(actual);
  }

  /** it should access methods on tuples */ {
    const actual = _ as GetKey<[number], 'toString'>;
    expectType<() => string>(actual);
  }
}

/** {@link GetPath} */ {
  /** it should traverse an object */ {
    const actual = _ as GetPath<InfiniteType<number>, ['foo', 'foo', 'value']>;
    expectType<number>(actual);
  }

  /** it should traverse an index signature */ {
    const actual = _ as GetPath<Record<string, number>, [string]>;
    expectType<number>(actual);
  }

  /** it should traverse a numeric index signature */ {
    const actual = _ as GetPath<Record<number, string>, [`${number}`]>;
    expectType<string>(actual);
  }

  /** it should traverse a tuple */ {
    const actual = _ as GetPath<InfiniteType<boolean>, ['bar', '0', 'value']>;
    expectType<boolean>(actual);
  }

  /** it should traverse an array */ {
    const actual = _ as GetPath<InfiniteType<boolean>, ['baz', '42', 'value']>;
    expectType<boolean>(actual);
  }

  /** it should evaluate to undefined if the path is not valid */ {
    const actual = _ as GetPath<InfiniteType<string>, ['foobar']>;
    expectType<undefined>(actual);
  }

  /** it should be implemented tail recursively */ {
    const actual = _ as GetPath<InfiniteType<string>, HundredTuple<'foo'>>;
    expectType<InfiniteType<string>>(actual);
  }

  /** it should work on path unions */ {
    const actual = _ as GetPath<
      InfiniteType<number>,
      ['foo', 'foo'] | ['foo', 'value']
    >;
    expectType<number | InfiniteType<number>>(actual);
  }

  /** it should add undefined if one of the paths doesn't exist */ {
    const actual = _ as GetPath<
      InfiniteType<number>,
      ['foo', 'value'] | ['foo', 'foobar']
    >;
    expectType<number | undefined>(actual);
  }

  /** it should add null if the path contains a nullable */ {
    const actual = _ as GetPath<
      { foo: null | { bar: string } },
      ['foo', 'bar']
    >;
    expectType<string | null>(actual);
  }

  /** it should add undefined if the path contains an optional */ {
    const actual = _ as GetPath<{ foo?: { bar: string } }, ['foo', 'bar']>;
    expectType<string | undefined>(actual);
  }

  /** it should add undefined if the path contains an undefineable */ {
    const actual = _ as GetPath<
      { foo: undefined | { bar: string } },
      ['foo', 'bar']
    >;
    expectType<string | undefined>(actual);
  }

  /** it should evaluate to undefined if the type is not traversable */ {
    const actual = _ as GetPath<string, ['foo']>;
    expectType<undefined>(actual);
  }

  /** it should work on type unions */ {
    const actual = _ as GetPath<
      InfiniteType<number> | InfiniteType<string>,
      ['foo', 'value']
    >;
    expectType<number | string>(actual);
  }

  /** it should add undefined if the path doesn't exist in one of the types */ {
    const actual = _ as GetPath<
      InfiniteType<number> | Nested<string>,
      ['foo', 'value']
    >;
    expectType<number | undefined>(actual);
  }

  /** it should evaluate to any if the type is any */ {
    const actual = _ as GetPath<any, ['foo']>;
    expectType<any>(actual);
  }

  /** it should evaluate to any if it encounters any */ {
    const actual = _ as GetPath<{ foo: any }, ['foo', 'bar', 'baz']>;
    expectType<any>(actual);
  }

  /** it should not evaluate to any if it doesn't encounter any */ {
    const actual = _ as GetPath<{ foo: any }, ['bar', 'baz']>;
    expectType<undefined>(actual);
  }

  /** it should not create a union which is too complex to represent */ {
    const makeSetter =
      <T>() =>
      <PS extends PathString>(_: PS, value: GetPath<T, SplitPathString<PS>>) =>
        value;

    const setter = makeSetter<{ foo: string }>();

    const actual = setter('foo', 'bar');
    expectType<string>(actual);
  }
}
