import * as React from 'react';
import getProxyFormState from './logic/getProxyFormState';
import isProxyEnabled from './utils/isProxyEnabled';
import { Control, FieldValues, FormState } from './types';

type UseFormStateProps<TFieldValues> = {
  control: Control<TFieldValues>;
};

function useFormState<TFieldValues extends FieldValues = FieldValues>({
  control,
}: UseFormStateProps<TFieldValues>) {
  const [, updateFormState] = React.useState<Partial<FormState<TFieldValues>>>(
    control.formState,
  );

  React.useEffect(() => {
    control.formStateSubjectRef.current.subscribe({
      next: (value) => {
        updateFormState({
          ...control.formStateRef.current,
          ...value,
        });
      },
    });
  }, []);

  return getProxyFormState(
    isProxyEnabled,
    control.formState,
    control.readFormStateRef,
  );
}

export { useFormState };
