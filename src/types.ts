import * as React from 'react';
import { UseFormMethods } from './contextTypes';

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

export type InternalFieldName<TFieldValues extends FieldValues> =
  | (keyof TFieldValues & string)
  | string;

export type FieldName<TFieldValues extends FieldValues> = IsFlatObject<
  TFieldValues
> extends true
  ? Extract<keyof TFieldValues, string>
  : string;

export type FieldValue<
  TFieldValues extends FieldValues
> = TFieldValues[InternalFieldName<TFieldValues>];

declare const $NestedValue: unique symbol;

export type NestedValue<TValue extends any[] | object = any[] | object> = {
  [$NestedValue]: never;
} & TValue;

export type NonUndefined<T> = T extends undefined ? never : T;

export type UnpackNestedValue<T> = NonUndefined<T> extends NestedValue<infer U>
  ? U
  : NonUndefined<T> extends object
  ? { [K in keyof T]: UnpackNestedValue<T[K]> }
  : T;

export type Ref = FieldElement;

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[K] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : T[K] extends Record<string, unknown>
    ? DeepPartial<T[K]>
    : T[K];
};

export type ValidationMode = {
  onBlur: 'onBlur';
  onChange: 'onChange';
  onSubmit: 'onSubmit';
  all: 'all';
};

export type Mode = keyof ValidationMode;

export type OnSubmit<TFieldValues extends FieldValues> = (
  data: UnpackNestedValue<TFieldValues>,
  event?: React.BaseSyntheticEvent,
) => void | Promise<void>;

export type EmptyObject = { [K in string | number]: never };

export type ResolverSuccess<TFieldValues extends FieldValues = FieldValues> = {
  values: UnpackNestedValue<TFieldValues>;
  errors: EmptyObject;
};

export type ResolverError<TFieldValues extends FieldValues = FieldValues> = {
  values: EmptyObject;
  errors: FieldErrors<TFieldValues>;
};

export type ResolverResult<TFieldValues extends FieldValues = FieldValues> =
  | ResolverSuccess<TFieldValues>
  | ResolverError<TFieldValues>;

export type Resolver<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object
> = (
  values: TFieldValues,
  context?: TContext,
  validateAllFieldCriteria?: boolean,
) => Promise<ResolverResult<TFieldValues>>;

export type UseFormOptions<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object
> = Partial<{
  mode: Mode;
  reValidateMode: Mode;
  defaultValues: UnpackNestedValue<DeepPartial<TFieldValues>>;
  resolver: Resolver<TFieldValues, TContext>;
  context: TContext;
  submitFocusError: boolean;
  criteriaMode: 'firstError' | 'all';
}>;

export type MutationWatcher = {
  disconnect: VoidFunction;
  observe?: any;
};

export type Message = string | React.ReactElement;

export type ValidationValue = boolean | number | string | RegExp;

export type ValidationOption<
  TValidationValue extends ValidationValue = ValidationValue
> = TValidationValue | ValidationValueMessage<TValidationValue>;

export type ValidationValueMessage<
  TValidationValue extends ValidationValue = ValidationValue
