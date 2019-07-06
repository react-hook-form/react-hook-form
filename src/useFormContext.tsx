import * as React from 'react';
import { FormContextValues, DataType } from './types';

export const FormGlobalContext = React.createContext<FormContextValues>(
  {} as FormContextValues,
);

export const useFormContext = () =>
  React.useContext<FormContextValues>(FormGlobalContext);

export function FormContext<T extends DataType>(props: T) {
  const { children, ...rest } = props;
  return (
    <FormGlobalContext.Provider
      value={
        {
          ...rest,
        } as any
      }
    >
      {children}
    </FormGlobalContext.Provider>
  );
}
