import { FieldValues } from '../fields';

import {
  ArrayKey,
  AsKeyList,
  EvaluateKeyList,
  IsTuple,
  JoinKeyList,
  KeyList,
  PathString,
  SplitPathString,
  ToKey,
  Traversable,
  TupleKey,
} from './internal';

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
type Keys<T, U = unknown> = T extends Traversable
  ? T extends ReadonlyArray<any>
    ? IsTuple<T> extends true
      ? {
          [K in TupleKey<T>]-?: CheckKeyConstraint<T, K, U>;
        }[TupleKey<T>]
      : CheckKeyConstraint<T, ArrayKey, U>
    : {
        [K in keyof T]-?: CheckKeyConstraint<T, K, U>;
      }[keyof T]
  : never;

/**
 * Type to find the longest path prefix which is still valid,
 * i.e. exists within the given type.
 * @typeParam T    - type which the path should be checked against
 * @typeParam KL   - path which should exist within the given type
 * @typeParam _VKL - implementation detail to enable tail call optimisation;
 *                   accumulates the {@link Key}s which have been confirmed to
 *                   exist the given type
 * @example
 * ```
 * ValidKeyListPrefix<{foo: {bar: string}}, ['foo', 'bar']> = ['foo', 'bar']
 * ValidKeyListPrefix<{foo: {bar: string}}, ['foo', 'ba']> = ['foo']
 * ```
 */
type ValidKeyListPrefix<
  T,
  KL extends KeyList,
  _VKL extends KeyList = [],
> = KL extends [infer K, ...infer R]
  ? K extends Keys<T>
    ? ValidKeyListPrefix<
        EvaluateKeyList<T, AsKeyList<[K]>>,
        AsKeyList<R>,
        AsKeyList<[..._VKL, K]>
      >
    : _VKL
  : _VKL;

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
type SuggestParentPath<KL extends KeyList> = JoinKeyList<DropLastElement<KL>>;

/**
 * Type, which given a type and a path into the type, returns all paths as
 * {@link PathString}s which can be used to index the type at that path.
 * Filters out paths whose value doesn't match the constraint type or
 * aren't traversable.
 * @typeParam T  - type which is indexed by the path
 * @typeParam KL - the current path into the type as a {@link KeyList}
 * @typeParam U  - constraint type
 * @typeParam _K - implementation detail to evaluate the intermediate type only
 *                 once
 * @example
 * ```
 * SuggestChildPaths<{foo: string, bar: string}, [], string> = 'foo' | 'bar'
 * SuggestChildPaths<{foo: string, bar: number}, [], string> = 'foo'
 * SuggestChildPaths<{foo: {bar: string}}, ['foo'], string> = 'foo.bar'
 * SuggestChildPaths<{foo: {bar: string[]}}, ['foo'], string> = 'foo.bar'
 * ```
 */
type SuggestChildPaths<
  T,
  KL extends KeyList,
  U,
  _K = Keys<EvaluateKeyList<T, KL>, U | Traversable>,
> = [_K] extends [never] ? never : JoinKeyList<AsKeyList<[...KL, _K]>>;

/**
 * Type to drop the last element from a tuple type
 * @typeParam T - tuple whose last element should be dropped
 * @example
 * ```
 * DropLastElement<[0, 1, 2]> = [0, 1]
 * DropLastElement<[]> = []
 * ```
 */
type DropLastElement<T extends ReadonlyArray<any>> = T extends [...infer R, any]
  ? R
  : [];

/**
 * Type which given a type and a {@link PathString} into returns
 *  - its parent/predecessor {@link PathString}
 *  - the {@link PathString} itself, if it exists within the type,
 *    and the type, that it points to, matches the constraint type
 *  - all its child/successor paths that point to a type which is either
 *    traversable or matches the constraint type.
 * In case the path does not exist it returns all of the above for the last
 * valid path (see {@link ValidKeyListPrefix}).
 * @typeParam T     - type which is indexed by the path
 * @typeParam PS    - the current path into the type as a {@link PathString}
 * @typeParam U     - constraint type
 * @typeParam _VKLP - implementation detail to evaluate the intermediate type
 *                    only once
 * @typeParam _VPS  - implementation detail to evaluate the intermediate type
 *                    only once
 * @example
 * ```
 * CompletePathString<{foo: {bar: string}}, 'foo', string> = 'foo.bar'
 * CompletePathString<{foo: {bar: string}}, 'foo.ba', string>
 *   = 'foo' | 'foo.bar'
 * CompletePathString<{foo: {bar: string}}, 'foo.bar', string>
 *   = 'foo' | 'foo.bar'
 * CompletePathString<{foo: {bar: {baz: string}}}, 'foo.bar', string>
 *   = 'foo' | 'foo.bar.baz'
 * ```
 */
type CompletePathString<
  T,
  PS extends PathString,
  U,
  _VKLP extends KeyList = ValidKeyListPrefix<T, SplitPathString<PS>>,
  _VPS extends PathString = JoinKeyList<_VKLP>,
> =
  | SuggestChildPaths<T, _VKLP, U>
  | (PS extends _VPS
      ?
          | SuggestParentPath<_VKLP>
          | (EvaluateKeyList<T, _VKLP> extends U ? PS : never)
      : _VPS);

/**
 * Type which given a type and a {@link PathString} into returns
 *  - its parent/predecessor {@link PathString}
 *  - the {@link PathString} itself, if it exists within the type
 *  - all its child/successor paths that point to a type which is traversable
 * In case the path does not exist it returns all of the above for the last
 * valid path (see {@link ValidKeyListPrefix}).
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
export type LazyPath<T, TPathString extends PathString> = CompletePathString<
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
 * Type which given a type and a {@link PathString} into returns
 *  - its parent/predecessor {@link PathString}
 *  - the {@link PathString} itself, if it exists within the type,
 *    and the type, that it points to, is an array type
 *  - all its child/successor paths that point to a type which is either
 *    traversable or is an array type.
 * In case the path does not exist it returns all of the above for the last
 * valid path (see {@link ValidKeyListPrefix}).
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
export type LazyArrayPath<
  T,
  TPathString extends PathString,
> = CompletePathString<T, TPathString, ReadonlyArray<any>>;

/**
 * See {@link LazyArrayPath}
 */
export type LazyFieldArrayPath<
  TFieldValues extends FieldValues,
  TPathString extends PathString,
> = LazyArrayPath<TFieldValues, TPathString>;
