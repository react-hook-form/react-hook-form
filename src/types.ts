import * as React from 'react';

export type IsAny<T> = boolean extends (T extends never ? true : false)
  ? true
  : false;

export type IsFlatObject<T extends Record<string, unknown>> = Extract<
  Exclude<T[keyof T], Date | FileList>,
  unknown[] | Record<string, unknown>
> extends never
  ? true
  : false;

export type Primitive = string | boolean | number | symbol | null | undefined;

export type LiteralToPrimitive<T extends any> = T extends string
  ? string
  : T extends number
  ? number
  : T extends boolean
  ? boolean
  : T;

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
    : T[P] extends { [key: string]: unknown }
    ? DeepPartial<T[P]>
    : T[P];
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

export type EmptyObject = { [key in string | number]: never };

export type SchemaValidationSuccess<
  FormValues extends FieldValues = FieldValues
> = {
  values: FormValues;
  errors: EmptyObject;
};

export type SchemaValidationError<
  FormValues extends FieldValues = FieldValues
> = {
  values: EmptyObject;
  errors: FieldErrors<FormValues>;
};

export type SchemaValidationResult<
  FormValues extends FieldValues = FieldValues
> = SchemaValidationSuccess<FormValues> | SchemaValidationError<FormValues>;

export type ValidationResolver<
  FormValues extends FieldValues = FieldValues,
  ValidationContext extends object = object
> = (
  values: FormValues,
  validationContext?: ValidationContext,
) =>
  | SchemaValidationResult<FormValues>
  | Promise<SchemaValidationResult<FormValues>>;

export type UseFormOptions<
  FormValues extends FieldValues = FieldValues,
  ValidationContext extends object = object
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

export type Message = string | React.ReactElement;

export type ValidationValue = boolean | number | string | RegExp;

export type ValidationOption<Value extends ValidationValue = ValidationValue> =
  | Value
  | ValidationValueMessage<Value>;

export type ValidationValueMessage<
  Value extends ValidationValue = ValidationValue
> = {
  value: Value;
  message: Message;
};

export type ValidateResult = Message | boolean | undefined;

export type Validate = (data: any) => ValidateResult | Promise<ValidateResult>;

export type ValidationOptions = Partial<{
  required: Message | ValidationOption<boolean>;
  min: ValidationOption<number | string>;
  max: ValidationOption<number | string>;
  maxLength: ValidationOption<number | string>;
  minLength: ValidationOption<number | string>;
  pattern: ValidationOption<RegExp>;
  validate: Validate | Record<string, Validate>;
}>;

export type MultipleFieldErrors = Record<string, ValidateResult>;

export type FieldError = {
  type: string;
  ref?: Ref;
  types?: MultipleFieldErrors;
  message?: Message;
  isManual?: boolean;
};

export type ManualFieldError<FormValues extends FieldValues> = {
  name: IsFlatObject<FormValues> extends true
    ? Extract<keyof FormValues, string>
    : string;
  type: string;
  types?: MultipleFieldErrors;
  message?: Message;
};

export type Field = {
  ref: Ref;
  mutationWatcher?: MutationWatcher;
  options?: RadioOrCheckboxOption[];
} & ValidationOptions;

export type FieldRefs<FormValues extends FieldValues> = Partial<
  Record<FieldName<FormValues>, Field>
>;

export type NestDataObject<FormValues, Value> = {
  [Key in keyof FormValues]?: FormValues[Key] extends Array<infer U>
    ? IsAny<U> extends true
      ? any
      : unknown extends U
      ? Value[]
      : object extends U
      ? Value[]
      : U extends Date
      ? Value[]
      : FormValues[Key] extends FileList
      ? Value[]
      : U extends object
      ? NestDataObject<U, Value>[]
      : Value[]
    : IsAny<FormValues[Key]> extends true
    ? any
    : unknown extends FormValues[Key]
    ? Value
    : object extends FormValues[Key]
    ? Value
    : FormValues[Key] extends Date
    ? Value
    : FormValues[Key] extends FileList
    ? Value
    : FormValues[Key] extends object
    ? NestDataObject<FormValues[Key], Value>
    : Value;
};

