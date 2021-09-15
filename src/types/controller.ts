import * as React from 'react';

import { RegisterOptions } from './validator';
import {
  Control,
  FieldErrors,
  FieldPath,
  FieldPathValue,
  FieldPathWithValue,
  FieldValues,
  RefCallBack,
  UseFormStateReturn,
} from './';

export type ControllerFieldState<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  invalid: boolean;
  isTouched: boolean;
  isDirty: boolean;
  error?: FieldErrors<FieldPathValue<TFieldValues, TFieldName>>;
};

export type ControllerRenderProps<
  TFieldValues extends FieldValues = FieldValues,
  TResult = FieldPathValue<TFieldValues, FieldPath<TFieldValues>>,
  TName extends FieldPathWithValue<TFieldValues, TResult> = FieldPathWithValue<
    TFieldValues,
    TResult
  >,
> = {
  onChange: (...event: any[]) => void;
  onBlur: () => void;
  value: TResult;
  name: TName;
  ref: RefCallBack;
};

export type UseControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TResult = FieldPathValue<TFieldValues, FieldPath<TFieldValues>>,
  TName extends FieldPathWithValue<TFieldValues, TResult> = FieldPathWithValue<
    TFieldValues,
    TResult
  >,
> = {
  name: TName;
  rules?: Omit<
    RegisterOptions<TFieldValues, TName>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >;
  shouldUnregister?: boolean;
  defaultValue?: TResult;
  control?: Control<TFieldValues>;
};

export type UseControllerReturn<
  TFieldValues extends FieldValues = FieldValues,
  TResult = FieldPathValue<TFieldValues, FieldPath<TFieldValues>>,
  TName extends FieldPathWithValue<TFieldValues, TResult> = FieldPathWithValue<
    TFieldValues,
    TResult
  >,
> = {
  field: ControllerRenderProps<TFieldValues, TResult, TName>;
  formState: UseFormStateReturn<TFieldValues>;
  fieldState: ControllerFieldState<TFieldValues, TName>;
};

export type ControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TResult = FieldPathValue<TFieldValues, FieldPath<TFieldValues>>,
  TName extends FieldPathWithValue<TFieldValues, TResult> = FieldPathWithValue<
    TFieldValues,
    TResult
  >,
> = {
  render: ({
    field,
    fieldState,
    formState,
  }: {
    field: ControllerRenderProps<TFieldValues, TResult, TName>;
    fieldState: ControllerFieldState<TFieldValues, TName>;
    formState: UseFormStateReturn<TFieldValues>;
  }) => React.ReactElement;
} & UseControllerProps<TFieldValues, TResult, TName>;
