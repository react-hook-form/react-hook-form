import { IsNever } from '../../utils';
import { PathString } from '../pathString';

import { HasPath, ValidPathPrefix } from './hasPath';
import { Keys } from './keys';
import { PathGetValue } from './pathGetValue';
import { PathSetValue } from './pathSetValue';
import { JoinPathTuple, PathTuple, SplitPathString } from './pathTuple';
import { AccessPattern, Key, Traversable, UnionToIntersection } from './utils';

/**
 * Type, which given a path, returns the parent path as a string
 * @typeParam PT - path represented as a tuple
 * @example
 * ```
 * SuggestParentPath<['foo', 'bar', 'baz']> = 'foo.bar'
 * SuggestParentPath<['foo', 'bar']> = 'foo'
 * SuggestParentPath<['foo']> = never
 * ```
 * @internal
 */
export type SuggestParentPath<PT extends PathTuple> = JoinPathTuple<
  PT extends [...infer R, Key] ? R : []
>;

/**
 * Type to implement {@link SuggestChildPaths}.
 * @typeParam PT  - the current path as a {@link PathTuple}
 * @typeParam TPT - the type at that path
 * @typeParam C   - constraint
 * @internal
 */
type SuggestChildPathsImpl<
  PT extends PathTuple,
  TPT,
  C extends AccessPattern,
> = JoinPathTuple<
  [
    ...PT,
    Keys<TPT, C> | Keys<TPT, AccessPattern<Traversable | undefined | null>>,
  ]
>;

/**
 * Type, which given a type and a path into the type, returns all paths as
 * strings which can be used to index the type at that path.
 * Filters out paths whose value doesn't match the constraint type or
 * aren't traversable.
 * @typeParam T  - type which is indexed by the path
 * @typeParam PT - the current path into the type as a tuple
 * @typeParam C  - constraint
 * @example
 * ```
 * SuggestChildPaths<{foo: string, bar: string}, [], AccessPattern<string>>
 *   = 'foo' | 'bar'
 * SuggestChildPaths<{foo: string, bar: number}, [], AccessPattern<string>>
 *   = 'foo'
 * SuggestChildPaths<{foo: {bar: string}}, ['foo']> = 'foo.bar'
 * SuggestChildPaths<{foo: {bar: string[]}}, ['foo']> = 'foo.bar'
 * ```
 * @internal
 */
export type SuggestChildPaths<
  T,
  PT extends PathTuple,
  C extends AccessPattern = AccessPattern,
> = PT extends any ? SuggestChildPathsImpl<PT, PathGetValue<T, PT>, C> : never;

/**
 * Type to implement {@link SuggestPaths} without having to compute the valid
 * path prefix more than once.
 * @typeParam T   - type which is indexed by the path
 * @typeParam PT  - the current path into the type as a tuple
 * @typeParam C   - constraint
 * @typeParam VPT - the valid path prefix for the given path
 * @internal
 */
type SuggestPathsImpl<
  T,
  PT extends PathTuple,
  C extends AccessPattern,
  VPT extends PathTuple,
> =
  | SuggestChildPaths<T, VPT, C>
  | (PT extends VPT ? SuggestParentPath<VPT> : JoinPathTuple<VPT>);

/**
 * Type which given a type and a path tuple into it returns
 *  - its parent/predecessor path string.
 *  - all its child/successor paths that point to a type which is either
 *    traversable or matches the constraint type.
 * In case the path does not exist it returns all of the above, but for the last
 * valid path prefix.
 * @typeParam T  - type which is indexed by the path
 * @typeParam PT - the current path into the type as a tuple
 * @typeParam C  - constraint
 * @example
 * ```
 * SuggestPaths<{foo: {bar: string}}, ['foo'], string> = 'foo.bar'
 * SuggestPaths<{foo: {bar: string}}, ['foo', 'ba'], AccessPattern<string>>
 *   = 'foo' | 'foo.bar'
 * SuggestPaths<{foo: {bar: string}}, ['foo', 'bar'], AccessPattern<string>>
 *   = 'foo'
 * SuggestPaths<{foo: {bar: {baz: string}}}, ['foo', 'bar'], AccessPattern<string>>
 *   = 'foo' | 'foo.bar.baz'
 * ```
 * @internal
 */
export type SuggestPaths<
  T,
  PT extends PathTuple,
  C extends AccessPattern = AccessPattern,
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
 * @internal
 */
type IsPathUnion<PS extends PathString> = IsNever<UnionToIntersection<PS>>;

/**
 * Type to check the current path against the constraint type.
 * Returns the path if it is valid and matches the constraint type.
 * @typeParam T  - type which is indexed by the path
 * @typeParam PS - the current path into the type as a string
 * @typeParam PT - the current path into the type as a tuple
 * @typeParam C  - constraint
 * @internal
 */
type AutoCompletePathCheckConstraint<
  T,
  PS extends PathString,
  PT extends PathTuple,
  C extends AccessPattern,
> = HasPath<T, PT> extends true
  ? AccessPattern<PathGetValue<T, PT>, PathSetValue<T, PT>> extends C
    ? PS extends JoinPathTuple<PT>
      ? PS
      : JoinPathTuple<PT>
    : never
  : never;

/**
 * Type to implement {@link AutoCompletePath} without having to compute the
 * key list more than once.
 * @typeParam T  - type which is indexed by the path
 * @typeParam PS - the current path into the type as a string
 * @typeParam PT - the current path into the type as a tuple
 * @typeParam C  - constraint
 * @internal
 */
type AutoCompletePathImpl<
  T,
  PS extends PathString,
  PT extends PathTuple,
  C extends AccessPattern,
> = SuggestPaths<T, PT, C> | AutoCompletePathCheckConstraint<T, PS, PT, C>;

/**
 * Type which given a type and a path string into it returns
 *  - its parent/predecessor path string.
 *  - the path string itself, if it exists within the type and matches
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
 * @typeParam PS - the current path into the type as a string
 * @typeParam C  - constraint
 * @example
 * ```
 * AutoCompletePath<{foo: {bar: string}}, 'foo', AccessPattern<string>> = 'foo.bar'
 * AutoCompletePath<{foo: {bar: string}}, 'foo.ba', AccessPattern<string>>
 *   = 'foo' | 'foo.bar'
 * AutoCompletePath<{foo: {bar: string}}, 'foo.bar', AccessPattern<string>>
 *   = 'foo' | 'foo.bar'
 * AutoCompletePath<{foo: {bar: {baz: string}}}, 'foo.bar', AccessPattern<string>>
 *   = 'foo' | 'foo.bar.baz'
 * ```
 * @internal
 */
export type AutoCompletePath<
  T,
  PS extends PathString,
  C extends AccessPattern = AccessPattern,
> = IsPathUnion<PS> extends false
  ? AutoCompletePathImpl<T, PS, SplitPathString<PS>, C>
  : PS extends any
  ? AutoCompletePathCheckConstraint<T, PS, SplitPathString<PS>, C>
  : never;
