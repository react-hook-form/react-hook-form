import * as React from 'react';
import { UseFormMethods, FieldValues } from './types/form';
import { FormProviderProps } from './types/props';

export const FormContext = React.createContext<UseFormMethods | null>(null);

FormGlobalContext.displayName = 'ReactHookFormGlobalContext';

export function useFormContext<T extends FieldValues>(): FormContextValues<T> {
  return React.useContext(FormGlobalContext) as FormContextValues<T>;
}

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
