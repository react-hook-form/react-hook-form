import * as React from 'react';
import { UseFormMethods, FieldValues, FormProviderProps } from './types';

const FormContext = React.createContext<UseFormMethods | null>(null);

FormContext.displayName = 'RHFContext';

export const useFormContext = <
  TFieldValues extends FieldValues
>(): UseFormMethods<TFieldValues> =>
  React.useContext(FormContext) as UseFormMethods<TFieldValues>;

export const FormProvider = <TFieldValues extends FieldValues>({
  children,
  ...props
}: FormProviderProps<TFieldValues>) => (
  // @ts-ignore
  <FormContext.Provider value={props as UseFormMethods}>
    {children}
  </FormContext.Provider>
);
