import * as React from 'react';
import {
  DeepPartial,
  DeepMap,
  FieldPath,
  FieldPathValues,
  FieldPathValue,
} from './utils';
import { Resolver } from './resolvers';
import {
  FieldName,
  FieldRefs,
  FieldValue,
  FieldValues,
  InternalFieldName,
} from './fields';
import { ErrorOption, FieldErrors } from './errors';
import { RegisterOptions } from './validator';
import { FieldArrayDefaultValues } from './fieldArray';
import { SubjectType, Subscription } from '../utils/Subject';

export type EventType =
  | 'focus'
  | 'blur'
  | 'change'
  | 'changeText'
  | 'valueChange'
  | 'contentSizeChange'
  | 'endEditing'
  | 'keyPress'
  | 'submitEditing'
  | 'layout'
  | 'selectionChange'
  | 'longPress'
  | 'press'
  | 'pressIn'
  | 'pressOut'
  | 'momentumScrollBegin'
  | 'momentumScrollEnd'
  | 'scroll'
  | 'scrollBeginDrag'
  | 'scrollEndDrag'
  | 'load'
  | 'error'
  | 'progress'
  | 'custom';

declare const $NestedValue: unique symbol;

export type NestedValue<
  TValue extends unknown[] | Record<string, unknown> | Map<unknown, unknown> =
    | unknown[]
    | Record<string, unknown>
> = {
  [$NestedValue]: never;
} & TValue;

export type Message = string;

export type UnpackNestedValue<T> = T extends NestedValue<infer U>
  ? U
  : T extends Date | FileList
  ? T
  : T extends Record<string, unknown>
  ? { [K in keyof T]: UnpackNestedValue<T[K]> }
  : T;

export type DefaultValues<TFieldValues> = UnpackNestedValue<
  DeepPartial<TFieldValues>
>;

export type InternalNameSet = Set<InternalFieldName>;

export type ValidationMode = {
  onBlur: 'onBlur';
  onChange: 'onChange';
  onSubmit: 'onSubmit';
  onTouched: 'onTouched';
  all: 'all';
};

export type Mode = keyof ValidationMode;

export type SubmitHandler<TFieldValues extends FieldValues> = (
  data: UnpackNestedValue<TFieldValues>,
  event?: React.BaseSyntheticEvent,
) => any | Promise<any>;

export type SubmitErrorHandler<TFieldValues extends FieldValues> = (
  errors: FieldErrors<TFieldValues>,
  event?: React.BaseSyntheticEvent,
) => any | Promise<any>;

export type SetValueConfig = Partial<{
  shouldValidate: boolean;
  shouldDirty: boolean;
}>;

export type HandleChange = (event: any) => Promise<void | boolean>;

export type UseFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object
> = Partial<{
  mode: Mode;
  reValidateMode: Exclude<Mode, 'onTouched' | 'all'>;
  defaultValues: DefaultValues<TFieldValues>;
  resolver: Resolver<TFieldValues, TContext>;
  context: TContext;
  shouldFocusError: boolean;
  criteriaMode: 'firstError' | 'all';
}>;

export type FieldNamesMarkedBoolean<TFieldValues extends FieldValues> = DeepMap<
  TFieldValues,
  true
>;

export type FormStateProxy<TFieldValues extends FieldValues = FieldValues> = {
  isDirty: boolean;
  isValidating: boolean;
  dirtyFields: FieldNamesMarkedBoolean<TFieldValues>;
  touchedFields: FieldNamesMarkedBoolean<TFieldValues>;
  isSubmitting: boolean;
  errors: boolean;
  isValid: boolean;
};

export type ReadFormState = { [K in keyof FormStateProxy]: boolean | 'all' };

export type FormState<TFieldValues> = {
  isDirty: boolean;
  dirtyFields: FieldNamesMarkedBoolean<TFieldValues>;
  isSubmitted: boolean;
  isSubmitSuccessful: boolean;
  submitCount: number;
  touchedFields: FieldNamesMarkedBoolean<TFieldValues>;
  isSubmitting: boolean;
  isValidating: boolean;
  isValid: boolean;
  errors: FieldErrors<TFieldValues>;
};

export type KeepStateOptions = Partial<{
  keepErrors: boolean;
  keepIsDirty: boolean;
  keepValues: boolean;
  keepDefaultValues: boolean;
  keepIsSubmitted: boolean;
  keepTouched: boolean;
  keepIsValid: boolean;
  keepSubmitCount: boolean;
  keepDirty: boolean;
}>;

export type SetFieldValue<TFieldValues> =
  | FieldValue<TFieldValues>
  | UnpackNestedValue<DeepPartial<TFieldValues>>
  | unknown[]
  | undefined
  | null
  | boolean;

export type RegisterMethods = {
  onChange: HandleChange;
  onBlur: HandleChange;
  ref: React.Ref<any>;
  name: InternalFieldName;
};

