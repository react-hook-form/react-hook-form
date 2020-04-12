import * as React from 'react';
import {
  DeepPartial,
  FieldValues,
  FormStateProxy,
  FieldErrors,
  OnSubmit,
  FieldElement,
  ValidationOptions,
  FieldName,
  ManualFieldError,
  MultipleFieldErrors,
  Control,
  OmitResetState,
  Message,
  LiteralToPrimitive,
} from './types';

export type FormProps<FormValues extends FieldValues = FieldValues> = {
  children: React.ReactNode;
} & FormContextValues<FormValues>;

export type FormContextValues<FormValues extends FieldValues = FieldValues> = {
  register<Element extends FieldElement = FieldElement>(): (
    ref: Element | null,
  ) => void;
  register<Element extends FieldElement = FieldElement>(
    validationOptions: ValidationOptions,
  ): (ref: Element | null) => void;
  register<Element extends FieldElement = FieldElement>(
    name: FieldName<FormValues>,
    validationOptions?: ValidationOptions,
  ): void;
  register<Element extends FieldElement = FieldElement>(
    namesWithValidationOptions: Record<
      FieldName<FormValues>,
      ValidationOptions
    >,
  ): void;
  register<Element extends FieldElement = FieldElement>(
    ref: Element,
    validationOptions?: ValidationOptions,
  ): void;
  register<Element extends FieldElement = FieldElement>(
    refOrValidationOptions: ValidationOptions | Element | null,
    validationOptions?: ValidationOptions,
  ): ((ref: Element | null) => void) | void;
  unregister(name: FieldName<FormValues>): void;
  unregister(names: FieldName<FormValues>[]): void;
  unregister(names: FieldName<FormValues> | FieldName<FormValues>[]): void;
  watch(): FormValues;
  watch(option: { nest: boolean }): FormValues;
  watch<T extends keyof FormValues>(
    field: T,
    defaultValue?: FormValues[T],
  ): FormValues[T];
  watch<T extends unknown>(
    field: string,
    defaultValue?: T,
  ): LiteralToPrimitive<T>;
  watch<T extends keyof FormValues>(
    fields: T[],
    defaultValues?: FormValues[T],
  ): Record<T, FormValues[T]>;
  watch<T extends DeepPartial<FormValues>>(
    fields: string[],
    defaultValues?: T,
  ): T;
  watch(
    fieldNames?: string | string[] | { nest: boolean },
    defaultValue?: unknown,
  ): unknown;
  setError(name: ManualFieldError<FormValues>[]): void;
  setError(name: FieldName<FormValues>, type: MultipleFieldErrors): void;
  setError(name: FieldName<FormValues>, type: string, message?: Message): void;
  setError(
    name: FieldName<FormValues> | ManualFieldError<FormValues>[],
    type: string | MultipleFieldErrors,
    message?: Message,
  ): void;
  clearError(): void;
  clearError(name: FieldName<FormValues>): void;
  clearError(names: FieldName<FormValues>[]): void;
  clearError(name?: FieldName<FormValues> | FieldName<FormValues>[]): void;
  setValue<Name extends FieldName<FormValues>>(
    name: Name,
    value?: FormValues[Name],
    shouldValidate?: boolean,
  ): void;
  setValue<Name extends FieldName<FormValues>>(
    namesWithValue: Record<Name, any>[],
    shouldValidate?: boolean,
  ): void;
  setValue<Name extends FieldName<FormValues>>(
    names: Name | Record<Name, any>[],
    valueOrShouldValidate?: FormValues[Name] | boolean,
    shouldValidate?: boolean,
  ): void;
  triggerValidation: (
    payload?: FieldName<FormValues> | FieldName<FormValues>[] | string,
    shouldRender?: boolean,
  ) => Promise<boolean>;
  errors: FieldErrors<FormValues>;
  formState: FormStateProxy<FormValues>;
  reset: (
    values?: DeepPartial<FormValues>,
    omitResetState?: OmitResetState,
  ) => void;
  getValues: (payload?: { nest: boolean }) => FormValues;
  handleSubmit: (
    callback: OnSubmit<FormValues>,
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  control: Control<FormValues>;
};
