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
  Name extends FieldName<FormValuesFromErrors<Errors>>
>({
  as: InnerComponent,
  errors,
  name,
  message,
  children,
}: ErrorMessageProps<Errors, Name>) => {
  const methods = useFormContext();
  const error = get(errors || methods.errors, name);

  if (!error) {
    return null;
  }

  const { message: messageFromRegister, types } = error;
  const props = {
    children: children
      ? children({ message: messageFromRegister || message, messages: types })
      : messageFromRegister || message,
  };

  return InnerComponent ? (
    React.isValidElement(InnerComponent) ? (
      React.cloneElement(InnerComponent, props)
    ) : (
      <InnerComponent {...props} />
    )
  ) : (
    <React.Fragment {...props} />
  );
};

export { ErrorMessage };