> = {
  value: TValidationValue;
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
  name: FieldName<TFieldValues>;
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
  Record<InternalFieldName<TFieldValues>, Field>
>;

export type DeepMap<T, TValue> = {
  [K in keyof T]?: IsAny<T[K]> extends true
    ? any
    : NonUndefined<T[K]> extends NestedValue | Date | FileList
    ? TValue
    : NonUndefined<T[K]> extends object
    ? DeepMap<T[K], TValue>
    : NonUndefined<T[K]> extends Array<infer U>
    ? IsAny<U> extends true
      ? Array<any>
      : U extends NestedValue | Date | FileList
      ? Array<TValue>
      : U extends object
      ? Array<DeepMap<U, TValue>>
      : Array<TValue>
    : TValue;
};

export type FieldErrors<
  TFieldValues extends FieldValues = FieldValues
> = DeepMap<TFieldValues, FieldError>;

export type Touched<TFieldValues extends FieldValues> = DeepMap<
  TFieldValues,
  true
>;

export type Dirtyed<TFieldValues extends FieldValues> = DeepMap<
  TFieldValues,
  true
>;

export type FormStateProxy<TFieldValues extends FieldValues = FieldValues> = {
  isDirty: boolean;
  dirtyFields: Dirtyed<TFieldValues>;
  isSubmitted: boolean;
  submitCount: number;
  touched: Touched<TFieldValues>;
  isSubmitting: boolean;
  isValid: boolean;
};

export type ReadFormState = { [K in keyof FormStateProxy]: boolean };

export type RadioOrCheckboxOption = {
  ref: HTMLInputElement;
  mutationWatcher?: MutationWatcher;
};

export type CustomElement<TFieldValues extends FieldValues> = {
  name: FieldName<TFieldValues>;
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

export type EventFunction = (...args: any[]) => any;

export type FieldValuesFromControl<
  TControl extends Control
> = TControl extends Control<infer TFieldValues> ? TFieldValues : never;

export type Control<TFieldValues extends FieldValues = FieldValues> = Pick<
  UseFormMethods<TFieldValues>,
  'register' | 'unregister' | 'setValue' | 'getValues' | 'trigger' | 'formState'
> & {
  reRender: () => void;
  removeFieldEventListener: (field: Field, forceDelete?: boolean) => void;
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
  dirtyFieldsRef: React.MutableRefObject<Dirtyed<TFieldValues>>;
  validateSchemaIsValid?: (fieldsValues: any) => void;
  touchedFieldsRef: React.MutableRefObject<Touched<TFieldValues>>;
  watchFieldsRef: React.MutableRefObject<Set<InternalFieldName<TFieldValues>>>;
  isWatchAllRef: React.MutableRefObject<boolean>;
  validFieldsRef: React.MutableRefObject<Set<InternalFieldName<TFieldValues>>>;
  fieldsWithValidationRef: React.MutableRefObject<
    Set<InternalFieldName<TFieldValues>>
  >;
  errorsRef: React.MutableRefObject<FieldErrors<TFieldValues>>;
  fieldsRef: React.MutableRefObject<FieldRefs<TFieldValues>>;
  resetFieldArrayFunctionRef: React.MutableRefObject<
    Record<string, (values: any) => void>
  >;
  fieldArrayNamesRef: React.MutableRefObject<Set<string>>;
  isDirtyRef: React.MutableRefObject<boolean>;
  readFormStateRef: React.MutableRefObject<{
    isDirty: boolean;
    isSubmitted: boolean;
    submitCount: boolean;
    touched: boolean;
    isSubmitting: boolean;
    isValid: boolean;
    dirtyFields: boolean;
  }>;
  defaultValuesRef: React.MutableRefObject<
    | FieldValue<UnpackNestedValue<TFieldValues>>
    | UnpackNestedValue<DeepPartial<TFieldValues>>
  >;
  watchFieldsHookRef: React.MutableRefObject<
    Record<string, Set<InternalFieldName<TFieldValues>>>
  >;
  watchFieldsHookRenderRef: React.MutableRefObject<Record<string, Function>>;
  watchInternal: (
    fieldNames?: string | string[],
    defaultValue?: unknown,
    isUseWatch?: string,
  ) => unknown;
  renderWatchedInputs: (name: string, found?: boolean) => void;
};

export type Assign<T extends object, U extends object> = T & Omit<U, keyof T>;

export type AsProps<TAs> = TAs extends undefined
  ? {}
  : TAs extends React.ReactElement
  ? Record<string, any>
  : TAs extends React.ComponentType<infer P>
  ? P
  : TAs extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[TAs]
  : never;

export type ControllerProps<
  TAs extends
    | React.ReactElement
    | React.ComponentType<any>
    | keyof JSX.IntrinsicElements,
  TControl extends Control = Control
> = Assign<
  {
    name: FieldName<FieldValuesFromControl<TControl>>;
    as: TAs;
    rules?: ValidationOptions;
    onChange?: EventFunction;
    onFocus?: () => void;
    onBlur?: EventFunction;
    mode?: Mode;
    onChangeName?: string;
    onBlurName?: string;
    valueName?: string;
    defaultValue?: unknown;
    control?: TControl;
  },
  AsProps<TAs>
>;

export type UseFieldArrayOptions<
  TKeyName extends string = 'id',
  TControl extends Control = Control
> = {
  name: string;
  keyName?: TKeyName;
  control?: TControl;
};

export type ArrayField<
  TFieldArrayValues extends FieldValues = FieldValues,
  TKeyName extends string = 'id'
> = TFieldArrayValues & Record<TKeyName, string>;

export type OmitResetState = Partial<{
  errors: boolean;
  isDirty: boolean;
  dirtyFields: boolean;
  isSubmitted: boolean;
  touched: boolean;
  isValid: boolean;
  submitCount: boolean;
}>;

export type UseWatchOptions<TControl extends Control = Control> = {
  defaultValue?: unknown;
  name?: string | string[];
  control?: TControl;
};

export type FieldValuesFromFieldErrors<
  TFieldErrors
> = TFieldErrors extends FieldErrors<infer TFieldValues> ? TFieldValues : never;

export type ErrorMessageProps<
  TFieldErrors extends FieldErrors,
  TAs extends
    | undefined
    | React.ReactElement
    | React.ComponentType<any>
    | keyof JSX.IntrinsicElements = undefined
> = Assign<
  {
    as?: TAs;
    errors?: TFieldErrors;
    name: FieldName<FieldValuesFromFieldErrors<TFieldErrors>>;
    message?: Message;
    children?: (data: {
      message: Message;
      messages?: MultipleFieldErrors;
    }) => React.ReactNode;
  },
  AsProps<TAs>
>;
