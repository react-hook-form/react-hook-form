import * as React from 'react';
import { UseFormReturn, FieldValues, FormProviderProps } from './types';
import omit from './utils/omit';

const FormContext = React.createContext<UseFormReturn | null>(null);

FormContext.displayName = 'RHFContext';

export const useFormContext = <
  TFieldValues extends FieldValues
>(): UseFormReturn<TFieldValues> =>
  (React.useContext(FormContext) as unknown) as UseFormReturn<TFieldValues>;

export const FormProvider = <TFieldValues extends FieldValues>(
  props: FormProviderProps<TFieldValues>,
) => (
  <FormContext.Provider
    value={(omit(props, 'children') as unknown) as UseFormReturn}
  >
    {props.children}
  </FormContext.Provider>
);
