import * as React from 'react';
import { VALIDATION_MODE } from './constants';

export type FieldValue = any;

export type Validate = (data: FieldValue) => string | boolean;

export type DataType = Record<string, FieldValue>;

export type OnSubmit<Data extends DataType> = (
  data: Data,
  e: React.SyntheticEvent,
) => void | Promise<void>;

export type Mode = keyof typeof VALIDATION_MODE;

export type SchemaValidateOptions = Partial<{
  strict: boolean;
  abortEarly: boolean;
  stripUnknown: boolean;
  recursive: boolean;
  context: object;
}>;

export type Options<Data extends DataType> = Partial<{
  mode: Mode;
  defaultValues: Partial<Data>;
  nativeValidation: boolean;
  validationFields: (keyof Data)[];
  validationSchema: any;
  validationSchemaOption: SchemaValidateOptions;
  submitFocusError: boolean;
}>;

export interface MutationWatcher {
  disconnect: () => void;
  observe?: any;
}

export type Ref = any;

type ValidationOptionObject<T> = T | { value: T; message: string };

export type ValidationOptions = Partial<{
  required?: boolean | string;
  min?: ValidationOptionObject<number | string>;
  max?: ValidationOptionObject<number | string>;
  maxLength?: ValidationOptionObject<number | string>;
  minLength?: ValidationOptionObject<number | string>;
  pattern?: ValidationOptionObject<RegExp>;
  validate?:
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

export type FieldsObject<Data extends DataType> = {
  [Key in keyof Data]?: Field;
};

export interface ReactHookFormError {
  ref: Ref;
  type: string;
  message?: string;
  isManual?: boolean;
}

export type ObjectErrorMessages<Data extends DataType> = {
  [Key in keyof Data]?: ReactHookFormError;
};

export type ErrorMessages<Data extends DataType> = ObjectErrorMessages<Data>;

export interface SubmitPromiseResult<Data extends DataType> {
  errors: ErrorMessages<Data>;
  values: Data;
}

export type VoidFunction = () => void;

export interface RadioReturn {
  isValid: boolean;
  value: number | string;
}

export type FieldErrors = Record<string, string>;

export interface ValidationReturn {
  fieldErrors: FieldErrors;
  result: DataType;
}

export interface ValidationPayload<Name, Value> {
  name: Name;
  value?: Value;
}

export interface FormState<
  Data extends DataType = DataType,
  Name extends keyof Data = keyof Data
> {
  dirty: boolean;
  isSubmitted: boolean;
  submitCount: number;
  touched: Name[];
  isSubmitting: boolean;
  isValid: boolean;
}

export type ElementLike<Element = HTMLInputElement> = {
  name: string;
} & Partial<Element>;
