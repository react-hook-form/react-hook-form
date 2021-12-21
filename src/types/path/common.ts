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
export type PathTuple = Key[];

/**
 * Type to assert that a type is a {@link PathTuple}.
 * @typeParam T - type which may be a {@link PathTuple}
 */
export type AsPathTuple<T> = Extract<T, PathTuple>;

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
 * Type to evaluate the type which the given key points to.
 * @typeParam T - type which is indexed by the key
 * @typeParam K - key into the type
 * @example
 * ```
 * EvaluateKey<{foo: string}, 'foo'> = string
 * EvaluateKey<[number, string], '1'> = string
 * ```
 */
export type EvaluateKey<T, K extends Key> = T extends ReadonlyArray<any>
  ? IsTuple<T> extends true
    ? K extends keyof T
      ? T[K]
      : undefined
    : T[number]
  : K extends keyof T
  ? T[K]
  : undefined;

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
export type EvaluatePath<T, PT extends PathTuple> = PT extends [
  infer K,
  ...infer R
]
  ? EvaluatePath<EvaluateKey<T, AsKey<K>>, AsPathTuple<R>>
  : T;
