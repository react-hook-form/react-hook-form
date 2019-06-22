import * as React from "react";
import { FormProps } from './types'

export const FormGlobalContext = React.createContext({});

export const useFormContext = () => React.useContext<{}>(FormGlobalContext);

export function FormContext(props: FormProps){
  const { children, ...rest } = props;
  return (
    <FormGlobalContext.Provider
      value={{
        ...rest
      }}
      children={children}
    />
  );
}
