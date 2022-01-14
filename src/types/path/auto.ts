import { FieldValues } from '../fields';

import * as Branded from './branded';
import * as Lazy from './lazy';
import { PathString } from './pathString';

/**
 * Type which offers autocompletion of paths through a form.
 * @typeParam TFieldValues - the field values for which this path is valid
 * @typeParam TPathString - the string representation of the path
 * @typeParam TValue - the value which may be read from the path
 * @typeParam TValueSet - the value which can be written to the path
 * @example
 * ```
 * declare function getNumber<T extends FieldValues, P extends PathString>(
 *   obj: T,
 *   path: TypedFieldPath<T, P, number>,
 * ): number
 * ```
 */
export type TypedFieldPath<
  TFieldValues,
  TPathString extends PathString,
  TValue,
  TValueSet = TValue,
> =
  | Branded.TypedFieldPath<TFieldValues, TValue, TValueSet>
  | Lazy.TypedFieldPath<TFieldValues, TPathString, TValue, TValueSet>;

/**
 * Type which offers autocompletion of paths through a form.
 * @typeParam TFieldValues - the field values for which this path is valid
 * @typeParam TPathString - the string representation of the path
 * @example
 * ```
 * declare function get<T extends FieldValues, P extends PathString>(
 *   obj: T,
 *   path: FieldPath<T, P>,
 * ): FieldPathValue<T, P>
 * ```
 */
export type FieldPath<TFieldValues, TPathString extends PathString> =
  | Branded.FieldPath<TFieldValues>
  | Lazy.FieldPath<TFieldValues, TPathString>;

/**
 * Type which offers autocompletion of paths through a form which point to an array.
 * @typeParam TFieldValues - the field values for which this path is valid
 * @typeParam TPathString - the string representation of the path
 * @typeParam TArrayValues - the value which may be read from array at the path
 * @typeParam TArrayValuesSet - the value which can be written to the array at the path
 * @example
 * ```
 * declare function popNumber<T extends FieldValues, P extends PathString>(
 *   obj: T,
 *   path: TypedFieldArrayPath<T, P, number>,
 * ): number
 * ```
 */
export type TypedFieldArrayPath<
  TFieldValues,
  TPathString extends PathString,
  TArrayValues extends FieldValues,
  TArrayValuesSet extends FieldValues = TArrayValues,
> =
  | Branded.TypedFieldArrayPath<TFieldValues, TArrayValues, TArrayValuesSet>
  | Lazy.TypedFieldArrayPath<
      TFieldValues,
      TPathString,
      TArrayValues,
      TArrayValuesSet
    >;

/**
 * Type which offers autocompletion of paths through a form which point to an array.
 * @typeParam TFieldValues - the field values for which this path is valid
 * @typeParam TPathString - the string representation of the path
 * @example
 * ```
 * declare function pop<T extends FieldValues, P extends PathString>(
 *   obj: T,
 *   path: FieldArrayPath<T, P>,
 * ): FieldPathValue<T, P>[never]
 * ```
 */
export type FieldArrayPath<TFieldValues, TPathString extends PathString> =
  | Branded.FieldArrayPath<TFieldValues>
  | Lazy.FieldArrayPath<TFieldValues, TPathString>;

/**
 * Type which offers autocompletion for a tuple of paths through a form.
 * @typeParam TFieldValues - the field values for which this path is valid
 * @typeParam TPathStrings - the string representations of the paths
 * @example
 * ```
 * declare function get<
 *   T extends FieldValues,
 *   P extends ReadonlyArray<PathString>,
 * >(obj: T, paths: FieldPaths<T, P>): FieldPathValues<T, P>
 * ```
 */
export type FieldPaths<
  TFieldValues,
  TPathStrings extends ReadonlyArray<PathString>,
> = {
  [Idx in keyof TPathStrings]: FieldPath<
    TFieldValues,
    Extract<TPathStrings[Idx], PathString>
  >;
};
