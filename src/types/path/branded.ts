import { FieldValues } from '../fields';

import { AccessPattern } from './internal/utils';

declare const FORM_VALUES: unique symbol;
declare const ACCESS_PATTERN: unique symbol;

export type TypedFieldPath<
  TFormValues extends FieldValues,
  TValue,
  TValueSet = TValue,
> = string & {
  [FORM_VALUES]: TFormValues;
  [ACCESS_PATTERN]: AccessPattern<TValue, TValueSet>;
};

export type FieldPath<TFormValues extends FieldValues> = TypedFieldPath<
  TFormValues,
  unknown,
  never
>;

export type TypedFieldArrayPath<
  TFormValues extends FieldValues,
  TArrayValues extends FieldValues,
  TArrayValuesSet extends FieldValues = TArrayValues,
> = TypedFieldPath<
  TFormValues,
  ReadonlyArray<TArrayValues> | null | undefined,
  TArrayValuesSet[]
>;

export type FieldArrayPath<TFormValues extends FieldValues> = TypedFieldPath<
  TFormValues,
  ReadonlyArray<FieldValues> | null | undefined,
  never[]
>;
