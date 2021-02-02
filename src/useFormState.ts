import * as React from 'react';
import { useFormContext } from './useFormContext';
import getProxyFormState from './logic/getProxyFormState';
import shouldRenderFormState from './logic/shouldRenderFormState';
import isProxyEnabled from './utils/isProxyEnabled';
import {
  FieldValues,
  FormState,
  ReadFormState,
  UseFormStateMethods,
  UseFormStateProps,
} from './types';

function useFormState<TFieldValues extends FieldValues = FieldValues>({
  control,
}: UseFormStateProps<TFieldValues> = {}): UseFormStateMethods<TFieldValues> {
  const methods = useFormContext();
  const { formStateRef, formStateSubjectRef, readFormStateRef } =
    control || methods.control;

  const [formState, updateFormState] = React.useState(formStateRef.current);
  const readFormState = React.useRef(
    Object.keys(readFormStateRef.current).reduce(
      (prev, current) => ({
        ...prev,
        [current]: false,
      }),
      {},
    ) as ReadFormState,
  );

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
