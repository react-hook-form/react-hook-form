import * as React from 'react';
import {
  FieldValues,
  FieldName,
  Control,
  FieldPath,
  InternalFieldName,
} from './';
import { RegisterOptions } from './validator';

export type ControllerMeta = {
  invalid: boolean;
  isTouched: boolean;
  isDirty: boolean;
  isValidating: boolean;
};

export type ControllerRenderProps<
  TFieldValues extends FieldValues = FieldValues
> = {
  onChange: (...event: any[]) => void;
  onBlur: () => void;
  value: any;
  name: FieldName<Control<TFieldValues>>;
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

export type UseControllerMethods<
  TFieldValues extends FieldValues = FieldValues
> = {
  field: ControllerRenderProps<TFieldValues>;
  meta: ControllerMeta;
};

export type ControllerProps<TFieldValues extends FieldValues = FieldValues> = {
  render: ({
    field,
    meta,
  }: {
    field: ControllerRenderProps<TFieldValues>;
    meta: ControllerMeta;
  }) => React.ReactElement;
} & UseControllerProps<TFieldValues>;

export type ControllerEvent = {
  type?: string;
  target: {
    value?: string;
    name: InternalFieldName;
  };
};
