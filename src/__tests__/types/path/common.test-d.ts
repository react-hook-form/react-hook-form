import { expectType } from 'tsd';

import { PathString } from '../../../types';
import {
  CheckKeyConstraint,
  ContainsIndexable,
  HasKey,
  HasPath,
  Keys,
  NumericKeys,
  ObjectKeys,
  SetKey,
  SetPath,
  TupleKeys,
  ValidPathPrefix,
} from '../../../types/path/common';
import { SplitPathString } from '../../../types/path/internal/pathTuple';
import { AccessPattern, Key } from '../../../types/path/internal/utils';
import {
  _,
  HundredTuple,
  InfiniteType,
  Nested,
  NullableInfiniteType,
} from '../__fixtures__';

/** {@link TupleKeys} */ {
  /** it should evaluate to the own keys of the tuple */ {
    const actual = _ as TupleKeys<[string, number]>;
    expectType<'0' | '1'>(actual);
  }

  /** it should evaluate to never if an array type is passed */ {
    const actual = _ as TupleKeys<string[]>;
    expectType<never>(actual);
  }
}

/** {@link CheckKeyConstraint} */ {
  /** it should remove the keys which don't match the constraint */ {
    const actual = _ as CheckKeyConstraint<
      { foo: string; bar: number },
      'foo' | 'bar',
      AccessPattern<string>
    >;
    expectType<'foo'>(actual);
  }
}

/** {@link ContainsIndexable} */ {
  /** it should evaluate to true when an array is passed */ {
    const actual = _ as ContainsIndexable<number[]>;
    expectType<true>(actual);
  }

  /** it should evaluate to true when a tuple is passed */ {
    const actual = _ as ContainsIndexable<[number]>;
    expectType<true>(actual);
  }

  /** it should evaluate to false when a string is passed */ {
    const actual = _ as ContainsIndexable<string>;
    expectType<false>(actual);
  }

  /** it should evaluate to false when an object is passed */ {
    const actual = _ as ContainsIndexable<{ foo: string }>;
    expectType<false>(actual);
  }

  /** it should evaluate to true when an array is part of the union */ {
    const actual = _ as ContainsIndexable<{ foo: string } | number[]>;
    expectType<true>(actual);
  }

  /** it should evaluate to true when a tuple is part of the union */ {
    const actual = _ as ContainsIndexable<{ foo: string } | [number]>;
    expectType<true>(actual);
  }
}

/** {@link NumericKeys} */ {
  /** it should return the numeric keys of an object */ {
    const actual = _ as NumericKeys<{ 0: string; '1': string; foo: string }>;
    expectType<'0' | '1'>(actual);
  }

  /** it should return the numeric keys of an array */ {
    const actual = _ as NumericKeys<number[]>;
    expectType<`${number}`>(actual);
  }

  /** it should return the numeric keys of a tuple */ {
    const actual = _ as NumericKeys<[string, number]>;
    expectType<'0' | '1'>(actual);
  }

  /** it should return the overlapping numeric keys of a tuple and array */ {
    const actual = _ as NumericKeys<[number, string] | number[]>;
    expectType<'0' | '1'>(actual);
  }

  /** it should return the overlapping numeric keys of an object and array */ {
    const actual = _ as NumericKeys<{ 0: string; '1': string } | number[]>;
    expectType<'0' | '1'>(actual);
  }

  /** it should return the overlapping numeric keys of an object and tuple */ {
    const actual = _ as NumericKeys<{ 1: string } | [number, string]>;
    expectType<'1'>(actual);
  }
}

/** {@link ObjectKeys} */ {
  /** it should return the keys of an object */ {
    const actual = _ as ObjectKeys<{ foo: string; bar: number }>;
    expectType<'foo' | 'bar'>(actual);
  }

  /** it should return the overlapping keys of a union of objects */ {
    const actual = _ as ObjectKeys<
      { foo: string; bar: number } | { bar: number; baz: string }
    >;
    expectType<'bar'>(actual);
  }

  /** it should not return keys which contain dots */ {
    const actual = _ as ObjectKeys<{ foo: string; 'foo.bar': number }>;
    expectType<'foo'>(actual);
  }

  /** it should not return blank keys */ {
    const actual = _ as ObjectKeys<{ foo: string; '': number }>;
    expectType<'foo'>(actual);
  }
}

