import * as React from 'react';

export type Primitive = string | boolean | number | symbol | null | undefined;

export type FieldValues = Record<string, any>;

export type FieldName<FormValues extends FieldValues> =
  | (keyof FormValues & string)
  | string;

export type FieldValue<FormValues extends FieldValues> = FormValues[FieldName<
  FormValues
>];

export type Ref =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
  | any;

export interface ValidationMode {
  onBlur: 'onBlur';
  onChange: 'onChange';
  onSubmit: 'onSubmit';
}

export type Mode = keyof ValidationMode;

export type OnSubmit<FormValues extends FieldValues> = (
  data: FormValues,
  event: React.BaseSyntheticEvent,
) => void | Promise<void>;

export type SchemaValidateOptions = Partial<{
  strict: boolean;
  abortEarly: boolean;
  stripUnknown: boolean;
  recursive: boolean;
  context: object;
}>;

export type UseFormOptions<
  FormValues extends FieldValues = FieldValues
> = Partial<{
  mode: Mode;
  reValidateMode: Mode;
  defaultValues: Partial<FormValues>;
  validationSchemaOption: SchemaValidateOptions;
  validationSchema: any;
  submitFocusError: boolean;
  validateCriteriaMode: 'firstError' | 'all';
}>;

export interface MutationWatcher {
  disconnect: VoidFunction;
  observe?: any;
}

type ValidationOptionObject<Value> = Value | { value: Value; message: string };

export type ValidationValue = boolean | number | string | RegExp;

export type ValidateResult = string | boolean | undefined;

export type Validate = (data: any) => ValidateResult | Promise<ValidateResult>;

export type ValidationOptions = Partial<{
  required: boolean | string | ValidationOptionObject<boolean>;
  min: ValidationOptionObject<number | string>;
  max: ValidationOptionObject<number | string>;
  maxLength: ValidationOptionObject<number | string>;
  minLength: ValidationOptionObject<number | string>;
  pattern: ValidationOptionObject<RegExp>;
  validate: Validate | Record<string, Validate>;
}>;

export type MultipleFieldErrors = Record<string, ValidateResult>;

export interface FieldError {
  type: string;
  ref?: Ref;
  types?: MultipleFieldErrors;
  message?: string;
  isManual?: boolean;
}

export interface ManualFieldError<FormValues> {
  name: FieldName<FormValues>;
  type: string;
  types?: MultipleFieldErrors;
  message?: string;
}

export interface Field extends ValidationOptions {
  ref: Ref;
  mutationWatcher?: MutationWatcher;
  options?: {
    ref: Ref;
    mutationWatcher?: MutationWatcher;
  }[];
}

export type FieldRefs<FormValues extends FieldValues> = Partial<
  Record<FieldName<FormValues>, Field>
>;

export type NestDataObject<FormValues> = {
  [Key in keyof FormValues]?: FormValues[Key] extends any[]
    ? FormValues[Key][number] extends object
      ? FieldErrors<FormValues[Key][number]>[]
      : FieldError
    : FormValues[Key] extends Date
    ? FieldError
    : FormValues[Key] extends object
    ? FieldErrors<FormValues[Key]>
    : FieldError;
};

export type FieldErrors<FormValues> = NestDataObject<FormValues>;

export type Touched<FormValues> = NestDataObject<FormValues>;

export interface SubmitPromiseResult<FormValues extends FieldValues> {
  errors: FieldErrors<FormValues>;
  values: FormValues;
}

export interface FormStateProxy<FormValues extends FieldValues = FieldValues> {
  dirty: boolean;
  isSubmitted: boolean;
  submitCount: number;
  touched: Touched<FormValues>;
  isSubmitting: boolean;
  isValid: boolean;
}

export type ReadFormState = { [P in keyof FormStateProxy]: boolean };

export interface RadioOrCheckboxOption {
  ref?: Ref;
  mutationWatcher?: MutationWatcher;
}

export interface ElementLike {
  name: string;
  type?: string;
  value?: string;
  checked?: boolean;
  options?: any;
}

export type HandleChange = ({
  type,
  target,
}: MouseEvent) => Promise<void | boolean>;

export type FormValuesFromErrors<Errors> = Errors extends FieldErrors<
  infer FormValues
>
  ? FormValues
  : never;

export type EventFunction = (args: any) => any;

export type ControllerProps = {
  name: string;
  as: React.ReactElement | React.ElementType | string;
  rules?: ValidationOptions;
  onChange?: EventFunction;
  onBlur?: EventFunction;
  mode?: Mode;
  onChangeName?: string;
  onBlurName?: string;
  valueName?: string;
  defaultValue?: any;
  control?: any;
};

export type ErrorMessageProps<Errors, Name> = {
  as?: React.ElementType<any> | React.FunctionComponent<any> | string | any;
  errors?: Errors;
  name: Name;
  children?: (data: {
    message: string;
    messages: MultipleFieldErrors;
  }) => React.ReactNode;
};
