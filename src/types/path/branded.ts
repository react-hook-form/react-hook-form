import { FieldValues } from '../fields';

import { AccessPattern } from './internal/utils';

declare const FORM_VALUES: unique symbol;
declare const ACCESS_PATTERN: unique symbol;

export type TypedFieldPath<
  TFieldValues extends FieldValues,
  TValue,
  TValueSet = TValue,
> = string & {
  [FORM_VALUES]: TFieldValues;
  [ACCESS_PATTERN]: AccessPattern<TValue, TValueSet>;
};

export type FieldPath<TFieldValues extends FieldValues> = TypedFieldPath<
  TFieldValues,
  unknown,
  never
>;

export type TypedFieldArrayPath<
  TFieldValues extends FieldValues,
  TArrayValues extends FieldValues,
  TArrayValuesSet extends FieldValues = TArrayValues,
> = TypedFieldPath<
  TFieldValues,
  ReadonlyArray<TArrayValues> | null | undefined,
  TArrayValuesSet[]
>;

export type FieldArrayPath<TFieldValues extends FieldValues> = TypedFieldPath<
  TFieldValues,
  ReadonlyArray<FieldValues> | null | undefined,
  never[]
>;
