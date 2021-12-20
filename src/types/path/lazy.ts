import { FieldValues } from '../fields';

import {
  ArrayKey,
  AsKeyList,
  EvaluateKey,
  EvaluateKeyList,
  JoinKeyList,
  KeyList,
  PathString,
  SplitPathString,
  ToKey,
  Traversable,
} from './common';

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
type CheckKeyConstraint<T, K extends keyof T, U> = T[K] extends U
  ? ToKey<K>
  : never;

export type ContainsTuple<T> = (
  T extends ReadonlyArray<any> ? (_: T['length']) => void : never
) extends (_: infer I) => void
  ? number extends I
    ? false
    : true
  : false;

export type ContainsTupleKey<T> = keyof {
  [K in keyof T as ToKey<K>]-?: Extract<K, number | `${number}`>;
} &
  (T extends ReadonlyArray<any> ? Exclude<keyof T, keyof any[]> : never);

/**
 * Type to find all properties of a type that match the constraint type
 * and return their keys. Converts the keys to {@link Key}s.
 * @typeParam T - type whose property should be checked
 * @typeParam U - constraint type
 * @example
 * ```
 * Keys<{foo: string, bar: string}, string> = 'foo' | 'bar'
 * Keys<{foo: string, bar: number}, string> = 'foo'
 * Keys<[string, number], string> = '0'
 * Keys<string[], string> = `${number}`
 * ```
 */
export type Keys<T, U = unknown> = [T] extends [Traversable]
  ? ContainsTuple<T> extends true
    ? {
        [K in ContainsTupleKey<T>]-?: CheckKeyConstraint<T, K, U>;
      }[ContainsTupleKey<T>]
    : any[] extends T
    ? T extends ReadonlyArray<any>
      ? CheckKeyConstraint<T, ArrayKey, U>
      : CheckKeyConstraint<T, keyof T, U>
    : {
        [K in keyof T]-?: CheckKeyConstraint<T, K, U>;
      }[keyof T]
  : never;

/**
 * Type to implement {@link ValidKeyListPrefix} tail recursively.
 * @typeParam T   - type which the path should be checked against
 * @typeParam KL  - path which should exist within the given type
 * @typeParam VKL - accumulates the prefix of {@link Key}s which have been
 *                  confirmed to exist already
 */
type ValidKeyListPrefixImpl<
  T,
  KL extends KeyList,
  VKL extends KeyList,
> = KL extends [infer K, ...infer R]
  ? K extends Keys<T>
    ? ValidKeyListPrefixImpl<
        EvaluateKey<T, K>,
        AsKeyList<R>,
        AsKeyList<[...VKL, K]>
      >
    : VKL
  : VKL;

/**
 * Type to find the longest path prefix which is still valid,
 * i.e. exists within the given type.
 * @typeParam T  - type which the path should be checked against
 * @typeParam KL - path which should exist within the given type
 * @example
 * ```
 * ValidKeyListPrefix<{foo: {bar: string}}, ['foo', 'bar']> = ['foo', 'bar']
 * ValidKeyListPrefix<{foo: {bar: string}}, ['foo', 'ba']> = ['foo']
 * ```
 */
export type ValidKeyListPrefix<T, KL extends KeyList> = ValidKeyListPrefixImpl<
  T,
  KL,
  []
>;

/**
 * Type to check whether a path through a type exists.
 * @typeParam T  - type which the path should be checked against
 * @typeParam KL - path which should exist within the given type
 * @example
 * ```
 * IsKeyListValid<{foo: {bar: string}}, ['foo', 'bar']> = true
 * IsKeyListValid<{foo: {bar: string}}, ['foo', 'ba']> = false
 * ```
 */
export type IsKeyListValid<T, KL extends KeyList> = ValidKeyListPrefix<
  T,
  KL
> extends KL
  ? true
  : false;

/**
 * Type to drop the last element from a tuple type
 * @typeParam T - tuple whose last element should be dropped
 * @example
 * ```
 * DropLastElement<[0, 1, 2]> = [0, 1]
 * DropLastElement<[]> = []
 * ```
 */
export type DropLastElement<T extends ReadonlyArray<any>> = T extends [
  ...infer R,
  any,
]
  ? R
  : [];

