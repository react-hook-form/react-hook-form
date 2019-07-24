import * as React from 'react';

export type FieldValue = any;

export type Validate = (data: FieldValue) => string | boolean;

export type NumberOrString = number | string;

export type DataType = Record<string, FieldValue>;

export type OnSubmit<Data extends DataType> = (
  data: Data,
  e: React.SyntheticEvent,
  ) => void;
  
export type Mode = 'onSubmit' | 'onBlur' | 'onChange'

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
    | Record<string,Validate>
    | { value: Validate | Record<string,Validate>; message: string };
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

export type ObjectErrorMessages<Data extends DataType> = {
  [Key in keyof Data]?: Error;
};
export type StringErrorMessages<Data extends DataType> = {
  [Key in keyof Data]?: string;
};
export type ErrorMessages<Data extends DataType> = ObjectErrorMessages<Data> | StringErrorMessages<Data>

export interface SubmitPromiseResult<Data extends DataType> {
  errors: ErrorMessages<Data>;
  values: Data;
}

export type VoidFunction = () => void;

export interface RadioReturn {
  isValid: boolean;
  value: NumberOrString;
}

export type ValidationReturn = Record<string, string>

export interface FormProps<
  Data extends DataType = DataType,
  Name extends keyof Data = keyof Data,
  Value = Data[Name]
> {
  children: JSX.Element[] | JSX.Element;
  register: (
    refOrValidateRule: RegisterInput | Ref,
    validateRule?: RegisterInput,
  ) => any;
  unregister: (name: string | string[]) => void;
  handleSubmit: (
    callback: (data: any, e: React.SyntheticEvent) => void,
  ) => (e: React.SyntheticEvent) => Promise<void>;
  watch: (
    fieldNames?: string | string[] | undefined,
    defaultValue?: string | Partial<Data> | undefined,
  ) => FieldValue | Partial<Data> | void;
  unSubscribe: VoidFunction;
  reset: VoidFunction
  clearError: (name: Name) => void;
  setError: (name: Name, type?: string, message?: string, ref?: Ref) => void;
  setValue: (name: Name, value: Value, shouldValidate?: boolean) => void;
  triggerValidation: (
    payload:
      | {
          name: Name;
          value?: Value;
        }
      | {
          name: Name;
          value?: Value;
        }[],
  ) => Promise<boolean>;
  getValues: () => DataType;
  errors: DataType;
  formState: {
    dirty: boolean;
    isSubmitted: boolean;
    submitCount: number;
    touched: string[] | object[];
    isSubmitting: boolean;
    isValid: boolean;
  };
}

export type FormContextValues = Omit<FormProps, 'children'>;
