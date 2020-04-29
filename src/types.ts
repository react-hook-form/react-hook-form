import * as React from 'react';

export type IsAny<T> = boolean extends (T extends never ? true : false)
  ? true
  : false;

export type IsFlatObject<T extends object> = Extract<
  Exclude<T[keyof T], NestedValue>,
  any[] | object
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

export type FieldName<TFieldValues extends FieldValues> =
  | (keyof TFieldValues & string)
  | string;

export type FieldValue<
  TFieldValues extends FieldValues
> = TFieldValues[FieldName<TFieldValues>];

declare const $NestedValue: unique symbol;

export type NestedValue<
  TNestedValue extends any[] | object = any[] | object
> = {
  [$NestedValue]: never;
} & TNestedValue;

export type NonUndefined<T> = T extends undefined ? never : T;

export type Unpacked<T> = {
  [K in keyof T]: NonUndefined<T[K]> extends NestedValue<infer U>
    ? U
    : T[K] extends object
    ? Unpacked<T[K]>
    : T[K];
};

export type Ref = FieldElement;

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[K] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : T[K] extends { [key: string]: unknown }
    ? DeepPartial<T[K]>
    : T[K];
};

export type ValidationMode = {
  onBlur: 'onBlur';
  onChange: 'onChange';
  onSubmit: 'onSubmit';
};

export type Mode = keyof ValidationMode;

