import { FieldValues } from '../fields';

import { AutoCompletePath } from './internal/autoCompletePath';
import { AccessPattern } from './internal/utils';
import { PathString } from './pathString';

export type TypedFieldPath<
  TFieldValues extends FieldValues,
  TPathString extends PathString,
  TValue,
  TValueSet = TValue,
> = AutoCompletePath<
  TFieldValues,
  TPathString,
  AccessPattern<TValue, TValueSet>
>;

export type FieldPath<
  TFieldValues extends FieldValues,
  TPathString extends PathString,
> = TypedFieldPath<TFieldValues, TPathString, unknown, never>;

export type TypedFieldArrayPath<
  TFieldValues extends FieldValues,
  TPathString extends PathString,
  TArrayValues extends FieldValues,
  TArrayValuesSet extends FieldValues = TArrayValues,
> = TypedFieldPath<
  TFieldValues,
  TPathString,
  ReadonlyArray<TArrayValues> | null | undefined,
  TArrayValuesSet[]
>;

export type FieldArrayPath<
  TFieldValues extends FieldValues,
  TPathString extends PathString,
> = TypedFieldArrayPath<TFieldValues, TPathString, FieldValues, never>;
