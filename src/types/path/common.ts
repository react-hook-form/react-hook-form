import { IsAny, IsNever } from '../utils';

/**
 * Type alias to `string` which describes a lodash-like path through an object.
 * E.g. `'foo.bar.0.baz'`
 */
export type PathString = string;

/**
 * Type which can be traversed through with a {@link PathString}.
 * I.e. objects, arrays, and tuples
 */
export type Traversable = object;

/**
 * Type to query whether an array type T is a tuple type.
 * @typeParam T - type which may be an array or tuple
 * @example
 * ```
 * IsTuple<[number]> = true
 * IsTuple<number[]> = false
 * ```
 */
export type IsTuple<T extends ReadonlyArray<any>> = number extends T['length']
  ? false
  : true;

/**
 * Type which can be used to index an array or tuple type.
 */
export type ArrayKey = number;

/**
 * Type which can be used to index an object.
 */
export type Key = string;

/**
 * Type to assert that a type is a {@link Key}.
 * @typeParam T - type which may be a {@link Key}
 */
export type AsKey<T> = Extract<T, Key>;

/**
 * Type to convert a type to a {@link Key}.
 * @typeParam T - type which may be converted to a {@link Key}
 */
export type ToKey<T> = T extends ArrayKey ? `${T}` : AsKey<T>;

/**
 * Type which describes a path through an object
 * as a list of individual {@link Key}s.
 */
export type PathTuple = Key[];

/**
 * Type to assert that a type is a {@link PathTuple}.
 * @typeParam T - type which may be a {@link PathTuple}
 */
export type AsPathTuple<T> = Extract<T, PathTuple>;

/**
 * Type to intersect a union type.
 * See https://fettblog.eu/typescript-union-to-intersection/
 * @typeParam U - union
 * @example
 * ```
 * UnionToIntersection<{ foo: string } | { bar: number }>
 *   = { foo: string; bar: number }
 * ```
 */
export type UnionToIntersection<U> = (
  U extends any ? (_: U) => any : never
) extends (_: infer I) => any
  ? I
  : never;

/**
 * Type which appends a {@link Key} to the {@link PathTuple} only if it is not
 * blank, i.e. not the empty string.
 * @typeParam PT - path
 * @typeParam K  - key
 * @example
 * ```
 * AppendNonBlankKey<['foo'], 'bar'> = ['foo', 'bar']
 * AppendNonBlankKey<['foo'], ''> = ['foo']
 * ```
 */
type AppendNonBlankKey<PT extends PathTuple, K extends Key> = K extends ''
  ? PT
  : [...PT, K];

/**
 * Type to implement {@link SplitPathString} tail recursively.
 * @typeParam PS - remaining {@link PathString} which should be split into its
 *                 individual {@link Key}s
 * @typeParam PT - accumulator of the {@link Key}s which have been split from
 *                 the original {@link PathString} already
 */
type SplitPathStringImpl<
  PS extends PathString,
  PT extends PathTuple,
> = PS extends `${infer K}.${infer R}`
  ? SplitPathStringImpl<R, AppendNonBlankKey<PT, K>>
  : AppendNonBlankKey<PT, PS>;

/**
 * Type to split a {@link PathString} into a {@link PathTuple}.
 * The individual {@link Key}s may be empty strings.
 * @typeParam PS  - {@link PathString} which should be split into its
 *                  individual {@link Key}s
 * @example
 * ```
 * SplitPathString<'foo'> = ['foo']
 * SplitPathString<'foo.bar.0.baz'> = ['foo', 'bar', '0', 'baz']
 * SplitPathString<'.'> = []
 * ```
 */
export type SplitPathString<PS extends PathString> = SplitPathStringImpl<
  PS,
  []
>;

/**
 * Type to implement {@link JoinPathTuple} tail-recursively.
 * @typeParam PT - remaining {@link Key}s which needs to be joined
 * @typeParam PS - accumulator of the already joined {@link Key}s
 */
type JoinPathTupleImpl<
  PT extends PathTuple,
  PS extends PathString,
> = PT extends [infer K, ...infer R]
  ? JoinPathTupleImpl<AsPathTuple<R>, `${PS}.${AsKey<K>}`>
  : PS;

