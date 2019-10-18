import * as React from 'react';

export type BaseFieldValue = any;

export type FieldValues = Record<string, BaseFieldValue>;

export type RawFieldName<FormValues extends FieldValues> = Extract<
  keyof FormValues,
  string
>;

export type FieldName<FormValues extends FieldValues> =
  | RawFieldName<FormValues>
  | string;

export type FieldValue<FormValues extends FieldValues> = FormValues[FieldName<
  FormValues
>];

export type Inputs = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export type Ref = Inputs | any;

type Mode = keyof ValidationMode;

export type OnSubmit<FormValues extends FieldValues> = (
  data: FormValues,
  e: React.BaseSyntheticEvent,
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

export interface Schema<Data> {
  validate(value: FieldValues, options?: SchemaValidateOptions): Promise<Data>;
}

export type Options<FormValues extends FieldValues = FieldValues> = Partial<{
  mode: Mode;
  reValidateMode: Mode;
  defaultValues: Partial<FormValues>;
  validationSchemaOption: SchemaValidateOptions;
  validationFields: FieldName<FormValues>[];
  validationSchema: any;
  nativeValidation: boolean;
  submitFocusError: boolean;
}>;

export interface MutationWatcher {
  disconnect: VoidFunction;
  observe?: any;
}

type ValidationOptionObject<Value> = Value | { value: Value; message: string };

export type ValidationTypes = number | string | RegExp;

export type ValidateResult =
  | string
  | boolean
  | void
  | Promise<string>
  | Promise<boolean>;

export type Validate = (data: BaseFieldValue) => ValidateResult;

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

export interface FieldError {
  ref: Ref;
  type: string;
  message?: string;
  isManual?: boolean;
}

export type ValidatePromiseResult = {} | void | FieldError;

export interface Field extends ValidationOptions {
  ref: Ref;
  mutationWatcher?: MutationWatcher;
  options?: {
    ref: Ref;
    mutationWatcher?: MutationWatcher;
  }[];
}

export type FieldsRefs<FormValues extends FieldValues> = Partial<
  Record<FieldName<FormValues>, Field>
>;

export type FieldErrors<FormValues extends FieldValues> = Partial<
  Record<FieldName<FormValues>, FieldError>
>;

export interface SubmitPromiseResult<FormValues extends FieldValues> {
  errors: FieldErrors<FormValues>;
  values: FormValues;
}

export interface SchemaValidationResult<FormValues> {
  fieldErrors: FieldErrors<FormValues>;
  result: FieldValues;
}

export interface ValidationPayload<Name, Value> {
  name: Name;
  value?: Value;
}

export interface FormState<FormValues extends FieldValues = FieldValues> {
  dirty: boolean;
  isSubmitted: boolean;
  submitCount: number;
  touched: FieldName<FormValues>[];
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
