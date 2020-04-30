import * as React from 'react';
import { FieldValues } from './types';
import { FormContextValues, FormProps } from './contextTypes';

const FormGlobalContext = React.createContext<FormContextValues<
  FieldValues
> | null>(null);

export function useFormContext<
  TFieldValues extends FieldValues
>(): FormContextValues<TFieldValues> {
  return React.useContext(FormGlobalContext) as FormContextValues<TFieldValues>;
}

export function FormContext<TFieldValues extends FieldValues>({
  children,
  formState,
  errors,
  ...restMethods
}: FormProps<TFieldValues>) {
  return (
    <FormGlobalContext.Provider
      value={{ ...restMethods, formState, errors } as FormContextValues}
    >
      {children}
    </FormGlobalContext.Provider>
  );
}
