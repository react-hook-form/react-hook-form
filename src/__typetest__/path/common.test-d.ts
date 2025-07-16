import { describe, expect, it } from 'tstyche';

import type {
  ArrayKey,
  AsKey,
  AsPathTuple,
  CheckKeyConstraint,
  ContainsIndexable,
  EvaluateKey,
  EvaluatePath,
  HasKey,
  HasPath,
  IsTuple,
  JoinPathTuple,
  Key,
  Keys,
  NumericKeys,
  ObjectKeys,
  PathString,
  SplitPathString,
  ToKey,
  TupleKeys,
  UnionToIntersection,
  ValidPathPrefix,
} from '../../types/path/common';

import type {
  HundredPathString,
  HundredTuple,
  InfiniteType,
  Nested,
  NullableInfiniteType,
} from '../__fixtures__';

describe('IsTuple', () => {
  it('should evaluate to true if it is a tuple', () => {
    expect<IsTuple<[string, number]>>().type.toBe<true>();
  });

  it('should evaluate to false if it is not a tuple', () => {
    expect<IsTuple<string[]>>().type.toBe<false>();
  });
});

describe('TupleKeys', () => {
  it('should evaluate to the own keys of the tuple', () => {
    expect<TupleKeys<[string, number]>>().type.toBe<'0' | '1'>();
  });

  it('should evaluate to never if an array type is passed', () => {
    expect<TupleKeys<string[]>>().type.toBe<never>();
  });
});

describe('AsKey', () => {
  it('should behave like a noop type when a Key is passed', () => {
    expect<AsKey<'foo'>>().type.toBe<'foo'>();
  });

  it('should evaluate to never if not a Key is passed', () => {
    expect<AsKey<boolean>>().type.toBe<never>();
  });
});

describe('ToKey', () => {
  it('should behave like a noop type when a Key is passed', () => {
    expect<ToKey<'foo'>>().type.toBe<'foo'>();
  });

  it('should evaluate to never if not a Key or ArrayKey is passed', () => {
    expect<ToKey<boolean>>().type.toBe<never>();
  });

  it('should convert an ArrayKey to a template literal type', () => {
    expect<ToKey<ArrayKey>>().type.toBe<`${ArrayKey}`>();
  });
});

describe('AsPathTuple', () => {
  it('should behave like a noop type when a PathTuple is passed', () => {
    expect<AsPathTuple<['foo']>>().type.toBe<['foo']>();
  });

  it('should evaluate to never if not a PathTuple is passed', () => {
    expect<AsPathTuple<[42]>>().type.toBe<never>();
  });
});

describe('SplitPathString', () => {
  it('should split the PathString', () => {
    expect<SplitPathString<'foo.bar.0.baz'>>().type.toBe<
      ['foo', 'bar', '0', 'baz']
    >();
  });

  it('should split a PathString which does not contain a "."', () => {
    expect<SplitPathString<'foo'>>().type.toBe<['foo']>();
  });

  it('should return an empty tuple for a blank PathString', () => {
    expect<SplitPathString<''>>().type.toBe<[]>();
  });

  it('should return an empty tuple for a PathString containing only a "."', () => {
    expect<SplitPathString<'.'>>().type.toBe<[]>();
  });

  it('should be implemented tail recursively', () => {
    expect<SplitPathString<HundredPathString<'foo'>>>().type.toBe<
      HundredTuple<'foo'>
    >();
  });

  it('should work on unions', () => {
    expect<SplitPathString<'foo.bar' | 'bar.foo'>>().type.toBe<
      ['foo', 'bar'] | ['bar', 'foo']
    >();
  });

  it('should split a PathString containing a number template', () => {
    expect<SplitPathString<`foo.bar.${number}.baz`>>().type.toBe<
      ['foo', 'bar', `${number}`, 'baz']
    >();
  });

  it('should split a PathString containing a string template', () => {
    expect<SplitPathString<`foo.bar.${string}.baz`>>().type.toBe<
      ['foo', 'bar', string, 'baz']
    >();
  });
});

