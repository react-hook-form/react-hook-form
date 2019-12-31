import * as React from 'react';
import { useFormContext } from './useFormContext';
import get from './utils/get';
import {
  FieldErrors,
  FieldName,
  MultipleFieldErrors,
  FormValuesFromErrors,
} from './types';

type Props<Errors, Name> = {
  as?: React.ElementType<any> | React.FunctionComponent<any> | string | any;
  errors?: Errors;
  name: Name;
  children?: (data: {
    message: string;
    messages: MultipleFieldErrors;
  }) => React.ReactNode;
};

const ErrorMessage = <
  Errors extends FieldErrors<any>,
  Name extends FieldName<FormValuesFromErrors<Errors>>
>({
  as: InnerComponent,
  errors,
  name,
  children,
}: Props<Errors, Name>) => {
  const methods = useFormContext() || {};
  const { message, types } = get(
    errors || (methods.errors as Errors),
    name,
    {},
  );

  if (!message) {
    return null;
  }

  const props = {
    children: children
      ? children({ message: message, messages: types })
      : message,
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
