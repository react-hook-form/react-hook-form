import { IsNever, IsUnknown } from '../utils';

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
  TFieldValues,
  TPathString extends PathString,
> = IsNever<TPathString> extends true
  ? unknown
  : TPathString extends Branded.FieldPath<any>
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
  TFieldValues,
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
  TFieldValues,
  TPathStrings extends ReadonlyArray<PathString>,
> = IsNever<TPathStrings> extends true
  ? unknown[]
  : {
      [Idx in keyof TPathStrings]: FieldPathValue<
        TFieldValues,
        Extract<TPathStrings[Idx], PathString>
      >;
    };

/**
 * Type for computing the value of a path only if TS failed to infer it, i.e,
 * inferred it to unknown.
 * @typeParam TFieldValues   - the field values for which this path is valid
 * @typeParam TPathString    - the string representation of the path
 * @typeParam TInferredValue - the inferred type
 * @example
 * ```
 * declare function get<T extends FieldValues, P extends PathString, I = unknown>(
 *   obj: T,
 *   path: Auto.FieldPath<T, P>,
 * ): TryInferFieldPathValue<T, P, I>
 * ```
 */
export type TryInferFieldPathValue<
  TFieldValues,
  TPathString extends PathString,
  TInferredValue,
> = IsUnknown<TInferredValue> extends false
  ? TInferredValue
  : FieldPathValue<TFieldValues, TPathString>;

/**
 * Type for computing the value which is required for setting a path only if TS
 * failed to infer it, i.e., inferred it to never.
 * @typeParam TFieldValues      - the field values for which this path is valid
 * @typeParam TPathString       - the string representation of the path
 * @typeParam TInferredValueSet - the inferred type
 * @example
 * ```
 * declare function set<T extends FieldValues, P extends PathString, I = never>(
 *   obj: T,
 *   path: Auto.FieldPath<T, P>,
 *   value: TryInferFieldPathSetValue<T, P, I>
 * ): void
 * ```
 */
export type TryInferFieldPathSetValue<
  TFieldValues,
  TPathString extends PathString,
  TInferredValueSet,
> = IsNever<TInferredValueSet> extends false
  ? TInferredValueSet
  : FieldPathSetValue<TFieldValues, TPathString>;
