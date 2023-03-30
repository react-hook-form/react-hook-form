import React from 'react';

import { createFormControl } from './logic/createFormControl';
import getProxyFormState from './logic/getProxyFormState';
import shouldRenderFormState from './logic/shouldRenderFormState';
import deepEqual from './utils/deepEqual';
import isFunction from './utils/isFunction';
import {
  FieldValues,
  FormState,
  InternalFieldName,
  UseFormProps,
  UseFormReturn,
} from './types';
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
  const _formControl = React.useRef<
    UseFormReturn<TFieldValues, TContext> | undefined
  >();
  const [formState, updateFormState] = React.useState<FormState<TFieldValues>>({
    isDirty: false,
    isValidating: false,
    isLoading: isFunction(props.defaultValues),
    isSubmitted: false,
    isSubmitting: false,
    isSubmitSuccessful: false,
    isValid: false,
    submitCount: 0,
    dirtyFields: {},
    touchedFields: {},
    errors: {},
    defaultValues: isFunction(props.defaultValues)
      ? undefined
      : props.defaultValues,
  });

  if (!_formControl.current) {
    _formControl.current = {
      ...createFormControl(props, () =>
        updateFormState((formState) => ({ ...formState })),
      ),
      formState,
    };
  }

  const control = _formControl.current.control;
  control._options = props;

  useSubscribe({
    subject: control._subjects.state,
    next: (
      value: Partial<FormState<TFieldValues>> & { name?: InternalFieldName },
    ) => {
      if (
        shouldRenderFormState(
          value,
          control._proxyFormState,
          control._updateFormState,
          true,
        )
      ) {
        updateFormState({ ...control._formState });
      }
    },
  });

  React.useEffect(() => {
    if (props.values && !deepEqual(props.values, control._defaultValues)) {
      control._reset(props.values, control._options.resetOptions);
    } else {
      control._resetDefaultValues();
    }
  }, [props.values, control]);

  React.useEffect(() => {
    if (!control._state.mount) {
      control._updateValid();
      control._state.mount = true;
    }

    if (control._state.watch) {
      control._state.watch = false;
      control._subjects.state.next({ ...control._formState });
    }

    control._removeUnmounted();
  });

  _formControl.current.formState = getProxyFormState(formState, control);

  return _formControl.current;
}
