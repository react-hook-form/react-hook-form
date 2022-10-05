import React from 'react';

import { createFormControl } from './logic/createFormControl';
import focusFieldBy from './logic/focusFieldBy';
import getProxyFormState from './logic/getProxyFormState';
import shouldRenderFormState from './logic/shouldRenderFormState';
import get from './utils/get';
import { FieldValues, FormState, UseFormProps, UseFormReturn } from './types';
import { useSubscribe } from './useSubscribe';

/**
 * Custom hook to manage the entire form.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/useform) • [Demo](https://codesandbox.io/s/react-hook-form-get-started-ts-5ksmm) • [Video](https://www.youtube.com/watch?v=RkXv4AXXC_4)
 *
 * @param props - form configuration and validation parameters.
 *
 * @returns methods - individual functions to manage the form state. {@link UseFormReturn}
 *
 * @example
 * ```tsx
 * function App() {
 *   const { register, handleSubmit, watch, formState: { errors } } = useForm();
 *   const onSubmit = data => console.log(data);
 *
 *   console.log(watch("example"));
 *
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       <input defaultValue="test" {...register("example")} />
 *       <input {...register("exampleRequired", { required: true })} />
 *       {errors.exampleRequired && <span>This field is required</span>}
 *       <input type="submit" />
 *     </form>
 *   );
 * }
 * ```
 */
export function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
>(
  props: UseFormProps<TFieldValues, TContext> = {},
): UseFormReturn<TFieldValues, TContext> {
  const { defaultValues, shouldFocusError } = props;
  const _formControl = React.useRef<
    UseFormReturn<TFieldValues, TContext> | undefined
  >();
  const [formState, updateFormState] = React.useState<FormState<TFieldValues>>({
    isDirty: false,
    isValidating: false,
    isSubmitted: false,
    isSubmitting: false,
    isSubmitSuccessful: false,
    isValid: false,
    submitCount: 0,
    dirtyFields: {},
    touchedFields: {},
    errors: {},
    defaultValues,
  });

  if (!_formControl.current) {
    _formControl.current = {
      ...createFormControl(props),
      formState,
    };
  }

  const control = _formControl.current.control;
  control._options = props;

  useSubscribe({
    subject: control._subjects.state,
    callback: React.useCallback(
      (value: FieldValues) => {
        if (shouldRenderFormState(value, control._proxyFormState, true)) {
          control._formState = {
            ...control._formState,
            ...value,
          };

          updateFormState({ ...control._formState });
        }
      },
      [control],
    ),
  });

  React.useEffect(() => {
    if (!control._stateFlags.mount) {
      control._proxyFormState.isValid && control._updateValid();
      control._stateFlags.mount = true;
    }

    if (control._stateFlags.watch) {
      control._stateFlags.watch = false;
      control._subjects.state.next({});
    }

    control._removeUnmounted();
  });

  React.useEffect(() => {
    if (formState.submitCount) {
      shouldFocusError !== false &&
        focusFieldBy(
          control._fields,
          (key) => get(control._formState.errors, key),
          control._names.mount,
        );
    }
  }, [control, shouldFocusError, formState]);

  _formControl.current.formState = getProxyFormState(formState, control);

  return _formControl.current;
}
