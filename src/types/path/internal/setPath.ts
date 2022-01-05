import { AsPathTuple, PathTuple } from './pathTuple';
import {
  ArrayKey,
  AsKey,
  IsTuple,
  Key,
  MapKeys,
  UnionToIntersection,
} from './utils';

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
