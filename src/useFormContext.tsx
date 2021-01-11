import * as React from 'react';
import { UseFormMethods, FieldValues, FormProviderProps } from './types';

const FormContext = React.createContext<UseFormMethods | null>(null);

FormContext.displayName = 'RHFContext';

export const useFormContext = <
  TFieldValues extends FieldValues
>(): UseFormMethods<TFieldValues> => {
  const ctx = React.useContext(FormContext);
  if (ctx === undefined) {
    throw new Error('useFormContext must be used within a FormContext.Provider');
  }
  return ctx as UseFormMethods<TFieldValues>;
};

export const FormProvider = <TFieldValues extends FieldValues>({
  children,
  ...props
}: FormProviderProps<TFieldValues>) => (
  <FormContext.Provider value={{ ...props } as UseFormMethods}>
    {children}
  </FormContext.Provider>
);
