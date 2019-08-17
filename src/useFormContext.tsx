import * as React from 'react';
import { FormContextValues, FormProps, TFormValues } from './types';

const FormGlobalContext = React.createContext<FormContextValues<
  TFormValues
> | null>(null);

export function useFormContext<T extends TFormValues>(): FormContextValues<T> {
  // @ts-ignore
  return React.useContext(FormGlobalContext);
}

export function FormContext<T extends TFormValues>(props: FormProps<T>) {
  const { children, ...rest } = props;
  return (
    <FormGlobalContext.Provider value={rest as FormContextValues}>
      {children}
    </FormGlobalContext.Provider>
  );
}
