import * as React from 'react';
import {
  DeepPartial,
  FieldValues,
  FormStateProxy,
  FieldErrors,
  OnSubmit,
  ElementLike,
  FieldOptions,
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
    fieldOptions: FieldOptions,
  ): (ref: Element | null) => void;
  register<Element extends ElementLike = ElementLike>(
    name: FieldName<FormValues>,
    fieldOptions?: FieldOptions,
  ): void;
  register<Element extends ElementLike = ElementLike>(
    namesWithFieldOptions: Record<FieldName<FormValues>, FieldOptions>,
  ): void;
  register<Element extends ElementLike = ElementLike>(
    ref: Element,
    fieldOptions?: FieldOptions,
  ): void;
  register<Element extends ElementLike = ElementLike>(
    refOrOptions: FieldOptions | Element | null,
    fieldOptions?: FieldOptions,
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
  reset: (values?: DeepPartial<FormValues>) => void;
  getValues: (payload?: { nest: boolean }) => FormValues;
  handleSubmit: (
    callback: OnSubmit<FormValues>,
  ) => (e: React.BaseSyntheticEvent) => Promise<void>;
  control: any;
}
