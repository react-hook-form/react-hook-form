import { FieldValues } from '../fields';

import {
  AsPathTuple,
  EvaluateKey,
  EvaluatePath,
  JoinPathTuple,
  Keys,
  PathString,
  PathTuple,
  SplitPathString,
  Traversable,
} from './common';

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
  ? K extends Keys<T>
    ? ValidPathPrefixImpl<
        EvaluateKey<T, K>,
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
 * IsPathValid<{foo: {bar: string}}, ['foo', 'bar']> = true
 * IsPathValid<{foo: {bar: string}}, ['foo', 'ba']> = false
 * ```
 */
export type IsPathValid<T, PT extends PathTuple> = ValidPathPrefix<
  T,
  PT
> extends PT
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
 * @typeParam PT - path represented as a {@link PathTuple}
 * @example
 * ```
 * SuggestParentPath<['foo', 'bar', 'baz']> = 'foo.bar'
 * SuggestParentPath<['foo', 'bar']> = 'foo'
 * SuggestParentPath<['foo']> = never
 * ```
 */
export type SuggestParentPath<PT extends PathTuple> = JoinPathTuple<
  DropLastElement<PT>
>;

/**
 * Type to implement {@link SuggestChildPaths}.
 * @typeParam PT  - the current path as a {@link PathTuple}
 * @typeParam TPT - the type at that path
 * @typeParam U   - constraint type
 */
type SuggestChildPathsImpl<PT extends PathTuple, TPT, U> = JoinPathTuple<
  [...PT, Keys<TPT, U | Traversable>]
>;

/**
 * Type, which given a type and a path into the type, returns all paths as
 * {@link PathString}s which can be used to index the type at that path.
 * Filters out paths whose value doesn't match the constraint type or
 * aren't traversable.
 * @typeParam T  - type which is indexed by the path
 * @typeParam PT - the current path into the type as a {@link PathTuple}
 * @typeParam U  - constraint type
 * @example
 * ```
 * SuggestChildPaths<{foo: string, bar: string}, [], string> = 'foo' | 'bar'
 * SuggestChildPaths<{foo: string, bar: number}, [], string> = 'foo'
 * SuggestChildPaths<{foo: {bar: string}}, ['foo'], string> = 'foo.bar'
 * SuggestChildPaths<{foo: {bar: string[]}}, ['foo'], string> = 'foo.bar'
 * ```
 */
export type SuggestChildPaths<
  T,
  PT extends PathTuple,
  U = unknown,
> = SuggestChildPathsImpl<PT, EvaluatePath<T, PT>, U>;

/**
 * Type to implement {@link SuggestPaths} without having to compute the valid
 * path prefix more than once.
 * @typeParam T   - type which is indexed by the path
 * @typeParam PT  - the current path into the type as a {@link PathTuple}
 * @typeParam U   - constraint type
 * @typeParam VPT - the valid path prefix for the given path
 */
type SuggestPathsImpl<T, PT extends PathTuple, U, VPT extends PathTuple> =
  | SuggestChildPaths<T, VPT, U>
  | (PT extends VPT ? SuggestParentPath<VPT> : JoinPathTuple<VPT>);

/**
 * Type which given a type and a {@link PathTuple} into it returns
 *  - its parent/predecessor {@link PathString}
 *  - all its child/successor paths that point to a type which is either
 *    traversable or matches the constraint type.
 * In case the path does not exist it returns all of the above for the last
 * valid path (see {@link ValidPathPrefix}).
 * @typeParam T  - type which is indexed by the path
 * @typeParam PT - the current path into the type as a {@link PathTuple}
 * @typeParam U  - constraint type
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
export type SuggestPaths<
  T,
  PT extends PathTuple,
  U = unknown,
> = SuggestPathsImpl<T, PT, U, ValidPathPrefix<T, PT>>;

/**
 * Type to implement {@link AutoCompletePath} without having to compute the
 * key list more than once.
 * @typeParam T  - type which is indexed by the path
 * @typeParam PS - the current path into the type as a {@link PathString}
 * @typeParam U  - constraint type
 * @typeParam PT - the current path into the type as a {@link PathTuple}
 */
type AutoCompletePathImpl<T, PS extends PathString, U, PT extends PathTuple> =
  | SuggestPaths<T, PT, U>
  | (IsPathValid<T, PT> extends true
      ? EvaluatePath<T, PT> extends U
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
  U = unknown,
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
  TPathString
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
