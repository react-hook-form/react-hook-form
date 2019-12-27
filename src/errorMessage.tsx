import * as React from 'react';
import { useFormContext } from './useFormContext';
import get from './utils/get';
import {
  FieldErrors,
  FieldError,
  FieldName,
  FormValuesFromErrors,
} from './types';

type Props<Errors, Name> = {
  as?: React.ElementType<any> | React.FunctionComponent<any> | string | any;
  errors?: Errors;
  name: Name;
};

const ErrorMessage = <
  Errors extends FieldErrors<any>,
  Name extends FieldName<FormValuesFromErrors<Errors>>
>({
  as: InnerComponent,
  errors: errorsFromProps,
  name,
}: Props<Errors, Name>) => {
  const methods = useFormContext();
  const errors = errorsFromProps || (methods?.errors as Errors);
  const error = get(errors, name) as FieldError | undefined;
  const message = error?.message;
  if (!message) {
    return null;
  }

  const props = { children: message };

  return InnerComponent ? (
    React.isValidElement(InnerComponent) ? (
      React.cloneElement(InnerComponent, props)
    ) : (
      <InnerComponent {...props} />
    )
  ) : (
    <>{message}</>
  );
};

export { ErrorMessage };
