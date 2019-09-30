import * as React from 'react';
import { FieldValues } from './types';
import { FormContextValues, FormProps } from './contextTypes';

const FormGlobalContext = React.createContext<FormContextValues<
  FieldValues
> | null>(null);

export function useFormContext<T extends FieldValues>(): FormContextValues<T> {
  return React.useContext(FormGlobalContext as any);
}

export function FormContext<T extends FieldValues>(props: FormProps<T>) {
  const { children, ...rest } = props;
  const restRef = React.useRef(rest);

  return (
    <FormGlobalContext.Provider value={restRef.current as FormContextValues}>
      {children}
    </FormGlobalContext.Provider>
  );
}
