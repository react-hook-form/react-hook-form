export type Validate = (data: string | number) => boolean | string | number | Date;

export type NumberOrString = number | string;

export type FieldValue = boolean | string | string[] | number | {};

export interface Props {
  mode: 'onSubmit' | 'onBlur' | 'onChange';
  validationSchema?: any;
}

export interface MutationWatcher {
  disconnect: () => void;
}

export type Ref = any;

export interface RegisterInput {
  ref: Ref;
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
  fields?: RegisterInput[];
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