/** {@link Keys} */ {
  /** it should return the keys of an object */ {
    const actual = _ as Keys<{ foo: string; bar: number }>;
    expectType<'foo' | 'bar'>(actual);
  }

  /** it should return the keys of a tuple */ {
    const actual = _ as Keys<[number, string]>;
    expectType<'0' | '1'>(actual);
  }

  /** it should return the keys of an array */ {
    const actual = _ as Keys<string[]>;
    expectType<`${number}`>(actual);
  }

  /** it should return the optional keys of an object */ {
    const actual = _ as Keys<{ foo?: string; bar?: number }>;
    expectType<'foo' | 'bar'>(actual);
  }

  /** it should return the keys of a nullable type */ {
    const actual = _ as Keys<{ foo: string; bar: number } | null>;
    expectType<'foo' | 'bar'>(actual);
  }

  /** it should return the keys of an undefinable type */ {
    const actual = _ as Keys<{ foo: string; bar: number } | undefined>;
    expectType<'foo' | 'bar'>(actual);
  }

  /** it should return the optional keys of a tuple */ {
    const actual = _ as Keys<[foo?: string, bar?: number]>;
    expectType<'0' | '1'>(actual);
  }

  /** it should return the optional keys of a union of tuple and object */ {
    const actual = _ as Keys<[foo?: string] | { 0?: string; 1?: string }>;
    expectType<'0'>(actual);
  }

  /** it should only return the keys of string properties */ {
    const actual = _ as Keys<
      { foo: 'foo'; bar: number },
      AccessPattern<string>
    >;
    expectType<'foo'>(actual);
  }

  /** it should only return the keys of properties which can be set to a string */ {
    const actual = _ as Keys<
      { foo: string; bar: 'bar' },
      AccessPattern<string, string>
    >;
    expectType<'foo'>(actual);
  }

  /** it should only return the keys of string properties */ {
    const actual = _ as Keys<{ 1: string; 2: number }, AccessPattern<string>>;
    expectType<'1'>(actual);
  }

  /** it should return only the required keys when undefined is excluded */ {
    const actual = _ as Keys<
      { foo: string; bar?: string },
      AccessPattern<string>
    >;
    expectType<'foo'>(actual);
  }

  /** it should return the optional keys when undefined is included */ {
    const actual = _ as Keys<
      { foo: string; bar?: string },
      AccessPattern<string | undefined>
    >;
    expectType<'foo' | 'bar'>(actual);
  }

  /** it should return the overlapping keys of a union of objects */ {
    const actual = _ as Keys<
      { foo: string; bar: number } | { bar: number; baz: string }
    >;
    expectType<'bar'>(actual);
  }

  /** it should return the keys of the tuple when given a tuple and an array */ {
    const actual = _ as Keys<number[] | [number]>;
    expectType<'0'>(actual);
  }

  /** it should return the overlapping keys when given a tuple and an object */ {
    const actual = _ as Keys<{ 0: string; 1: number } | [number]>;
    expectType<'0'>(actual);
  }

  /** it should return the overlapping keys when given a tuple and an object */ {
    const actual = _ as Keys<{ foo: string } | [number]>;
    expectType<never>(actual);
  }

  /** it should return the numeric keys when given an array and an object */ {
    const actual = _ as Keys<{ 0: string; foo: number } | number[]>;
    expectType<'0'>(actual);
  }

  /** it should return {@link Key} when given any */ {
    const actual = _ as Keys<any>;
    expectType<Key>(actual);
  }

  /** it should return {@link Key} when given never */ {
    const actual = _ as Keys<never>;
    expectType<Key>(actual);
  }

  /** it should return never when given unknown */ {
    const actual = _ as Keys<unknown>;
    expectType<never>(actual);
  }

  /** it should return never when given a string */ {
    const actual = _ as Keys<string>;
    expectType<never>(actual);
  }

  /** it should return never when given undefined */ {
    const actual = _ as Keys<undefined>;
    expectType<never>(actual);
  }

  /** it should return never when given null */ {
    const actual = _ as Keys<null>;
    expectType<never>(actual);
  }
}

