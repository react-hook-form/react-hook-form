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
  IsFlatObject,
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
  watch<T extends string, U extends unknown>(
    field: T,
    defaultValue?: T extends keyof FormValues
      ? FormValues[T]
      : LiteralToPrimitive<U>,
  ): T extends keyof FormValues ? FormValues[T] : LiteralToPrimitive<U>;
  watch<T extends keyof FormValues>(
    fields: T[],
    defaultValues?: DeepPartial<Pick<FormValues, T>>,
  ): Pick<FormValues, T>;
  watch(
    fields: string[],
    defaultValues?: DeepPartial<FormValues>,
  ): DeepPartial<FormValues>;
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
  setValue<T extends string, U extends unknown>(
    name: T,
    value: T extends keyof FormValues
      ? DeepPartial<FormValues[T]>
      : LiteralToPrimitive<U>,
    shouldValidate?: boolean,
  ): void;
  setValue<T extends keyof FormValues>(
    namesWithValue: DeepPartial<Pick<FormValues, T>>[],
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
  getValues(): IsFlatObject<FormValues> extends true
    ? FormValues
    : Record<string, unknown>;
  getValues<T extends boolean>(payload: {
    nest: T;
  }): T extends true
    ? FormValues
    : IsFlatObject<FormValues> extends true
    ? FormValues
    : Record<string, unknown>;
  getValues<T extends string, U extends unknown>(
    payload: T,
  ): T extends keyof FormValues ? FormValues[T] : U;
  handleSubmit: (
    callback: OnSubmit<FormValues>,
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  control: Control<FormValues>;
};
