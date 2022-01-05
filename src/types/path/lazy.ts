import { FieldValues } from '../fields';

import { AutoCompletePath } from './internal/autoCompletePath';
import { AccessPattern } from './internal/utils';
import { PathString } from './pathString';

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
  AccessPattern<ReadonlyArray<FieldValues> | null | undefined, never[]>
>;

/**
 * See {@link LazyArrayPath}
 */
export type LazyFieldArrayPath<
  TFieldValues extends FieldValues,
  TPathString extends PathString,
> = LazyArrayPath<TFieldValues, TPathString>;
