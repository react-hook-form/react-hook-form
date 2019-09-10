import * as React from 'react';

export type DefaultFieldValues = Record<string, unknown>;

export type FieldValues = Record<string, any>;

export type Validate = (data: any) => string | boolean | void;

export type Ref = any;

type Mode = keyof ValidationMode;

export type OnSubmit<Data extends FieldValues> = (
  data: Data,
  e: React.SyntheticEvent,
) => void | Promise<void>;

export interface ValidationMode {
  onBlur: 'onBlur';
  onChange: 'onChange';
  onSubmit: 'onSubmit';
}

export type SchemaValidateOptions = Partial<{
  strict: boolean;
  abortEarly: boolean;
  stripUnknown: boolean;
  recursive: boolean;
  context: object;
}>;

export interface Schema<T> {
  validate(value: FieldValues, options?: SchemaValidateOptions): Promise<T>;
}

export type Options<
  FormValues extends FieldValues = DefaultFieldValues,
  FieldName extends keyof FormValues = keyof FormValues
> = Partial<{
  mode: Mode;
  defaultValues: Partial<FormValues>;
  validationSchemaOption: SchemaValidateOptions;
  validationFields: FieldName[];
  validationSchema: any;
  nativeValidation: boolean;
  submitFocusError: boolean;
}>;

export interface MutationWatcher {
  disconnect: () => void;
  observe?: any;
}

type ValidationOptionObject<T> = T | { value: T; message: string };

export type ValidationTypes = number | string | RegExp;

export type ValidationOptions = Partial<{
  required: boolean | string;
  min: ValidationOptionObject<number | string>;
  max: ValidationOptionObject<number | string>;
  maxLength: ValidationOptionObject<number | string>;
  minLength: ValidationOptionObject<number | string>;
  pattern: ValidationOptionObject<RegExp>;
  validate:
    | Validate
    | Record<string, Validate>
    | { value: Validate | Record<string, Validate>; message: string };
}>;

export type ValidatePromiseResult =
  | {}
  | void
  | {
      type: string;
      message: string | number | boolean | Date;
    };

export interface Field extends ValidationOptions {
  ref: Ref;
  watch?: boolean;
  mutationWatcher?: MutationWatcher;
  options?: {
    ref: Ref;
    mutationWatcher?: MutationWatcher;
  }[];
}

export type FieldsObject<Data extends FieldValues> = {
  [Key in keyof Data]?: Field;
};

export interface Error {
  ref: Ref;
  type: string;
  message?: string;
  isManual?: boolean;
}

export type Errors<Data extends FieldValues> = {
  [Key in keyof Data]?: Error;
};

export interface SubmitPromiseResult<Data extends FieldValues> {
  errors: Errors<Data>;
  values: Data;
}

export interface SchemaValidationResult<FormValues> {
  fieldErrors: Errors<FormValues>;
  result: FieldValues;
}

export interface ValidationPayload<Name, Value> {
  name: Name;
  value?: Value;
}

export interface FormState<
  Data extends FieldValues = FieldValues,
  Name extends keyof Data = keyof Data
> {
  dirty: boolean;
  isSubmitted: boolean;
  submitCount: number;
  touched: Name[];
  isSubmitting: boolean;
  isValid: boolean;
}

export interface ElementLike {
  name: string;
  type?: string;
  value?: string;
  checked?: boolean;
  options?: any;
}
