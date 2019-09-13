import * as React from 'react';
import {
  FieldValues,
  ElementLike,
  FormState,
  FieldErrors,
  OnSubmit,
  Ref,
  ValidationOptions,
  ValidationPayload,
  DefaultFieldValues,
} from './types';

export interface FormProps<
  FormValues extends FieldValues = DefaultFieldValues,
  FieldName extends keyof FormValues = keyof FormValues,
  FieldValue = FormValues[FieldName]
> extends FormContextValues<FormValues, FieldName, FieldValue> {
  children: JSX.Element[] | JSX.Element;
}

export interface FormContextValues<
  FormValues extends FieldValues = DefaultFieldValues,
  FieldName extends keyof FormValues = keyof FormValues,
  FieldValue = FormValues[FieldName]
> {
  register<Element extends ElementLike = ElementLike>(
    validateRule: ValidationOptions,
  ): (ref: Element | null) => void;
  register<Element extends ElementLike = ElementLike>(
    ref: Element | null,
    validationOptions?: ValidationOptions,
  ): void;
  unregister(name: FieldName | string): void;
  unregister(names: (FieldName | string)[]): void;
  handleSubmit: (
    callback: OnSubmit<FormValues>,
  ) => (e: React.SyntheticEvent) => Promise<void>;
  watch(): FormValues;
  watch(field: FieldName | string, defaultValue?: string): FieldValue;
  watch(
    fields: (FieldName | string)[],
    defaultValues?: Partial<FormValues>,
  ): Partial<FormValues>;
  reset: (values?: FieldValues) => void;
  clearError(): void;
  clearError(name: FieldName): void;
  clearError(names: FieldName[]): void;
  setError: (
    name: FieldName,
    type: string,
    message?: string,
    ref?: Ref,
  ) => void;
  setValue: (
    name: FieldName,
    value: FieldValue,
    shouldValidate?: boolean,
  ) => void;
  triggerValidation: (
    payload:
      | ValidationPayload<FieldName, FieldValue>
      | ValidationPayload<FieldName, FieldValue>[],
  ) => Promise<boolean>;
  getValues: (payload?: { nest: boolean }) => FormValues;
  errors: FieldErrors<FormValues>;
  formState: FormState<FormValues, FieldName>;
}
