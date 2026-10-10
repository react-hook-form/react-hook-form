import React from 'react';

import { getScope, scopeFormState, scopeNames } from './logic/createSelect';
import getProxyFormState from './logic/getProxyFormState';
import type {
  FieldValues,
  FormState,
  SelectionLeafControl,
  SelectionLeafFormState,
  UseFormStateProps,
  UseFormStateReturn,
} from './types';
import { useFormControlContext } from './useFormControlContext';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useResyncOnReconnect } from './useResyncOnReconnect';

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
export function useFormState<T>(props: {
  control: SelectionLeafControl<T>;
  name?: '';
  disabled?: boolean;
  exact?: boolean;
}): SelectionLeafFormState<T>;
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
): UseFormStateReturn<TFieldValues>;
export function useFormState<
  TFieldValues extends FieldValues = FieldValues,
  TTransformedValues = TFieldValues,
>(
  formStateProps?:
    | UseFormStateProps<TFieldValues, TTransformedValues>
    | { control: SelectionLeafControl<any>; name?: '' },
): UseFormStateReturn<TFieldValues> {
  const props = formStateProps as UseFormStateProps<
    TFieldValues,
    TTransformedValues
  >;
  const formControl = useFormControlContext<
    TFieldValues,
    unknown,
    TTransformedValues
  >();
  const {
    control: _control = formControl,
    disabled,
    name: _name,
    exact,
  } = props || {};
  const scope = getScope(_control);
  const control = scope ? scope.control : _control;
  const name = React.useMemo(
    () => (scope ? scopeNames(scope.path, _name) : _name),
    [scope, _name],
  );

  const getCurrentFormState = () => ({
    ...control._formState,
    defaultValues:
      control._defaultValues as FormState<TFieldValues>['defaultValues'],
  });

  const [formState, updateFormState] =
    React.useState<FormState<TFieldValues>>(getCurrentFormState);
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

  const { resyncIfNeeded, snapshot } =
    useResyncOnReconnect<FormState<TFieldValues>>(getCurrentFormState);

  useIsomorphicLayoutEffect(() => {
    resyncIfNeeded(!disabled, getCurrentFormState, updateFormState);

    const unsubscribe = control._subscribe({
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
    });

    return () => {
      unsubscribe();
      snapshot(!disabled, getCurrentFormState);
    };
  }, [control, name, disabled, exact, resyncIfNeeded, snapshot]);

  React.useEffect(() => {
    _localProxyFormState.current.isValid && control._setValid(true);
  }, [control]);

  return React.useMemo(() => {
    const proxyFormState = getProxyFormState(
      formState,
      control,
      _localProxyFormState.current,
      false,
    );

    return scope ? scopeFormState(proxyFormState, scope.path) : proxyFormState;
  }, [formState, control, scope]);
}