describe('JoinPathTuple', () => {
  it('should join the PathTuple', () => {
    expect<
      JoinPathTuple<['foo', 'bar', '0', 'baz']>
    >().type.toBe<'foo.bar.0.baz'>();
  });

  it('should join a PathTuple of length 1', () => {
    expect<JoinPathTuple<['foo']>>().type.toBe<'foo'>();
  });

  it('should evaluate to never when passed an empty PathTuple', () => {
    expect<JoinPathTuple<[]>>().type.toBe<never>();
  });

  it('should be implemented tail recursively', () => {
    expect<JoinPathTuple<HundredTuple<'foo'>>>().type.toBe<
      HundredPathString<'foo'>
    >();
  });

  it('should work on unions', () => {
    expect<JoinPathTuple<['foo', 'bar'] | ['bar', 'foo']>>().type.toBe<
      'foo.bar' | 'bar.foo'
    >();
  });

  it('should evaluate to never if a keys is never', () => {
    expect<JoinPathTuple<['foo', never]>>().type.toBe<never>();
  });
});

describe('CheckKeyConstraint', () => {
  it('should remove the keys which does not match the constraint', () => {
    expect<
      CheckKeyConstraint<{ foo: string; bar: number }, 'foo' | 'bar', string>
    >().type.toBe<'foo'>();
  });
});

describe('UnionToIntersection', () => {
  it('should intersect a union of objects', () => {
    expect<UnionToIntersection<{ foo: string } | { bar: number }>>().type.toBe<
      { foo: string } & { bar: number }
    >();
  });

  it('should intersect wrapped unions', () => {
    expect<UnionToIntersection<[0 | 1] | [1 | 2]>[never]>().type.toBe<1>();
  });
});

describe('ContainsIndexable', () => {
  it('should evaluate to true when an array is passed', () => {
    expect<ContainsIndexable<number[]>>().type.toBe<true>();
  });

  it('should evaluate to true when a tuple is passed', () => {
    expect<ContainsIndexable<[number]>>().type.toBe<true>();
  });

  it('should evaluate to false when a string is passed', () => {
    expect<ContainsIndexable<string>>().type.toBe<false>();
  });

  it('should evaluate to false when an object is passed', () => {
    expect<ContainsIndexable<{ foo: string }>>().type.toBe<false>();
  });

  it('should evaluate to true when an array is part of the union', () => {
    expect<ContainsIndexable<{ foo: string } | number[]>>().type.toBe<true>();
  });

  it('should evaluate to true when a tuple is part of the union', () => {
    expect<ContainsIndexable<{ foo: string } | [number]>>().type.toBe<true>();
  });
});

describe('NumericKeys', () => {
  it('should return the numeric keys of an object', () => {
    expect<NumericKeys<{ 0: string; '1': string; foo: string }>>().type.toBe<
      '0' | '1'
    >();
  });

  it('should return the numeric keys of an array', () => {
    expect<NumericKeys<number[]>>().type.toBe<`${number}`>();
  });

  it('should return the numeric keys of a tuple', () => {
    expect<NumericKeys<[string, number]>>().type.toBe<'0' | '1'>();
  });

  it('should return the overlapping numeric keys of a tuple and array', () => {
    expect<NumericKeys<[number, string] | number[]>>().type.toBe<'0' | '1'>();
  });

  it('should return the overlapping numeric keys of an object and array', () => {
    expect<NumericKeys<{ 0: string; '1': string } | number[]>>().type.toBe<
      '0' | '1'
    >();
  });

  it('should return the overlapping numeric keys of an object and tuple', () => {
    expect<NumericKeys<{ 1: string } | [number, string]>>().type.toBe<'1'>();
  });
});