export type FieldErrors<FormValues> = NestDataObject<FormValues, FieldError>;

export type Touched<FormValues> = NestDataObject<FormValues, true>;

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

export type CustomElement<FormValues extends FieldValues> = {
  name: IsFlatObject<FormValues> extends true
    ? Extract<keyof FormValues, string>
    : string;
  type?: string;
  value?: any;
  checked?: boolean;
  options?: HTMLOptionsCollection;
  files?: FileList | null;
  focus?: () => void;
};

export type FieldElement<FormValues extends FieldValues = FieldValues> =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
  | CustomElement<FormValues>;

export type HandleChange = (evt: Event) => Promise<void | boolean>;

export type FormValuesFromErrors<Errors> = Errors extends FieldErrors<
  infer FormValues
>
  ? FormValues
  : never;

export type EventFunction = (args: any[]) => any;

export type Control<FormValues extends FieldValues = FieldValues> = {
  reRender: () => void;
  removeFieldEventListener: (field: Field, forceDelete?: boolean) => void;
  setValue<T extends keyof FormValues>(
    namesWithValue: DeepPartial<Pick<FormValues, T>>[],
    shouldValidate?: boolean,
  ): void;
  setValue<T extends string, U extends unknown>(
    name: T,
    value: T extends keyof FormValues
      ? IsAny<FormValues[T]> extends true
        ? any
        : DeepPartial<FormValues[T]>
      : LiteralToPrimitive<U>,
    shouldValidate?: boolean,
  ): void;
  getValues(): IsFlatObject<FormValues> extends false
    ? Record<string, unknown>
    : FormValues;
  getValues(payload: { nest: true }): FormValues;
  getValues(payload: {
    nest: false;
  }): IsFlatObject<FormValues> extends false
    ? Record<string, unknown>
    : FormValues;
  getValues<T extends string, U extends unknown>(
    payload: T,
  ): T extends keyof FormValues ? FormValues[T] : U;
  triggerValidation(
    payload?:
      | (IsFlatObject<FormValues> extends true
          ? Extract<keyof FormValues, string>
          : string)
      | (IsFlatObject<FormValues> extends true
          ? Extract<keyof FormValues, string>
          : string)[]
      | RegExp,
  ): Promise<boolean>;
  register<
    Element extends FieldElement<FormValues> = FieldElement<FormValues>
  >(): (ref: Element | null) => void;
  register<Element extends FieldElement<FormValues> = FieldElement<FormValues>>(
    validationOptions: ValidationOptions,
  ): (ref: Element | null) => void;
  register(
    name: IsFlatObject<FormValues> extends true
      ? Extract<keyof FormValues, string>
      : string,
    validationOptions?: ValidationOptions,
  ): void;
  register<Element extends FieldElement<FormValues> = FieldElement<FormValues>>(
    ref: Element,
    validationOptions?: ValidationOptions,
  ): void;
  unregister(
    name:
      | (IsFlatObject<FormValues> extends true
          ? Extract<keyof FormValues, string>
          : string)
      | (IsFlatObject<FormValues> extends true
          ? Extract<keyof FormValues, string>
          : string)[],
  ): void;
  formState: FormStateProxy<FormValues>;
  mode: {
    isOnBlur: boolean;
    isOnSubmit: boolean;
    isOnChange: boolean;
  };
  reValidateMode: {
    isReValidateOnBlur: boolean;
    isReValidateOnSubmit: boolean;
  };
  fieldArrayDefaultValues: React.MutableRefObject<Record<string, any[]>>;
  dirtyFieldsRef: React.MutableRefObject<Set<FieldName<FormValues>>>;
  validateSchemaIsValid?: (fieldsValues: any) => void;
  touchedFieldsRef: React.MutableRefObject<Touched<FormValues>>;
  watchFieldsRef: React.MutableRefObject<Set<FieldName<FormValues>>>;
  isWatchAllRef: React.MutableRefObject<boolean>;
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
    onFocus?: () => void;
    onBlur?: EventFunction;
    mode?: Mode;
    onChangeName?: string;
    onBlurName?: string;
    valueName?: string;
    defaultValue?: unknown;
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
    message?: Message;
    children?: (data: {
      message: Message;
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
