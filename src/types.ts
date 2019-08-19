import * as React from 'react';
import { VALIDATION_MODE } from './constants';

export type FieldValue = any;

export type Validate = (data: FieldValue) => string | boolean;

export type NumberOrString = number | string;

export type DataType = Record<string, FieldValue>;

export type OnSubmit<Data extends DataType> = (
  data: Data,
  e: React.SyntheticEvent,
) => void | Promise<void>;

export type Mode = keyof typeof VALIDATION_MODE;

export interface Props<Data extends DataType> {
  mode?: Mode;
  defaultValues?: Partial<Data>;
  nativeValidation?: boolean;
  validationFields?: (keyof Data)[];
  validationSchema?: any;
  submitFocusError?: boolean;
}

export interface MutationWatcher {
  disconnect: () => void;
  observe?: any;
}

export type Ref = any;

export interface RegisterInput {
  ref?: Ref;
  required?: boolean | string;
  min?: NumberOrString | { value: NumberOrString; message: string };
  max?: NumberOrString | { value: NumberOrString; message: string };
  maxLength?: number | { value: number; message: string };
  minLength?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  validate?:
    | Validate
    | Record<string, Validate>
    | { value: Validate | Record<string, Validate>; message: string };
}

export interface Field extends RegisterInput {
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
  value: NumberOrString;
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

export interface FormProps<
  Data extends DataType = DataType,
  Name extends keyof Data = keyof Data,
  Value = Data[Name]
> extends FormContextValues<Data, Name, Value> {
  children: JSX.Element[] | JSX.Element;
}

export interface FormContextValues<
  Data extends DataType = DataType,
  Name extends keyof Data = keyof Data,
  Value = Data[Name]
> {
  register: (
    refOrValidateRule: Ref | RegisterInput,
    validateRule?: RegisterInput,
  ) => void | ((ref: Ref) => void);
  unregister: (name: string | string[]) => void;
  handleSubmit: (
    callback: OnSubmit<Data>,
  ) => (e: React.SyntheticEvent) => Promise<void>;
  watch: (
    fieldNames?: string | string[],
    defaultValue?: string | Partial<Data>,
  ) => FieldValue | Partial<Data> | void;
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