/**
 * Type to join a {@link PathTuple} to a {@link PathString}.
 * @typeParam PT - {@link PathTuple} which should be joined.
 * @example
 * ```
 * JoinPathTuple<['foo']> = 'foo'
 * JoinPathTuple<['foo', 'bar', '0', 'baz']> = 'foo.bar.0.baz'
 * JoinPathTuple<[]> = never
 * ```
 */
export type JoinPathTuple<PT extends PathTuple> = PT extends [
  infer K,
  ...infer R
]
  ? JoinPathTupleImpl<AsPathTuple<R>, AsKey<K>>
  : never;

/**
 * Type which converts all keys of an object to {@link Key}s.
 * @typeParam T - object type
 * @example
 * ```
 * MapKeys<{0: string}> = {'0': string}
 * ```
 */
type MapKeys<T> = { [K in keyof T as ToKey<K>]: T[K] };

/**
 * Type to access a type by a key.
 *  - Returns undefined if it can't be indexed by that key.
 *  - Returns null if the type is null.
 *  - Returns undefined if the type is not traversable.
 * @typeParam T - type which is indexed by the key
 * @typeParam K - key into the type
 * ```
 * TryGet<{foo: string}, 'foo'> = string
 * TryGet<{foo: string}, 'bar'> = undefined
 * TryGet<null, 'foo'> = null
 * TryGet<string, 'foo'> = undefined
 * ```
 */
type TryGet<T, K> = K extends keyof T
  ? T[K]
  : T extends null
  ? null
  : undefined;

/**
 * Type to access an array type by a key.
 * @typeParam T - type which is indexed by the key
 * @typeParam K - key into the type
 * ```
 * TryGetArray<string[], '0'> = string
 * TryGetArray<string[], 'foo'> = undefined
 * ```
 */
type TryGetArray<
  T extends ReadonlyArray<any>,
  K extends Key,
> = K extends `${ArrayKey}` ? T[number] : TryGet<T, K>;

/**
 * Type to evaluate the type which the given key points to. This type is the
 * covariant equivalent of {@link SetKey}.
 *  - If either T or K is union, it will evaluate to the union of the types at
 *    the given key(s).
 *  - If T can be null or undefined, the resulting type will also include null
 *    or undefined.
 *  - If a key doesn't exist, or may be optional, the resulting type will
 *    include undefined.
 * @typeParam T - type which is indexed by the key
 * @typeParam K - key into the type
 * @example
 * ```
 * GetKey<{foo: string}, 'foo'> = string
 * GetKey<{foo: string, bar: number}, 'foo' | 'bar'> = string | number
 * GetKey<{foo: string} | {foo: number}, 'foo'> = string | number
 * GetKey<null | {foo: string}, 'foo'> = null | string
 * GetKey<{bar: string}, 'foo'> = undefined
 * GetKey<{foo?: string}, 'foo'> = undefined | string
 * ```
 */
export type GetKey<T, K extends Key> = T extends ReadonlyArray<any>
  ? IsTuple<T> extends true
    ? TryGet<T, K>
    : TryGetArray<T, K>
  : TryGet<MapKeys<T>, K>;

/**
 * Type to evaluate the type which the given path points to. This type is the
 * covariant equivalent of {@link SetKey}.
 *  - If either T or PT is union, it will evaluate to the union of the types at
 *    the given path(s).
 *  - If T can be null or undefined, the resulting type will also include null
 *    or undefined.
 *  - If a path doesn't exist, or may be optional, the resulting type will
 *    include undefined.
 * @typeParam T  - deeply nested type which is indexed by the path
 * @typeParam PT - path into the deeply nested type
 * @example
 * ```
 * GetPath<{foo: {bar: string}}, ['foo', 'bar']> = string
 * GetPath<{foo: string, bar: number}, ['foo'] | ['bar']> = string | number
 * GetPath<{foo: string} | {foo: number}, ['foo']> = string | number
 * GetPath<null | {foo: string}, ['foo']> = null | string
 * GetPath<{bar: string}, ['foo']> = undefined
 * GetPath<{foo?: string}, ['foo']> = undefined | string
 * ```
 */
