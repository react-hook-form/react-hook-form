import { IsAny, IsNever } from '../utils';

import { GetKey } from './internal/getPath';
import { AsPathTuple, PathTuple } from './internal/pathTuple';
import { SetKey } from './internal/setPath';
import {
  AccessPattern,
  ArrayKey,
  AsKey,
  IsTuple,
  Key,
  ToKey,
  Traversable,
  UnionToIntersection,
} from './internal/utils';

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
