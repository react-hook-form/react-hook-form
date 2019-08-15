import * as React from 'react';
import { FormContextValues, FormProps, DataType } from './types';

const FormGlobalContext = React.createContext<FormContextValues<
  DataType
> | null>(null);

export function useFormContext<T extends DataType>(): FormContextValues<T> {
  // @ts-ignore
  return React.useContext(FormGlobalContext);
}

export function FormContext(props: FormProps<DataType>) {
  const { children, ...rest } = props;
  return (
    <FormGlobalContext.Provider value={rest}>
      {children}
    </FormGlobalContext.Provider>
  );
}