export type GetPath<T, PT extends PathTuple> = PT extends [infer K, ...infer R]
  ? GetPath<GetKey<T, AsKey<K>>, AsPathTuple<R>>
  : T;

/**
 * Type to access a type by a key. Returns never
 *  - if it can't be indexed by that key.
 *  - if the type is not traversable.
 * @typeParam T - type which is indexed by the key
 * @typeParam K - key into the type
 * ```
 * TrySet<{foo: string}, 'foo'> = string
 * TrySet<{foo: string}, 'bar'> = never
 * TrySet<null, 'foo'> = never
 * TrySet<string, 'foo'> = never
 * ```
 */
type TrySet<T, K> = K extends keyof T ? T[K] : never;

/**
 * Type to access an array type by a key.
 * @typeParam T - type which is indexed by the key
 * @typeParam K - key into the type
 * ```
 * TrySetArray<string[], '0'> = string
 * TrySetArray<string[], 'foo'> = never
 * ```
 */
type TrySetArray<
  T extends ReadonlyArray<any>,
  K extends Key,
> = K extends `${ArrayKey}` ? T[number] : TrySet<T, K>;

/**
 * Type to implement {@link SetKey}. Wraps everything into a tuple.
 * @typeParam T - non-nullable type which is indexed by the key
 * @typeParam K - key into the type, mustn't be a union of keys
 */
type SetKeyImpl<T, K extends Key> = T extends ReadonlyArray<any>
  ? IsTuple<T> extends true
    ? [TrySet<T, K>]
    : [TrySetArray<T, K>]
  : [TrySet<MapKeys<T>, K>];

/**
 * Type to evaluate the type which the given key points to. This type is the
 * contravariant equivalent of {@link GetKey}.
 *  - If either T or K is union, it will evaluate to the intersection of the
 *    types at the given key(s).
 *  - If T can be null or undefined, the resulting type won't include null or
 *    undefined.
 *  - If a key doesn't exist,the resulting type will be never.
 *  - If a key may be optional, the resulting type will include undefined.
 * @typeParam T - type which is indexed by the key
 * @typeParam K - key into the type
 * @example
 * ```
 * SetKey<{foo: string}, 'foo'> = string
 * SetKey<{foo: string, bar: number}, 'foo' | 'bar'> = string & number
 * SetKey<{foo: string} | {foo: number}, 'foo'> = string & number
 * SetKey<null | {foo: string}, 'foo'> = string
 * SetKey<{bar: string}, 'foo'> = never
 * SetKey<{foo?: string}, 'foo'> = undefined | string
 * ```
 */
export type SetKey<T, K extends Key> = UnionToIntersection<
  K extends any ? SetKeyImpl<NonNullable<T>, K> : never
>[never];

/**
 * Type to implement {@link SetPath} tail-recursively.
 * Wraps everything into a tuple.
 * @typeParam T  - deeply nested type which is indexed by the path
 * @typeParam PT - path into the deeply nested type
 */
type SetPathImpl<T, PT extends PathTuple> = PT extends [infer K, ...infer R]
  ? SetPathImpl<SetKey<T, AsKey<K>>, AsPathTuple<R>>
  : [T];

/**
 * Type to evaluate the type which the given path points to. This type is the
 * contravariant equivalent of {@link GetPath}.
 *  - If either T or PT is union, it will evaluate to the intersection of the
 *    types at the given paths(s).
 *  - If T can be null or undefined, the resulting type won't include null or
 *    undefined.
 *  - If a path doesn't exist, the resulting type will be never.
 *  - Only if last kay is optional, the resulting type will include undefined.
 * @typeParam T  - deeply nested type which is indexed by the path
 * @typeParam PT - path into the deeply nested type
 * @example
 * ```
 * SetPath<{foo: {bar: string}}, ['foo', 'bar']> = string
 * SetPath<{foo: string, bar: number}, ['foo'] | ['bar']> = string & number
 * SetPath<{foo: string} | {foo: number}, ['foo']> = string & number
 * SetPath<null | {foo: string}, ['foo']> = string
 * SetPath<{bar: string}, ['foo']> = never
 * SetPath<{foo?: string}, ['foo']> = undefined | string
 * SetPath<{foo?: {bar: string}}, ['foo', 'bar']> = string
 * ```
 */
