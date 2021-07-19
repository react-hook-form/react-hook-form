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
  const nameRef = React.useRef<InternalFieldName>(name as InternalFieldName);
  const [formState, updateFormState] = React.useState(control._formState.val);
  const _localProxyFormState = React.useRef({
    isDirty: false,
    dirtyFields: false,
    touchedFields: false,
    isValidating: false,
    isValid: false,
    errors: false,
  });
  nameRef.current = name as InternalFieldName;

  React.useEffect(() => {
    const formStateSubscription = control._subjects.state.subscribe({
      next: (formState) =>
        (!nameRef.current ||
          !formState.name ||
          convertToArrayPayload(nameRef.current).includes(formState.name)) &&
        shouldRenderFormState(formState, _localProxyFormState.current) &&
        updateFormState({
          ...control._formState.val,
          ...formState,
        }),
    });

    disabled && formStateSubscription.unsubscribe();

    return () => formStateSubscription.unsubscribe();
  }, [disabled]);

  return getProxyFormState(
    formState as FormState<TFieldValues>,
    control._proxyFormState,
    _localProxyFormState.current,
    false,
  );
}

export { useFormState };
