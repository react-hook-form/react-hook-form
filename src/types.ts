import * as React from 'react';

export type Validate = (data: string | number) => boolean | string | number | Date;

export type NumberOrString = number | string;

export type DataType = { [key: string]: FieldValue }

export type FieldValue = boolean | string | string[] | number | {};

type OnSubmit<Data extends DataType = DataType> = (data: Data, e: React.SyntheticEvent) => void;

export interface Props {
  mode: 'onSubmit' | 'onBlur' | 'onChange';
  defaultValues?: { [key: string]: string | number | boolean };
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
  [Key in keyof Data]: Field;
}

export interface Error {
  ref: Ref;
  message?: string;
  type?: string;
  isManual?: boolean;
}

export type ErrorMessages<Data extends DataType = DataType> = {
  [Key in keyof Data]: Error;
}

export interface SubmitPromiseResult<Data extends DataType = DataType> {
  errors: ErrorMessages<Data>;
  values: Data;
}

export type VoidFunction = () => void;

export type RegisterFunction = (refOrValidateRule: RegisterInput | Ref, validateRule?: RegisterInput) => any;

export type WatchFunction<Data extends DataType> = ((name?: undefined) => void)
  & (<Name extends keyof Data>(fieldName: Name, defaultValue?: Data[Name]) => Data[Name])
  & (<Names extends keyof Data>(fieldNames: Names[], defaultValue?: Pick<Data, Names>) => Pick<Data, Names>);

export interface UseFormFunctions<Data extends DataType = DataType> {
  register: RegisterFunction;
  handleSubmit: (func: OnSubmit<Data>) => any;
  errors: ErrorMessages<Data>;
  watch: WatchFunction<Data>;
  unSubscribe: VoidFunction;
  reset: VoidFunction;
  setValue: <Name extends keyof Data>(name: Name, value: Data[Name]) => void;
  setError: (name: keyof Data, type: string, message?: string, ref?: Ref) => void;
  getValues: () => { [key: string]: FieldValue };
  formState: {
    formState: {
    dirty: boolean;
    isSubmitted: boolean;
    isSubmitting: boolean;
    submitCount: number;
    touched: string[];
  };
}
