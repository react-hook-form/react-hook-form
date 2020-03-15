import * as React from 'react';
import { FieldValues } from './types';
import { FormContextValues, FormProps } from './contextTypes';
import isUndefined from './utils/isUndefined';

const FormGlobalContext = React.createContext<FormContextValues<
  FieldValues
> | null>(null);

export function useFormContext<T extends FieldValues>(): FormContextValues<T> {
  const context = React.useContext(FormGlobalContext) as FormContextValues<T>;
  if (isUndefined(context)) {
    // eslint-disable-next-line no-console
    console.warn('Missing FormContext');
  }
  return context;
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
