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
} & UseFormMethods<TFieldValues>;

export type UseFormMethods<TFieldValues extends FieldValues = FieldValues> = {
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
    ref: TFieldElement | null,
    validationOptions?: ValidationOptions,
  ): void;
  unregister(name: FieldName<TFieldValues> | FieldName<TFieldValues>[]): void;
  watch(): UnpackNestedValue<TFieldValues>;
  watch<TFieldName extends string, TFieldValue extends unknown>(
    name: TFieldName,
    defaultValue?: TFieldName extends keyof TFieldValues
      ? UnpackNestedValue<TFieldValues>[TFieldName]
      : LiteralToPrimitive<TFieldValue>,
  ): TFieldName extends keyof TFieldValues
    ? UnpackNestedValue<TFieldValues>[TFieldName]
    : LiteralToPrimitive<TFieldValue>;
  watch<TFieldName extends keyof TFieldValues>(
    names: TFieldName[],
    defaultValues?: UnpackNestedValue<
      DeepPartial<Pick<TFieldValues, TFieldName>>
    >,
  ): UnpackNestedValue<Pick<TFieldValues, TFieldName>>;
  watch(
    names: string[],
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
  setValue<TFieldName extends string, TFieldValue extends unknown>(
    name: TFieldName,
    value: TFieldName extends keyof TFieldValues
      ? IsAny<TFieldValues[TFieldName]> extends true
        ? any
        : TFieldValues[TFieldName] extends NestedValue<infer U>
        ? U
        : UnpackNestedValue<DeepPartial<TFieldValues[TFieldName]>>
      : LiteralToPrimitive<TFieldValue>,
    shouldValidate?: boolean,
  ): void;
  setValue<TFieldName extends keyof TFieldValues>(
    namesWithValue: UnpackNestedValue<
      DeepPartial<Pick<TFieldValues, TFieldName>>
    >[],
    shouldValidate?: boolean,
  ): void;
  trigger(
    name?: FieldName<TFieldValues> | FieldName<TFieldValues>[],
  ): Promise<boolean>;
  errors: FieldErrors<TFieldValues>;
  formState: FormStateProxy<TFieldValues>;
  reset: (
    values?: UnpackNestedValue<DeepPartial<TFieldValues>>,
    omitResetState?: OmitResetState,
  ) => void;
  getValues(): UnpackNestedValue<TFieldValues>;
  getValues<TFieldName extends string, TFieldValue extends unknown>(
    name: TFieldName,
  ): TFieldName extends keyof TFieldValues
    ? UnpackNestedValue<TFieldValues>[TFieldName]
    : TFieldValue;
  getValues<TFieldName extends keyof TFieldValues>(
    names: TFieldName[],
  ): UnpackNestedValue<Pick<TFieldValues, TFieldName>>;
  handleSubmit: (
    callback: OnSubmit<TFieldValues>,
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  control: Control<TFieldValues>;
};
