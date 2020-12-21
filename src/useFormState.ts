import * as React from 'react';
import getProxyFormState from './logic/getProxyFormState';
import shouldRenderFormState from './logic/shouldRenderFormState';
import isProxyEnabled from './utils/isProxyEnabled';
import cloneObject from './utils/cloneObject';
import {
  FieldValues,
  FormState,
  UseFormStateMethods,
  UseFormStateProps,
} from './types';

function useFormState<TFieldValues extends FieldValues = FieldValues>({
  control,
}: UseFormStateProps<TFieldValues>): UseFormStateMethods<TFieldValues> {
  const [formState, updateFormState] = React.useState<FormState<TFieldValues>>(
    control.formStateRef.current,
  );
  const readFormStateRef = React.useRef(
    cloneObject(control.readFormStateRef.current),
  );

  React.useEffect(() => {
    control.formStateSubjectRef.current.subscribe({
      next: (state: Partial<FormState<TFieldValues>>) => {
        if (shouldRenderFormState(state, readFormStateRef.current)) {
          updateFormState({
            ...control.formStateRef.current,
            ...state,
          });
        }
      },
    });
  }, []);

  return getProxyFormState<TFieldValues>(
    isProxyEnabled,
    formState,
    control.readFormStateRef,
    readFormStateRef,
    false,
  );
}

export { useFormState };
