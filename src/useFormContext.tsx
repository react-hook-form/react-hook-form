import React from 'react';

import type {
  Control,
  FieldValues,
  FormProviderProps,
  UseFormReturn,
} from './types';
import { HookFormControlContext } from './useFormControlContext';

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
  getFieldState,
  setError,
  clearErrors,
  setValue,
  setValues,
  trigger,
  formState,
  resetField,
  reset,
  handleSubmit,
  unregister,
  control,
  register,
  setFocus,
  subscribe,
}: FormProviderProps<TFieldValues, TContext, TTransformedValues>) => {
  const memoizedValue = React.useMemo(
    () => ({
      watch,
      getValues,
      getFieldState,
      setError,
      clearErrors,
      setValue,
      setValues,
      trigger,
      formState,
      resetField,
      reset,
      handleSubmit,
      unregister,
      control,
      register,
      setFocus,
      subscribe,
    }),
    [
      clearErrors,
      control,
      formState,
      getFieldState,
      getValues,
      handleSubmit,
      register,
      reset,
      resetField,
      setError,
      setFocus,
      setValue,
      setValues,
      subscribe,
      trigger,
      unregister,
      watch,
    ],
  );

  return (
    <HookFormContext.Provider value={memoizedValue as unknown as UseFormReturn}>
      <HookFormControlContext.Provider value={memoizedValue.control as Control}>
        {children}
      </HookFormControlContext.Provider>
    </HookFormContext.Provider>
  );
};
