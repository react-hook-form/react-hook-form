import { expectType } from 'tsd';

import { PathString } from '../../../../types';
import {
  KeyGetValue,
  PathGetValue,
} from '../../../../types/path/internal/pathGetValue';
import { SplitPathString } from '../../../../types/path/internal/pathTuple';
import { _ } from '../../../__fixtures__';
import { HundredTuple, InfiniteType, Nested } from '../../__fixtures__';

/** {@link KeyGetValue} */ {
  /** it should traverse an object */ {
    const actual = _ as KeyGetValue<{ foo: number; bar: string }, 'foo'>;
    expectType<number>(actual);
  }

  /** it should traverse an index signature */ {
    const actual = _ as KeyGetValue<Record<string, number>, string>;
    expectType<number>(actual);
  }

  /** it should traverse a numeric index signature */ {
    const actual = _ as KeyGetValue<Record<number, string>, `${number}`>;
    expectType<string>(actual);
  }

  /** it should traverse an object with numeric keys */ {
    const actual = _ as KeyGetValue<{ 0: number }, '0'>;
    expectType<number>(actual);
  }

  /** it should traverse a tuple */ {
    const actual = _ as KeyGetValue<[boolean, string], '1'>;
    expectType<string>(actual);
  }

  /** it should traverse an array */ {
    const actual = _ as KeyGetValue<boolean[], '42'>;
    expectType<boolean>(actual);
  }

  /** it should handle optional keys */ {
    const actual = _ as KeyGetValue<{ foo?: number }, 'foo'>;
    expectType<number | undefined>(actual);
  }

  /** it should handle optional indexes */ {
    const actual = _ as KeyGetValue<[foo?: number], '0'>;
    expectType<number | undefined>(actual);
  }

  /** it should add unknown if the key is not valid */ {
    const actual = _ as KeyGetValue<{ foo: string }, 'foobar'>;
    expectType<unknown>(actual);
  }

  /** it should evaluate to unknown if the key is out of bounds */ {
    const actual = _ as KeyGetValue<[string], '1'>;
    expectType<unknown>(actual);
  }

  /** it should work on path unions */ {
    const actual = _ as KeyGetValue<
      { foo: number; bar: string },
      'foo' | 'bar'
    >;
    expectType<number | string>(actual);
  }

  /** it should evaluate to unknown if one of the keys doesn't exist */ {
    const actual = _ as KeyGetValue<{ foo: number }, 'foo' | 'bar'>;
    expectType<unknown>(actual);
  }

  /** it should add null if the type may be null */ {
    const actual = _ as KeyGetValue<null | { foo: string }, 'foo'>;
    expectType<string | null>(actual);
  }

  /** it should add undefined if the type may be undefined */ {
    const actual = _ as KeyGetValue<undefined | { foo: string }, 'foo'>;
    expectType<string | undefined>(actual);
  }

  /** it should add null and undefined if the type may be null or undefined */ {
    const actual = _ as KeyGetValue<null | undefined | { foo: string }, 'foo'>;
    expectType<string | null | undefined>(actual);
  }

  /** it should evaluate to unknown if the type is not traversable */ {
    const actual = _ as KeyGetValue<string, 'foo'>;
    expectType<unknown>(actual);
  }

  /** it should evaluate to unknown if the key is non-numeric */ {
    const actual = _ as KeyGetValue<string[], 'foo'>;
    expectType<unknown>(actual);
  }

  /** it should work on unions of object */ {
    const actual = _ as KeyGetValue<{ foo: number } | { foo: string }, 'foo'>;
    expectType<number | string>(actual);
  }

  /** it should work on unions of object and tuple */ {
    const actual = _ as KeyGetValue<{ 0: number } | [string], '0'>;
    expectType<number | string>(actual);
  }

  /** it should work on unions of object and array */ {
    const actual = _ as KeyGetValue<{ 0: number } | string[], '0'>;
    expectType<number | string>(actual);
  }

  /** it should work on unions of tuple and array */ {
    const actual = _ as KeyGetValue<[number] | string[], '0'>;
    expectType<number | string>(actual);
  }

  /** it should evaluate to unknown if the key doesn't exist in one of the types */ {
    const actual = _ as KeyGetValue<{ foo: number } | { bar: string }, 'foo'>;
    expectType<unknown>(actual);
  }

  /** it should evaluate to unknown if the key is out of bounds in one of the types */ {
    const actual = _ as KeyGetValue<[] | [number], '0'>;
    expectType<unknown>(actual);
  }

  /** it should evaluate to any if the type is any */ {
    const actual = _ as KeyGetValue<any, string>;
    expectType<any>(actual);
  }

  /** it should access methods on primitives */ {
    const actual = _ as KeyGetValue<string, 'toString'>;
    expectType<() => string>(actual);
  }

  /** it should access methods on arrays */ {
    const actual = _ as KeyGetValue<number[], 'toString'>;
    expectType<() => string>(actual);
  }

  /** it should access methods on tuples */ {
    const actual = _ as KeyGetValue<[number], 'toString'>;
    expectType<() => string>(actual);
  }

  /** it should evaluate to unknown if the key is never */ {
    const actual = _ as KeyGetValue<{ foo: string }, never>;
    expectType<unknown>(actual);
  }

  /** it should evaluate to any if the key is any */ {
    const actual = _ as KeyGetValue<{ foo: string }, any>;
    expectType<any>(actual);
  }
}

