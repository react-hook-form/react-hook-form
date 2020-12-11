import * as React from 'react';
import {
  UseFormMethods,
  FieldValues,
  FieldName,
  Control,
  Assign,
  InputState,
} from './';
import { RegisterOptions } from './validator';

export type FormProviderProps<
  TFieldValues extends FieldValues = FieldValues
> = {
  children: React.ReactNode;
} & UseFormMethods<TFieldValues>;

type AsProps<TAs> = TAs extends undefined
  ? {}
  : TAs extends React.ReactElement
  ? Record<string, any>
  : TAs extends React.ComponentType<infer P>
  ? P
  : TAs extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[TAs]
  : never;

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

export type ControllerProps<
  TAs extends
    | React.ReactElement
    | React.ComponentType<any>
    | 'input'
    | 'select'
    | 'textarea',
  TFieldValues extends FieldValues = FieldValues
> = Assign<
  (
    | {
        as: TAs;
        render?: undefined;
      }
    | {
        as?: undefined;
        render: (
          field: ControllerRenderProps<TFieldValues>,
          state: InputState,
        ) => React.ReactElement;
      }
  ) &
    UseControllerOptions,
  AsProps<TAs>
>;