describe('ObjectKeys', () => {
  it('should return the keys of an object', () => {
    expect<ObjectKeys<{ foo: string; bar: number }>>().type.toBe<
      'foo' | 'bar'
    >();
  });

  it('should return the overlapping keys of a union of objects', () => {
    expect<
      ObjectKeys<{ foo: string; bar: number } | { bar: number; baz: string }>
    >().type.toBe<'bar'>();
  });

  it('should not return keys which contain dots', () => {
    expect<ObjectKeys<{ foo: string; 'foo.bar': number }>>().type.toBe<'foo'>();
  });

  it('should not return blank keys', () => {
    expect<ObjectKeys<{ foo: string; '': number }>>().type.toBe<'foo'>();
  });
});

describe('Keys', () => {
  it('should return the keys of an object', () => {
    expect<Keys<{ foo: string; bar: number }>>().type.toBe<'foo' | 'bar'>();
  });

  it('should return the keys of a tuple', () => {
    expect<Keys<[number, string]>>().type.toBe<'0' | '1'>();
  });

  it('should return the keys of an array', () => {
    expect<Keys<string[]>>().type.toBe<`${number}`>();
  });

  it('should return the optional keys of an object', () => {
    expect<Keys<{ foo?: string; bar?: number }>>().type.toBe<'foo' | 'bar'>();
  });

  it('should return the keys of a nullable type', () => {
    expect<Keys<{ foo: string; bar: number } | null>>().type.toBe<
      'foo' | 'bar'
    >();
  });

  it('should return the keys of an undefinable type', () => {
    expect<Keys<{ foo: string; bar: number } | undefined>>().type.toBe<
      'foo' | 'bar'
    >();
  });

  it('should return the optional keys of a tuple', () => {
    expect<Keys<[foo?: string, bar?: number]>>().type.toBe<'0' | '1'>();
  });

  it('should return the optional keys of a union of tuple and object', () => {
    expect<
      Keys<[foo?: string] | { 0?: string; 1?: string }>
    >().type.toBe<'0'>();
  });

  it('should only return the keys of string properties', () => {
    expect<Keys<{ foo: string; bar: number }, string>>().type.toBe<'foo'>();
  });

  it('should only return the keys of string properties', () => {
    expect<Keys<{ 1: string; 2: number }, string>>().type.toBe<'1'>();
  });

  it('should return only the required keys when undefined is excluded', () => {
    expect<Keys<{ foo: string; bar?: string }, string>>().type.toBe<'foo'>();
  });

  it('should return the optional keys when undefined is included', () => {
    expect<Keys<{ foo: string; bar?: string }, string | undefined>>().type.toBe<
      'foo' | 'bar'
    >();
  });

  it('should return the overlapping keys of a union of objects', () => {
    expect<
      Keys<{ foo: string; bar: number } | { bar: number; baz: string }>
    >().type.toBe<'bar'>();
  });

  it('should return the keys of the tuple when given a tuple and an array', () => {
    expect<Keys<number[] | [number]>>().type.toBe<'0'>();
  });

  it('should return the overlapping keys when given a tuple and an object', () => {
    expect<Keys<{ 0: string; 1: number } | [number]>>().type.toBe<'0'>();
  });

  it('should return the overlapping keys when given a tuple and an object', () => {
    expect<Keys<{ foo: string } | [number]>>().type.toBe<never>();
  });

  it('should return the numeric keys when given an array and an object', () => {
    expect<Keys<{ 0: string; foo: number } | number[]>>().type.toBe<'0'>();
  });

  it('should return {@link Key} when given any', () => {
    expect<Keys<any>>().type.toBe<Key>();
  });

  it('should return {@link Key} when given never', () => {
    expect<Keys<never>>().type.toBe<Key>();
  });

  it('should return never when given unknown', () => {
    expect<Keys<unknown>>().type.toBe<never>();
  });

  it('should return never when given a string', () => {
    expect<Keys<string>>().type.toBe<never>();
  });

  it('should return never when given undefined', () => {
    expect<Keys<undefined>>().type.toBe<never>();
  });

  it('should return never when given null', () => {
    expect<Keys<null>>().type.toBe<never>();
  });
});

