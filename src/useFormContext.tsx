import * as React from "react";
import { FormProps } from './types'

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type FormContextValues = Required<Omit<FormProps, "children">>;

export const FormGlobalContext = React.createContext<FormContextValues>({} as FormContextValues);

export const useFormContext = () => React.useContext<FormContextValues>(FormGlobalContext);

export function FormContext(props: FormProps){
  const { children, ...rest } = props;
  return (
    <FormGlobalContext.Provider
      value={{
        ...rest
      } as FormContextValues}
      children={children}
    />
  );
}
