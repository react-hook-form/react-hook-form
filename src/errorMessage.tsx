import * as React from 'react';
import { useFormContext } from './useFormContext';
import get from './utils/get';
import {
  FieldErrors,
  FieldError,
  FieldName,
  FormValuesFromErrors,
  ErrorMessages,
} from './types';

type Props<Errors, Name> = {
  as?: React.ElementType<any> | React.FunctionComponent<any> | string | any;
  errors?: Errors;
  name: Name;
  messages?: ErrorMessages;
};

const ErrorMessage = <
  Errors extends FieldErrors<any>,
  Name extends FieldName<FormValuesFromErrors<Errors>>
>({
  as,
  errors: errorsFromProps,
  name,
  messages = {},
}: Props<Errors, Name>) => {
  const methods = useFormContext();
  const errors = errorsFromProps || (methods.errors as Errors);
  const error = get(errors, name) as FieldError | undefined;
  const message = error && (error.message || messages[error.type]);
  if (!message) {
    return null;
  }

  return as ? (
    React.cloneElement(as, { children: message })
  ) : (
    <span>{message}</span>
  );
};

export { ErrorMessage };