describe('HasKey', () => {
  it('should return true when the key exists', () => {
    expect<HasKey<{ foo: string }, 'foo'>>().type.toBe<true>();
  });

  it('should return false when the key does not exist', () => {
    expect<HasKey<{ foo: string }, 'bar'>>().type.toBe<false>();
  });

  it('should return false when one of the keys does not exist', () => {
    expect<HasKey<{ foo: string }, 'foo' | 'bar'>>().type.toBe<false>();
  });

  it('should return false when one key does not exist in one of the types', () => {
    expect<
      HasKey<{ foo: string } | { bar: string }, 'foo'>
    >().type.toBe<false>();
  });
});

describe('EvaluateKey', () => {
  it('should traverse an object', () => {
    expect<
      EvaluateKey<{ foo: number; bar: string }, 'foo'>
    >().type.toBe<number>();
  });

  it('should traverse an index signature', () => {
    expect<EvaluateKey<Record<string, number>, string>>().type.toBe<number>();
  });

  it('should traverse a numeric index signature', () => {
    expect<
      EvaluateKey<Record<number, string>, `${number}`>
    >().type.toBe<string>();
  });

  it('should traverse an object with numeric keys', () => {
    expect<EvaluateKey<{ 0: number }, '0'>>().type.toBe<number>();
  });

  it('should traverse a tuple', () => {
    expect<EvaluateKey<[boolean, string], '1'>>().type.toBe<string>();
  });

  it('should traverse an array', () => {
    expect<EvaluateKey<boolean[], '42'>>().type.toBe<boolean>();
  });

  it('should handle optional keys', () => {
    expect<EvaluateKey<{ foo?: number }, 'foo'>>().type.toBe<
      number | undefined
    >();
  });

  it('should handle optional indexes', () => {
    expect<EvaluateKey<[foo?: number], '0'>>().type.toBe<number | undefined>();
  });

  it('should add undefined if the key is not valid', () => {
    expect<EvaluateKey<{ foo: string }, 'foobar'>>().type.toBe<undefined>();
  });

  it('should evaluate to undefined if the key is out of bounds', () => {
    expect<EvaluateKey<[string], '1'>>().type.toBe<undefined>();
  });

  it('should work on path unions', () => {
    expect<
      EvaluateKey<{ foo: number; bar: string }, 'foo' | 'bar'>
    >().type.toBe<number | string>();
  });

  it('should add undefined if one of the keys does not exist', () => {
    expect<EvaluateKey<{ foo: number }, 'foo' | 'bar'>>().type.toBe<
      number | undefined
    >();
  });

  it('should add null if the type may be null', () => {
    expect<EvaluateKey<null | { foo: string }, 'foo'>>().type.toBe<
      string | null
    >();
  });

  it('should add undefined if the type may be undefined', () => {
    expect<EvaluateKey<undefined | { foo: string }, 'foo'>>().type.toBe<
      string | undefined
    >();
  });

  it('should add null and undefined if the type may be null or undefined', () => {
    expect<EvaluateKey<null | undefined | { foo: string }, 'foo'>>().type.toBe<
      string | null | undefined
    >();
  });

  it('should evaluate to undefined if the type is not traversable', () => {
    expect<EvaluateKey<string, 'foo'>>().type.toBe<undefined>();
  });

  it('should evaluate to undefined if the key is non-numeric', () => {
    expect<EvaluateKey<string[], 'foo'>>().type.toBe<undefined>();
  });

  it('should work on unions of object', () => {
    expect<EvaluateKey<{ foo: number } | { foo: string }, 'foo'>>().type.toBe<
      number | string
    >();
  });

  it('should work on unions of object and tuple', () => {
    expect<EvaluateKey<{ 0: number } | [string], '0'>>().type.toBe<
      number | string
    >();
  });

  it('should work on unions of object and array', () => {
    expect<EvaluateKey<{ 0: number } | string[], '0'>>().type.toBe<
      number | string
    >();
  });

  it('should work on unions of tuple and array', () => {
    expect<EvaluateKey<[number] | string[], '0'>>().type.toBe<
      number | string
    >();
  });

  it('should add undefined if the key does not exist in one of the types', () => {
    expect<EvaluateKey<{ foo: number } | { bar: string }, 'foo'>>().type.toBe<
      number | undefined
    >();
  });

  it('should add undefined if the key is out of bounds in one of the types', () => {
    expect<EvaluateKey<[] | [number], '0'>>().type.toBe<number | undefined>();
  });

  it('should evaluate to any if the type is any', () => {
    expect<EvaluateKey<any, string>>().type.toBe<any>();
  });

  it('should access methods on primitives', () => {
    expect<EvaluateKey<string, 'toString'>>().type.toBe<() => string>();
  });

  it('should access methods on arrays', () => {
    expect<EvaluateKey<number[], 'toString'>>().type.toBe<() => string>();
  });

  it('should access methods on tuples', () => {
    expect<EvaluateKey<[number], 'toString'>>().type.toBe<() => string>();
  });
});

