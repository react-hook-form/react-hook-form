import * as React from 'react';

export type Validate = (data: string | number) => boolean | string | number | Date;

export type NumberOrString = number | string;

export type FieldValue = boolean | string | string[] | number | {};

type OnSubmit = (data: { [key: string]: FieldValue }, e: React.SyntheticEvent) => void;

export interface Props {
  mode: 'onSubmit' | 'onBlur' | 'onChange';
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

export interface FieldsObject {
  [key: string]: Field;
}

export interface Error {
  ref: Ref;
  message: string | boolean;
  typeError?: string;
}

export interface ErrorMessages {
  [key: string]: Error;
}

export interface SubmitPromiseResult {
  errors: { [key: string]: Error };
  values: { [key: string]: FieldValue };
}

export type VoidFunction = () => void;

export type RegisterFunction = (refOrValidateRule: RegisterInput | Ref, validateRule?: RegisterInput) => any;

export interface UseFormFunctions {
  register: RegisterFunction;
  handleSubmit: (func: OnSubmit) => any;
  errors: ErrorMessages;
  watch: (
    filedNames?: string | string[] | undefined,
    defaultValue?: string | string[] | undefined,
  ) => FieldValue | FieldValue[] | undefined;
  unSubscribe: VoidFunction;
  reset: VoidFunction;
  formState: {
    dirty: boolean;
    isSubmitted: boolean;
    isSubmitting: boolean;
    submitCount: number;
    touched: string[];
  };
}
