import * as React from 'react';

export type FieldValue = any;

export type Validate = (data: FieldValue) => string | boolean;

export type NumberOrString = number | string;

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface DataType {
  [key: string]: FieldValue;
}

export type OnSubmit<Data extends DataType> = (
  data: Data,
  e: React.SyntheticEvent,
) => void;

export interface Props<Data> {
  mode?: 'onSubmit' | 'onBlur' | 'onChange';
  defaultValues?: { [key: string]: any };
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
    | { [key: string]: Validate }
    | { value: Validate | { [key: string]: Validate }; message: string }
    | undefined;
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

export interface Error {
  ref: Ref;
  message?: string;
  type?: string;
  isManual?: boolean;
}

export type ErrorMessages<Data extends DataType> = {
  [Key in keyof Data]?: Error;
};

export interface SubmitPromiseResult<Data extends DataType> {
  errors: ErrorMessages<Data>;
  values: Data;
}

export type VoidFunction = () => void;

export interface FormProps<
  Data extends DataType = DataType,
  Name extends keyof Data = keyof Data
> {
  children: JSX.Element[] | JSX.Element;
  register: (
    refOrValidateRule: RegisterInput | Ref,
    validateRule?: RegisterInput,
  ) => any;
  handleSubmit: (
    callback: (data: any, e: React.SyntheticEvent) => void,
  ) => (e: React.SyntheticEvent) => Promise<void>;
  watch: (
    fieldNames?: string | string[] | undefined,
    defaultValue?: string | Partial<Data> | undefined,
  ) => FieldValue | Partial<Data> | void;
  unSubscribe: () => void;
  reset: () => void;
  setError: (name: Name, type?: string, message?: string, ref?: Ref) => void;
  setValue: (name: Name, value: Data[Name], shouldValidate?: boolean) => void;
  triggerValidation: (
    payload:
      | {
          name: Name;
          value?: Data[Name];
        }
      | {
          name: Name;
          value?: Data[Name];
        }[],
  ) => Promise<boolean>;
  getValues: () => DataType;
  errors: DataType;
  formState: {
    dirty: boolean;
    isSubmitted: boolean;
    submitCount: number;
    touched: string[] | {}[];
    isSubmitting: boolean;
    isValid: boolean;
  };
}

export type FormContextValues = Omit<FormProps, 'children'>;
