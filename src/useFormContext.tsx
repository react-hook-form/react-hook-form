import * as React from 'react';
import { FormContextValues, FormProps } from './types';

export const FormGlobalContext = React.createContext<FormContextValues>(
  {} as FormContextValues,
);

export const useFormContext = () =>
  React.useContext<FormContextValues>(FormGlobalContext);

export function FormContext(props: FormProps) {
  const { children, ...rest } = props;
  return (
    <FormGlobalContext.Provider
      value={
        {
          ...rest,
        } as FormContextValues
      }
    >{children}</FormGlobalContext.Provider>
    
  );
}
