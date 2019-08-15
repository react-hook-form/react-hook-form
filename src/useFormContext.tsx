import * as React from 'react';
import { FormContextValues, FormProps, DataType } from './types';

const FormGlobalContext = React.createContext<FormContextValues<
  DataType
> | null>(null);

export function useFormContext() {
  return React.useContext(FormGlobalContext)!;
}

export function FormContext<T extends DataType>(props: FormProps<T>) {
  const { children, ...rest } = props;
  return (
    <FormGlobalContext.Provider value={rest as FormContextValues}>
      {children}
    </FormGlobalContext.Provider>
  );
}