type UseFormCommonMethods<TFieldValues extends FieldValues = FieldValues> = {
  register: (
    name: FieldPath<TFieldValues>,
    options?: RegisterOptions,
  ) => RegisterMethods;
  unregister: (
    name: FieldPath<TFieldValues> | FieldPath<TFieldValues>[],
  ) => void;
};

export type Control<TFieldValues extends FieldValues = FieldValues> = {
  isWatchAllRef: React.MutableRefObject<boolean>;
  watchFieldsRef: React.MutableRefObject<InternalNameSet>;
  isFormDirty: <TName extends InternalFieldName, TData>(
    name?: TName,
    data?: TData,
  ) => boolean;
  fieldArrayValuesRef: FieldArrayDefaultValues;
  formStateRef: React.MutableRefObject<FormState<TFieldValues>>;
  formStateSubjectRef: React.MutableRefObject<
    SubjectType<Partial<FormState<TFieldValues>>>
  >;
  watchSubjectRef: React.MutableRefObject<
    SubjectType<{
      name?: InternalFieldName;
      value?: unknown;
    }>
  >;
  controllerSubjectRef: React.MutableRefObject<
    SubjectType<DefaultValues<TFieldValues>>
  >;
  fieldArraySubjectRef: React.MutableRefObject<
    SubjectType<{
      name?: string;
      fields: unknown;
      isReset?: boolean;
    }>
  >;
  updateIsValid: (fieldsValues: FieldValues) => void;
  validFieldsRef: React.MutableRefObject<FieldNamesMarkedBoolean<TFieldValues>>;
  fieldsWithValidationRef: React.MutableRefObject<
    FieldNamesMarkedBoolean<TFieldValues>
  >;
  fieldsRef: React.MutableRefObject<FieldRefs>;
  fieldArrayNamesRef: React.MutableRefObject<InternalNameSet>;
  readFormStateRef: React.MutableRefObject<ReadFormState>;
  defaultValuesRef: React.MutableRefObject<DefaultValues<TFieldValues>>;
  watchInternal: <T>(
    fieldNames?: InternalFieldName | InternalFieldName[],
    defaultValue?: T,
    isGlobal?: boolean,
  ) => unknown;
} & UseFormCommonMethods<TFieldValues>;

export type WatchObserver = <TFieldValues>(
  value: UnpackNestedValue<TFieldValues>,
  info: {
    name?: string;
    type?: EventType;
    value?: unknown;
  },
) => void;

export type UseFormMethods<TFieldValues extends FieldValues = FieldValues> = {
  watch: {
    (): UnpackNestedValue<TFieldValues>;
    <TName extends FieldPath<TFieldValues>>(
      fieldName: TName,
      defaultValue?: FieldPathValue<TFieldValues, TName>,
    ): FieldPathValue<TFieldValues, TName>;
    <TName extends FieldPath<TFieldValues>[]>(
      fieldName: TName,
      defaultValue?: FieldPathValues<TFieldValues, TName>,
    ): FieldPathValues<TFieldValues, TName>;
    (
      callback: WatchObserver,
      defaultValues?: UnpackNestedValue<DeepPartial<TFieldValues>>,
    ): Subscription;
  };
  getValues: {
    (): UnpackNestedValue<TFieldValues>;
    <TName extends FieldPath<TFieldValues>>(fieldName: TName): FieldPathValue<
      TFieldValues,
      TName
    >;
    <TName extends FieldPath<TFieldValues>[]>(
      fieldNames: TName,
    ): FieldPathValues<TFieldValues, TName>;
  };
  setError: (name: FieldName<TFieldValues>, error: ErrorOption) => void;
  clearErrors: (
    name?: FieldName<TFieldValues> | FieldName<TFieldValues>[],
  ) => void;
  setValue: (
    name: FieldName<TFieldValues>,
    value: SetFieldValue<TFieldValues>,
    config?: SetValueConfig,
  ) => void;
  trigger: (name?: FieldName<TFieldValues> | FieldName<TFieldValues>[]) => void;
  formState: FormState<TFieldValues>;
  reset: (
    values?: UnpackNestedValue<DeepPartial<TFieldValues>>,
    keepStateOptions?: KeepStateOptions,
  ) => void;
  handleSubmit: <TSubmitFieldValues extends FieldValues = TFieldValues>(
    onValid: SubmitHandler<TSubmitFieldValues>,
    onInvalid?: SubmitErrorHandler<TFieldValues>,
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  control: Control<TFieldValues>;
} & UseFormCommonMethods<TFieldValues>;

export type UseFormStateProps<TFieldValues> = Partial<{
  control?: Control<TFieldValues>;
}>;

export type UseFormStateMethods<TFieldValues> = FormState<TFieldValues>;

export type UseWatchProps<TFieldValues extends FieldValues = FieldValues> = {
  defaultValue?: unknown;
  name?: FieldPath<TFieldValues> | FieldPath<TFieldValues>[];
  control?: Control<TFieldValues>;
};

export type FormProviderProps<
  TFieldValues extends FieldValues = FieldValues
> = {
  children: React.ReactNode;
} & UseFormMethods<TFieldValues>;
