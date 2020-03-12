import * as React from 'react';

export type Primitive = string | boolean | number | symbol | null | undefined;

export type FieldValues = Record<string, any>;

export type FieldName<FormValues extends FieldValues> =
  | (keyof FormValues & string)
  | string;

export type FieldValue<FormValues extends FieldValues> = FormValues[FieldName<
  FormValues
>];

export type Ref = FieldElement;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};

export type ValidationMode = {
  onBlur: 'onBlur';
  onChange: 'onChange';
  onSubmit: 'onSubmit';
};

export type Mode = keyof ValidationMode;

export type OnSubmit<FormValues extends FieldValues> = (
  data: FormValues,
  event?: React.BaseSyntheticEvent,
) => void | Promise<void>;

export type SchemaValidateOptions = Partial<{
  strict: boolean;
  abortEarly: boolean;
  stripUnknown: boolean;
  recursive: boolean;
  context: any;
}>;

export type ValidationResolver<FormValues, ValidationContext> = (
  values: FormValues,
  validationContext?: ValidationContext,
) => { values: FormValues | {}; errors: FieldErrors<FormValues> | {} };

export type UseFormOptions<
  FormValues extends FieldValues = FieldValues,
  ValidationContext = any
> = Partial<{
  mode: Mode;
  reValidateMode: Mode;
  defaultValues: DeepPartial<FormValues>;
  validationSchema: any;
  validationResolver: ValidationResolver<FormValues, ValidationContext>;
  validationContext: ValidationContext;
  submitFocusError: boolean;
  validateCriteriaMode: 'firstError' | 'all';
}>;

export type MutationWatcher = {
  disconnect: VoidFunction;
  observe?: any;
};

type ValidationOptionObject<Value> = Value | { value: Value; message: string };

export type ValidationValue = boolean | number | string | RegExp;

export type ValidateResult = string | boolean | undefined;

export type Validate = (data: any) => ValidateResult | Promise<ValidateResult>;

export type ValidationOptions = Partial<{
  required: string | ValidationOptionObject<boolean>;
  min: ValidationOptionObject<number | string>;
  max: ValidationOptionObject<number | string>;
  maxLength: ValidationOptionObject<number | string>;
  minLength: ValidationOptionObject<number | string>;
  pattern: ValidationOptionObject<RegExp>;
  validate: Validate | Record<string, Validate>;
}>;

export type MultipleFieldErrors = Record<string, ValidateResult>;

export type FieldError = {
  type: string;
  ref?: Ref;
  types?: MultipleFieldErrors;
  message?: string;
  isManual?: boolean;
};

export type ManualFieldError<FormValues> = {
  name: FieldName<FormValues>;
  type: string;
  types?: MultipleFieldErrors;
  message?: string;
};

export type Field = {
  ref: Ref;
  mutationWatcher?: MutationWatcher;
  options?: RadioOrCheckboxOption[];
} & ValidationOptions;

export type FieldRefs<FormValues extends FieldValues> = Partial<
  Record<FieldName<FormValues>, Field>
>;

export type NestDataObject<FormValues> = {
  [Key in keyof FormValues]?: FormValues[Key] extends Array<infer U>
    ? 0 extends 1 & U
      ? any
      : unknown extends U
      ? FieldError[]
      : object extends U
      ? FieldError[]
      : U extends Date
      ? FieldError[]
      : U extends object
      ? FieldErrors<U>[]
      : FieldError[]
    : 0 extends 1 & FormValues[Key]
    ? any
    : unknown extends FormValues[Key]
    ? FieldError
    : object extends FormValues[Key]
    ? FieldError
    : FormValues[Key] extends Date
    ? FieldError
    : FormValues[Key] extends object
    ? FieldErrors<FormValues[Key]>
    : FieldError;
};

export type FieldErrors<FormValues> = NestDataObject<FormValues>;

export type Touched<FormValues> = NestDataObject<FormValues>;

export type SubmitPromiseResult<FormValues extends FieldValues> = {
  errors: FieldErrors<FormValues>;
  values: FormValues;
};

export type FormStateProxy<FormValues extends FieldValues = FieldValues> = {
  dirty: boolean;
  dirtyFields: Set<FieldName<FormValues>>;
  isSubmitted: boolean;
  submitCount: number;
  touched: Touched<FormValues>;
  isSubmitting: boolean;
  isValid: boolean;
};

export type ReadFormState = { [P in keyof FormStateProxy]: boolean };

export type RadioOrCheckboxOption = {
  ref: HTMLInputElement;
  mutationWatcher?: MutationWatcher;
};

export type FieldElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
  | CustomElement;

export type CustomElement = {
  name: string;
  type?: string;
  value?: any;
  checked?: boolean;
  options?: HTMLOptionsCollection;
  files?: FileList | null;
};

export type HandleChange = (evt: Event) => Promise<void | boolean>;

export type FormValuesFromErrors<Errors> = Errors extends FieldErrors<
  infer FormValues
>
  ? FormValues
  : never;

export type EventFunction = (args: any[]) => any;

