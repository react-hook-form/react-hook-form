import * as React from 'react';
import { FieldValues } from './types';
import { FormContextValues, FormProps } from './contextTypes';

const FormGlobalContext = React.createContext<FormContextValues<
  FieldValues
> | null>(null);

export function useFormContext<T extends FieldValues>(): FormContextValues<T> {
  // @ts-ignore
  return React.useContext(FormGlobalContext);
}

export function FormContext<T extends FieldValues>(props: FormProps<T>) {
  const { children, ...rest } = props;
  return (
    <FormGlobalContext.Provider value={rest as FormContextValues}>
      {children}
    </FormGlobalContext.Provider>
  );
}