describe('ValidPathPrefix', () => {
  it('should return the entire path if it is valid', () => {
    expect<
      ValidPathPrefix<InfiniteType<string>, ['foo', 'bar', '0', 'baz', '42']>
    >().type.toBe<['foo', 'bar', '0', 'baz', '42']>();
  });

  it('should return the entire nullable path if it is valid', () => {
    expect<
      ValidPathPrefix<
        NullableInfiniteType<string>,
        ['foo', 'bar', '0', 'baz', '42']
      >
    >().type.toBe<['foo', 'bar', '0', 'baz', '42']>();
  });

  it('should return the longest valid prefix', () => {
    expect<
      ValidPathPrefix<InfiniteType<string>, ['foo', 'bar', '0', 'ba', '42']>
    >().type.toBe<['foo', 'bar', '0']>();
  });

  it('should return the longest common valid prefix', () => {
    expect<
      ValidPathPrefix<InfiniteType<string> | { foo: string }, ['foo', 'value']>
    >().type.toBe<['foo']>();
  });

  it('should return an empty tuple when the path is an empty tuple', () => {
    expect<ValidPathPrefix<InfiniteType<string>, []>>().type.toBe<[]>();
  });

  it('should be implemented tail recursively', () => {
    expect<
      ValidPathPrefix<InfiniteType<string>, HundredTuple<'foo'>>
    >().type.toBe<HundredTuple<'foo'>>();
  });

  it('should be distributive on path unions', () => {
    expect<
      ValidPathPrefix<
        InfiniteType<string>,
        ['foo', 'bar', '0', 'ba', '42'] | ['foo', 'ba']
      >
    >().type.toBe<['foo', 'bar', '0'] | ['foo']>();
  });
});

describe('HasPath', () => {
  it('should return true if the path exists', () => {
    expect<
      HasPath<InfiniteType<string>, ['foo', 'bar', '0', 'baz', '42']>
    >().type.toBe<true>();
  });

  it('should return false if the path does not exist', () => {
    expect<
      HasPath<InfiniteType<string>, ['foo', 'bar', '0', 'ba', '42']>
    >().type.toBe<false>();
  });

  it('should return true if the path exist in both types', () => {
    expect<
      HasPath<InfiniteType<string> | { foo: { bar: string } }, ['foo', 'bar']>
    >().type.toBe<true>();
  });

  it('should return false if the path does not exist in both types', () => {
    expect<
      HasPath<InfiniteType<string> | { foo: { bar: string } }, ['foo', 'value']>
    >().type.toBe<false>();
  });

  it('should return false if either of the paths is invalid', () => {
    expect<
      HasPath<InfiniteType<string>, ['foo', 'bar'] | ['foo', 'ba']>
    >().type.toBe<false>();
  });

  it('should return true if both of the path are valid', () => {
    expect<
      HasPath<InfiniteType<string>, ['foo', 'baz'] | ['foo', 'bar']>
    >().type.toBe<true>();
  });

  it('should evaluate to true when any is encountered', () => {
    expect<HasPath<{ foo: any }, ['foo', 'bar', 'baz']>>().type.toBe<true>();
  });

  it('should evaluate to false when any is not encountered', () => {
    expect<HasPath<{ foo: any }, ['bar', 'baz']>>().type.toBe<false>();
  });
});

