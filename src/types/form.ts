import * as React from 'react';
import {
  EmptyObject,
  NonUndefined,
  LiteralToPrimitive,
  DeepPartial,
  DeepMap,
  IsFlatObject,
} from './utils';

declare const $NestedValue: unique symbol;

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

export type NestedValue<TValue extends any[] | object = any[] | object> = {
  [$NestedValue]: never;
} & TValue;

export type UnpackNestedValue<T> = NonUndefined<T> extends NestedValue<infer U>
  ? U
  : NonUndefined<T> extends Date | FileList
  ? T
  : NonUndefined<T> extends object
  ? { [K in keyof T]: UnpackNestedValue<T[K]> }
  : T;

export type DefaultValuesAtRender<TFieldValues> = UnpackNestedValue<
  DeepPartial<Record<InternalFieldName<TFieldValues>, FieldValue<TFieldValues>>>
>;

export type FieldElement<TFieldValues extends FieldValues = FieldValues> =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
  | CustomElement<TFieldValues>;

export type Ref = FieldElement;

export type ValidationMode = {
  onBlur: 'onBlur';
  onChange: 'onChange';
  onSubmit: 'onSubmit';
  all: 'all';
};

export type Mode = keyof ValidationMode;

export type SubmitHandler<TFieldValues extends FieldValues> = (
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
) => Promise<ResolverResult<TFieldValues>> | ResolverResult<TFieldValues>;

export type UseFormOptions<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object
> = Partial<{
  mode: Mode;
  reValidateMode: Mode;
  defaultValues: UnpackNestedValue<DeepPartial<TFieldValues>>;
  resolver: Resolver<TFieldValues, TContext>;
  context: TContext;
  shouldFocusError: boolean;
  shouldUnregister: boolean;
  criteriaMode: 'firstError' | 'all';
}>;

export type Message = string;

export type ValidationValue = boolean | number | string | RegExp;

export type ValidationRule<
  TValidationValue extends ValidationValue = ValidationValue
> = TValidationValue | ValidationValueMessage<TValidationValue>;

export type ValidationValueMessage<
  TValidationValue extends ValidationValue = ValidationValue
> = {
  value: TValidationValue;
  message: Message;
};

export type ValidateResult = Message | Message[] | boolean | undefined;

export type Validate = (data: any) => ValidateResult | Promise<ValidateResult>;

export type ValidationRules = Partial<{
  required: Message | ValidationRule<boolean>;
  min: ValidationRule<number | string>;
  max: ValidationRule<number | string>;
  maxLength: ValidationRule<number | string>;
  minLength: ValidationRule<number | string>;
  pattern: ValidationRule<RegExp>;
  validate: Validate | Record<string, Validate>;
}>;

export type MultipleFieldErrors = Record<string, ValidateResult>;

export type FieldError = {
  type: keyof ValidationRules | string;
  ref?: Ref;
  types?: MultipleFieldErrors;
  message?: Message;
};

export type ErrorOption =
  | {
      types: MultipleFieldErrors;
    }
  | {
      message?: Message;
      type: string;
    };

export type Field = {
  ref: Ref;
  mutationWatcher?: MutationObserver;
  options?: RadioOrCheckboxOption[];
} & ValidationRules;

export type FieldRefs<TFieldValues extends FieldValues> = Partial<
  Record<InternalFieldName<TFieldValues>, Field>
>;

export type FieldErrors<
  TFieldValues extends FieldValues = FieldValues
> = DeepMap<TFieldValues, FieldError>;

export type FlatFieldErrors<TFieldValues extends FieldValues> = Partial<
  Record<InternalFieldName<TFieldValues>, FieldError>
>;

export type Touched<TFieldValues extends FieldValues> = DeepMap<
  TFieldValues,
  true
>;

export type Dirtied<TFieldValues extends FieldValues> = DeepMap<
  TFieldValues,
  true
>;

export type SetValueConfig = Partial<{
  shouldValidate: boolean;
  shouldDirty: boolean;
}>;

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
  mutationWatcher?: MutationObserver;
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

export type HandleChange = (event: Event) => Promise<void | boolean>;

export type FieldValuesFromControl<
  TControl extends Control
> = TControl extends Control<infer TFieldValues> ? TFieldValues : never;

export type FieldArrayName = string;

export type UseFieldArrayOptions<
  TKeyName extends string = 'id',
  TControl extends Control = Control
> = {
  name: FieldArrayName;
  keyName?: TKeyName;
  control?: TControl;
};

