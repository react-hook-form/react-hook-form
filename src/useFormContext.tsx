import * as React from "react";

export const FormGlobalContext = React.createContext({});

export function useFormContext() {
  const methods = React.useContext(FormGlobalContext);
  return {
    ...methods
  };
}

export function FormContext(props) {
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
