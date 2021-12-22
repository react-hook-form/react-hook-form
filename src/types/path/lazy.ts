import { FieldValues } from '../fields';
import { IsNever } from '../utils';

import {
  EvaluatePath,
  HasPath,
  JoinPathTuple,
  Key,
  Keys,
  PathString,
  PathTuple,
  SplitPathString,
  Traversable,
  UnionToIntersection,
  ValidPathPrefix,
} from './common';

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
  PT extends [...infer R, Key] ? R : []
>;

/**
 * Type to implement {@link SuggestChildPaths}.
 * @typeParam PT  - the current path as a {@link PathTuple}
 * @typeParam TPT - the type at that path
 * @typeParam U   - constraint type
 */
type SuggestChildPathsImpl<
  PT extends PathTuple,
  TPT,
  U,
> = IsNever<TPT> extends true
  ? never
  : JoinPathTuple<[...PT, Keys<TPT, U | Traversable>]>;

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
> = PT extends any ? SuggestChildPathsImpl<PT, EvaluatePath<T, PT>, U> : never;

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
 *  - its parent/predecessor {@link PathString}.
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
 * Type to test whether the path is a union of paths.
 * @typeParam PS - path
 * @example
 * ```
 * IsPathUnion<'foo'> = false
 * IsPathUnion<'foo' | 'foo'> = false
 * IsPathUnion<'foo' | 'foo.bar'> = true
 * ```
 */
type IsPathUnion<PS extends PathString> = IsNever<UnionToIntersection<PS>>;

/**
 * Type to implement {@link AutoCompletePath} without having to compute the
 * key list more than once.
 * @typeParam T  - type which is indexed by the path
 * @typeParam PS - the current path into the type as a {@link PathString}
 * @typeParam U  - constraint type
 * @typeParam PT - the current path into the type as a {@link PathTuple}
 * @typeParam S  - flag whether paths need to be suggested
 */
type AutoCompletePathImpl<
  T,
  PS extends PathString,
  U,
  PT extends PathTuple,
  S extends boolean,
> =
  | (S extends true ? SuggestPaths<T, PT, U> : never)
  | (HasPath<T, PT> extends true
      ? EvaluatePath<T, PT> extends U
        ? PS
        : never
      : never);

/**
 * Type which given a type and a {@link PathString} into it returns
 *  - its parent/predecessor {@link PathString}.
 *  - the {@link PathString} itself, if it exists within the type and matches
 *    the constraint type.
 *  - all its child/successor paths that point to a type which is either
 *    traversable or matches the constraint type.
 * Also,
 *  - in case the path does not exist it returns all of the above for the last
 *    valid path.
 *  - in case the path is a union of paths it doesn't suggest any
 *    parent/predecessor and child/successor paths.
 *    Otherwise, the returned type may become to large, or it may accept paths
 *    which don't match the constraint type.
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
> = IsPathUnion<PS> extends false
  ? AutoCompletePathImpl<T, PS, U, SplitPathString<PS>, true>
  : PS extends any
  ? AutoCompletePathImpl<T, PS, U, SplitPathString<PS>, false>
  : never;

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
