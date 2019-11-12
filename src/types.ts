import * as React from 'react';

type BaseFieldValue = any;

export type FieldValues = Record<string, BaseFieldValue>;

type BaseFieldName<FormValues extends FieldValues> = Extract<
  keyof FormValues,
  string
>;

export type FieldName<FormValues extends FieldValues> =
  | BaseFieldName<FormValues>
  | string;

export type FieldValue<FormValues extends FieldValues> = FormValues[FieldName<
  FormValues
>];

export type Ref =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
  | any;

export interface ValidationMode {
  onBlur: 'onBlur';
  onChange: 'onChange';
  onSubmit: 'onSubmit';
}

export type Mode = keyof ValidationMode;

export type OnSubmit<FormValues extends FieldValues> = (
  data: FormValues,
  event: React.BaseSyntheticEvent,
) => void | Promise<void>;

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

export type UseFormOptions<
  FormValues extends FieldValues = FieldValues
> = Partial<{
  mode: Mode;
  reValidateMode: Mode;
  defaultValues: Partial<FormValues>;
  validationSchemaOption: SchemaValidateOptions;
  validationSchema: any;
  nativeValidation: boolean;
  submitFocusError: boolean;
  validateCriteriaMode: 'firstError' | 'all';
}>;

export interface MutationWatcher {
  disconnect: VoidFunction;
  observe?: any;
}

type ValidationOptionObject<Value> = Value | { value: Value; message: string };

export type ValidationValue = number | string | RegExp;

export type ValidateResult =
  | string
  | boolean
  | void
  | Promise<string>
  | Promise<boolean>;

export type Validate = (data: any) => ValidateResult;

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

export type MultipleErrors = Record<string, ValidateResult>;

export interface FieldError {
  type: string;
  ref?: Ref;
  types?: MultipleErrors;
  message?: ValidateResult;
  isManual?: boolean;
}

export interface ManualFieldError<FormValues> {
  name: FieldName<FormValues>;
  type: string;
  types?: MultipleErrors;
  message?: string;
}

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

export type YupValidationError = {
  inner: { path: string; message: string; type: string }[];
  path: string;
  message: string;
  type: string;
};

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

export type ReadFormState = { [P in keyof FormState]: boolean };

export interface NameProp {
  name: string;
}

export interface RadioOption {
  ref?: Ref;
  mutationWatcher?: MutationWatcher;
}
export interface ElementLike extends NameProp {
  type?: string;
  value?: string;
  checked?: boolean;
  options?: any;
}

export interface RadioFieldResult {
  isValid: boolean;
  value: number | string;
}