describe('EvaluatePath', () => {
  it('should traverse an object', () => {
    expect<
      EvaluatePath<InfiniteType<number>, ['foo', 'foo', 'value']>
    >().type.toBe<number>();
  });

  it('should traverse an index signature', () => {
    expect<
      EvaluatePath<Record<string, number>, [string]>
    >().type.toBe<number>();
  });

  it('should traverse a numeric index signature', () => {
    expect<
      EvaluatePath<Record<number, string>, [`${number}`]>
    >().type.toBe<string>();
  });

  it('should traverse a tuple', () => {
    expect<
      EvaluatePath<InfiniteType<boolean>, ['bar', '0', 'value']>
    >().type.toBe<boolean>();
  });

  it('should traverse an array', () => {
    expect<
      EvaluatePath<InfiniteType<boolean>, ['baz', '42', 'value']>
    >().type.toBe<boolean>();
  });

  it('should evaluate to never if the path is not valid', () => {
    expect<
      EvaluatePath<InfiniteType<string>, ['foobar']>
    >().type.toBe<undefined>();
  });

  it('should be implemented tail recursively', () => {
    expect<EvaluatePath<InfiniteType<string>, HundredTuple<'foo'>>>().type.toBe<
      InfiniteType<string>
    >();
  });

  it('should work on path unions', () => {
    expect<
      EvaluatePath<InfiniteType<number>, ['foo', 'foo'] | ['foo', 'value']>
    >().type.toBe<number | InfiniteType<number>>();
  });

  it('should add undefined if one of the paths does not exist', () => {
    expect<
      EvaluatePath<InfiniteType<number>, ['foo', 'value'] | ['foo', 'foobar']>
    >().type.toBe<number | undefined>();
  });

  it('should add null if the path contains a nullable', () => {
    expect<
      EvaluatePath<{ foo: null | { bar: string } }, ['foo', 'bar']>
    >().type.toBe<string | null>();
  });

  it('should add undefined if the path contains an optional', () => {
    expect<EvaluatePath<{ foo?: { bar: string } }, ['foo', 'bar']>>().type.toBe<
      string | undefined
    >();
  });

  it('should add undefined if the path contains an undefineable', () => {
    expect<
      EvaluatePath<{ foo: undefined | { bar: string } }, ['foo', 'bar']>
    >().type.toBe<string | undefined>();
  });

  it('should evaluate to undefined if the type is not traversable', () => {
    expect<EvaluatePath<string, ['foo']>>().type.toBe<undefined>();
  });

  it('should work on type unions', () => {
    expect<
      EvaluatePath<
        InfiniteType<number> | InfiniteType<string>,
        ['foo', 'value']
      >
    >().type.toBe<number | string>();
  });

  it('should add undefined if the path does not exist in one of the types', () => {
    expect<
      EvaluatePath<InfiniteType<number> | Nested<string>, ['foo', 'value']>
    >().type.toBe<number | undefined>();
  });

  it('should evaluate to any if the type is any', () => {
    expect<EvaluatePath<any, ['foo']>>().type.toBe<any>();
  });

  it('should evaluate to any if it encounters any', () => {
    expect<
      EvaluatePath<{ foo: any }, ['foo', 'bar', 'baz']>
    >().type.toBe<any>();
  });

  it('should not evaluate to any if it does not encounter any', () => {
    expect<EvaluatePath<{ foo: any }, ['bar', 'baz']>>().type.toBe<undefined>();
  });

  it('should not create a union which is too complex to represent', () => {
    const makeSetter =
      <T>() =>
      <PS extends PathString>(
        _: PS,
        value: EvaluatePath<T, SplitPathString<PS>>,
      ) =>
        value;

    const setter = makeSetter<{ foo: string }>();

    expect(setter('foo', 'bar')).type.toBe<string>();
  });
});
