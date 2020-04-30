import * as React from 'react';
import {
  DeepPartial,
  FieldValues,
  Unpacked,
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
  IsFlatObject,
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
    name: IsFlatObject<TFieldValues> extends true
      ? Extract<keyof TFieldValues, string>
      : string,
    validationOptions?: ValidationOptions,
  ): void;
  register<TFieldElement extends FieldElement<TFieldValues>>(
    ref: TFieldElement,
    validationOptions?: ValidationOptions,
  ): void;
  unregister(
    name:
      | (IsFlatObject<TFieldValues> extends true
          ? Extract<keyof TFieldValues, string>
          : string)
      | (IsFlatObject<TFieldValues> extends true
          ? Extract<keyof TFieldValues, string>
          : string)[],
  ): void;
  watch(): Unpacked<TFieldValues>;
  watch<T extends string, U extends unknown>(
    field: T,
    defaultValue?: T extends keyof TFieldValues
      ? Unpacked<TFieldValues>[T]
      : LiteralToPrimitive<U>,
  ): T extends keyof TFieldValues
    ? Unpacked<TFieldValues>[T]
    : LiteralToPrimitive<U>;
  watch<T extends keyof TFieldValues>(
    fields: T[],
    defaultValues?: Unpacked<DeepPartial<Pick<TFieldValues, T>>>,
  ): Unpacked<Pick<TFieldValues, T>>;
  watch(
    fields: string[],
    defaultValues?: Unpacked<DeepPartial<TFieldValues>>,
  ): Unpacked<DeepPartial<TFieldValues>>;
  setError(
    name: IsFlatObject<TFieldValues> extends true
      ? Extract<keyof TFieldValues, string>
      : string,
    type: MultipleFieldErrors,
  ): void;
  setError(
    name: IsFlatObject<TFieldValues> extends true
      ? Extract<keyof TFieldValues, string>
      : string,
    type: string,
    message?: Message,
  ): void;
  setError(name: ManualFieldError<TFieldValues>[]): void;
  clearError(
    name?:
      | (IsFlatObject<TFieldValues> extends true
          ? Extract<keyof TFieldValues, string>
          : string)
      | (IsFlatObject<TFieldValues> extends true
          ? Extract<keyof TFieldValues, string>
          : string)[],
  ): void;
  setValue<T extends string, U extends unknown>(
    name: T,
    value: T extends keyof TFieldValues
      ? IsAny<TFieldValues[T]> extends true
        ? any
        : TFieldValues[T] extends NestedValue<infer U>
        ? U
        : Unpacked<DeepPartial<TFieldValues[T]>>
      : LiteralToPrimitive<U>,
    shouldValidate?: boolean,
  ): void;
  setValue<T extends keyof TFieldValues>(
    namesWithValue: Unpacked<DeepPartial<Pick<TFieldValues, T>>>[],
    shouldValidate?: boolean,
  ): void;
  triggerValidation(
    payload?:
      | (IsFlatObject<TFieldValues> extends true
          ? Extract<keyof TFieldValues, string>
          : string)
      | (IsFlatObject<TFieldValues> extends true
          ? Extract<keyof TFieldValues, string>
          : string)[],
  ): Promise<boolean>;
  errors: FieldErrors<TFieldValues>;
  formState: FormStateProxy<TFieldValues>;
  reset: (
    values?: Unpacked<DeepPartial<TFieldValues>>,
    omitResetState?: OmitResetState,
  ) => void;
  getValues(): Unpacked<TFieldValues>;
  getValues<T extends keyof TFieldValues>(
    payload: T[],
  ): Unpacked<Pick<TFieldValues, T>>;
  getValues<T extends string, U extends unknown>(
    payload: T,
  ): T extends keyof TFieldValues ? Unpacked<TFieldValues>[T] : U;
  handleSubmit: (
    callback: OnSubmit<Unpacked<TFieldValues>>,
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  control: Control<TFieldValues>;
};
