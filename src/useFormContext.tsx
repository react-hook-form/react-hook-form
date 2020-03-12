import * as React from 'react';
import { FieldValues } from './types';
import { FormContextValues, FormProps } from './contextTypes';
import isNullOrUndefined from './utils/isNullOrUndefined';

const FormGlobalContext = React.createContext<FormContextValues<
  FieldValues
> | null>(null);

export function useFormContext<T extends FieldValues>(): FormContextValues<T> {
  const context = React.useContext(FormGlobalContext) as FormContextValues<T>;
  if (!isNullOrUndefined(context)) {
    const {
      register,
      defaultValuesRef,
      defaultRenderValuesRef,
      watchFieldArrayRef,
    } = context.control;
    return {
      ...context,
      register: React.useCallback(
        (refOrValidationOptions?: any, validationOptions?: any): any =>
          register(refOrValidationOptions, validationOptions),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
          defaultValuesRef.current,
          defaultRenderValuesRef.current,
          watchFieldArrayRef.current,
        ],
      ),
    };
  }
  throw new Error('Missing FormContext');
}

export function FormContext<T extends FieldValues>({
  children,
  formState,
  errors,
  ...restMethods
}: FormProps<T>) {
  return (
    <FormGlobalContext.Provider
      value={{ ...restMethods, formState, errors } as FormContextValues}
    >
      {children}
    </FormGlobalContext.Provider>
  );
}
