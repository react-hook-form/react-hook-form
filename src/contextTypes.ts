import * as React from 'react';
import {
  FieldValues,
  FormStateProxy,
  FieldErrors,
  OnSubmit,
  ElementLike,
  ValidationOptions,
  FieldName,
  FieldValue,
  ManualFieldError,
  MultipleFieldErrors,
} from './types';

export interface FormProps<FormValues extends FieldValues = FieldValues>
  extends FormContextValues<FormValues> {
  children: React.ReactNode;
}

export interface FormContextValues<
  FormValues extends FieldValues = FieldValues
> {
  register<Element extends ElementLike = ElementLike>(
    validationOptions: ValidationOptions,
  ): (ref: Element | null) => void;
  register<Element extends ElementLike = ElementLike>(
    name: FieldName<FormValues>,
    validationOptions?: ValidationOptions,
  ): void;
  register<Element extends ElementLike = ElementLike>(
    namesWithValidationOptions: Record<
      FieldName<FormValues>,
      ValidationOptions
    >,
  ): void;
  register<Element extends ElementLike = ElementLike>(
    ref: Element,
    validationOptions?: ValidationOptions,
  ): void;
  register<Element extends ElementLike = ElementLike>(
    refOrValidationOptions: ValidationOptions | Element | null,
    validationOptions?: ValidationOptions,
  ): ((ref: Element | null) => void) | void;
  unregister(name: FieldName<FormValues>): void;
  unregister(names: FieldName<FormValues>[]): void;
  unregister(names: FieldName<FormValues> | FieldName<FormValues>[]): void;
  watch(): FormValues;
  watch(option: { nest: boolean }): FormValues;
  watch<T extends FieldName<FormValues>>(
    field: T & string,
    defaultValue?: string,
  ): FormValues[T];
  watch(
    fields: FieldName<FormValues>[] | string[],
    defaultValues?: Partial<FormValues>,
  ): Partial<FormValues>;
  watch(
    fieldNames?:
      | FieldName<FormValues>
      | FieldName<FormValues>[]
      | { nest: boolean },
    defaultValue?: string | Partial<FormValues>,
  ): FieldValue<FormValues> | Partial<FormValues> | string | undefined;
  setError(name: ManualFieldError<FormValues>[]): void;
  setError(name: FieldName<FormValues>, type: MultipleFieldErrors): void;
  setError(name: FieldName<FormValues>, type: string, message?: string): void;
  setError(
    name: FieldName<FormValues> | ManualFieldError<FormValues>[],
    type: string | MultipleFieldErrors,
    message?: string,
  ): void;
  clearError(): void;
  clearError(name: FieldName<FormValues>): void;
  clearError(names: FieldName<FormValues>[]): void;
  clearError(name?: FieldName<FormValues> | FieldName<FormValues>[]): void;
  setValue: <Name extends FieldName<FormValues>>(
    name: Name,
    value: FormValues[Name],
    shouldValidate?: boolean,
  ) => void | Promise<boolean>;
  triggerValidation: (
    payload?: FieldName<FormValues> | FieldName<FormValues>[] | string,
    shouldRender?: boolean,
  ) => Promise<boolean>;
  errors: FieldErrors<FormValues>;
  formState: FormStateProxy<FormValues>;
  reset: (values?: Partial<FormValues>) => void;
  getValues: (payload?: { nest: boolean }) => FormValues;
  handleSubmit: (
    callback: OnSubmit<FormValues>,
  ) => (e: React.BaseSyntheticEvent) => Promise<void>;
}
