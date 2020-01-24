import * as React from 'react';
import { useFormContext } from './useFormContext';
import isUndefined from './utils/isUndefined';
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
  children,
}: ErrorMessageProps<Errors, Name>) => {
  const methods = useFormContext();
  const error = get(errors || methods.errors, name);
  const { message, types } = error;

  if (isUndefined(error)) {
    return null;
  }

  const props = {
    children: children ? children({ message, messages: types }) : message,
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