export type FormState<TFieldValues> = {
  isDirty: boolean;
  dirtyFields: Touched<TFieldValues>;
  isSubmitted: boolean;
  submitCount: number;
  touched: Touched<TFieldValues>;
  isSubmitting: boolean;
  isValid: boolean;
};

export type Control<TFieldValues extends FieldValues = FieldValues> = Pick<
  UseFormMethods<TFieldValues>,
  'register' | 'unregister' | 'setValue' | 'getValues' | 'trigger' | 'formState'
> & {
  reRender: () => void;
  removeFieldEventListener: (field: Field, forceDelete?: boolean) => void;
  mode: {
    readonly isOnBlur: boolean;
    readonly isOnSubmit: boolean;
    readonly isOnChange: boolean;
    readonly isOnAll: boolean;
  };
  reValidateMode: {
    readonly isReValidateOnBlur: boolean;
    readonly isReValidateOnChange: boolean;
  };
  fieldArrayDefaultValues: React.MutableRefObject<
    Record<FieldArrayName, any[]>
  >;
  formState: FormState<FieldValues>;
  updateFormState: (args: Partial<FormState<FieldValues>>) => void;
  validateSchemaIsValid?: (fieldsValues: any) => void;
  watchFieldsRef: React.MutableRefObject<Set<InternalFieldName<TFieldValues>>>;
  isWatchAllRef: React.MutableRefObject<boolean>;
  validFieldsRef: React.MutableRefObject<Set<InternalFieldName<TFieldValues>>>;
  fieldsWithValidationRef: React.MutableRefObject<
    Set<InternalFieldName<TFieldValues>>
  >;
  errorsRef: React.MutableRefObject<FieldErrors<TFieldValues>>;
  fieldsRef: React.MutableRefObject<FieldRefs<TFieldValues>>;
  resetFieldArrayFunctionRef: React.MutableRefObject<
    Record<string, () => void>
  >;
  unmountFieldsStateRef: Record<InternalFieldName<FieldValues>, any>;
  fieldArrayNamesRef: React.MutableRefObject<
    Set<InternalFieldName<FieldValues>>
  >;
  readFormStateRef: React.MutableRefObject<
    { [k in keyof FormStateProxy<TFieldValues>]: boolean }
  >;
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
    watchId?: string,
  ) => unknown;
  renderWatchedInputs: (name: string, found?: boolean) => void;
};

export type ArrayField<
  TFieldArrayValues extends FieldValues = FieldValues,
  TKeyName extends string = 'id'
> = TFieldArrayValues & Record<TKeyName, string>;

export type OmitResetState = Partial<
  {
    errors: boolean;
  } & ReadFormState
>;

export type UseWatchOptions = {
  defaultValue?: unknown;
  name?: string | string[];
  control?: Control;
};

export type UseFormMethods<TFieldValues extends FieldValues = FieldValues> = {
  register<TFieldElement extends FieldElement<TFieldValues>>(
    rules?: ValidationRules,
  ): (ref: (TFieldElement & Ref) | null) => void;
  register(name: FieldName<TFieldValues>, rules?: ValidationRules): void;
  register<TFieldElement extends FieldElement<TFieldValues>>(
    ref: (TFieldElement & Ref) | null,
    rules?: ValidationRules,
  ): void;
  unregister(name: FieldName<TFieldValues> | FieldName<TFieldValues>[]): void;
  watch(): UnpackNestedValue<TFieldValues>;
  watch<TFieldName extends string, TFieldValue>(
    name: TFieldName,
    defaultValue?: TFieldName extends keyof TFieldValues
      ? UnpackNestedValue<TFieldValues[TFieldName]>
      : UnpackNestedValue<LiteralToPrimitive<TFieldValue>>,
  ): TFieldName extends keyof TFieldValues
    ? UnpackNestedValue<TFieldValues[TFieldName]>
    : UnpackNestedValue<LiteralToPrimitive<TFieldValue>>;
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
  setError(name: FieldName<TFieldValues>, error: ErrorOption): void;
  clearErrors(name?: FieldName<TFieldValues> | FieldName<TFieldValues>[]): void;
  setValue<
    TFieldName extends string,
    TFieldValue extends TFieldValues[TFieldName]
  >(
    name: TFieldName,
    value?: NonUndefined<TFieldValue> extends NestedValue<infer U>
      ? U
      : UnpackNestedValue<DeepPartial<LiteralToPrimitive<TFieldValue>>>,
    options?: SetValueConfig,
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
    callback: SubmitHandler<TSubmitFieldValues>,
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  control: Control<TFieldValues>;
};
