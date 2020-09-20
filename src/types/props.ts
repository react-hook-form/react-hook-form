import * as React from 'react';
import { UseFormMethods, FieldValues, FieldName, Control, Assign } from './';
import { ValidationRules } from './validator';

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
        render: (data: {
          onChange: (...event: any[]) => void;
          onBlur: () => void;
          value: any;
          name: FieldName<TFieldValues>;
        }) => React.ReactElement;
      }
  ) & {
    name: FieldName<TFieldValues>;
    rules?: ValidationRules;
    onFocus?: () => void;
    defaultValue?: unknown;
    control?: Control<TFieldValues>;
  },
  AsProps<TAs>
>;
