import * as React from 'react';

import getProxyFormState from './logic/getProxyFormState';
import shouldRenderFormState from './logic/shouldRenderFormState';
import isProxyEnabled from './utils/isProxyEnabled';
import {
  FieldValues,
  FormState,
  UseFormStateProps,
  UseFormStateReturn,
} from './types';
import { useFormContext } from './useFormContext';

function useFormState<TFieldValues extends FieldValues = FieldValues>(
  props?: UseFormStateProps<TFieldValues>,
): UseFormStateReturn<TFieldValues> {
  const methods = useFormContext();
  const { formStateRef, formStateSubjectRef, readFormStateRef } =
    (props && props.control) || methods.control;

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
    const formStateSubscription = formStateSubjectRef.current.subscribe({
      next: (formState) => {
        shouldRenderFormState(formState, readFormState.current) &&
          updateFormState({
            ...formStateRef.current,
            ...formState,
          });
      },
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
