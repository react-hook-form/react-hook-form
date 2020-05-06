import * as React from 'react';
import { FieldValues } from './types';
import { UseFormMethods, FormProviderProps } from './contextTypes';

export const FormContext = React.createContext<UseFormMethods<
  FieldValues
> | null>(null);

export const useFormContext = <
  TFieldValues extends FieldValues
>(): UseFormMethods<TFieldValues> =>
  React.useContext(FormContext) as UseFormMethods<TFieldValues>;

export const FormProvider = <TFieldValues extends FieldValues>({
  children,
  ...props
}: FormProviderProps<TFieldValues>) => (
  <FormContext.Provider value={{ ...props } as UseFormMethods}>
    {children}
  </FormContext.Provider>
);
