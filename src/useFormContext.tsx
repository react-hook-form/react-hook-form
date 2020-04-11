import React from 'react';
import { FieldValues } from './types';
import { FormContextValues, FormProps } from './contextTypes';

const FormGlobalContext = React.createContext<FormContextValues<
  FieldValues
> | null>(null);

export function useFormContext<T extends FieldValues>(): FormContextValues<T> {
  return React.useContext(FormGlobalContext) as FormContextValues<T>;
}

export function FormContext<T extends FieldValues>({
  children,
  formState,
  errors,
  ...restMethods
}: FormProps<T>) {
  return (
    <FormGlobalContext.Provider
      value={{ ...restMethods, formState, errors } as FormContextValues}
    >
      {children}
    </FormGlobalContext.Provider>
  );
}
