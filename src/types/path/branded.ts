import { FieldValues } from '../fields';

import { AccessPattern } from './internal/utils';

declare const FORM_VALUES: unique symbol;
declare const ACCESS_PATTERN: unique symbol;

/**
 * Type which describes a path through a form.
 * @typeParam TFieldValues - the field values for which this path is valid
 * @typeParam TValue - the value which may be read from the path
 * @typeParam TValueSet - the value which can be written to the path
 * @example
 * ```
 * declare function getNumber<T extends FieldValues>(
 *   obj: T,
 *   path: TypedFieldPath<T, number>,
 * ): number
 * ```
 */
export type TypedFieldPath<
  TFieldValues extends FieldValues,
  TValue,
  TValueSet = TValue,
> = string & {
  [FORM_VALUES]: TFieldValues;
  [ACCESS_PATTERN]: AccessPattern<TValue, TValueSet>;
};

/**
 * Type which describes a path through a form.
 * @typeParam TFieldValues - the field values for which this path is valid
 * @example
 * ```
 * declare function get<T extends FieldValues, P extends FieldPath<T>>(
 *   obj: T,
 *   path: P,
 * ): FieldPathValue<T, P>
 * ```
 */
export type FieldPath<TFieldValues extends FieldValues> = TypedFieldPath<
  TFieldValues,
  unknown,
  never
>;

/**
 * Type which describes a path through a form and points to an array.
 * @typeParam TFieldValues - the field values for which this path is valid
 * @typeParam TArrayValues - the value which may be read from array at the path
 * @typeParam TArrayValuesSet - the value which can be written to the array at the path
 * @example
 * ```
 * declare function popNumber<T extends FieldValues>(
 *   obj: T,
 *   path: TypedFieldArrayPath<T, number>,
 * ): number
 * ```
 */
export type TypedFieldArrayPath<
  TFieldValues extends FieldValues,
  TArrayValues extends FieldValues,
  TArrayValuesSet extends FieldValues = TArrayValues,
> = TypedFieldPath<
  TFieldValues,
  ReadonlyArray<TArrayValues> | null | undefined,
  TArrayValuesSet[]
>;

/**
 * Type which describes a path through a form and points to an array.
 * @typeParam TFieldValues - the field values for which this path is valid
 * @example
 * ```
 * declare function pop<T extends FieldValues, P extends FieldArrayPath<T>>(
 *   obj: T,
 *   path: P,
 * ): FieldPathValue<T, P>[never]
 * ```
 */
export type FieldArrayPath<TFieldValues extends FieldValues> =
  TypedFieldArrayPath<TFieldValues, FieldValues, never>;
