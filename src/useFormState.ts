import * as React from 'react';
import getProxyFormState from './logic/getProxyFormState';
import shouldRenderFormState from './logic/shouldRenderFormState';
import isProxyEnabled from './utils/isProxyEnabled';
import cloneObject from './utils/cloneObject';
import { Control, FieldValues, FormState, ReadFormState } from './types';

type UseFormStateProps<TFieldValues> = {
  control: Control<TFieldValues>;
};

function useFormState<TFieldValues extends FieldValues = FieldValues>({
  control,
}: UseFormStateProps<TFieldValues>) {
  const readFormStateRef = React.useRef<ReadFormState>(
    cloneObject(control.readFormStateRef.current),
  );
  const [, updateFormState] = React.useState<Partial<FormState<TFieldValues>>>(
    control.formState,
  );

  React.useEffect(() => {
    control.formStateSubjectRef.current.subscribe({
      next: (state) => {
        if (
          shouldRenderFormState(state, control.readFormStateRef.current) ||
          shouldRenderFormState(state, readFormStateRef.current)
        ) {
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
    control.formState,
    readFormStateRef,
  );
}

export { useFormState };
