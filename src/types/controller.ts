import * as React from 'react';

import { RegisterOptions } from './validator';
import {
  Control,
  FieldErrors,
  FieldPath,
  FieldPathValue,
  FieldValues,
  RefCallBack,
  UnpackNestedValue,
  UseFormStateReturn,
} from './';

export type ControllerFieldState<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues, any> = FieldPath<
    TFieldValues,
    any
  >,
> = {
  invalid: boolean;
  isTouched: boolean;
  isDirty: boolean;
  error?: FieldErrors<FieldPathValue<TFieldValues, TFieldName>>;
};

export type ControllerRenderProps<
  TFieldValues extends FieldValues = FieldValues,
  TResult = unknown,
  TName extends FieldPath<TFieldValues, TResult> = FieldPath<
    TFieldValues,
    TResult
  >,
> = {
  onChange: (...event: any[]) => void;
  onBlur: () => void;
  value: UnpackNestedValue<FieldPathValue<TFieldValues, TName>>;
  name: TName;
  ref: RefCallBack;
};

export type UseControllerProps<
  TFieldValues extends FieldValues,
  TResult,
  TName extends FieldPath<TFieldValues, TResult> = FieldPath<
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
  TFieldValues extends FieldValues,
  TResult,
  TName extends FieldPath<TFieldValues, TResult> = FieldPath<
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
  TResult = unknown,
  TName extends FieldPath<TFieldValues, TResult> = FieldPath<
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
