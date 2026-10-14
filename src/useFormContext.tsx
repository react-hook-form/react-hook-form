import React from 'react';

import getProxyFormState from './logic/getProxyFormState';
import { updateMethodsReference } from './utils/updateMethodsReference';
import type {
  Control,
  FieldValues,
  FormProviderProps,
  FormState,
  UseFormReturn,
} from './types';
import { HookFormControlContext } from './useFormControlContext';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useResyncOnReconnect } from './useResyncOnReconnect';

const HookFormContext = React.createContext<UseFormReturn | null>(null);
HookFormContext.displayName = 'HookFormContext';

/**
 * Retrieves all `useForm` methods from the nearest `FormProvider`.
 * Use in deeply nested components to avoid prop-drilling.
 *
 * @see [API](https://react-hook-form.com/docs/useformcontext)
 *
 * @example
 * ```tsx
 * const { register } = useFormContext<FormValues>();
 * ```
 */
export const useFormContext = <
  TFieldValues extends FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
>(): UseFormReturn<TFieldValues, TContext, TTransformedValues> =>
  React.useContext(HookFormContext) as UseFormReturn<
    TFieldValues,
    TContext,
    TTransformedValues
  >;

/**
 * Provides all `useForm` methods to the component tree via React Context.
 * Pair with `useFormContext` to consume them in any descendant.
 *
 * @see [API](https://react-hook-form.com/docs/useformcontext)
 *
 * @example
 * ```tsx
 * <FormProvider {...methods}>
 *   <form onSubmit={methods.handleSubmit(onSubmit)}>{children}</form>
 * </FormProvider>
 * ```
 */
export const FormProvider = <
  TFieldValues extends FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
>({
  children,
  watch,
  getValues,
  getErrors,
  getFieldState,
  setError,
  clearErrors,
  setValue,
  setValues,
  trigger,
  formState,
  resetField,
  reset,
  resetDefaultValues,
  handleSubmit,
  unregister,
  control,
  register,
  setFocus,
  subscribe,
}: FormProviderProps<TFieldValues, TContext, TTransformedValues>) => {
  // Compiled parents memoize this element, so subscribe here as well.
  const [subscribed, setSubscribed] = React.useState<{
    source: typeof formState;
    formState?: FormState<TFieldValues>;
  }>({ source: formState });
  let current = subscribed;

  // A newer `formState` prop from a parent render takes precedence.

  if (subscribed.source !== formState) {
    current = { source: formState };
    setSubscribed(current);
  }

  const getCurrentFormState = () => ({
    ...control._formState,
    defaultValues:
      control._defaultValues as FormState<TFieldValues>['defaultValues'],
  });

  const updateFormState = (state: FormState<TFieldValues>) =>
    setSubscribed((prev) => ({ source: prev.source, formState: state }));

  const { resyncIfNeeded, snapshot } =
    useResyncOnReconnect<FormState<TFieldValues>>(getCurrentFormState);

  useIsomorphicLayoutEffect(() => {
    resyncIfNeeded(true, getCurrentFormState, updateFormState);

    const unsubscribe = control._subscribe({
      formState: control._proxyFormState,
      callback: () => updateFormState(getCurrentFormState()),
      reRenderRoot: true,
    });

    return () => {
      unsubscribe();
      snapshot(true, getCurrentFormState);
    };
  }, [control, resyncIfNeeded, snapshot]);

  const subscribedFormState = current.formState;

  const memoizedValue = React.useMemo<
    UseFormReturn<TFieldValues, TContext, TTransformedValues>
  >(() => {
    const value = {
      watch,
      getValues,
      getErrors,
      getFieldState,
      setError,
      clearErrors,
      setValue,
      setValues,
      trigger,
      formState: subscribedFormState
        ? getProxyFormState(subscribedFormState, control)
        : formState,
      resetField,
      reset,
      resetDefaultValues,
      handleSubmit,
      unregister,
      control,
      register,
      setFocus,
      subscribe,
    };

    // Rebind read methods so memoized calls in compiled consumers re-run.
    if (subscribedFormState) {
      updateMethodsReference(value, value);
    }

    return value;
  }, [
    subscribedFormState,
    clearErrors,
    control,
    formState,
    getErrors,
    getFieldState,
    getValues,
    handleSubmit,
    register,
    reset,
    resetDefaultValues,
    resetField,
    setError,
    setFocus,
    setValue,
    setValues,
    subscribe,
    trigger,
    unregister,
    watch,
  ]);

  return (
    <HookFormContext.Provider value={memoizedValue as unknown as UseFormReturn}>
      <HookFormControlContext.Provider value={memoizedValue.control as Control}>
        {children}
      </HookFormControlContext.Provider>
    </HookFormContext.Provider>
  );
};
