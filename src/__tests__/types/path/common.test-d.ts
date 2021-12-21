import { expectType } from 'tsd';

import {
  ArrayKey,
  AsKey,
  AsPathTuple,
  CheckKeyConstraint,
  ContainsIndexable,
  EvaluateKey,
  EvaluatePath,
  HasKey,
  IsTuple,
  JoinPathTuple,
  Key,
  Keys,
  NumericKeys,
  ObjectKeys,
  SplitPathString,
  ToKey,
  TupleKey,
  UnionToIntersection,
} from '../../../types/path/common';
import {
  _,
  HundredPathString,
  HundredTuple,
  InfiniteType,
  Nested,
} from '../__fixtures__';

/** {@link IsTuple} */ {
  /** it should evaluate to true if it's a tuple */ {
    const actual = _ as IsTuple<[string, number]>;
    expectType<true>(actual);
  }

  /** it should evaluate to false if it's not a tuple */ {
    const actual = _ as IsTuple<string[]>;
    expectType<false>(actual);
  }
}

/** {@link TupleKey} */ {
  /** it should evaluate to the own keys of the tuple */ {
    const actual = _ as TupleKey<[string, number]>;
    expectType<'0' | '1'>(actual);
  }

  /** it should evaluate to never if an array type is passed */ {
    const actual = _ as TupleKey<string[]>;
    expectType<never>(actual);
  }
}

/** {@link AsKey} */ {
  /** it should behave like a noop type when a Key is passed */ {
    const actual = _ as AsKey<'foo'>;
    expectType<'foo'>(actual);
  }

  /** it should evaluate to never if not a Key is passed */ {
    const actual = _ as AsKey<boolean>;
    expectType<never>(actual);
  }
}

/** {@link ToKey} */ {
  /** it should behave like a noop type when a Key is passed */ {
    const actual = _ as ToKey<'foo'>;
    expectType<'foo'>(actual);
  }

  /** it should evaluate to never if not a Key or ArrayKey is passed */ {
    const actual = _ as ToKey<boolean>;
    expectType<never>(actual);
  }

  /** it should convert an ArrayKey to a template literal type */ {
    const actual = _ as ToKey<ArrayKey>;
    expectType<`${ArrayKey}`>(actual);
  }
}

/** {@link AsPathTuple} */ {
  /** it should behave like a noop type when a PathTuple is passed */ {
    const actual = _ as AsPathTuple<['foo']>;
    expectType<['foo']>(actual);
  }

  /** it should evaluate to never if not a PathTuple is passed */ {
    const actual = _ as AsPathTuple<[42]>;
    expectType<never>(actual);
  }
}

/** {@link SplitPathString} */ {
  /** it should split the PathString */ {
    const actual = _ as SplitPathString<'foo.bar.0.baz'>;
    expectType<['foo', 'bar', '0', 'baz']>(actual);
  }

  /** it should split a PathString which does not contain a "." */ {
    const actual = _ as SplitPathString<'foo'>;
    expectType<['foo']>(actual);
  }

  /** it should split a PathString containing only a "." */ {
    const actual = _ as SplitPathString<'.'>;
    expectType<['', '']>(actual);
  }

  /** it should be implemented tail recursively */ {
    const actual = _ as SplitPathString<HundredPathString<'foo'>>;
    expectType<HundredTuple<'foo'>>(actual);
  }

  /** it should work on unions */ {
    const actual = _ as SplitPathString<'foo.bar' | 'bar.foo'>;
    expectType<['foo', 'bar'] | ['bar', 'foo']>(actual);
  }
}

/** {@link JoinPathTuple} */ {
  /** it should join the PathTuple */ {
    const actual = _ as JoinPathTuple<['foo', 'bar', '0', 'baz']>;
    expectType<'foo.bar.0.baz'>(actual);
  }

  /** it should join a PathTuple of length 1 */ {
    const actual = _ as JoinPathTuple<['foo']>;
    expectType<'foo'>(actual);
  }

  /** it should evaluate to never when passed an empty PathTuple */ {
    const actual = _ as JoinPathTuple<[]>;
    expectType<never>(actual);
  }

  /** it should be implemented tail recursively */ {
    const actual = _ as JoinPathTuple<HundredTuple<'foo'>>;
    expectType<HundredPathString<'foo'>>(actual);
  }

  /** it should work on unions */ {
    const actual = _ as JoinPathTuple<['foo', 'bar'] | ['bar', 'foo']>;
    expectType<'foo.bar' | 'bar.foo'>(actual);
  }

  /** it should evaluate to never if a keys is never */ {
    const actual = _ as JoinPathTuple<['foo', never]>;
    expectType<never>(actual);
  }
}

/** {@link CheckKeyConstraint} */ {
  /** it should convert the keys to string literals */ {
    const actual = _ as CheckKeyConstraint<string[], ArrayKey, unknown>;
    expectType<`${ArrayKey}`>(actual);
  }

  /** it should remove the keys which don't match the constraint */ {
    const actual = _ as CheckKeyConstraint<
      { foo: string; bar: number },
      'foo' | 'bar',
      string
    >;
    expectType<'foo'>(actual);
  }
}

