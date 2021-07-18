import * as React from 'react';

import getProxyFormState from './logic/getProxyFormState';
import shouldRenderFormState from './logic/shouldRenderFormState';
import get from './utils/get';
import isHTMLElement from './utils/isHTMLElement';
import isProxyEnabled from './utils/isProxyEnabled';
import set from './utils/set';
import { createFormControl } from './createFormControl';
import {
  Field,
  FieldPath,
  FieldValues,
  FormState,
  Ref,
  UseFormProps,
  UseFormReturn,
} from './types';

export function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object,
>(
  props: UseFormProps<TFieldValues, TContext> = {},
): UseFormReturn<TFieldValues, TContext> {
  const _formControl = React.useRef(
    createFormControl<TFieldValues, TContext>(props),
  );
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

  const control = _formControl.current.control;

  control._updateProps(props);

  React.useEffect(() => {
    const formStateSubscription = control._subjects.state.subscribe({
      next(formState) {
        if (
          shouldRenderFormState(formState, control._proxyFormState.val, true)
        ) {
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
        if (state.values && state.name && control._proxyFormState.val.isValid) {
          set(control._formValues.val, state.name, state.values);
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
    const isLiveInDom = (ref: Ref) =>
      !isHTMLElement(ref) || !document.contains(ref);

    if (!control._isMounted.val) {
      control._isMounted.val = true;
      control._proxyFormState.val.isValid && control._updateValid();
      !props.shouldUnregister &&
        control._registerMissFields(control._defaultValues.val);
    }

    for (const name of control._names.val.unMount) {
      const field = get(control._fields.val, name) as Field;

      field &&
        (field._f.refs
          ? field._f.refs.every(isLiveInDom)
          : isLiveInDom(field._f.ref)) &&
        unregisterFieldNames.push(name);
    }

    unregisterFieldNames.length &&
      _formControl.current.unregister(
        unregisterFieldNames as FieldPath<TFieldValues>[],
      );

    control._names.val.unMount = new Set();
  });

  return {
    ..._formControl.current,
    formState: getProxyFormState<TFieldValues>(
      isProxyEnabled,
      formState,
      control._proxyFormState,
    ),
  };
}
