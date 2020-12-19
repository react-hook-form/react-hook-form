import * as React from 'react';
import {
  UseFormMethods,
  FieldValues,
  FieldName,
  Control,
  InputState,
} from './';
import { RegisterOptions } from './validator';

export type FormProviderProps<
  TFieldValues extends FieldValues = FieldValues
> = {
  children: React.ReactNode;
} & UseFormMethods<TFieldValues>;

export type ControllerRenderProps<
  TFieldValues extends FieldValues = FieldValues
> = {
  onChange: (...event: any[]) => void;
  onBlur: () => void;
  value: any;
  name: FieldName<Control<TFieldValues>>;
  ref: React.MutableRefObject<any>;
};

export type UseControllerOptions<
  TFieldValues extends FieldValues = FieldValues
> = {
  name: FieldName<TFieldValues>;
  rules?: Exclude<
    RegisterOptions,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs'
  >;
  onFocus?: () => void;
  defaultValue?: unknown;
  control?: Control<TFieldValues>;
};

export type ControllerProps<TFieldValues extends FieldValues = FieldValues> = {
  render: ({
    field,
    meta,
  }: {
    field: ControllerRenderProps<TFieldValues>;
    meta: InputState;
  }) => React.ReactElement;
} & UseControllerOptions;
