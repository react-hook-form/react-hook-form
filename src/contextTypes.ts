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
  FieldValue,
  ManualFieldError,
  MultipleFieldErrors,
  Control,
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
  watch<T extends FieldName<FormValues>>(
    field: T & string,
    defaultValue?: string,
  ): FormValues[T];
  watch(
    fields: FieldName<FormValues>[] | string[],
    defaultValues?: DeepPartial<FormValues>,
  ): DeepPartial<FormValues>;
  watch(
    fieldNames?:
      | FieldName<FormValues>
      | FieldName<FormValues>[]
      | { nest: boolean },
    defaultValue?: string | DeepPartial<FormValues>,
  ): FieldValue<FormValues> | DeepPartial<FormValues> | string | undefined;
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
  setValue<Name extends FieldName<FormValues>>(
    name: Name,
    value?: FormValues[Name] | null | undefined | boolean,
    shouldValidate?: boolean,
  ): void;
  setValue<Name extends FieldName<FormValues>>(
    namesWithValue: Record<Name, any>[],
    shouldValidate?: boolean,
  ): void;
  setValue<Name extends FieldName<FormValues>>(
    names: Name | Record<Name, any>[],
    valueOrShouldValidate?: FormValues[Name] | null | undefined | boolean,
    shouldValidate?: boolean,
  ): void;
  triggerValidation: (
    payload?: FieldName<FormValues> | FieldName<FormValues>[] | string,
    shouldRender?: boolean,
  ) => Promise<boolean>;
  errors: FieldErrors<FormValues>;
  formState: FormStateProxy<FormValues>;
  reset: (values?: DeepPartial<FormValues>) => void;
  getValues: (payload?: { nest: boolean }) => FormValues;
  handleSubmit: (
    callback: OnSubmit<FormValues>,
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  control: Control<FormValues>;
};