export type OnSubmit<TFieldValues extends FieldValues> = (
  data: Unpacked<TFieldValues>,
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
  TFieldValues extends FieldValues = FieldValues
> = {
  values: Unpacked<TFieldValues>;
  errors: EmptyObject;
};

export type SchemaValidationError<
  TFieldValues extends FieldValues = FieldValues
> = {
  values: EmptyObject;
  errors: FieldErrors<TFieldValues>;
};

export type SchemaValidationResult<
  TFieldValues extends FieldValues = FieldValues
> = SchemaValidationSuccess<TFieldValues> | SchemaValidationError<TFieldValues>;

export type ValidationResolver<
  TFieldValues extends FieldValues = FieldValues,
  ValidationContext extends object = object
> = (
  values: TFieldValues,
  validationContext?: ValidationContext,
  validateAllFieldCriteria?: boolean,
) => Promise<SchemaValidationResult<TFieldValues>>;

export type UseFormOptions<
  TFieldValues extends FieldValues = FieldValues,
  ValidationContext extends object = object
> = Partial<{
  mode: Mode;
  reValidateMode: Mode;
  defaultValues: Unpacked<DeepPartial<TFieldValues>>;
  validationResolver: ValidationResolver<TFieldValues, ValidationContext>;
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

export type ManualFieldError<TFieldValues extends FieldValues> = {
  name: IsFlatObject<TFieldValues> extends true
    ? Extract<keyof TFieldValues, string>
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

export type FieldRefs<TFieldValues extends FieldValues> = Partial<
  Record<FieldName<TFieldValues>, Field>
>;

export type NestDataObject<TFieldValues, Value> = {
  [Key in keyof TFieldValues]?: IsAny<TFieldValues[Key]> extends true
    ? any
    : TFieldValues[Key] extends NestedValue
    ? Value
    : TFieldValues[Key] extends Date
    ? Value
    : TFieldValues[Key] extends FileList
    ? Value
    : TFieldValues[Key] extends Array<infer U>
    ? Array<NestDataObject<U, Value>>
    : TFieldValues[Key] extends ReadonlyArray<infer U>
    ? ReadonlyArray<NestDataObject<U, Value>>
    : TFieldValues[Key] extends object
    ? NestDataObject<TFieldValues[Key], Value>
    : Value;
};

export type FieldErrors<TFieldValues> = NestDataObject<
  TFieldValues,
  FieldError
>;

export type Touched<TFieldValues> = NestDataObject<TFieldValues, true>;

export type FormStateProxy<TFieldValues extends FieldValues = FieldValues> = {
  dirty: boolean;
  dirtyFields: Set<FieldName<TFieldValues>>;
  isSubmitted: boolean;
  submitCount: number;
  touched: Touched<TFieldValues>;
  isSubmitting: boolean;
  isValid: boolean;
};

export type ReadFormState = { [P in keyof FormStateProxy]: boolean };

export type RadioOrCheckboxOption = {
  ref: HTMLInputElement;
  mutationWatcher?: MutationWatcher;
};

export type CustomElement<TFieldValues extends FieldValues> = {
  name: IsFlatObject<TFieldValues> extends true
    ? Extract<keyof TFieldValues, string>
    : string;
  type?: string;
  value?: any;
  checked?: boolean;
  options?: HTMLOptionsCollection;
  files?: FileList | null;
  focus?: () => void;
};

export type FieldElement<TFieldValues extends FieldValues = FieldValues> =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
  | CustomElement<TFieldValues>;

export type HandleChange = (evt: Event) => Promise<void | boolean>;

export type FieldValuesFromErrors<Errors> = Errors extends FieldErrors<
  infer FormValues
>
  ? FormValues
  : never;

export type EventFunction = (...args: any[]) => any;

export type Control<TFieldValues extends FieldValues = FieldValues> = {
  reRender: () => void;
  removeFieldEventListener: (field: Field, forceDelete?: boolean) => void;
  setValue<T extends keyof TFieldValues>(
    namesWithValue: Unpacked<DeepPartial<Pick<TFieldValues, T>>>[],
    shouldValidate?: boolean,
  ): void;
  setValue<T extends string, U extends unknown>(
    name: T,
    value: T extends keyof TFieldValues
      ? IsAny<TFieldValues[T]> extends true
        ? any
        : TFieldValues[T] extends NestedValue<infer U>
        ? U
        : Unpacked<DeepPartial<TFieldValues[T]>>
      : LiteralToPrimitive<U>,
    shouldValidate?: boolean,
  ): void;
  getValues(): Unpacked<TFieldValues>;
  getValues<T extends keyof TFieldValues>(
    payload: T[],
  ): Unpacked<Pick<TFieldValues, T>>;
  getValues<T extends string, U extends unknown>(
    payload: T,
  ): T extends keyof TFieldValues ? Unpacked<TFieldValues>[T] : U;
  triggerValidation(
    payload?:
      | (IsFlatObject<TFieldValues> extends true
          ? Extract<keyof TFieldValues, string>
          : string)
      | (IsFlatObject<TFieldValues> extends true
          ? Extract<keyof TFieldValues, string>
          : string)[],
  ): Promise<boolean>;
  register<
    Element extends FieldElement<TFieldValues> = FieldElement<TFieldValues>
  >(): (ref: Element | null) => void;
  register<
    Element extends FieldElement<TFieldValues> = FieldElement<TFieldValues>
  >(
    validationOptions: ValidationOptions,
  ): (ref: Element | null) => void;
  register(
    name: IsFlatObject<TFieldValues> extends true
      ? Extract<keyof TFieldValues, string>
      : string,
    validationOptions?: ValidationOptions,
  ): void;
  register<
    Element extends FieldElement<TFieldValues> = FieldElement<TFieldValues>
  >(
    ref: Element,
    validationOptions?: ValidationOptions,
  ): void;
  unregister(
    name:
      | (IsFlatObject<TFieldValues> extends true
          ? Extract<keyof TFieldValues, string>
          : string)
      | (IsFlatObject<TFieldValues> extends true
          ? Extract<keyof TFieldValues, string>
          : string)[],
  ): void;
  formState: FormStateProxy<TFieldValues>;
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
  dirtyFieldsRef: React.MutableRefObject<Set<FieldName<TFieldValues>>>;
  validateSchemaIsValid?: (fieldsValues: any) => void;
  touchedFieldsRef: React.MutableRefObject<Touched<TFieldValues>>;
  watchFieldsRef: React.MutableRefObject<Set<FieldName<TFieldValues>>>;
  isWatchAllRef: React.MutableRefObject<boolean>;
  validFieldsRef: React.MutableRefObject<Set<FieldName<TFieldValues>>>;
  fieldsWithValidationRef: React.MutableRefObject<Set<FieldName<TFieldValues>>>;
  errorsRef: React.MutableRefObject<FieldErrors<TFieldValues>>;
  fieldsRef: React.MutableRefObject<FieldRefs<TFieldValues>>;
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
    | Unpacked<DeepPartial<TFieldValues>>
    | Unpacked<TFieldValues>[FieldName<TFieldValues>]
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
  Name extends FieldName<FieldValuesFromErrors<Errors>>,
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
