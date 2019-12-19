import * as React from 'react';
import {
  FieldValues,
  FormStateProxy,
  FieldErrors,
  Register,
  OnSubmit,
  Unregister,
  Watch,
  SetError,
  ClearError,
  TriggerValidation,
  SetValue,
  Reset,
  GetValues,
} from './types';

export interface FormProps<FormValues extends FieldValues = FieldValues>
  extends FormContextValues<FormValues> {
  children: React.ReactNode;
}

export interface FormContextValues<
  FormValues extends FieldValues = FieldValues
> {
  register: Register<FormValues>;
  unregister: Unregister<FormValues>;
  watch: Watch<FormValues>;
  setError: SetError<FormValues>;
  clearError: ClearError<FormValues>;
  setValue: SetValue<FormValues>;
  triggerValidation: TriggerValidation<FormValues>;
  errors: FieldErrors<FormValues>;
  formState: FormStateProxy<FormValues>;
  reset: Reset<FormValues>;
  getValues: GetValues<FormValues>;
  handleSubmit: (
    callback: OnSubmit<FormValues>,
  ) => (e: React.BaseSyntheticEvent) => Promise<void>;
}
