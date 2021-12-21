/**
 * Type alias to `string` which describes a lodash-like path through an object.
 * E.g. `'foo.bar.0.baz'`
 */
import { IsAny, IsNever } from '../utils';

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
 * Type which given a tuple type returns its own keys, i.e. only its indices.
 * @typeParam T - tuple type
 * @example
 * ```
 * TupleKeys<[number, string]> = '0' | '1'
 * ```
 */
export type TupleKey<T extends ReadonlyArray<any>> = Exclude<
  keyof T,
  keyof any[]
>;

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
 * Type which evaluates to true when the type is an array or tuple or is a union
 * which contains an array or tuple.
 * @typeParam T - type
 * @example
 * ```
 * ContainsIndexable<{foo: string}> = false
 * ContainsIndexable<{foo: string} | number[]> = true
 * ```
 */
export type ContainsIndexable<T> = [Extract<T, ReadonlyArray<any>>] extends [
  never,
]
  ? false
  : true;

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
  ? SplitPathStringImpl<R, [...PT, K]>
  : [...PT, PS];

/**
 * Type to split a {@link PathString} into a {@link PathTuple}.
 * The individual {@link Key}s may be empty strings.
 * @typeParam PS  - {@link PathString} which should be split into its
 *                  individual {@link Key}s
 * @example
 * ```
 * SplitPathString<'foo'> = ['foo']
 * SplitPathString<'foo.bar.0.baz'> = ['foo', 'bar', '0', 'baz']
 * SplitPathString<'.'> = ['', '']
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
 * Type to check whether a type's property matches the constraint type
 * and return its key. Converts the key to a {@link Key}.
 * @typeParam T - type whose property should be checked
 * @typeParam K - key of the property
 * @typeParam U - constraint type
 * @example
 * ```
 * CheckKeyConstraint<{foo: string}, 'foo', string> = 'foo'
 * CheckKeyConstraint<{foo: string}, 'foo', number> = never
 * CheckKeyConstraint<string[], number, string> = `${number}`
 * ```
 */
export type CheckKeyConstraint<T, K extends keyof T, U> = {
  [Key in K]: T[Key] extends U ? ToKey<Key> : never;
}[K];

/**
 * Type which extracts all numeric keys from an object.
 * @typeParam T - type
 * @example
 * ```
 * NumericObjectKeys<{0: string, '1': string, foo: string}> = '0' | '1'
 * ```
 */
type NumericObjectKeys<T extends Traversable> = {
  [K in keyof T]-?: Extract<keyof T, ArrayKey | `${ArrayKey}`>;
}[keyof T];

/**
 * Type which extracts all numeric keys from an object, tuple, or array
 * that match the constraint type.
 * If a union is passed, it evaluates to the overlapping numeric keys.
 * @typeParam T - type
 * @typeParam U - constraint type
 * @example
 * ```
 * NumericKeys<{0: string, '1': string, foo: string}> = '0' | '1'
 * NumericKeys<number[]> = `${number}`
 * NumericKeys<[string, number]> = '0' | '1'
 * NumericKeys<{0: string, '1': string} | [number] | number[]> = '0'
 * ```
 */
export type NumericKeys<
  T extends Traversable,
  U = unknown,
> = UnionToIntersection<
  T extends ReadonlyArray<any>
    ? IsTuple<T> extends true
      ? [CheckKeyConstraint<T, TupleKey<T>, U>]
      : [CheckKeyConstraint<T, ArrayKey, U>]
    : [CheckKeyConstraint<T, NumericObjectKeys<T>, U>]
>[never];

/**
 * Type which extracts all keys from an object that match the constraint type.
 * If a union is passed, it evaluates to the overlapping keys.
 * @typeParam T - object type
 * @typeParam U - constraint type
 * @example
 * ```
 * ObjectKeys<{foo: string, bar: string}, string> = 'foo' | 'bar'
 * ObjectKeys<{foo: string, bar: number}, string> = 'foo'
 * ```
 */
export type ObjectKeys<T extends Traversable, U = unknown> = Exclude<
  CheckKeyConstraint<T, keyof T, U>,
  `${string}.${string}`
>;

/**
 * Type to find all properties of a type that match the constraint type
 * and return their keys.
 * If a union is passed, it evaluates to the overlapping keys.
 * @typeParam T - type whose property should be checked
 * @typeParam U - constraint type
 * @example
 * ```
 * Keys<{foo: string, bar: string}, string> = 'foo' | 'bar'
 * Keys<{foo: string, bar: number}, string> = 'foo'
 * Keys<[string, number], string> = '0'
 * Keys<string[], string> = `${number}`
 * Keys<{0: string, '1': string} | [number] | number[]> = '0'
 * ```
 */
export type Keys<T, U = unknown> = IsAny<T> extends true
  ? Key
  : [T] extends [Traversable]
  ? ContainsIndexable<T> extends true
    ? NumericKeys<T, U>
    : ObjectKeys<T, U>
  : never;

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
 * Returns never if it can't be indexed by that key.
 * @typeParam T - type which is indexed by the key
 * @typeParam K - key into the type
 * ```
 * TryAccess<{foo: string}, 'foo'> = string
 * TryAccess<string[], '1'> = never
 * ```
 */
type TryAccess<T, K> = [K] extends [keyof T] ? T[K] : never;

/**
 * Type to evaluate the type which the given key points to.
 * @typeParam T - type which is indexed by the key
 * @typeParam K - key into the type
 * @example
 * ```
 * EvaluateKey<{foo: string}, 'foo'> = string
 * EvaluateKey<[number, string], '1'> = string
 * EvaluateKey<string[], '1'> = string
 * ```
 */
export type EvaluateKey<T, K extends Key> = HasKey<T, K> extends true
  ? T extends ReadonlyArray<any>
    ? IsTuple<T> extends true
      ? TryAccess<T, K>
      : T[number]
    : TryAccess<MapKeys<T>, K>
  : never;

/**
 * Type which return the head of a tuple type.
 * @typeParam T - tuple type
 * @example
 * ```
 * Head<[]> = never
 * Head<[1]> = 1
 * ```
 */
type Head<T extends ReadonlyArray<any>> = T extends [infer H, ...unknown[]]
  ? H
  : never;

/**
 * Type which return the tail of a tuple type.
 * @typeParam T - tuple type
 * @example
 * ```
 * Tail<[]> = []
 * Tail<[1]> = []
 * Head<[1, 2]> = [2]
 * ```
 */
type Tail<T extends ReadonlyArray<any>> = T extends [unknown, ...infer R]
  ? R
  : [];

/**
 * Type which returns true whenever the tuple type is empty.
 * @typeParam T - tuple type
 * @example
 * ```
 * IsEmpty<[]> = true
 * IsEmpty<[1]> = never
 * ```
 */
type IsEmpty<T extends ReadonlyArray<any>> = IsNever<Head<T>>;

/**
 * Type to evaluate the type which the given path points to.
 * @typeParam T  - deeply nested type which is indexed by the path
 * @typeParam PT - path into the deeply nested type
 * @example
 * ```
 * EvaluatePath<{foo: {bar: string}}, ['foo', 'bar']> = string
 * EvaluatePath<[number, string], ['1']> = string
 * EvaluatePath<number, []> = number
 * EvaluatePath<number, ['foo']> = never
 * ```
 */
export type EvaluatePath<T, PT extends PathTuple> = IsEmpty<PT> extends true
  ? T
  : EvaluatePath<EvaluateKey<T, AsKey<Head<PT>>>, AsPathTuple<Tail<PT>>>;
