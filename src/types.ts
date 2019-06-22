import * as React from 'react';

export type FieldValue = any;

export type Validate = (data: FieldValue) => string | boolean;

export type NumberOrString = number | string;

export interface DataType {
  [key: string]: FieldValue;
}

export type OnSubmit<Data extends DataType> = (
  data: Data,
  e: React.SyntheticEvent,
) => void;

export interface Props<Data> {
  mode: 'onSubmit' | 'onBlur' | 'onChange';
  defaultValues?: { [key: string]: any };
  validationFields?: (keyof Data)[];
  validationSchema?: any;
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
  [Key in keyof Data]?: Field
};

export interface Error {
  ref: Ref;
  message?: string;
  type?: string;
}

export type ErrorMessages<Data extends DataType> = {
  [Key in keyof Data]?: Error
};

export interface SubmitPromiseResult<Data extends DataType> {
  errors: ErrorMessages<Data>;
  values: Data;
}

export type VoidFunction = () => void;

export interface FormProps {
  children: JSX.Element[] | JSX.Element;
  register?: Function;
  handleSubmit?: Function;
  watch?: Function;
  unSubscribe?: Function;
  reset?: Function;
  setError?: Function;
  setValue?: Function;
  triggerValidation?: Function;
  getValues?: Function;
  errors: any;
  formState: any;
}
