import * as React from 'react';
import { UseFormReturn, FieldValues, FormProviderProps } from './types';

const FormContext = React.createContext<UseFormReturn | null>(null);

FormContext.displayName = 'RHFContext';

export const useFormContext = <
  TFieldValues extends FieldValues
>(): UseFormReturn<TFieldValues> =>
  (React.useContext(FormContext) as unknown) as UseFormReturn<TFieldValues>;

export const FormProvider = <TFieldValues extends FieldValues>({
  children,
  ...props
}: FormProviderProps<TFieldValues>) => (
  <FormContext.Provider value={(props as unknown) as UseFormReturn}>
    {children}
  </FormContext.Provider>
);
