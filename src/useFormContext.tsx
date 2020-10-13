import * as React from 'react';
import { UseFormMethods, FieldValues, FormProviderProps } from './types';

const FormContext = React.createContext<UseFormMethods | null>(null);

FormContext.displayName = 'RHFContext';

export const useFormContext = <
  TFieldValues extends FieldValues = FieldValues
>(): UseFormMethods<TFieldValues> =>
  React.useContext(FormContext) as UseFormMethods<TFieldValues>;

export const FormProvider = <TFieldValues extends FieldValues = FieldValues>({
  children,
  ...props
}: FormProviderProps<TFieldValues>) => {
  const Context = FormContext as React.Context<UseFormMethods<
    TFieldValues
  > | null>;

  return <Context.Provider value={{ ...props }}>{children}</Context.Provider>;
};
