import * as React from 'react';

import getProxyFormState from './logic/getProxyFormState';
import shouldRenderFormState from './logic/shouldRenderFormState';
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
  const { control, name } = props || {};
  const methods = useFormContext();
  const { formStateRef, formStateSubjectRef, readFormStateRef } =
    control || methods.control;
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
    const formStateSubscription = formStateSubjectRef.current.subscribe({
      next: ({ name, ...formState }) =>
        (!name ||
          !nameRef.current ||
          (Array.isArray(nameRef.current)
            ? nameRef.current
            : [nameRef.current]
          ).includes(name)) &&
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