/**
 * Type, which given a path, returns the parent path as a {@link PathString}
 * @typeParam KL - path represented as a {@link KeyList}
 * @example
 * ```
 * SuggestParentPath<['foo', 'bar', 'baz']> = 'foo.bar'
 * SuggestParentPath<['foo', 'bar']> = 'foo'
 * SuggestParentPath<['foo']> = never
 * ```
 */
export type SuggestParentPath<KL extends KeyList> = JoinKeyList<
  DropLastElement<KL>
>;

/**
 * Type to implement {@link SuggestChildPaths}.
 * @typeParam KL  - the current path as a {@link KeyList}
 * @typeParam TKL - the type at that path
 * @typeParam U   - constraint type
 */
type SuggestChildPathsImpl<KL extends KeyList, TKL, U> = JoinKeyList<
  [...KL, Keys<TKL, U | Traversable>]
>;

/**
 * Type, which given a type and a path into the type, returns all paths as
 * {@link PathString}s which can be used to index the type at that path.
 * Filters out paths whose value doesn't match the constraint type or
 * aren't traversable.
 * @typeParam T  - type which is indexed by the path
 * @typeParam KL - the current path into the type as a {@link KeyList}
 * @typeParam U  - constraint type
 * @example
 * ```
 * SuggestChildPaths<{foo: string, bar: string}, [], string> = 'foo' | 'bar'
 * SuggestChildPaths<{foo: string, bar: number}, [], string> = 'foo'
 * SuggestChildPaths<{foo: {bar: string}}, ['foo'], string> = 'foo.bar'
 * SuggestChildPaths<{foo: {bar: string[]}}, ['foo'], string> = 'foo.bar'
 * ```
 */
export type SuggestChildPaths<T, KL extends KeyList, U> = SuggestChildPathsImpl<
  KL,
  EvaluateKeyList<T, KL>,
  U
>;

/**
 * Type to implement {@link SuggestPaths} without having to compute the valid
 * path prefix more than once.
 * @typeParam T    - type which is indexed by the path
 * @typeParam KL   - the current path into the type as a {@link KeyList}
 * @typeParam U    - constraint type
 * @typeParam VKLP - the valid path prefix for the given path
 */
type SuggestPathsImpl<T, KL extends KeyList, U, VKLP extends KeyList> =
  | SuggestChildPaths<T, VKLP, U>
  | (KL extends VKLP ? SuggestParentPath<VKLP> : JoinKeyList<VKLP>);

/**
 * Type which given a type and a {@link KeyList} into it returns
 *  - its parent/predecessor {@link PathString}
 *  - all its child/successor paths that point to a type which is either
 *    traversable or matches the constraint type.
 * In case the path does not exist it returns all of the above for the last
 * valid path (see {@link ValidKeyListPrefix}).
 * @typeParam T     - type which is indexed by the path
 * @typeParam KL    - the current path into the type as a {@link KeyList}
 * @typeParam U     - constraint type
 * @example
 * ```
 * SuggestPaths<{foo: {bar: string}}, ['foo'], string> = 'foo.bar'
 * SuggestPaths<{foo: {bar: string}}, ['foo', 'ba'], string>
 *   = 'foo' | 'foo.bar'
 * SuggestPaths<{foo: {bar: string}}, ['foo', 'bar'], string>
 *   = 'foo'
 * SuggestPaths<{foo: {bar: {baz: string}}}, ['foo', 'bar'], string>
 *   = 'foo' | 'foo.bar.baz'
 * ```
 */
export type SuggestPaths<T, KL extends KeyList, U> = SuggestPathsImpl<
  T,
  KL,
  U,
  ValidKeyListPrefix<T, KL>
>;

/**
 * Type to implement {@link AutoCompletePath} without having to compute the
 * key list more than once.
 * @typeParam T  - type which is indexed by the path
 * @typeParam PS - the current path into the type as a {@link PathString}
 * @typeParam U  - constraint type
 * @typeParam KL - the current path into the type as a {@link KeyList}
 */
