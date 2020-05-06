import * as React from 'react';
import {
  DeepPartial,
  FieldValues,
  UnpackNestedValue,
  FieldName,
  NestedValue,
  FormStateProxy,
  FieldErrors,
  OnSubmit,
  FieldElement,
  ValidationOptions,
  ManualFieldError,
  MultipleFieldErrors,
  Control,
  OmitResetState,
  Message,
  LiteralToPrimitive,
  IsAny,
} from './types';

export type FormProviderProps<
  TFieldValues extends FieldValues = FieldValues
> = {
  children: React.ReactNode;
} & FormContextValues<TFieldValues>;

export type FormContextValues<
  TFieldValues extends FieldValues = FieldValues
> = {
  register<TFieldElement extends FieldElement<TFieldValues>>(): (
    ref: TFieldElement | null,
  ) => void;
  register<TFieldElement extends FieldElement<TFieldValues>>(
    validationOptions: ValidationOptions,
  ): (ref: TFieldElement | null) => void;
  register(
    name: FieldName<TFieldValues>,
    validationOptions?: ValidationOptions,
  ): void;
  register<TFieldElement extends FieldElement<TFieldValues>>(
    ref: TFieldElement,
    validationOptions?: ValidationOptions,
  ): void;
  unregister(name: FieldName<TFieldValues> | FieldName<TFieldValues>[]): void;
  watch(): UnpackNestedValue<TFieldValues>;
  watch<T extends string, U extends unknown>(
    field: T,
    defaultValue?: T extends keyof TFieldValues
      ? UnpackNestedValue<TFieldValues>[T]
      : LiteralToPrimitive<U>,
  ): T extends keyof TFieldValues
    ? UnpackNestedValue<TFieldValues>[T]
    : LiteralToPrimitive<U>;
  watch<T extends keyof TFieldValues>(
    fields: T[],
    defaultValues?: UnpackNestedValue<DeepPartial<Pick<TFieldValues, T>>>,
  ): UnpackNestedValue<Pick<TFieldValues, T>>;
  watch(
    fields: string[],
    defaultValues?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): UnpackNestedValue<DeepPartial<TFieldValues>>;
  setError(name: FieldName<TFieldValues>, type: MultipleFieldErrors): void;
  setError(
    name: FieldName<TFieldValues>,
    type: string,
    message?: Message,
  ): void;
  setError(name: ManualFieldError<TFieldValues>[]): void;
  clearError(name?: FieldName<TFieldValues> | FieldName<TFieldValues>[]): void;
  setValue<T extends string, U extends unknown>(
    name: T,
    value: T extends keyof TFieldValues
      ? IsAny<TFieldValues[T]> extends true
        ? any
        : TFieldValues[T] extends NestedValue<infer U>
        ? U
        : UnpackNestedValue<DeepPartial<TFieldValues[T]>>
      : LiteralToPrimitive<U>,
    shouldValidate?: boolean,
  ): void;
  setValue<T extends keyof TFieldValues>(
    namesWithValue: UnpackNestedValue<DeepPartial<Pick<TFieldValues, T>>>[],
    shouldValidate?: boolean,
  ): void;
  trigger(
    payload?: FieldName<TFieldValues> | FieldName<TFieldValues>[],
  ): Promise<boolean>;
  errors: FieldErrors<TFieldValues>;
  formState: FormStateProxy<TFieldValues>;
  reset: (
    values?: UnpackNestedValue<DeepPartial<TFieldValues>>,
    omitResetState?: OmitResetState,
  ) => void;
  getValues(): UnpackNestedValue<TFieldValues>;
  getValues<T extends keyof TFieldValues>(
    payload: T[],
  ): UnpackNestedValue<Pick<TFieldValues, T>>;
  getValues<T extends string, U extends unknown>(
    payload: T,
  ): T extends keyof TFieldValues ? UnpackNestedValue<TFieldValues>[T] : U;
  handleSubmit: (
    callback: OnSubmit<TFieldValues>,
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  control: Control<TFieldValues>;
};
