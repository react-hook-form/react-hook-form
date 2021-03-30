import * as React from 'react';
import {
  FieldValues,
  Control,
  FieldPath,
  FieldError,
  UseFormStateReturn,
  FieldPathValue,
} from './';
import { RegisterOptions } from './validator';

export type ControllerFieldState = {
  invalid: boolean;
  isTouched: boolean;
  isDirty: boolean;
  isValidating: boolean;
  error: FieldError;
};

export type ControllerRenderProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  onChange: (...event: any[]) => void;
  onBlur: () => void;
  value: FieldPathValue<TFieldValues, TName>;
  name: TName;
  ref: React.Ref<any>;
};

export type UseControllerProps<
  TFieldValues extends FieldValues = FieldValues
> = {
  name: FieldPath<TFieldValues>;
  rules?: Exclude<
    RegisterOptions,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs'
  >;
  defaultValue?: unknown;
  control?: Control<TFieldValues>;
};

export type UseControllerReturn<
  TFieldValues extends FieldValues = FieldValues
> = {
  field: ControllerRenderProps<TFieldValues>;
  formState: UseFormStateReturn<TFieldValues>;
  fieldState: ControllerFieldState;
};

export type ControllerProps<TFieldValues extends FieldValues = FieldValues> = {
  render: ({
    field,
    fieldState,
    formState,
  }: {
    field: ControllerRenderProps<TFieldValues>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<TFieldValues>;
  }) => React.ReactElement;
} & UseControllerProps<TFieldValues>;