/** {@link HasKey} */ {
  /** it should return true when the key exists */ {
    const actual = _ as HasKey<{ foo: string }, 'foo'>;
    expectType<true>(actual);
  }

  /** it should return false when the key doesn't exist */ {
    const actual = _ as HasKey<{ foo: string }, 'bar'>;
    expectType<false>(actual);
  }

  /** it should return false when one of the keys doesn't exist */ {
    const actual = _ as HasKey<{ foo: string }, 'foo' | 'bar'>;
    expectType<false>(actual);
  }

  /** it should return false when one key doesn't exist in one of the types */ {
    const actual = _ as HasKey<{ foo: string } | { bar: string }, 'foo'>;
    expectType<false>(actual);
  }
}

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

/** {@link ValidPathPrefix} */ {
  /** it should return the entire path if it is valid */ {
    const actual = _ as ValidPathPrefix<
      InfiniteType<string>,
      ['foo', 'bar', '0', 'baz', '42']
    >;
    expectType<['foo', 'bar', '0', 'baz', '42']>(actual);
  }

  /** it should return the entire nullable path if it is valid */ {
    const actual = _ as ValidPathPrefix<
      NullableInfiniteType<string>,
      ['foo', 'bar', '0', 'baz', '42']
    >;
    expectType<['foo', 'bar', '0', 'baz', '42']>(actual);
  }

  /** it should return the longest valid prefix */ {
    const actual = _ as ValidPathPrefix<
      InfiniteType<string>,
      ['foo', 'bar', '0', 'ba', '42']
    >;
    expectType<['foo', 'bar', '0']>(actual);
  }

  /** it should return the longest common valid prefix */ {
    const actual = _ as ValidPathPrefix<
      InfiniteType<string> | { foo: string },
      ['foo', 'value']
    >;
    expectType<['foo']>(actual);
  }

  /** it should return an empty tuple when the path is an empty tuple */ {
    const actual = _ as ValidPathPrefix<InfiniteType<string>, []>;
    expectType<[]>(actual);
  }

  /** it should be implemented tail recursively */ {
    const actual = _ as ValidPathPrefix<
      InfiniteType<string>,
      HundredTuple<'foo'>
    >;
    expectType<HundredTuple<'foo'>>(actual);
  }

  /** it should be distributive on path unions */ {
    const actual = _ as ValidPathPrefix<
      InfiniteType<string>,
      ['foo', 'bar', '0', 'ba', '42'] | ['foo', 'ba']
    >;
    expectType<['foo', 'bar', '0'] | ['foo']>(actual);
  }
}

/** {@link HasPath} */ {
  /** it should return true if the path exists */ {
    const actual = _ as HasPath<
      InfiniteType<string>,
      ['foo', 'bar', '0', 'baz', '42']
    >;
    expectType<true>(actual);
  }

  /** it should return false if the path doesn't exist */ {
    const actual = _ as HasPath<
      InfiniteType<string>,
      ['foo', 'bar', '0', 'ba', '42']
    >;
    expectType<false>(actual);
  }

  /** it should return true if the path exist in both types */ {
    const actual = _ as HasPath<
      InfiniteType<string> | { foo: { bar: string } },
      ['foo', 'bar']
    >;
    expectType<true>(actual);
  }

  /** it should return false if the path doesn't exist in both types */ {
    const actual = _ as HasPath<
      InfiniteType<string> | { foo: { bar: string } },
      ['foo', 'value']
    >;
    expectType<false>(actual);
  }

  /** it should return false if either of the paths is invalid */ {
    const actual = _ as HasPath<
      InfiniteType<string>,
      ['foo', 'bar'] | ['foo', 'ba']
    >;
    expectType<false>(actual);
  }

  /** it should return true if both of the path are valid */ {
    const actual = _ as HasPath<
      InfiniteType<string>,
      ['foo', 'baz'] | ['foo', 'bar']
    >;
    expectType<true>(actual);
  }

  /** it should evaluate to true when any is encountered */ {
    const actual = _ as HasPath<{ foo: any }, ['foo', 'bar', 'baz']>;
    expectType<true>(actual);
  }

  /** it should evaluate to false when any is not encountered */ {
    const actual = _ as HasPath<{ foo: any }, ['bar', 'baz']>;
    expectType<false>(actual);
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
