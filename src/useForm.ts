import * as React from 'react';

import { createFormControl } from './logic/createFormControl';
import getProxyFormState from './logic/getProxyFormState';
import shouldRenderFormState from './logic/shouldRenderFormState';
import get from './utils/get';
import live from './utils/live';
import set from './utils/set';
import {
  Field,
  FieldPath,
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
    Omit<UseFormReturn<TFieldValues, TContext>, 'formState'> | undefined
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

  _formControl.current
    ? _formControl.current.control._updateProps(props)
    : (_formControl.current = createFormControl(props));

  const control = _formControl.current.control;

  React.useEffect(() => {
    const formStateSubscription = control._subjects.state.subscribe({
      next(formState) {
        if (shouldRenderFormState(formState, control._proxyFormState, true)) {
          control._formState.val = {
            ...control._formState.val,
            ...formState,
          };

          updateFormState({ ...control._formState.val });
        }
      },
    });

    const useFieldArraySubscription = control._subjects.array.subscribe({
      next(state) {
        if (state.values && state.name && control._proxyFormState.isValid) {
          set(control._formValues, state.name, state.values);
          control._updateValid();
        }
      },
    });

    return () => {
      formStateSubscription.unsubscribe();
      useFieldArraySubscription.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    const unregisterFieldNames = [];

    if (!control._isMounted) {
      control._isMounted = true;
      control._proxyFormState.isValid && control._updateValid();
      !props.shouldUnregister &&
        control._registerMissFields(control._defaultValues);
    }

    for (const name of control._names.unMount) {
      const field = get(control._fields, name) as Field;

      field &&
        (field._f.refs ? field._f.refs.every(live) : live(field._f.ref)) &&
        unregisterFieldNames.push(name);
    }

    unregisterFieldNames.length &&
      _formControl.current!.unregister(
        unregisterFieldNames as FieldPath<TFieldValues>[],
      );

    control._names.unMount = new Set();
  });

  return {
    ..._formControl.current,
    formState: getProxyFormState(formState, control._proxyFormState),
  };
}
