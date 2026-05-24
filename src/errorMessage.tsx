import React from 'react';

import type {
  Control,
  FieldPath,
  FieldValues,
  Message,
  MultipleFieldErrors,
} from './types';
import { useFormState } from './useFormState';
import { get } from './utils';

export type ErrorMessageProps<TFieldValues extends FieldValues = FieldValues> =
  {
    as?: React.ElementType;
    control?: Control<TFieldValues>;
    name: FieldPath<TFieldValues> | `root.${string}` | 'root';
    render?: (data: {
      message: Message;
      messages?: MultipleFieldErrors;
    }) => React.ReactNode;
  };

/**
 * Displays the validation error for a single field.
 * Reads from `control` when provided, otherwise from the nearest `FormProvider`.
 *
 * @see [API](https://react-hook-form.com/docs/useformstate/errormessage)
 *
 * @example
 * ```tsx
 * <ErrorMessage control={control} name="email" as="p" />
 * <ErrorMessage name="email" as="span" />
 * <ErrorMessage control={control} name="email"
 *   render={({ message }) => <Alert>{message}</Alert>} />
 * ```
 */
export const ErrorMessage = <TFieldValues extends FieldValues = FieldValues>({
  as,
  control,
  name,
  render,
}: ErrorMessageProps<TFieldValues>) => {
  const { errors } = useFormState<TFieldValues>({
    control,
    name: name as FieldPath<TFieldValues>,
  });

  const error = get(errors, name);

  if (!error) {
    return null;
  }

  const message = error.message || '';

  if (render) {
    return render({ message, messages: error.types }) as React.ReactElement;
  }

  return React.createElement(as || React.Fragment, null, message);
};
