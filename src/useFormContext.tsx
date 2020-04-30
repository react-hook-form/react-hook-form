import * as React from 'react';
import { FieldValues } from './types';
import { FormContextValues, FormProviderProps } from './contextTypes';

const FormContext = React.createContext<FormContextValues<FieldValues> | null>(
  null,
);

export const useFormContext = <
  TFieldValues extends FieldValues
>(): FormContextValues<TFieldValues> =>
  React.useContext(FormContext) as FormContextValues<TFieldValues>;

export const FormProvider = <TFieldValues extends FieldValues>({
  children,
  ...props
}: FormProviderProps<TFieldValues>) => (
  <FormContext.Provider value={{ ...props } as FormContextValues}>
    {children}
  </FormContext.Provider>
);
