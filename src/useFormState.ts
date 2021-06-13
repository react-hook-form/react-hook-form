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
import { useFormControl } from './useFormContext';

function useFormState<TFieldValues extends FieldValues = FieldValues>(
  props?: UseFormStateProps<TFieldValues>,
): UseFormStateReturn<TFieldValues> {
  const { control, name } = props || {};
  const controlContext = useFormControl<TFieldValues>();
  const { formStateRef, subjectsRef, readFormStateRef } =
    control || controlContext;
  const nameRef = React.useRef<InternalFieldName>(name as InternalFieldName);
  nameRef.current = name as InternalFieldName;

  const [formState, updateFormState] = React.useState(formStateRef.current);
  const readFormState = React.useRef({
    isDirty: false,
    dirtyFields: false,
    touchedFields: false,
    isValidating: false,
    isValid: false,
    errors: false,
  });

  React.useEffect(() => {
    const formStateSubscription = subjectsRef.current.state.subscribe({
      next: (formState) =>
        (!nameRef.current ||
          !formState.name ||
          convertToArrayPayload(nameRef.current).includes(formState.name)) &&
        shouldRenderFormState(formState, readFormState.current) &&
        updateFormState({
          ...formStateRef.current,
          ...formState,
        }),
    });

    return () => formStateSubscription.unsubscribe();
  }, []);

  return getProxyFormState<TFieldValues>(
    isProxyEnabled,
    formState as FormState<TFieldValues>,
    readFormStateRef,
    readFormState,
    false,
  );
}

export { useFormState };
