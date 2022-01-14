import { FieldValues } from '../fields';

import { PathGetValue } from './internal/pathGetValue';
import { PathSetValue } from './internal/pathSetValue';
import { SplitPathString } from './internal/pathTuple';
import * as Branded from './branded';
import { PathString } from './pathString';

/**
 * Type for getting the value of a path.
 * @typeParam TFieldValues - the field values for which this path is valid
 * @typeParam TPathString - the string representation of the path
 * @example
 * ```
 * declare function get<T extends FieldValues, P extends PathString>(
 *   obj: T,
 *   path: Auto.FieldPath<T, P>,
 * ): FieldPathValue<T, P>
 * ```
 */
export type FieldPathValue<
  TFieldValues extends FieldValues,
  TPathString extends PathString,
> = TPathString extends Branded.FieldPath<any>
  ? TPathString extends Branded.TypedFieldPath<TFieldValues, infer Value, never>
    ? Value
    : unknown
  : PathGetValue<TFieldValues, SplitPathString<TPathString>>;

/**
 * Type for getting the value which required for setting a path.
 * @typeParam TFieldValues - the field values for which this path is valid
 * @typeParam TPathString - the string representation of the path
 * @example
 * ```
 * declare function set<T extends FieldValues, P extends PathString>(
 *   obj: T,
 *   path: Auto.FieldPath<T, P>,
 *   value: FieldPathSetValue<T, P>
 * ): void
 * ```
 */
export type FieldPathSetValue<
  TFieldValues extends FieldValues,
  TPathString extends PathString,
> = TPathString extends Branded.FieldPath<any>
  ? TPathString extends Branded.TypedFieldPath<
      TFieldValues,
      unknown,
      infer Value
    >
    ? Value
    : never
  : PathSetValue<TFieldValues, SplitPathString<TPathString>>;

/**
 * Type for getting the values of a tuple of paths.
 * @typeParam TFieldValues - the field values for which the paths are valid
 * @typeParam TPathStrings - the string representations of the paths
 * @example
 * ```
 * declare function get<
 *   T extends FieldValues,
 *   P extends ReadonlyArray<PathString>,
 * >(obj: T, paths: Auto.FieldPaths<T, P>): FieldPathValues<T, P>
 * ```
 */
export type FieldPathValues<
  TFieldValues extends FieldValues,
  TPathStrings extends ReadonlyArray<PathString>,
> = {
  [Idx in keyof TPathStrings]: FieldPathValue<
    TFieldValues,
    Extract<TPathStrings[Idx], PathString>
  >;
};
