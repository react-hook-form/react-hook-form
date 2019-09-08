import * as React from 'react';
import {
  FieldValues,
  ElementLike,
  FieldValue,
  FormState,
  ObjectErrorMessages,
  OnSubmit,
  Ref,
  ValidationOptions,
  ValidationPayload,
  VoidFunction,
} from './types';

export interface FormProps<
  Data extends FieldValues = FieldValues,
  Name extends keyof Data = keyof Data,
  Value = Data[Name]
> extends FormContextValues<Data, Name, Value> {
  children: JSX.Element[] | JSX.Element;
}

export interface FormContextValues<
  Data extends FieldValues = FieldValues,
  Name extends keyof Data = keyof Data,
  Value = Data[Name]
> {
  register<Element extends ElementLike = ElementLike>(
    validateRule: ValidationOptions,
  ): (ref: Element | null) => void;
  register<Element extends ElementLike = ElementLike>(
    ref: Element | null,
    validationOptions?: ValidationOptions,
  ): void;
  unregister(name: Name | string): void;
  unregister(names: (Name | string)[]): void;
  handleSubmit: (
    callback: OnSubmit<Data>,
  ) => (e: React.SyntheticEvent) => Promise<void>;
  watch(): Data;
  watch(field: Name | string, defaultValue?: string): FieldValue | void;
  watch(
    fields: (Name | string)[],
    defaultValues?: Partial<Data>,
  ): Partial<Data>;
  reset: VoidFunction;
  clearError: (name?: Name | Name[]) => void;
  setError: (name: Name, type: string, message?: string, ref?: Ref) => void;
  setValue: (name: Name, value: Value, shouldValidate?: boolean) => void;
  triggerValidation: (
    payload: ValidationPayload<Name, Value> | ValidationPayload<Name, Value>[],
  ) => Promise<boolean>;
  getValues: (payload?: { nest: boolean }) => Data;
  errors: ObjectErrorMessages<Data>;
  formState: FormState<Data, Name>;
}
