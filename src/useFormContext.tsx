import * as React from 'react';
import { FieldValues, Options } from './types';
import { FormContextValues } from './contextTypes';
import { useCreateForm } from './useForm';

const FormGlobalContext = React.createContext<FormContextValues<
  FieldValues
> | null>(null);

export function useFormContext<T extends FieldValues>(): FormContextValues<T> {
  return React.useContext(FormGlobalContext as any);
}

export function FormContext<FormValues extends FieldValues>({
  children,
  ...options
}: { children: React.ReactNode } & Options<FormValues>) {
  const form = useCreateForm(options);
  return (
    <FormGlobalContext.Provider value={form as FormContextValues}>
      {children}
    </FormGlobalContext.Provider>
  );
}
