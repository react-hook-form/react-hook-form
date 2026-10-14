import React from 'react';

import { formStateOwners } from './logic/formStateOwners';
import { updateMethodsReference } from './utils/updateMethodsReference';
import type {
  Control,
  FieldValues,
  FormProviderProps,
  UseFormReturn,
} from './types';
import { HookFormControlContext } from './useFormControlContext';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

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
  formState: formStateProp,
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
  // A memoized parent (React Compiler) can pass an outdated `formState`; take
  // the latest one from the `useForm` call that created it.
  const owner = formStateOwners.get(formStateProp);
  const formState = ((owner && owner.formState) ||
    formStateProp) as typeof formStateProp;
  const isOutdated = formState !== formStateProp;
  const renderedFormState = React.useRef(formState);
  const [, forceRender] = React.useReducer((count: number) => count + 1, 0);

  useIsomorphicLayoutEffect(() => {
    renderedFormState.current = formState;
  });

  useIsomorphicLayoutEffect(() => {
    if (!owner) {
      return;
    }

    const update = () => {
      if (owner.formState !== renderedFormState.current) {
        forceRender();
      }
    };

    update();
    owner.listeners.add(update);

    return () => {
      owner.listeners.delete(update);
    };
  }, [owner]);

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
    };

    // Rebind read methods so memoized calls in compiled consumers re-run.
    if (isOutdated) {
      updateMethodsReference(value, value);
    }

    return value;
  }, [
    isOutdated,
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
