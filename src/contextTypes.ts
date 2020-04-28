import * as React from 'react';
import {
  UnpackedDeepPartial,
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

export type FormProps<FormValues extends FieldValues = FieldValues> = {
  children: React.ReactNode;
} & FormContextValues<FormValues>;

export type FormContextValues<FormValues extends FieldValues = FieldValues> = {
  register<
    Element extends FieldElement<FormValues> = FieldElement<FormValues>
  >(): (ref: Element | null) => void;
  register<Element extends FieldElement<FormValues> = FieldElement<FormValues>>(
    validationOptions: ValidationOptions,
  ): (ref: Element | null) => void;
  register(
    name: IsFlatObject<FormValues> extends true
      ? Extract<keyof FormValues, string>
      : string,
    validationOptions?: ValidationOptions,
  ): void;
  register<Element extends FieldElement<FormValues> = FieldElement<FormValues>>(
    ref: Element,
    validationOptions?: ValidationOptions,
  ): void;
  unregister(
    name:
      | (IsFlatObject<FormValues> extends true
          ? Extract<keyof FormValues, string>
          : string)
      | (IsFlatObject<FormValues> extends true
          ? Extract<keyof FormValues, string>
          : string)[],
  ): void;
  watch(): Unpacked<FormValues>;
  watch<T extends string, U extends unknown>(
    field: T,
    defaultValue?: T extends keyof FormValues
      ? Unpacked<FormValues>[T]
      : LiteralToPrimitive<U>,
  ): T extends keyof FormValues
    ? Unpacked<FormValues>[T]
    : LiteralToPrimitive<U>;
  watch<T extends keyof FormValues>(
    fields: T[],
    defaultValues?: Pick<UnpackedDeepPartial<FormValues>, T>,
  ): Pick<Unpacked<FormValues>, T>;
  watch(
    fields: string[],
    defaultValues?: UnpackedDeepPartial<FormValues>,
  ): UnpackedDeepPartial<FormValues>;
  setError(
    name: IsFlatObject<FormValues> extends true
      ? Extract<keyof FormValues, string>
      : string,
    type: MultipleFieldErrors,
  ): void;
  setError(
    name: IsFlatObject<FormValues> extends true
      ? Extract<keyof FormValues, string>
      : string,
    type: string,
    message?: Message,
  ): void;
  setError(name: ManualFieldError<FormValues>[]): void;
  clearError(
    name?:
      | (IsFlatObject<FormValues> extends true
          ? Extract<keyof FormValues, string>
          : string)
      | (IsFlatObject<FormValues> extends true
          ? Extract<keyof FormValues, string>
          : string)[],
  ): void;
  setValue<T extends string, U extends unknown>(
    name: T,
    value: T extends keyof FormValues
      ? IsAny<FormValues[T]> extends true
        ? any
        : FormValues[T] extends NestedValue<infer U>
        ? U
        : UnpackedDeepPartial<FormValues[T]>
      : LiteralToPrimitive<U>,
    shouldValidate?: boolean,
  ): void;
  setValue<T extends keyof FormValues>(
    namesWithValue: Pick<UnpackedDeepPartial<FormValues>, T>[],
    shouldValidate?: boolean,
  ): void;
  triggerValidation(
    payload?:
      | (IsFlatObject<FormValues> extends true
          ? Extract<keyof FormValues, string>
          : string)
      | (IsFlatObject<FormValues> extends true
          ? Extract<keyof FormValues, string>
          : string)[],
  ): Promise<boolean>;
  errors: FieldErrors<FormValues>;
  formState: FormStateProxy<FormValues>;
  reset: (
    values?: UnpackedDeepPartial<FormValues>,
    omitResetState?: OmitResetState,
  ) => void;
  getValues(): Unpacked<FormValues>;
  getValues<T extends keyof FormValues>(
    payload: T[],
  ): Pick<Unpacked<FormValues>, T>;
  getValues<T extends string, U extends unknown>(
    payload: T,
  ): T extends keyof FormValues ? Unpacked<FormValues>[T] : U;
  handleSubmit: (
    callback: OnSubmit<Unpacked<FormValues>>,
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  control: Control<FormValues>;
};