export type SetPath<T, PT extends PathTuple> = UnionToIntersection<
  SetPathImpl<T, PT>
>[never];

/**
 * Type which given a tuple type returns its own keys, i.e. only its indices.
 * @typeParam T - tuple type
 * @example
 * ```
 * TupleKeys<[number, string]> = '0' | '1'
 * ```
 */
export type TupleKeys<T extends ReadonlyArray<any>> = Exclude<
  keyof T,
  keyof any[]
>;

/**
 * Type which extracts all numeric keys from an object.
 * @typeParam T - type
 * @example
 * ```
 * NumericObjectKeys<{0: string, '1': string, foo: string}> = '0' | '1'
 * ```
 */
type NumericObjectKeys<T extends Traversable> = ToKey<
  Extract<keyof T, ArrayKey | `${ArrayKey}`>
>;

/**
 * Type which extracts all numeric keys from an object, tuple, or array.
 * If a union is passed, it evaluates to the overlapping numeric keys.
 * @typeParam T - type
 * @example
 * ```
 * NumericKeys<{0: string, '1': string, foo: string}> = '0' | '1'
 * NumericKeys<number[]> = `${number}`
 * NumericKeys<[string, number]> = '0' | '1'
 * NumericKeys<{0: string, '1': string} | [number] | number[]> = '0'
 * ```
 */
export type NumericKeys<T extends Traversable> = UnionToIntersection<
  T extends ReadonlyArray<any>
    ? IsTuple<T> extends true
      ? [TupleKeys<T>]
      : [ToKey<ArrayKey>]
    : [NumericObjectKeys<T>]
>[never];

/**
 * Type which extracts all keys from an object.
 * If a union is passed, it evaluates to the overlapping keys.
 * @typeParam T - object type
 * @example
 * ```
 * ObjectKeys<{foo: string, bar: string}, string> = 'foo' | 'bar'
 * ObjectKeys<{foo: string, bar: number}, string> = 'foo'
 * ```
 */
export type ObjectKeys<T extends Traversable> = Exclude<
  ToKey<keyof T>,
  `${string}.${string}` | ''
>;

/**
 * Type which represents a property access.
 * See {@link https://dmitripavlutin.com/typescript-covariance-contravariance/}
 * for an explanation of covariance and contravariance.
 * @typeParam Get - constrains a type to be a subtype of this type,
 *                  i.e. the type when getting the property
 * @typeParam Set - constrains a type to be a supertype of this type,
 *                  i.e. the type required for setting the property
 * @example
 * ```
 *  'abcd' is a subtype   of string
 *  string is a supertype of 'abcd'
 *  AccessPattern<'abcd', 'abcd'>  extends         AccessPattern<string, 'abcd'>
 *  AccessPattern<'abcd', string>  extends         AccessPattern<'abcd', 'abcd'>
 *  AccessPattern<string, 'abcd'>  doesn't extend  AccessPattern<'abcd', 'abcd'>
 *  AccessPattern<'abcd', 'abcd'>  doesn't extend  AccessPattern<'abcd', string>
 * ```
 */
export type AccessPattern<Get = unknown, Set = never> = (_: Set) => Get;

/**
 * Type to check whether a type's property matches the constraint type
 * and return its key. Converts the key to a {@link Key}.
 * @typeParam T - type whose property should be checked
 * @typeParam K - key of the property
 * @typeParam C - constraint
 * @example
 * ```
 * CheckKeyConstraint<{foo: string}, 'foo', AccessPattern<string>> = 'foo'
 * CheckKeyConstraint<{foo: string}, 'foo', AccessPattern<number>> = never
 * CheckKeyConstraint<string[], number, AccessPattern<string>> = `${number}`
 * ```
 */
export type CheckKeyConstraint<
  T,
  K extends Key,
  C extends AccessPattern,
> = K extends any
  ? AccessPattern<GetKey<T, K>, SetKey<T, K>> extends C
    ? K
    : never
  : never;

