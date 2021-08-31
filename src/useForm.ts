import * as React from 'react';

import { createFormControl } from './logic/createFormControl';
import getProxyFormState from './logic/getProxyFormState';
import shouldRenderFormState from './logic/shouldRenderFormState';
import { FieldValues, FormState, UseFormProps, UseFormReturn } from './types';

export function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object,
>(
  props: UseFormProps<TFieldValues, TContext> = {},
): UseFormReturn<TFieldValues, TContext> {
  const _formControl = React.useRef<
    UseFormReturn<TFieldValues, TContext> | undefined
  >();
  const [formState, updateFormState] = React.useState<FormState<TFieldValues>>({
    isDirty: false,
    isValidating: false,
    dirtyFields: {},
    isSubmitted: false,
    submitCount: 0,
    touchedFields: {},
    isSubmitting: false,
    isSubmitSuccessful: false,
    isValid: false,
    errors: {},
  });

  if (_formControl.current) {
    _formControl.current.control._updateProps(props);
  } else {
    _formControl.current = {
      ...createFormControl(props),
      formState,
    };
  }

  const control = _formControl.current.control;

  React.useEffect(() => {
    const formStateSubscription = control._subjects.state.subscribe({
      next(formState) {
        if (shouldRenderFormState(formState, control._proxyFormState, true)) {
          control._formState = {
            ...control._formState,
            ...formState,
          };

          updateFormState({ ...control._formState });
        }
      },
    });

    return () => {
      formStateSubscription.unsubscribe();
    };
  }, [control]);

  React.useEffect(() => {
    if (!control._isMounted) {
      control._isMounted = true;
      control._proxyFormState.isValid && control._updateValid();
      !props.shouldUnregister && control._updateValues(control._defaultValues);
    }
    control._removeFields();
  });

  _formControl.current.formState = getProxyFormState(
    formState,
    control._proxyFormState,
  );

  return _formControl.current;
}
