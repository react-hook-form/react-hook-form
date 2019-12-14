import * as React from 'react';
import {
  FieldValues,
  FieldName,
  FieldValue,
  ElementLike,
  FormStateProxy,
  FieldErrors,
  Ref,
  ValidationOptions,
  NameProp,
  OnSubmit,
} from './types';

export interface FormProps<FormValues extends FieldValues = FieldValues>
  extends FormContextValues<FormValues> {
  children: React.ReactNode;
}

export interface FormContextValues<
  FormValues extends FieldValues = FieldValues
> {
  // todo: update here for register as well
  register<Element>(
    validateRule: ValidationOptions & NameProp,
  ): (ref: Element | null) => void;
  register<Element extends ElementLike = ElementLike>(
    validateRule: ValidationOptions,
  ): (ref: Element | null) => void;
  register<Element>(
    ref: Element | null,
    validateRule: ValidationOptions & NameProp,
  ): void;
  register<Element extends ElementLike = ElementLike>(
    ref: Element | null,
    validationOptions?: ValidationOptions,
  ): void;
  unregister(name: FieldName<FormValues>): void;
  unregister(names: FieldName<FormValues>[]): void;
  unregister(names: FieldName<FormValues> | FieldName<FormValues>[]): void;
  watch(): FormValues;
  watch<T extends FieldName<FormValues>>(
    field: T,
    defaultValue?: string,
  ): FormValues[T];
  watch(
    fields: FieldName<FormValues>[],
    defaultValues?: Partial<FormValues>,
  ): Partial<FormValues>;
  watch(
    fieldNames?: FieldName<FormValues> | FieldName<FormValues>[],
    defaultValue?: string | Partial<FormValues>,
  ): FieldValue<FormValues> | Partial<FormValues> | string | undefined;
  reset: (values?: FormValues) => void;
  clearError(): void;
  clearError(name: FieldName<FormValues>): void;
  clearError(names: FieldName<FormValues>[]): void;
  clearError(name?: FieldName<FormValues> | FieldName<FormValues>[]): void;
  setError: (
    name: FieldName<FormValues>,
    type: string,
    message?: string,
    ref?: Ref,
  ) => void;
  setValue: <Name extends FieldName<FormValues>>(
    name: Name,
    value: FormValues[Name],
    shouldValidate?: boolean,
  ) => void | Promise<boolean>;
  triggerValidation: (
    payload?: FieldName<FormValues> | FieldName<FormValues>[],
  ) => Promise<boolean>;
  getValues: (payload?: { nest: boolean }) => FormValues;
  errors: FieldErrors<FormValues>;
  formState: FormStateProxy<FormValues>;
  handleSubmit: (
    callback: OnSubmit<FormValues>,
  ) => (e: React.BaseSyntheticEvent) => Promise<void>;
}
