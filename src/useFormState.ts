import * as React from 'react';

import getProxyFormState from './logic/getProxyFormState';
import shouldRenderFormState from './logic/shouldRenderFormState';
import convertToArrayPayload from './utils/convertToArrayPayload';
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
  const { control = methods.control, disabled, name } = props || {};
  const { _formState, _subjects, _proxyFormState } = control;
  const nameRef = React.useRef<InternalFieldName>(name as InternalFieldName);
  nameRef.current = name as InternalFieldName;

  const [formState, updateFormState] = React.useState(_formState.val);
  const readFormState = React.useRef({
    isDirty: false,
    dirtyFields: false,
    touchedFields: false,
    isValidating: false,
    isValid: false,
    errors: false,
  });

  React.useEffect(() => {
    const formStateSubscription = _subjects.state.subscribe({
      next: (formState) =>
        (!nameRef.current ||
          !formState.name ||
          convertToArrayPayload(nameRef.current).includes(formState.name)) &&
        shouldRenderFormState(formState, readFormState.current) &&
        updateFormState({
          ..._formState.val,
          ...formState,
        }),
    });

    disabled && formStateSubscription.unsubscribe();

    return () => formStateSubscription.unsubscribe();
  }, []);

  return getProxyFormState<TFieldValues>(
    formState as FormState<TFieldValues>,
    _proxyFormState,
    readFormState,
    false,
  );
}

export { useFormState };
