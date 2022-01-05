import { AsPathTuple, PathTuple } from './pathTuple';
import { ArrayKey, AsKey, IsTuple, Key, MapKeys } from './utils';

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
 * covariant equivalent of {@link KeySetValue}.
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
 * KeyGetValue<{foo: string}, 'foo'> = string
 * KeyGetValue<{foo: string, bar: number}, 'foo' | 'bar'> = string | number
 * KeyGetValue<{foo: string} | {foo: number}, 'foo'> = string | number
 * KeyGetValue<null | {foo: string}, 'foo'> = null | string
 * KeyGetValue<{bar: string}, 'foo'> = undefined
 * KeyGetValue<{foo?: string}, 'foo'> = undefined | string
 * ```
 */
export type KeyGetValue<T, K extends Key> = T extends ReadonlyArray<any>
  ? IsTuple<T> extends true
    ? TryGet<T, K>
    : TryGetArray<T, K>
  : TryGet<MapKeys<T>, K>;

/**
 * Type to evaluate the type which the given path points to. This type is the
 * covariant equivalent of {@link PathSetValue}.
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
 * PathGetValue<{foo: {bar: string}}, ['foo', 'bar']> = string
 * PathGetValue<{foo: string, bar: number}, ['foo'] | ['bar']> = string | number
 * PathGetValue<{foo: string} | {foo: number}, ['foo']> = string | number
 * PathGetValue<null | {foo: string}, ['foo']> = null | string
 * PathGetValue<{bar: string}, ['foo']> = undefined
 * PathGetValue<{foo?: string}, ['foo']> = undefined | string
 * ```
 */
export type PathGetValue<T, PT extends PathTuple> = PT extends [
  infer K,
  ...infer R
]
  ? PathGetValue<KeyGetValue<T, AsKey<K>>, AsPathTuple<R>>
  : T;