/** {@link UnionToIntersection} */ {
  /** it should intersect a union of objects */ {
    const actual = _ as UnionToIntersection<{ foo: string } | { bar: number }>;
    expectType<{ foo: string } & { bar: number }>(actual);
  }

  /** it should intersect wrapped unions */ {
    const actual = _ as UnionToIntersection<[0 | 1] | [1 | 2]>[never];
    expectType<1>(actual);
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

  /** it should only return the keys of string properties */ {
    const actual = _ as NumericKeys<{ 1: string; 2: number }, string>;
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

  /** it should only return the keys of string properties */ {
    const actual = _ as ObjectKeys<{ foo: string; bar: number }, string>;
    expectType<'foo'>(actual);
  }

  /** it should not return keys which contain dots */ {
    const actual = _ as ObjectKeys<{ foo: string; 'foo.bar': number }>;
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

  /** it should only return the keys of string properties */ {
    const actual = _ as Keys<{ foo: string; bar: number }, string>;
    expectType<'foo'>(actual);
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

/** {@link EvaluateKey} */ {
  /** it should traverse an object */ {
    const actual = _ as EvaluateKey<{ foo: number; bar: string }, 'foo'>;
    expectType<number>(actual);
  }

  /** it should traverse an object with numeric keys */ {
    const actual = _ as EvaluateKey<{ 0: number }, '0'>;
    expectType<number>(actual);
  }

  /** it should traverse a tuple */ {
    const actual = _ as EvaluateKey<[boolean, string], '1'>;
    expectType<string>(actual);
  }

  /** it should traverse an array */ {
    const actual = _ as EvaluateKey<boolean[], '42'>;
    expectType<boolean>(actual);
  }

  /** it should evaluate to never if the key is not valid */ {
    const actual = _ as EvaluateKey<{ foo: string }, 'foobar'>;
    expectType<never>(actual);
  }

  /** it should evaluate to never if the key is out of bounds */ {
    const actual = _ as EvaluateKey<[string], '1'>;
    expectType<never>(actual);
  }

  /** it should work on path unions */ {
    const actual = _ as EvaluateKey<
      { foo: number; bar: string },
      'foo' | 'bar'
    >;
    expectType<number | string>(actual);
  }

  /** it should evaluate to never if one of the keys doesn't exist */ {
    const actual = _ as EvaluateKey<{ foo: number }, 'foo' | 'bar'>;
    expectType<never>(actual);
  }

  /** it should work on unions of object */ {
    const actual = _ as EvaluateKey<{ foo: number } | { foo: string }, 'foo'>;
    expectType<number | string>(actual);
  }

  /** it should work on unions of object and tuple */ {
    const actual = _ as EvaluateKey<{ 0: number } | [string], '0'>;
    expectType<number | string>(actual);
  }

  /** it should work on unions of object and array */ {
    const actual = _ as EvaluateKey<{ 0: number } | string[], '0'>;
    expectType<number | string>(actual);
  }

  /** it should work on unions of tuple and array */ {
    const actual = _ as EvaluateKey<[number] | string[], '0'>;
    expectType<number | string>(actual);
  }

  /** it should evaluate to never if the key doesn't exist in one of the types */ {
    const actual = _ as EvaluateKey<{ foo: number } | { bar: string }, 'foo'>;
    expectType<never>(actual);
  }

  /** it should evaluate to never if the key is out of bounds in one of the types */ {
    const actual = _ as EvaluateKey<[] | [number], '0'>;
    expectType<never>(actual);
  }

  /** it should evaluate to any if the type is any */ {
    const actual = _ as EvaluateKey<any, string>;
    expectType<any>(actual);
  }
}

/** {@link EvaluatePath} */ {
  /** it should traverse an object */ {
    const actual = _ as EvaluatePath<
      InfiniteType<number>,
      ['foo', 'foo', 'value']
    >;
    expectType<number>(actual);
  }

  /** it should traverse a tuple */ {
    const actual = _ as EvaluatePath<
      InfiniteType<boolean>,
      ['bar', '0', 'value']
    >;
    expectType<boolean>(actual);
  }

  /** it should traverse an array */ {
    const actual = _ as EvaluatePath<
      InfiniteType<boolean>,
      ['baz', '42', 'value']
    >;
    expectType<boolean>(actual);
  }

  /** it should evaluate to never if the path is not valid */ {
    const actual = _ as EvaluatePath<InfiniteType<string>, ['foobar']>;
    expectType<never>(actual);
  }

  /** it should be implemented tail recursively */ {
    const actual = _ as EvaluatePath<InfiniteType<string>, HundredTuple<'foo'>>;
    expectType<InfiniteType<string>>(actual);
  }

  /** it should work on path unions */ {
    const actual = _ as EvaluatePath<
      InfiniteType<number>,
      ['foo', 'foo'] | ['foo', 'value']
    >;
    expectType<number | InfiniteType<number>>(actual);
  }

  /** it should evaluate to never if one of the paths doesn't exist */ {
    const actual = _ as EvaluatePath<
      InfiniteType<number>,
      ['foo', 'value'] | ['foo', 'foobar']
    >;
    expectType<never>(actual);
  }

  /** it should work on type unions */ {
    const actual = _ as EvaluatePath<
      InfiniteType<number> | InfiniteType<string>,
      ['foo', 'value']
    >;
    expectType<number | string>(actual);
  }

  /** it should evaluate to never if the path doesn't exist in one of the types */ {
    const actual = _ as EvaluatePath<
      InfiniteType<number> | Nested<string>,
      ['foo', 'value']
    >;
    expectType<never>(actual);
  }

  /** it should evaluate to any if the type is any */ {
    const actual = _ as EvaluatePath<any, [string]>;
    expectType<any>(actual);
  }
}
