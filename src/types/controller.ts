import React from 'react';

import { RegisterOptions } from './validator';
import {
  Auto,
  Control,
  FieldError,
  FieldPathValue,
  FieldValues,
  Noop,
  PathString,
  RefCallBack,
  UnpackNestedValue,
  UseFormStateReturn,
} from './';

export type ControllerFieldState = {
  invalid: boolean;
  touched: boolean;
  dirty: boolean;
  error?: FieldError;
};

export type ControllerRenderProps<
  TFieldValues extends FieldValues,
  TName extends PathString,
> = {
  onChange: (...event: any[]) => void;
  onBlur: Noop;
  value: UnpackNestedValue<FieldPathValue<TFieldValues, TName>>;
  name: TName;
  ref: RefCallBack;
};

export type UseControllerProps<
  TFieldValues extends FieldValues,
  TName extends PathString,
> = {
  name: Auto.FieldPath<TFieldValues, TName>;
  rules?: Omit<
    RegisterOptions<TFieldValues, TName>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >;
  unregister?: boolean;
  defaultValue?: UnpackNestedValue<FieldPathValue<TFieldValues, TName>>;
  control?: Control<TFieldValues>;
};

export type UseControllerReturn<
  TFieldValues extends FieldValues,
  TName extends PathString,
> = {
  field: ControllerRenderProps<TFieldValues, TName>;
  formState: UseFormStateReturn<TFieldValues>;
  fieldState: ControllerFieldState;
};

export type ControllerProps<
  TFieldValues extends FieldValues,
  TName extends PathString,
> = {
  render: ({
    field,
    fieldState,
    formState,
  }: {
    field: ControllerRenderProps<TFieldValues, TName>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<TFieldValues>;
  }) => React.ReactElement;
} & UseControllerProps<TFieldValues, TName>;
