import * as React from 'react';
import { Control, FieldValues, FormState } from './types';

type UseFormStateProps<TFieldValues> = {
  control: Control<TFieldValues>;
};

function useFormState<TFieldValues extends FieldValues = FieldValues>({
  control,
}: UseFormStateProps<TFieldValues>) {
  const [formState, updateFormState] = React.useState<
    Partial<FormState<TFieldValues>>
  >(control.formState);

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

  return formState;
}

export { useFormState };
