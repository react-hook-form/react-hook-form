import * as React from 'react';

import { createFormControl } from './logic/createFormControl';
import getProxyFormState from './logic/getProxyFormState';
import shouldRenderFormState from './logic/shouldRenderFormState';
import { TearDown } from './utils/Subject';
import {
  FieldErrors,
  FieldNamesMarkedBoolean,
  FieldValues,
  FormState,
  UseFormProps,
  UseFormReturn,
} from './types';

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
    dirtyFields: {} as FieldNamesMarkedBoolean<TFieldValues>,
    isSubmitted: false,
    submitCount: 0,
    touchedFields: {} as FieldNamesMarkedBoolean<TFieldValues>,
    isSubmitting: false,
    isSubmitSuccessful: false,
    isValid: false,
    errors: {} as FieldErrors<TFieldValues>,
  });
  const _formStateSubscription = React.useRef<{
    unsubscribe: TearDown;
  }>();

  if (_formControl.current) {
    _formControl.current.control._updateProps(props);
  } else {
    _formControl.current = {
      ...createFormControl(props),
      formState,
    };
  }

  const control = _formControl.current.control;

  _formStateSubscription.current =
    _formStateSubscription.current ||
    control._subjects.state.subscribe({
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

  React.useEffect(() => {
    return () => {
      _formStateSubscription.current!.unsubscribe();
    };
  }, [control]);

  React.useEffect(() => {
    if (!control._stateFlags.mount) {
      control._proxyFormState.isValid && control._updateValid();
      control._stateFlags.mount = true;
    }
    if (control._stateFlags.watch) {
      control._stateFlags.watch = false;
      control._subjects.state.next({});
    }
    control._removeFields();
  });

  _formControl.current.formState = getProxyFormState(
    formState,
    control._proxyFormState,
  );

  return _formControl.current;
}