/**
 * Type which evaluates to true when the type is an array or tuple or is a union
 * which contains an array or tuple.
 * @typeParam T - type
 * @example
 * ```
 * ContainsIndexable<{foo: string}> = false
 * ContainsIndexable<{foo: string} | number[]> = true
 * ```
 */
export type ContainsIndexable<T> = IsNever<
  Extract<T, ReadonlyArray<any>>
> extends true
  ? false
  : true;

/**
 * Type to implement {@link Keys} for non-nullable values.
 * @typeParam T - non-nullable type whose property should be checked
 */
type KeysImpl<T> = [T] extends [Traversable]
  ? ContainsIndexable<T> extends true
    ? NumericKeys<T>
    : ObjectKeys<T>
  : never;

/**
 * Type to find all properties of a type that match the constraint type
 * and return their keys.
 * If a union is passed, it evaluates to the overlapping keys.
 * @typeParam T - type whose property should be checked
 * @typeParam C - constraint
 * @example
 * ```
 * Keys<{foo: string, bar: string}, AccessPattern<string>> = 'foo' | 'bar'
 * Keys<{foo?: string, bar?: string}> = 'foo' | 'bar'
 * Keys<{foo: string, bar: number}, AccessPattern<string>> = 'foo'
 * Keys<[string, number], string> = '0'
 * Keys<string[], AccessPattern<string>> = `${number}`
 * Keys<{0: string, '1': string} | [number] | number[]> = '0'
 * ```
 */
export type Keys<
  T,
  C extends AccessPattern = AccessPattern,
> = IsAny<T> extends true
  ? Key
  : IsNever<T> extends true
  ? Key
  : IsNever<NonNullable<T>> extends true
  ? never
  : CheckKeyConstraint<T, KeysImpl<NonNullable<T>>, C>;

/**
 * Type to check whether a {@link Key} is present in a type.
 * If a union of {@link Key}s is passed, all {@link Key}s have to be present
 * in the type.
 * @typeParam T - type which is introspected
 * @typeParam K - key
 * @example
 * ```
 * HasKey<{foo: string}, 'foo'> = true
 * HasKey<{foo: string}, 'bar'> = false
 * HasKey<{foo: string}, 'foo' | 'bar'> = false
 * ```
 */
export type HasKey<T, K extends Key> = IsNever<Exclude<K, Keys<T>>>;

/**
 * Type to implement {@link ValidPathPrefix} tail recursively.
 * @typeParam T   - type which the path should be checked against
 * @typeParam PT  - path which should exist within the given type
 * @typeParam VPT - accumulates the prefix of {@link Key}s which have been
 *                  confirmed to exist already
 */
type ValidPathPrefixImpl<
  T,
  PT extends PathTuple,
  VPT extends PathTuple,
> = PT extends [infer K, ...infer R]
  ? HasKey<T, AsKey<K>> extends true
    ? ValidPathPrefixImpl<
        GetKey<T, AsKey<K>>,
        AsPathTuple<R>,
        AsPathTuple<[...VPT, K]>
      >
    : VPT
  : VPT;

/**
 * Type to find the longest path prefix which is still valid,
 * i.e. exists within the given type.
 * @typeParam T  - type which the path should be checked against
 * @typeParam PT - path which should exist within the given type
 * @example
 * ```
 * ValidPathPrefix<{foo: {bar: string}}, ['foo', 'bar']> = ['foo', 'bar']
 * ValidPathPrefix<{foo: {bar: string}}, ['foo', 'ba']> = ['foo']
 * ```
 */
export type ValidPathPrefix<T, PT extends PathTuple> = ValidPathPrefixImpl<
  T,
  PT,
  []
>;

/**
 * Type to check whether a path through a type exists.
 * @typeParam T  - type which the path should be checked against
 * @typeParam PT - path which should exist within the given type
 * @example
 * ```
 * HasPath<{foo: {bar: string}}, ['foo', 'bar']> = true
 * HasPath<{foo: {bar: string}}, ['foo', 'ba']> = false
 * ```
 */
export type HasPath<T, PT extends PathTuple> = ValidPathPrefix<T, PT> extends PT
  ? true
  : false;
