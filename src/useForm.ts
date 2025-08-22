import React from 'react';

import getProxyFormState from './logic/getProxyFormState';
import createId from './utils/createId';
import deepEqual from './utils/deepEqual';
import isFunction from './utils/isFunction';
import submitForm from './utils/submit';
import { createFormControl } from './logic';
import type {
  FieldValues,
  FormMetadata,
  FormState,
  UseFormProps,
  UseFormReturn,
} from './types';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

/**
 * Custom hook to manage the entire form.
 *
 * @remarks
 * [API](https://react-hook-form.com/docs/useform) • [Demo](https://codesandbox.io/s/react-hook-form-get-started-ts-5ksmm) • [Video](https://www.youtube.com/watch?v=RkXv4AXXC_4)
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
 *       <button>Submit</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
  TMetadata extends FormMetadata = any,
>(
  props: UseFormProps<
    TFieldValues,
    TContext,
    TTransformedValues,
    TMetadata
  > = {},
): UseFormReturn<TFieldValues, TContext, TTransformedValues, TMetadata> {
  const _formControl = React.useRef<
    | UseFormReturn<TFieldValues, TContext, TTransformedValues, TMetadata>
    | undefined
  >(undefined);
  const _values = React.useRef<typeof props.values>(undefined);
  const [formState, updateFormState] = React.useState<
    FormState<TFieldValues, TMetadata>
  >({
    isDirty: false,
    isDirtySinceSubmit: false,
    isValidating: false,
    isLoading: props.isLoading || isFunction(props.defaultValues),
    isSubmitted: false,
    isSubmitting: false,
    isSubmitSuccessful: false,
    isValid: false,
    submitCount: 0,
    dirtyFields: {},
    touchedFields: {},
    focusedField: undefined,
    validatingFields: {},
    errors: props.errors || {},
    // If it's an array, set formState.disabled to false because when using array mode,
    // the form itself isn't disabled - only specific fields are
    disabled: Array.isArray(props.disabled) ? false : props.disabled || false,
    isReady: false,
    defaultValues: isFunction(props.defaultValues)
      ? undefined
      : props.defaultValues,
    metadata:
      props.defaultMetadata ||
      props.formControl?.control._options.defaultMetadata ||
      ({} as TMetadata),
  });

  if (!_formControl.current) {
    if (props.formControl) {
      _formControl.current = {
        ...props.formControl,
        formState,
      };

      if (props.defaultValues && !isFunction(props.defaultValues)) {
        props.formControl.reset(props.defaultValues, props.resetOptions);
      }
    } else {
      const { formControl, ...rest } = createFormControl(props);

      _formControl.current = {
        ...rest,
        formState,
      };
    }
  }

  const control = _formControl.current.control;
  control._options = props;

  useIsomorphicLayoutEffect(() => {
    const sub = control._subscribe({
      formState: control._proxyFormState,
      callback: () => updateFormState({ ...control._formState }),
      reRenderRoot: true,
    });

    updateFormState((data) => ({
      ...data,
      isReady: true,
    }));

    control._formState.isReady = true;

    return sub;
  }, [control]);

  React.useEffect(
    () => control._disableForm(props.disabled),
    [control, props.disabled],
  );

  React.useEffect(() => {
    control._updateIsLoading(props.isLoading);
  }, [control, props.isLoading]);

  React.useEffect(() => {
    if (props.mode) {
      control._options.mode = props.mode;
    }
    if (props.reValidateMode) {
      control._options.reValidateMode = props.reValidateMode;
    }
  }, [control, props.mode, props.reValidateMode]);

  React.useEffect(() => {
    if (props.errors) {
      control._setErrors(props.errors);
      control._focusError();
    }
  }, [control, props.errors]);

  React.useEffect(() => {
    props.shouldUnregister &&
      control._subjects.state.next({
        values: control._getWatch(),
      });
  }, [control, props.shouldUnregister]);

  React.useEffect(() => {
    if (control._proxyFormState.isDirty) {
      const isDirty = control._getDirty();
      if (isDirty !== formState.isDirty) {
        control._subjects.state.next({
          isDirty,
        });
      }
    }
  }, [control, formState.isDirty]);

  React.useEffect(() => {
    if (props.values && !deepEqual(props.values, _values.current)) {
      control._reset(props.values, {
        keepFieldsRef: true,
        ...control._options.resetOptions,
      });
      _values.current = props.values;
      updateFormState((state) => ({ ...state }));
    } else {
      control._resetDefaultValues();
    }
  }, [control, props.values]);

  React.useEffect(() => {
    if (!control._state.mount) {
      control._setValid();
      control._state.mount = true;
    }

    if (control._state.watch) {
      control._state.watch = false;
      control._subjects.state.next({ ...control._formState });
    }

    control._removeUnmounted();
  });

  React.useEffect(() => {
    if (
      _formControl.current &&
      props.id !== undefined &&
      _formControl.current.id !== props.id
    ) {
      const id = createId(props.id);
      _formControl.current.id = id;
      _formControl.current.submit = () => {
        submitForm(id);
      };
      updateFormState((state) => ({ ...state }));
    }
  }, [props.id]);

  _formControl.current.formState = getProxyFormState(formState, control);

  return _formControl.current;
}
