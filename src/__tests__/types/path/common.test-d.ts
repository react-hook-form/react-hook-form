import { expectType } from 'tsd';

import {
  CheckKeyConstraint,
  ContainsIndexable,
  HasKey,
  HasPath,
  Keys,
  NumericKeys,
  ObjectKeys,
  TupleKeys,
  ValidPathPrefix,
} from '../../../types/path/common';
import { AccessPattern, Key } from '../../../types/path/internal/utils';
import {
  _,
  HundredTuple,
  InfiniteType,
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
