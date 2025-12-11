import { type ReactNode } from 'react';

import type {
  FieldValues,
  UseFormStateProps,
  UseFormStateReturn,
} from './types';
import { useFormState } from './useFormState';

export type FormStateSubscribeProps<
  TFieldValues extends FieldValues = FieldValues,
  TTransformedValues = TFieldValues,
> = UseFormStateProps<TFieldValues, TTransformedValues> & {
  render: (formState: UseFormStateReturn<TFieldValues>) => ReactNode;
};

/**
 * FormStateSubscribe component that subscribes to form state changes and re-renders when the form state updates.
 * Provides the same functionality as useFormState, but in component form with a render prop pattern.
 *
 * @param control - The form control object from useForm (optional if using FormProvider)
 * @param name - Field name(s) to subscribe to for selective re-rendering
 * @param disabled - Option to disable the subscription
 * @param exact - Enable exact match for input name subscriptions
 * @param render - Function that receives form state and returns ReactNode
 * @returns The result of calling render function with current form state
 *
 * @example
 * The `FormStateSubscribe` component only re-renders when form state of specified field(s) changes.
 * The form state type is accurately inferred based on your form's field values.
 *
 * ```tsx
 * const { register, control } = useForm();
 *
 * <FormStateSubscribe
 *   control={control}
 *   name="foo"
 *   render={({ errors }) => <span>{errors.foo?.message}</span>}
 * />
 * ```
 */
export const FormStateSubscribe = <
  TFieldValues extends FieldValues = FieldValues,
  TTransformedValues = TFieldValues,
>({
  control,
  name,
  disabled,
  exact,
  render,
}: FormStateSubscribeProps<TFieldValues, TTransformedValues>) =>
  render(
    useFormState<TFieldValues, TTransformedValues>({
      control,
      name,
      disabled,
      exact,
    }),
  );
