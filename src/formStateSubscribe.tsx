import type { ReactNode } from 'react';

import type {
  FieldValues,
  UseFormStateProps,
  UseFormStateReturn,
} from './types';
import { useFormState } from './useFormState';

export type FormStateProps<
  TFieldValues extends FieldValues,
  TTransformedValues = TFieldValues,
> = UseFormStateProps<TFieldValues, TTransformedValues> & {
  render: (values: UseFormStateReturn<TFieldValues>) => ReactNode;
};

export const FormState = <
  TFieldValues extends FieldValues,
  TTransformedValues = TFieldValues,
>({
  control,
  disabled,
  exact,
  name,
  render,
}: FormStateProps<TFieldValues, TTransformedValues>) =>
  render(useFormState({ control, name, disabled, exact }));

/** @deprecated Use `FormState` instead. Kept as an alias for backward compatibility. */
export const FormStateSubscribe = FormState;

/** @deprecated Use `FormStateProps` instead. Kept as an alias for backward compatibility. */
export type FormStateSubscribeProps<
  TFieldValues extends FieldValues,
  TTransformedValues = TFieldValues,
> = FormStateProps<TFieldValues, TTransformedValues>;