/** {@link PathGetValue} */ {
  /** it should traverse an object */ {
    const actual = _ as PathGetValue<
      InfiniteType<number>,
      ['foo', 'foo', 'value']
    >;
    expectType<number>(actual);
  }

  /** it should traverse an index signature */ {
    const actual = _ as PathGetValue<Record<string, number>, [string]>;
    expectType<number>(actual);
  }

  /** it should traverse a numeric index signature */ {
    const actual = _ as PathGetValue<Record<number, string>, [`${number}`]>;
    expectType<string>(actual);
  }

  /** it should traverse a tuple */ {
    const actual = _ as PathGetValue<
      InfiniteType<boolean>,
      ['bar', '0', 'value']
    >;
    expectType<boolean>(actual);
  }

  /** it should traverse an array */ {
    const actual = _ as PathGetValue<
      InfiniteType<boolean>,
      ['baz', '42', 'value']
    >;
    expectType<boolean>(actual);
  }

  /** it should evaluate to unknown if the path is not valid */ {
    const actual = _ as PathGetValue<InfiniteType<string>, ['foobar']>;
    expectType<unknown>(actual);
  }

  /** it should be implemented tail recursively */ {
    const actual = _ as PathGetValue<InfiniteType<string>, HundredTuple<'foo'>>;
    expectType<InfiniteType<string>>(actual);
  }

  /** it should work on path unions */ {
    const actual = _ as PathGetValue<
      InfiniteType<number>,
      ['foo', 'foo'] | ['foo', 'value']
    >;
    expectType<number | InfiniteType<number>>(actual);
  }

  /** it should evaluate to unknown if one of the paths doesn't exist */ {
    const actual = _ as PathGetValue<
      InfiniteType<number>,
      ['foo', 'value'] | ['foo', 'foobar']
    >;
    expectType<unknown>(actual);
  }

  /** it should add null if the path contains a nullable */ {
    const actual = _ as PathGetValue<
      { foo: null | { bar: string } },
      ['foo', 'bar']
    >;
    expectType<string | null>(actual);
  }

  /** it should add undefined if the path contains an optional */ {
    const actual = _ as PathGetValue<{ foo?: { bar: string } }, ['foo', 'bar']>;
    expectType<string | undefined>(actual);
  }

  /** it should add undefined if the path contains an undefineable */ {
    const actual = _ as PathGetValue<
      { foo: undefined | { bar: string } },
      ['foo', 'bar']
    >;
    expectType<string | undefined>(actual);
  }

  /** it should evaluate to unknown if the type is not traversable */ {
    const actual = _ as PathGetValue<string, ['foo']>;
    expectType<unknown>(actual);
  }

  /** it should work on type unions */ {
    const actual = _ as PathGetValue<
      InfiniteType<number> | InfiniteType<string>,
      ['foo', 'value']
    >;
    expectType<number | string>(actual);
  }

  /** it should evaluate to unknown if the path doesn't exist in one of the types */ {
    const actual = _ as PathGetValue<
      InfiniteType<number> | Nested<string>,
      ['foo', 'value']
    >;
    expectType<unknown>(actual);
  }

  /** it should evaluate to any if the type is any */ {
    const actual = _ as PathGetValue<any, ['foo']>;
    expectType<any>(actual);
  }

  /** it should evaluate to any if it encounters any */ {
    const actual = _ as PathGetValue<{ foo: any }, ['foo', 'bar', 'baz']>;
    expectType<any>(actual);
  }

  /** it should not evaluate to any if it doesn't encounter any */ {
    const actual = _ as PathGetValue<{ foo: any }, ['bar', 'baz']>;
    expectType<unknown>(actual);
  }

  /** it should not create a union which is too complex to represent */ {
    const makeSetter =
      <T>() =>
      <PS extends PathString>(
        _: PS,
        value: PathGetValue<T, SplitPathString<PS>>,
      ) =>
        value;

    const setter = makeSetter<{ foo: string }>();

    const actual = setter('foo', 'bar');
    expectType<string>(actual);
  }

  /** it should evaluate to unknown if the path is never */ {
    const actual = _ as PathGetValue<{ foo: string }, never>;
    expectType<unknown>(actual);
  }

  /** it should evaluate to unknown if the path contains never */ {
    const actual = _ as PathGetValue<{ foo: string }, [never]>;
    expectType<unknown>(actual);
  }

  /** it should evaluate to any if the path is any */ {
    const actual = _ as PathGetValue<{ foo: string }, any>;
    expectType<any>(actual);
  }

  /** it should evaluate to any if the path contains any */ {
    const actual = _ as PathGetValue<{ foo: string }, [any]>;
    expectType<any>(actual);
  }
}
