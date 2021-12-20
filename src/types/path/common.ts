/**
 * Type alias to `string` which describes a lodash-like path through an object.
 * E.g. `'foo.bar.0.baz'`
 */
export type PathString = string;

/**
 * Type which can be traversed through with a {@link PathString}.
 * I.e. objects, arrays, and tuples
 */
export type Traversable = object | ReadonlyArray<any>;

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
export type KeyList = Key[];

/**
 * Type to assert that a type is a {@link KeyList}.
 * @typeParam T - type which may be a {@link KeyList}
 */
export type AsKeyList<T> = Extract<T, KeyList>;

/**
 * Type to implement {@link SplitPathString} tail recursively.
 * @typeParam PS - remaining {@link PathString} which should be split into its
 *                 individual {@link Key}s
 * @typeParam KL - accumulator of the {@link Key}s which have been split from
 *                 the original {@link PathString} already
 */
type SplitPathStringImpl<
  PS extends PathString,
  KL extends KeyList,
> = PS extends `${infer K}.${infer R}`
  ? SplitPathStringImpl<R, [...KL, K]>
  : [...KL, PS];

/**
 * Type to split a {@link PathString} into a {@link KeyList}.
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
 * Type to implement {@link JoinKeyList} tail-recursively.
 * @typeParam KL - remaining {@link Key}s which needs to be joined
 * @typeParam PS - accumulator of the already joined {@link Key}s
 */
type JoinKeyListImpl<KL extends KeyList, PS extends PathString> = KL extends [
  infer K,
  ...infer R
]
  ? JoinKeyListImpl<AsKeyList<R>, `${PS}.${AsKey<K>}`>
  : PS;

/**
 * Type to join a {@link KeyList} to a {@link PathString}.
 * @typeParam KL - {@link KeyList} which should be joined.
 * @example
 * ```
 * JoinKeyList<['foo']> = 'foo'
 * JoinKeyList<['foo', 'bar', '0', 'baz']> = 'foo.bar.0.baz'
 * JoinKeyList<[]> = never
 * ```
 */
export type JoinKeyList<KL extends KeyList> = KL extends [infer K, ...infer R]
  ? JoinKeyListImpl<AsKeyList<R>, AsKey<K>>
  : never;

/**
 * Type to evaluate the type which the given key points to.
 * @typeParam T - type which is indexed by the key
 * @typeParam K - key into the type
 * @example
 * ```
 * EvaluateKey<{foo: string}, 'foo'> = string
 * EvaluateKey<[number, string], '1'> = string
 * ```
 */
export type EvaluateKey<T, K extends Key> = [T] extends [ReadonlyArray<any>]
  ? IsTuple<T> extends true
    ? [K] extends [keyof T]
      ? T[K]
      : never
    : T[number]
  : [K] extends [keyof T]
  ? T[K]
  : never;

/**
 * Type to evaluate the type which the given path points to.
 * @typeParam T  - deeply nested type which is indexed by the path
 * @typeParam KL - path into the deeply nested type
 * @example
 * ```
 * EvaluateKeyList<{foo: {bar: string}}, ['foo', 'bar']> = string
 * EvaluateKeyList<[number, string], ['1']> = string
 * EvaluateKeyList<number, []> = number
 * EvaluateKeyList<number, ['foo']> = never
 * ```
 */
export type EvaluateKeyList<T, KL extends KeyList> = [KL] extends [
  [infer K, ...infer R],
]
  ? EvaluateKeyList<EvaluateKey<T, AsKey<K>>, AsKeyList<R>>
  : T;
