import * as React from 'react';

import getProxyFormState from './logic/getProxyFormState';
import shouldRenderFormState from './logic/shouldRenderFormState';
import convertToArrayPayload from './utils/convertToArrayPayload';
import isProxyEnabled from './utils/isProxyEnabled';
import {
  FieldValues,
  FormState,
  InternalFieldName,
  UseFormStateProps,
  UseFormStateReturn,
} from './types';
import { useFormContext } from './useFormContext';

function useFormState<TFieldValues extends FieldValues = FieldValues>(
  props?: UseFormStateProps<TFieldValues>,
): UseFormStateReturn<TFieldValues> {
  const methods = useFormContext();
  const { control = methods.control, name } = props || {};
  const nameRef = React.useRef<InternalFieldName>(name as InternalFieldName);
  nameRef.current = name as InternalFieldName;

  const [formState, updateFormState] = React.useState(control.formStateRef);
  const readFormState = React.useRef({
    isDirty: false,
    dirtyFields: false,
    touchedFields: false,
    isValidating: false,
    isValid: false,
    errors: false,
  });

  React.useEffect(() => {
    const formStateSubscription = control.subjectsRef.state.subscribe({
      next: (formState) =>
        (!nameRef.current ||
          !formState.name ||
          convertToArrayPayload(nameRef.current).includes(formState.name)) &&
        shouldRenderFormState(formState, readFormState.current) &&
        updateFormState({
          ...control.formStateRef,
          ...formState,
        }),
    });

    return () => formStateSubscription.unsubscribe();
  }, []);

  return getProxyFormState<TFieldValues>(
    isProxyEnabled,
    formState as FormState<TFieldValues>,
    {
      get current() {
        return control.readFormStateRef;
      },
    },
    readFormState,
    false,
  );
}

export { useFormState };
