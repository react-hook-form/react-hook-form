import { PathString } from '../pathString';

import { AsKey, Key } from './utils';

/**
 * Type which describes a path through an object as a list of individual keys.
 */
export type PathTuple = Key[];

/**
 * Type to assert that a type is a path tuple.
 * @typeParam T - type which may be a path tuple
 */
export type AsPathTuple<T> = Extract<T, PathTuple>;

/**
 * Type which appends a key to the path tuple only if it is not blank,
 * i.e. not the empty string.
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
 * @typeParam PS - remaining path string which should be split into its
 *                 individual keys
 * @typeParam PT - accumulator of the keys which have been split from
 *                 the original path string already
 */
type SplitPathStringImpl<
  PS extends PathString,
  PT extends PathTuple,
> = PS extends `${infer K}.${infer R}`
  ? SplitPathStringImpl<R, AppendNonBlankKey<PT, K>>
  : AppendNonBlankKey<PT, PS>;

/**
 * Type to split a path string into a path tuple.
 * The individual keys may be empty strings.
 * @typeParam PS  - path string which should be split into its individual keys
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
 * @typeParam PT - remaining keys which needs to be joined
 * @typeParam PS - accumulator of the already joined keys
 */
type JoinPathTupleImpl<
  PT extends PathTuple,
  PS extends PathString,
> = PT extends [infer K, ...infer R]
  ? JoinPathTupleImpl<AsPathTuple<R>, `${PS}.${AsKey<K>}`>
  : PS;

/**
 * Type to join a path tuple to a path string.
 * @typeParam PT - path tuple which should be joined.
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
