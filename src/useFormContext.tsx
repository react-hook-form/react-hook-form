import * as React from 'react';
import { FieldValues } from './types';
import { FormContextValues, FormProps } from './contextTypes';

const FormGlobalContext = React.createContext<FormContextValues<
  FieldValues
> | null>(null);

export function useFormContext<T extends FieldValues>(): FormContextValues<T> {
  const ctx = React.useContext<FormContextValues<T>>(FormGlobalContext as any);
  // Make sure to wrap this in this if statement so it transpiles out
  // with babel-plugin-dev-expression
  if (process.env.NODE_ENV !== 'production') {
    if (!ctx) {
      console.warn(
        '[react-hook-form] Form context was not found with useFormContext.',
      );
    }
  }
  return ctx;
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
