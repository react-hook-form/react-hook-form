import * as React from 'react';

import { RegisterOptions } from './validator';
import {
  Control,
  ControllerFieldStateError,
  FieldPath,
  FieldPathValue,
  FieldValues,
  Noop,
  RefCallBack,
  UnpackNestedValue,
  UseFormStateReturn,
} from './';

export type ControllerFieldState<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  invalid: boolean;
  isTouched: boolean;
  isDirty: boolean;
  error?: ControllerFieldStateError<FieldPathValue<TFieldValues, TFieldName>>;
};

export type ControllerRenderProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  onChange: (...event: any[]) => void;
  onBlur: Noop;
  value: UnpackNestedValue<FieldPathValue<TFieldValues, TName>>;
  name: TName;
  ref: RefCallBack;
};

export type UseControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
  rules?: Omit<
    RegisterOptions<TFieldValues, TName>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >;
  shouldUnregister?: boolean;
  defaultValue?: UnpackNestedValue<FieldPathValue<TFieldValues, TName>>;
  control?: Control<TFieldValues>;
};

export type UseControllerReturn<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  field: ControllerRenderProps<TFieldValues, TName>;
  formState: UseFormStateReturn<TFieldValues>;
  fieldState: ControllerFieldState<TFieldValues, TName>;
};

export type ControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  render: ({
    field,
    fieldState,
    formState,
  }: {
    field: ControllerRenderProps<TFieldValues, TName>;
    fieldState: ControllerFieldState<TFieldValues, TName>;
    formState: UseFormStateReturn<TFieldValues>;
  }) => React.ReactElement;
} & UseControllerProps<TFieldValues, TName>;