type AutoCompletePathImpl<T, PS extends PathString, U, KL extends KeyList> =
  | SuggestPaths<T, KL, U>
  | (IsKeyListValid<T, KL> extends true
      ? EvaluateKeyList<T, KL> extends U
        ? PS
        : never
      : never);

/**
 * Type which given a type and a {@link PathString} into it returns
 *  - its parent/predecessor {@link PathString}
 *  - the {@link PathString} itself, if it exists within the type and matches
 *    the constraint type
 *  - all its child/successor paths that point to a type which is either
 *    traversable or matches the constraint type
 * In case the path does not exist it returns all of the above for the last
 * valid path.
 * @typeParam T  - type which is indexed by the path
 * @typeParam PS - the current path into the type as a {@link PathString}
 * @typeParam U  - constraint type
 * @example
 * ```
 * AutoCompletePath<{foo: {bar: string}}, 'foo', string> = 'foo.bar'
 * AutoCompletePath<{foo: {bar: string}}, 'foo.ba', string>
 *   = 'foo' | 'foo.bar'
 * AutoCompletePath<{foo: {bar: string}}, 'foo.bar', string>
 *   = 'foo' | 'foo.bar'
 * AutoCompletePath<{foo: {bar: {baz: string}}}, 'foo.bar', string>
 *   = 'foo' | 'foo.bar.baz'
 * ```
 */
export type AutoCompletePath<
  T,
  PS extends PathString,
  U,
> = AutoCompletePathImpl<T, PS, U, SplitPathString<PS>>;

/**
 * Type which given a type and a {@link PathString} into it returns
 *  - its parent/predecessor {@link PathString}
 *  - the {@link PathString} itself, if it exists within the type
 *  - all its child/successor paths that point to a type which is traversable
 * In case the path does not exist it returns all of the above for the last
 * valid path.
 * @typeParam T           - type which is indexed by the path
 * @typeParam TPathString - the current path into the type as a
 *                          {@link PathString}
 * @example
 * ```
 * LazyPath<{foo: {bar: string}}, 'foo'> = 'foo' | 'foo.bar'
 * LazyPath<{foo: {bar: string}}, 'foo.ba'> = 'foo' | 'foo.bar'
 * LazyPath<{foo: {bar: string}}, 'foo.bar'> = 'foo' | 'foo.bar'
 * LazyPath<{foo: {bar: {baz: string}}}, 'foo.bar'>
 *   = 'foo' | 'foo.bar' | 'foo.bar.baz'
 * ```
 */
export type LazyPath<T, TPathString extends PathString> = AutoCompletePath<
  T,
  TPathString,
  unknown
>;

/**
 * See {@link LazyPath}
 */
export type LazyFieldPath<
  TFieldValues extends FieldValues,
  TPathString extends PathString,
> = LazyPath<TFieldValues, TPathString>;

/**
 * Type which given a type and a {@link PathString} into it returns
 *  - its parent/predecessor {@link PathString}
 *  - the {@link PathString} itself, if it exists within the type,
 *    and the type, that it points to, is an array type
 *  - all its child/successor paths that point to a type which is either
 *    traversable or is an array type.
 * In case the path does not exist it returns all of the above for the last
 * valid path.
 * @typeParam T           - type which is indexed by the path
 * @typeParam TPathString - the current path into the type as a
 *                          {@link PathString}
 * @example
 * @example
 * ```
 * LazyArrayPath<{foo: {bar: string[]}}, 'foo'> = 'foo.bar'
 * LazyArrayPath<{foo: {bar: string[]}}, 'foo.ba'> = 'foo' | 'foo.bar'
 * LazyArrayPath<{foo: {bar: string[]}}, 'foo.bar'> = 'foo' | 'foo.bar'
 * LazyArrayPath<{foo: {bar: {baz: string[]}}}, 'foo.bar'>
 *   = 'foo' | 'foo.bar.baz'
 * ```
 */
export type LazyArrayPath<T, TPathString extends PathString> = AutoCompletePath<
  T,
  TPathString,
  ReadonlyArray<Traversable>
>;

/**
 * See {@link LazyArrayPath}
 */
export type LazyFieldArrayPath<
  TFieldValues extends FieldValues,
  TPathString extends PathString,
> = LazyArrayPath<TFieldValues, TPathString>;
