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
 * Subscribes to form state with re-renders isolated to this hook.
 * Optionally scope to specific field names to minimize re-render surface.
 *
 * @see [API](https://react-hook-form.com/docs/useformstate)
 *
 * @example
 * ```tsx
 * const { errors, isDirty } = useFormState({ control, name: "email" });
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
