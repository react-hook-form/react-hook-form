import type { ReactNode } from 'react';

import type { FieldValues } from './fields';
import type { Control } from './form';
import type { FieldPath, FieldPathValue, FieldPathValues } from './path';
import type { DeepPartialSkipArrayKey } from './utils';

export type UseWatchProps<TFieldValues extends FieldValues = FieldValues> = {
  defaultValue?: unknown;
  disabled?: boolean;
  name?:
    | FieldPath<TFieldValues>
    | FieldPath<TFieldValues>[]
    | readonly FieldPath<TFieldValues>[];
  control?: Control<TFieldValues>;
  exact?: boolean;
  compute?: (formValues: TFieldValues) => TFieldValues;
};

export type WatchDefaultValue<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName = undefined,
> =
  TFieldName extends FieldPath<TFieldValues>
    ? FieldPathValue<TFieldValues, TFieldName>
    : DeepPartialSkipArrayKey<TFieldValues>;

export type WatchName<TFieldValues extends FieldValues> =
  | FieldPath<TFieldValues>
  | FieldPath<TFieldValues>[]
  | readonly FieldPath<TFieldValues>[]
  | readonly [FieldPath<TFieldValues>, ...FieldPath<TFieldValues>[]]
  | undefined;

export type WatchValue<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName = undefined,
> = TFieldName extends readonly FieldPath<TFieldValues>[]
  ? FieldPathValues<TFieldValues, TFieldName>
  : TFieldName extends FieldPath<TFieldValues>
    ? FieldPathValue<TFieldValues, TFieldName>
    : TFieldValues;

export type WatchRenderValue<
  TFieldValues extends FieldValues,
  TFieldName,
  TComputeValue,
> = TComputeValue extends undefined
  ? WatchValue<TFieldValues, TFieldName>
  : TComputeValue;

export type WatchProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends WatchName<TFieldValues> = undefined,
  TContext = any,
  TTransformedValues = TFieldValues,
  TComputeValue = undefined,
> = {
  control?: Control<TFieldValues, TContext, TTransformedValues>;
  /**
   * @deprecated This prop will be renamed to `name` in the next major release.
   * Use `name` instead.
   */
  names?: TFieldName;
  name?: TFieldName;
  disabled?: boolean;
  exact?: boolean;
  defaultValue?: WatchDefaultValue<TFieldValues, TFieldName>;
  compute?: (value: WatchValue<TFieldValues, TFieldName>) => TComputeValue;
  render: (
    value: WatchRenderValue<TFieldValues, TFieldName, TComputeValue>,
  ) => ReactNode | ReactNode[];
};