export type Control<FormValues extends FieldValues = FieldValues> = {
  register<Element extends FieldElement = FieldElement>(): (
    ref: Element | null,
  ) => void;
  register<Element extends FieldElement = FieldElement>(
    validationOptions: ValidationOptions,
  ): (ref: Element | null) => void;
  register<Element extends FieldElement = FieldElement>(
    name: FieldName<FormValues>,
    validationOptions?: ValidationOptions,
  ): void;
  register<Element extends FieldElement = FieldElement>(
    namesWithValidationOptions: Record<
      FieldName<FormValues>,
      ValidationOptions
    >,
  ): void;
  register<Element extends FieldElement = FieldElement>(
    ref: Element,
    validationOptions?: ValidationOptions,
  ): void;
  register<Element extends FieldElement = FieldElement>(
    refOrValidationOptions: ValidationOptions | Element | null,
    validationOptions?: ValidationOptions,
  ): ((ref: Element | null) => void) | void;
  triggerValidation: (
    payload?: FieldName<FormValues> | FieldName<FormValues>[] | string,
    shouldRender?: boolean,
  ) => Promise<boolean>;
  reRender: () => void;
  removeFieldEventListener: (field: Field, forceDelete?: boolean) => void;
  unregister(name: FieldName<FormValues>): void;
  unregister(names: FieldName<FormValues>[]): void;
  unregister(names: FieldName<FormValues> | FieldName<FormValues>[]): void;
  getValues: (payload?: { nest: boolean }) => any;
  setValue<Name extends FieldName<FormValues>>(
    name: Name,
    value?: FormValues[Name],
    shouldValidate?: boolean,
  ): void;
  setValue<Name extends FieldName<FormValues>>(
    namesWithValue: Record<Name, any>[],
    shouldValidate?: boolean,
  ): void;
  setValue<Name extends FieldName<FormValues>>(
    names: Name | Record<Name, any>[],
    valueOrShouldValidate?: FormValues[Name] | boolean,
    shouldValidate?: boolean,
  ): void;
  formState: FormStateProxy<FormValues>;
  mode: {
    isOnBlur: boolean;
    isOnSubmit: boolean;
  };
  reValidateMode: {
    isReValidateOnBlur: boolean;
    isReValidateOnSubmit: boolean;
  };
  dirtyFieldsRef: React.MutableRefObject<Set<FieldName<FormValues>>>;
  validateSchemaIsValid?: (fieldsValues: any) => void;
  touchedFieldsRef: React.MutableRefObject<Touched<FormValues>>;
  watchFieldArrayRef: React.MutableRefObject<any>;
  validFieldsRef: React.MutableRefObject<Set<FieldName<FormValues>>>;
  fieldsWithValidationRef: React.MutableRefObject<Set<FieldName<FormValues>>>;
  errorsRef: React.MutableRefObject<FieldErrors<FormValues>>;
  fieldsRef: React.MutableRefObject<FieldRefs<FormValues>>;
  resetFieldArrayFunctionRef: React.MutableRefObject<
    Record<string, (values: any) => void>
  >;
  fieldArrayNamesRef: React.MutableRefObject<Set<string>>;
  isDirtyRef: React.MutableRefObject<boolean>;
  readFormStateRef: React.MutableRefObject<{
    dirty: boolean;
    isSubmitted: boolean;
    submitCount: boolean;
    touched: boolean;
    isSubmitting: boolean;
    isValid: boolean;
    dirtyFields: boolean;
  }>;
  defaultValuesRef: React.MutableRefObject<
    DeepPartial<FormValues> | FormValues[FieldName<FormValues>]
  >;
  defaultRenderValuesRef: React.MutableRefObject<
    DeepPartial<Record<FieldName<FormValues>, FieldValue<FormValues>>>
  >;
};

export type Assign<T extends object, U extends object> = T & Omit<U, keyof T>;

export type AsProps<As> = As extends undefined
  ? {}
  : As extends React.ReactElement
  ? { [key: string]: any }
  : As extends React.ComponentType<infer P>
  ? P
  : As extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[As]
  : never;

export type ControllerProps<
  As extends
    | React.ReactElement
    | React.ComponentType<any>
    | keyof JSX.IntrinsicElements,
  ControlProp extends Control = Control
> = Assign<
  {
    name: string;
    as: As;
    rules?: ValidationOptions;
    onChange?: EventFunction;
    onBlur?: EventFunction;
    mode?: Mode;
    onChangeName?: string;
    onBlurName?: string;
    valueName?: string;
    defaultValue?: any;
    control?: ControlProp;
  },
  AsProps<As>
>;

export type ErrorMessageProps<
  Errors extends FieldErrors<any>,
  Name extends FieldName<FormValuesFromErrors<Errors>>,
  As extends
    | undefined
    | React.ReactElement
    | React.ComponentType<any>
    | keyof JSX.IntrinsicElements = undefined
> = Assign<
  {
    as?: As;
    errors?: Errors;
    name: Name;
    message?: string;
    children?: (data: {
      message: string;
      messages?: MultipleFieldErrors;
    }) => React.ReactNode;
  },
  AsProps<As>
>;

export type UseFieldArrayProps<
  KeyName extends string = 'id',
  ControlProp extends Control = Control
> = {
  name: string;
  keyName?: KeyName;
  control?: ControlProp;
};

export type ArrayField<
  FormArrayValues extends FieldValues = FieldValues,
  KeyName extends string = 'id'
> = FormArrayValues & Record<KeyName, string>;

export type OmitResetState = Partial<{
  errors: boolean;
  dirty: boolean;
  dirtyFields: boolean;
  isSubmitted: boolean;
  touched: boolean;
  isValid: boolean;
  submitCount: boolean;
}>;
