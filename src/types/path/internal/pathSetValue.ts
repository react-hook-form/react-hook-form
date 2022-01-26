import { AsPathTuple, PathTuple } from './pathTuple';
import {
  ArrayKey,
  AsKey,
  IsTuple,
  Key,
  MapKeys,
  UnionToIntersection,
} from './utils';
import { IsAny } from '../../utils';

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
 * @internal
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
 * @internal
 */
type TrySetArray<
  T extends ReadonlyArray<any>,
  K extends Key,
> = K extends `${ArrayKey}` ? T[number] : TrySet<T, K>;

/**
 * Type to implement {@link KeySetValue}. Wraps everything into a tuple.
 * @typeParam T - non-nullable type which is indexed by the key
 * @typeParam K - key into the type, mustn't be a union of keys
 * @internal
 */
type KeySetValueImpl<T, K extends Key> = T extends ReadonlyArray<any>
  ? IsTuple<T> extends true
    ? [TrySet<T, K>]
    : [TrySetArray<T, K>]
  : [TrySet<MapKeys<T>, K>];

/**
 * Type to evaluate the type which is required for setting the property which
 * the given key points to.
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
 * KeySetValue<{foo: string}, 'foo'> = string
 * KeySetValue<{foo: string, bar: number}, 'foo' | 'bar'> = string & number
 * KeySetValue<{foo: string} | {foo: number}, 'foo'> = string & number
 * KeySetValue<null | {foo: string}, 'foo'> = string
 * KeySetValue<{bar: string}, 'foo'> = never
 * KeySetValue<{foo?: string}, 'foo'> = undefined | string
 * ```
 * @internal
 */
export type KeySetValue<T, K extends Key> = UnionToIntersection<
  K extends any ? KeySetValueImpl<NonNullable<T>, K> : never
>[never];

/**
 * Type to implement {@link PathSetValue} tail-recursively.
 * Wraps everything into a tuple.
 * @typeParam T  - deeply nested type which is indexed by the path
 * @typeParam PT - path into the deeply nested type
 * @internal
 */
type PathSetValueImpl<T, PT extends PathTuple> = PT extends [
  infer K,
  ...infer R
]
  ? PathSetValueImpl<KeySetValue<T, AsKey<K>>, AsPathTuple<R>>
  : [T];

/**
 * Type to evaluate the type which is required for setting the property which
 * the given path points to.
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
 * PathSetValue<{foo: {bar: string}}, ['foo', 'bar']> = string
 * PathSetValue<{foo: string, bar: number}, ['foo'] | ['bar']> = string & number
 * PathSetValue<{foo: string} | {foo: number}, ['foo']> = string & number
 * PathSetValue<null | {foo: string}, ['foo']> = string
 * PathSetValue<{bar: string}, ['foo']> = never
 * PathSetValue<{foo?: string}, ['foo']> = undefined | string
 * PathSetValue<{foo?: {bar: string}}, ['foo', 'bar']> = string
 * ```
 * @internal
 */
export type PathSetValue<T, PT extends PathTuple> = IsAny<PT> extends true
  ? any
  : UnionToIntersection<PathSetValueImpl<T, PT>>[never];
