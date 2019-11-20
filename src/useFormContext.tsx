import * as React from 'react';
import { FieldValues } from './types';
import { FormContextValues, FormProps } from './contextTypes';

const FormGlobalContext = React.createContext<FormContextValues<
  FieldValues
> | null>(null);

export function useFormContext<T extends FieldValues>(): FormContextValues<T> {
  const formGlobalContext = React.useContext(FormGlobalContext);

  if (formGlobalContext === null) {
    throw new Error('useFormContext must under FormContext');
  }

  return formGlobalContext as FormContextValues<T>;
}

export function FormContext<T extends FieldValues>(props: FormProps<T>) {
  const { children, formState, errors, ...restMethods } = props;
  const restRef = React.useRef(restMethods);

  return (
    <FormGlobalContext.Provider
      value={{ ...restRef.current, formState, errors } as FormContextValues}
    >
      {children}
    </FormGlobalContext.Provider>
  );
}
