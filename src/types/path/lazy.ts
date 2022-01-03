import { FieldValues } from '../fields';
import { IsNever } from '../utils';

import {
  Constraint,
  GetPath,
  HasPath,
  JoinPathTuple,
  Key,
  Keys,
  PathString,
  PathTuple,
  SetPath,
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
 * @typeParam C   - constraint
 */
type SuggestChildPathsImpl<
  PT extends PathTuple,
  TPT,
  C extends Constraint,
> = JoinPathTuple<
  [...PT, Keys<TPT, C> | Keys<TPT, Constraint<Traversable | undefined | null>>]
>;

/**
 * Type, which given a type and a path into the type, returns all paths as
 * {@link PathString}s which can be used to index the type at that path.
 * Filters out paths whose value doesn't match the constraint type or
 * aren't traversable.
 * @typeParam T  - type which is indexed by the path
 * @typeParam PT - the current path into the type as a {@link PathTuple}
 * @typeParam C  - constraint
 * @example
 * ```
 * SuggestChildPaths<{foo: string, bar: string}, [], Constraint<string>>
 *   = 'foo' | 'bar'
 * SuggestChildPaths<{foo: string, bar: number}, [], Constraint<string>>
 *   = 'foo'
 * SuggestChildPaths<{foo: {bar: string}}, ['foo']> = 'foo.bar'
 * SuggestChildPaths<{foo: {bar: string[]}}, ['foo']> = 'foo.bar'
 * ```
 */
export type SuggestChildPaths<
  T,
  PT extends PathTuple,
  C extends Constraint = Constraint,
> = PT extends any ? SuggestChildPathsImpl<PT, GetPath<T, PT>, C> : never;

/**
 * Type to implement {@link SuggestPaths} without having to compute the valid
 * path prefix more than once.
 * @typeParam T   - type which is indexed by the path
 * @typeParam PT  - the current path into the type as a {@link PathTuple}
 * @typeParam C   - constraint
 * @typeParam VPT - the valid path prefix for the given path
 */
type SuggestPathsImpl<
  T,
  PT extends PathTuple,
  C extends Constraint,
  VPT extends PathTuple,
> =
  | SuggestChildPaths<T, VPT, C>
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
 * @typeParam C  - constraint
 * @example
 * ```
 * SuggestPaths<{foo: {bar: string}}, ['foo'], string> = 'foo.bar'
 * SuggestPaths<{foo: {bar: string}}, ['foo', 'ba'], Constraint<string>>
 *   = 'foo' | 'foo.bar'
 * SuggestPaths<{foo: {bar: string}}, ['foo', 'bar'], Constraint<string>>
 *   = 'foo'
 * SuggestPaths<{foo: {bar: {baz: string}}}, ['foo', 'bar'], Constraint<string>>
 *   = 'foo' | 'foo.bar.baz'
 * ```
 */
export type SuggestPaths<
  T,
  PT extends PathTuple,
  C extends Constraint = Constraint,
> = SuggestPathsImpl<T, PT, C, ValidPathPrefix<T, PT>>;

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
 * Type to check the current path against the constraint type.
 * Returns the path if it is valid and matches the constraint type.
 * @typeParam T  - type which is indexed by the path
 * @typeParam PS - the current path into the type as a {@link PathString}
 * @typeParam PT - the current path into the type as a {@link PathTuple}
 * @typeParam C  - constraint
 */
type AutoCompletePathCheckConstraint<
  T,
  PS extends PathString,
  PT extends PathTuple,
  C extends Constraint,
> = HasPath<T, PT> extends true
  ? Constraint<GetPath<T, PT>, SetPath<T, PT>> extends C
    ? PS extends JoinPathTuple<PT>
      ? PS
      : JoinPathTuple<PT>
    : never
  : never;

/**
 * Type to implement {@link AutoCompletePath} without having to compute the
 * key list more than once.
 * @typeParam T  - type which is indexed by the path
 * @typeParam PS - the current path into the type as a {@link PathString}
 * @typeParam PT - the current path into the type as a {@link PathTuple}
 * @typeParam C  - constraint
 */
type AutoCompletePathImpl<
  T,
  PS extends PathString,
  PT extends PathTuple,
  C extends Constraint,
> = SuggestPaths<T, PT, C> | AutoCompletePathCheckConstraint<T, PS, PT, C>;

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
 * @typeParam C  - constraint
 * @example
 * ```
 * AutoCompletePath<{foo: {bar: string}}, 'foo', Constraint<string>> = 'foo.bar'
 * AutoCompletePath<{foo: {bar: string}}, 'foo.ba', Constraint<string>>
 *   = 'foo' | 'foo.bar'
 * AutoCompletePath<{foo: {bar: string}}, 'foo.bar', Constraint<string>>
 *   = 'foo' | 'foo.bar'
 * AutoCompletePath<{foo: {bar: {baz: string}}}, 'foo.bar', Constraint<string>>
 *   = 'foo' | 'foo.bar.baz'
 * ```
 */
export type AutoCompletePath<
  T,
  PS extends PathString,
  C extends Constraint = Constraint,
> = IsPathUnion<PS> extends false
  ? AutoCompletePathImpl<T, PS, SplitPathString<PS>, C>
  : PS extends any
  ? AutoCompletePathCheckConstraint<T, PS, SplitPathString<PS>, C>
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
  Constraint<ReadonlyArray<FieldValues> | null | undefined, never[]>
>;

/**
 * See {@link LazyArrayPath}
 */
export type LazyFieldArrayPath<
  TFieldValues extends FieldValues,
  TPathString extends PathString,
> = LazyArrayPath<TFieldValues, TPathString>;
