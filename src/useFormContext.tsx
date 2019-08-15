import * as React from 'react';
import { FormContextValues, FormProps, DataType } from './types';

type FormContextType<T extends DataType = DataType> = FormContextValues<T>;

export const FormGlobalContext = React.createContext<FormContextType | null>(
  null,
);

export function useFormContext() {
  const context = React.useContext(FormGlobalContext);
  // TODO: Warn?
  return context!;
}

export function FormContext<T extends DataType>(props: FormProps<T>) {
  const { children, ...rest } = props;
  return (
    // @ts-ignore
    <FormGlobalContext.Provider value={rest}>
      {children}
    </FormGlobalContext.Provider>
  );
}
