import * as React from 'react';
import { ValidationMode } from './constants';

export type TFormValues = Record<string, unknown>;

export type OnSubmit<Data extends TFormValues> = (
  data: Data,
  e: React.SyntheticEvent,
) => void | Promise<void>;

export type Mode = keyof ValidationMode;

// NOTE: Stolen from @types/yup
interface ValidateOptions {
  /**
   * Only validate the input, and skip and coercion or transformation. Default - false
   */
  strict?: boolean;
  /**
   * Teturn from validation methods on the first error rather than after all validations run. Default - true
   */
  abortEarly?: boolean;
  /**
   * Remove unspecified keys from objects. Default - false
   */
  stripUnknown?: boolean;
  /**
   * When false validations will not descend into nested schema (relevant for objects or arrays). Default - true
   */
  recursive?: boolean;
  /**
   * Any context needed for validating schema conditions (see: when())
   */
  context?: object;
}
export interface Schema<T> {
  validate(value: any, options?: ValidateOptions): Promise<T>;
}
export interface ValidationError extends Error {
  name: string;
  message: string;
  value: any;
  /**
   * A string, indicating where there error was thrown. path is empty at the root level.
   */
  path: string;
  type: any;
  /**
   * array of error messages
   */
  errors: string[];

  /**
   * In the case of aggregate errors, inner is an array of ValidationErrors throw earlier in the validation chain.
   */
  inner: ValidationError[];
  params?: object;

  isError(err: any): err is ValidationError;
  formatError(
    message: string | ((params?: any) => string),
    params?: any,
  ): string | ((params?: any) => string);
}

export type Options<
  FormValues extends TFormValues = TFormValues,
  FieldName extends keyof FormValues = keyof FormValues
> = Partial<{
  mode: ValidationMode[keyof ValidationMode];
  defaultValues: Partial<FormValues>;
  validationFields: FieldName[];
  validationSchema: Schema<FormValues>;
  nativeValidation: boolean;
  submitFocusError: boolean;
}>;

export interface MutationWatcher {
  disconnect: () => void;
  observe?: any;
}

export type Ref = any;

type ValidationOptionObject<T> =
  | T
  | {
      value: T;
      message: string;
    };

type ValidationFunction<ValueType = unknown> = (
  value: ValueType,
) => boolean | string;

export type ValidationOptions<ValueType = unknown> = Partial<{
  required: boolean | string;
  maxLength: ValidationOptionObject<number>;
  minLength: ValidationOptionObject<number>;
  max: ValidationOptionObject<number | string>;
  min: ValidationOptionObject<number | string>;
  pattern: ValidationOptionObject<RegExp>;
  validate: ValidationOptionObject<
    | ValidationFunction<ValueType>
    | Record<string, ValidationFunction<ValueType>>
  >;
}>;

export interface ElementLikeObject<
  FormValues extends TFormValues = TFormValues,
  FieldName extends keyof FormValues = keyof FormValues
> extends Partial<Omit<HTMLInputElement, 'name'>> {
  name: FieldName | string;
}

export interface Field<ValueType = unknown>
  extends ValidationOptions<ValueType> {
  ref: Ref;
  watch?: boolean;
  mutationWatcher?: MutationWatcher;
  options?: {
    ref: Ref;
    mutationWatcher?: MutationWatcher;
  }[];
}

export type FieldsObject<
  FormValues extends TFormValues = TFormValues,
  FieldName extends keyof FormValues = keyof FormValues,
  FieldValue = FormValues[FieldName]
> = Partial<Record<FieldName, Field<FieldValue>>>;

export interface ReactHookFormError {
  ref: Ref;
  type: string;
  message?: string;
  isManual?: boolean;
}

export type ObjectErrorMessages<
  FormValues extends TFormValues = TFormValues,
  FieldName extends keyof FormValues = keyof FormValues
> = Partial<Record<FieldName, ReactHookFormError>>;

export type ErrorMessages<FormValues extends TFormValues> = ObjectErrorMessages<
  FormValues
>;

export interface SubmitPromiseResult<FormValues extends TFormValues> {
  errors: ErrorMessages<FormValues>;
  values: FormValues;
}

export interface RadioReturn {
  isValid: boolean;
  value: number | string;
}

export type FieldErrors<
  FormValues extends TFormValues = TFormValues,
  FieldName extends keyof FormValues = keyof FormValues
> = Partial<
  Record<
    FieldName,
    {
      message: string;
      path: string;
      ref: any;
      type: any;
    }
  >
>;

export interface ValidationReturn<
  FormValues extends TFormValues = TFormValues
> {
  fieldErrors: FieldErrors<FormValues>;
  result: Partial<FormValues>;
}

export interface ValidationPayload<Name, Value> {
  name: Name;
  value?: Value;
}

export interface FormState<
  Data extends TFormValues = TFormValues,
  Name extends keyof Data = keyof Data
> {
  dirty: boolean;
  isSubmitted: boolean;
  submitCount: number;
  touched: Name[];
  isSubmitting: boolean;
  isValid: boolean;
}

export interface FormProps<
  FormValues extends TFormValues = TFormValues,
  FieldName extends keyof FormValues = keyof FormValues,
  FieldValue = FormValues[FieldName]
> extends FormContextValues<FormValues, FieldName, FieldValue> {
  children: JSX.Element[] | JSX.Element;
}

export interface FormContextValues<
  FormValues extends TFormValues = TFormValues,
  FieldName extends keyof FormValues = keyof FormValues,
  FieldValue = FormValues[FieldName]
> {
  register: (
    refOrValidateRule: ValidationOptions<FieldValue> | Ref,
    validateRule?: ValidationOptions<FieldValue>,
  ) => any;
  unregister: (name: string | string[]) => void;
  handleSubmit: (
    callback: OnSubmit<FormValues>,
  ) => (e: React.SyntheticEvent) => Promise<void>;
  watch: (
    fieldNames?: string | string[],
    defaultValue?: string | Partial<FormValues>,
  ) => FieldValue | Partial<FormValues> | void;
  reset: VoidFunction;
  clearError: (name?: FieldName | FieldName[]) => void;
  setError: (
    name: FieldName,
    type: string,
    message?: string,
    ref?: Ref,
  ) => void;
  setValue: (
    name: FieldName,
    value: FieldValue,
    shouldValidate?: boolean,
  ) => void;
  triggerValidation: (
    payload:
      | ValidationPayload<FieldName, FieldValue>
      | ValidationPayload<FieldName, FieldValue>[],
  ) => Promise<boolean>;
  getValues: (payload?: { nest: boolean }) => FormValues;
  errors: ObjectErrorMessages<FormValues>;
  formState: FormState<FormValues, FieldName>;
}
