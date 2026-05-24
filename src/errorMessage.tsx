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
    as?: React.ElementType | React.ReactElement;
    control?: Control<TFieldValues>;
    name: FieldPath<TFieldValues> | `root.${string}` | 'root';
    render?: (data: {
      message: Message;
      messages?: MultipleFieldErrors;
    }) => React.ReactNode;
  };

/**
 * Renders the validation error message for a single form field.
 *
 * Works in two modes, in priority order:
 * 1. **`control` prop** — subscribes reactively to the field's error without
 *    a wrapping `FormProvider`. Preferred for co-located forms.
 * 2. **Context** — reads from the nearest `FormProvider` automatically.
 *
 * @remarks
 * [API](https://react-hook-form.com/docs/useformstate/errormessage)
 *
 * @example
 * ```tsx
 * // ① control prop — no FormProvider required
 * function LoginForm() {
 *   const { register, control } = useForm<{ email: string }>();
 *   return (
 *     <form>
 *       <input {...register('email', { required: 'Email is required' })} />
 *       <ErrorMessage control={control} name="email" as="p" />
 *     </form>
 *   );
 * }
 *
 * // ② Inside FormProvider
 * function EmailField() {
 *   const { register } = useFormContext<{ email: string }>();
 *   return (
 *     <>
 *       <input {...register('email', { required: 'Email is required' })} />
 *       <ErrorMessage name="email" as="span" />
 *     </>
 *   );
 * }
 *
 * // ③ render prop for full control
 * <ErrorMessage
 *   control={control}
 *   name="email"
 *   render={({ message }) => <Alert severity="error">{message}</Alert>}
 * />
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
  const types = error.types;

  if (render) {
    return render({ message, messages: types }) as React.ReactElement;
  }

  if (React.isValidElement(as)) {
    return React.cloneElement(as, {}, message);
  }

  return React.createElement(
    (as as React.ElementType) || React.Fragment,
    null,
    message,
  );
};
