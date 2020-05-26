import * as React from 'react';
import {
  EmptyObject,
  NonUndefined,
  LiteralToPrimitive,
  DeepPartial,
  DeepMap,
  IsFlatObject,
} from './utils';

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

export type UnpackNestedValue<T> = NonUndefined<T> extends NestedValue<infer U>
  ? U
  : NonUndefined<T> extends object
  ? { [K in keyof T]: UnpackNestedValue<T[K]> }
  : T;

export type Ref = FieldElement;

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

export type FieldErrors<
  TFieldValues extends FieldValues = FieldValues
> = DeepMap<TFieldValues, FieldError>;

export type Touched<TFieldValues extends FieldValues> = DeepMap<
  TFieldValues,
  true
>;

export type Dirtied<TFieldValues extends FieldValues> = DeepMap<
  TFieldValues,
  true
>;

export type FormStateProxy<TFieldValues extends FieldValues = FieldValues> = {
  isDirty: boolean;
  dirtyFields: Dirtied<TFieldValues>;
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
  dirtyFieldsRef: React.MutableRefObject<Dirtied<TFieldValues>>;
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

export type UseWatchOptions = {
  defaultValue?: unknown;
  name?: string | string[];
  control?: Control;
};

export type FieldValuesFromFieldErrors<
  TFieldErrors
> = TFieldErrors extends FieldErrors<infer TFieldValues> ? TFieldValues : never;

export type UseFormMethods<TFieldValues extends FieldValues = FieldValues> = {
  register<TFieldElement extends FieldElement<TFieldValues>>(): (
    ref: TFieldElement | null,
  ) => void;
  register<TFieldElement extends FieldElement<TFieldValues>>(
    validationOptions: ValidationOptions,
  ): (ref: TFieldElement | null) => void;
  register(
    name: FieldName<TFieldValues>,
    validationOptions?: ValidationOptions,
  ): void;
  register<TFieldElement extends FieldElement<TFieldValues>>(
    ref: TFieldElement | null,
    validationOptions?: ValidationOptions,
  ): void;
  unregister(name: FieldName<TFieldValues> | FieldName<TFieldValues>[]): void;
  watch(): UnpackNestedValue<TFieldValues>;
  watch<
    TFieldName extends string,
    TFieldValue extends TFieldValues[TFieldName]
  >(
    name: TFieldName,
    defaultValue?: UnpackNestedValue<LiteralToPrimitive<TFieldValue>>,
  ): UnpackNestedValue<LiteralToPrimitive<TFieldValue>>;
  watch<TFieldName extends keyof TFieldValues>(
    names: TFieldName[],
    defaultValues?: UnpackNestedValue<
      DeepPartial<Pick<TFieldValues, TFieldName>>
    >,
  ): UnpackNestedValue<Pick<TFieldValues, TFieldName>>;
  watch(
    names: string[],
    defaultValues?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): UnpackNestedValue<DeepPartial<TFieldValues>>;
  setError(name: FieldName<TFieldValues>, type: MultipleFieldErrors): void;
  setError(
    name: FieldName<TFieldValues>,
    type: string,
    message?: Message,
  ): void;
  setError(name: ManualFieldError<TFieldValues>[]): void;
  clearError(name?: FieldName<TFieldValues> | FieldName<TFieldValues>[]): void;
  setValue<
    TFieldName extends string,
    TFieldValue extends TFieldValues[TFieldName]
  >(
    name: TFieldName,
    value: NonUndefined<TFieldValue> extends NestedValue<infer U>
      ? U
      : UnpackNestedValue<DeepPartial<LiteralToPrimitive<TFieldValue>>>,
    shouldValidate?: boolean,
  ): void;
  setValue<TFieldName extends keyof TFieldValues>(
    namesWithValue: UnpackNestedValue<
      DeepPartial<Pick<TFieldValues, TFieldName>>
    >[],
    shouldValidate?: boolean,
  ): void;
  trigger(
    name?: FieldName<TFieldValues> | FieldName<TFieldValues>[],
  ): Promise<boolean>;
  errors: FieldErrors<TFieldValues>;
  formState: FormStateProxy<TFieldValues>;
  reset: (
    values?: UnpackNestedValue<DeepPartial<TFieldValues>>,
    omitResetState?: OmitResetState,
  ) => void;
  getValues(): UnpackNestedValue<TFieldValues>;
  getValues<TFieldName extends string, TFieldValue extends unknown>(
    name: TFieldName,
  ): TFieldName extends keyof TFieldValues
    ? UnpackNestedValue<TFieldValues>[TFieldName]
    : TFieldValue;
  getValues<TFieldName extends keyof TFieldValues>(
    names: TFieldName[],
  ): UnpackNestedValue<Pick<TFieldValues, TFieldName>>;
  handleSubmit: <TSubmitFieldValues extends FieldValues = TFieldValues>(
    callback: OnSubmit<TSubmitFieldValues>,
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  control: Control<TFieldValues>;
};
