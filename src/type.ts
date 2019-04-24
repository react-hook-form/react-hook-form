export type Validate = (data: string | number) => boolean | string | number | Date;

export type NumberOrString = number | string;

export type Props = { mode: 'onSubmit' | 'onBlur' | 'onChange'; validationSchema?: any };

export type MutationWatcher = {
  disconnect: () => void;
};

export type Ref = any;

export interface IRegisterInput {
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

export interface IField extends IRegisterInput {
  ref: Ref;
  watch?: boolean;
  mutationWatcher?: MutationWatcher;
  fields?: Array<IRegisterInput>;
  options?: Array<{
    ref: Ref;
    mutationWatcher?: MutationWatcher;
  }>;
}

export type Error = {
  ref: Ref;
  message: string | boolean;
  type: string;
};

export interface IErrorMessages {
  [key: string]: Error;
}

export type SubmitPromiseResult = {
  errors: { [key: string]: Error };
  values: { [key: string]: number | string | boolean };
};
