import * as React from 'react';

import omit from './utils/omit';
import {
  Control,
  FieldValues,
  FormProviderProps,
  UseFormReturn,
} from './types';

const FormControlContext = React.createContext<Control | null>(null);

FormControlContext.displayName = 'RHFControlContext';

export const useFormControl = <
  TFieldValues extends FieldValues,
>(): Control<TFieldValues> =>
  React.useContext(FormControlContext) as unknown as Control<TFieldValues>;

const FormContext = React.createContext<UseFormReturn | null>(null);

FormContext.displayName = 'RHFContext';

export const useFormContext = <
  TFieldValues extends FieldValues,
>(): UseFormReturn<TFieldValues> =>
  React.useContext(FormContext) as unknown as UseFormReturn<TFieldValues>;

export const FormProvider = <TFieldValues extends FieldValues>(
  props: FormProviderProps<TFieldValues>,
) => {
  return (
    <FormContext.Provider
      value={omit(props, 'children') as unknown as UseFormReturn}
    >
      <FormControlContext.Provider value={props.control as unknown as Control}>
        {props.children}
      </FormControlContext.Provider>
    </FormContext.Provider>
  );
};
