import React from 'react';

import getProxyFormState from './logic/getProxyFormState';
import type {
  FieldValues,
  FormState,
  UseFormStateProps,
  UseFormStateReturn,
} from './types';
import { useFormControlContext } from './useFormControlContext';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

/**
 * Subscribes to each form state and isolates re-renders at the custom hook level. It has its own scope for form state subscriptions, so it will not affect other useFormState or useForm instances. Using this hook can reduce the re-render impact on large and complex form applications.
 *
 * @remarks
 * [API](https://react-hook-form.com/docs/useformstate) • [Demo](https://codesandbox.io/s/useformstate-75xly)
 *
 * @param props - Include options to specify fields to subscribe to. {@link UseFormStateReturn}
 *
 * @example
 * ```tsx
 * function App() {
 *   const { register, handleSubmit, control } = useForm({
 *     defaultValues: {
 *     firstName: "firstName"
 *   }});
 *   const { dirtyFields } = useFormState({
 *     control
 *   });
 *   const onSubmit = (data) => console.log(data);
 *
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       <input {...register("firstName")} placeholder="First Name" />
 *       {dirtyFields.firstName && <p>Field is dirty.</p>}
 *       <input type="submit" />
 *     </form>
 *   );
 * }
 * ```
 */
export function useFormState<
  TFieldValues extends FieldValues = FieldValues,
  TTransformedValues = TFieldValues,
>(
  props?: UseFormStateProps<TFieldValues, TTransformedValues>,
): UseFormStateReturn<TFieldValues> {
  const formControl = useFormControlContext<
    TFieldValues,
    any,
    TTransformedValues
  >();
  const { control = formControl, disabled, name, exact } = props || {};
  const [formState, updateFormState] = React.useState<FormState<TFieldValues>>(
    () => ({
      ...control._formState,
      defaultValues:
        control._defaultValues as FormState<TFieldValues>['defaultValues'],
    }),
  );
  const _localProxyFormState = React.useRef({
    isDirty: false,
    isLoading: false,
    dirtyFields: false,
    touchedFields: false,
    validatingFields: false,
    isValidating: false,
    isValid: false,
    errors: false,
  });

  useIsomorphicLayoutEffect(
    () =>
      control._subscribe({
        name,
        formState: _localProxyFormState.current,
        exact,
        callback: (formState) => {
          !disabled &&
            updateFormState({
              ...control._formState,
              ...formState,
              defaultValues:
                control._defaultValues as FormState<TFieldValues>['defaultValues'],
            });
        },
      }),
    [name, disabled, exact],
  );

  React.useEffect(() => {
    _localProxyFormState.current.isValid && control._setValid(true);
  }, [control]);

  return React.useMemo(
    () =>
      getProxyFormState(
        formState,
        control,
        _localProxyFormState.current,
        false,
      ),
    [formState, control],
  );
}
