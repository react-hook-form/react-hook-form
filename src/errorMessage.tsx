import * as React from 'react';
import { useFormContext } from './useFormContext';
import get from './utils/get';
import {
  FieldErrors,
  FieldName,
  FormValuesFromErrors,
  ErrorMessageProps,
} from './types';

const ErrorMessage = <
  Errors extends FieldErrors<any>,
  Name extends FieldName<FormValuesFromErrors<Errors>>,
  As extends
    | undefined
    | React.ReactElement
    | React.ComponentType<any>
    | keyof JSX.IntrinsicElements = undefined
>({
  as: InnerComponent,
  errors,
  name,
  message,
  children,
  ...rest
}: ErrorMessageProps<Errors, Name, As>) => {
  let error;
  try {
    const methods = useFormContext();
    error = get(methods.errors, name);
  } catch {
    error = get(errors, name);
  }

  if (!error) {
    return null;
  }

  const { message: messageFromRegister, types } = error;
  const props = {
    ...(InnerComponent ? rest : {}),
    children: children
      ? children({ message: messageFromRegister || message, messages: types })
      : messageFromRegister || message,
  };

  return InnerComponent ? (
    React.isValidElement(InnerComponent) ? (
      React.cloneElement(InnerComponent, props)
    ) : (
      React.createElement(InnerComponent as string, props)
    )
  ) : (
    <React.Fragment {...props} />
  );
};

export { ErrorMessage };
