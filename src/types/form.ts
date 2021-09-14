import * as React from 'react';

import { SubjectType, Subscription } from '../utils/Subject';

import { ErrorOption, FieldError, FieldErrors } from './errors';
import { EventType } from './events';
import { FieldArrayWithId } from './fieldArray';
import {
  FieldRefs,
  FieldValue,
  FieldValues,
  InternalFieldName,
} from './fields';
import { Resolver } from './resolvers';
import {
  DeepMap,
  DeepPartial,
  FieldPath,
  FieldPathValue,
  FieldPathValues,
  UnionLike,
} from './utils';
import { RegisterOptions } from './validator';

declare const $NestedValue: unique symbol;

export type NestedValue<TValue extends object = object> = {
  [$NestedValue]: never;
} & TValue;

export type UnpackNestedValue<T> = T extends NestedValue<infer U>
  ? U
  : T extends Date | FileList | File
  ? T
  : T extends object
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

export type CriteriaMode = 'firstError' | 'all';

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
  shouldTouch: boolean;
}>;

export type TriggerConfig = Partial<{
  shouldFocus: boolean;
}>;

export type ChangeHandler = (event: {
  target: any;
  type?: any;
}) => Promise<void | boolean>;

export type DelayCallback = (
  name: InternalFieldName,
  error: FieldError,
) => void;

export type UseFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object,
> = Partial<{
  mode: Mode;
  reValidateMode: Exclude<Mode, 'onTouched' | 'all'>;
  defaultValues: DefaultValues<TFieldValues>;
  resolver: Resolver<TFieldValues, TContext>;
  context: TContext;
  shouldFocusError: boolean;
  shouldUnregister: boolean;
  shouldUseNativeValidation: boolean;
  criteriaMode: CriteriaMode;
  delayError: number;
}>;

export type FieldNamesMarkedBoolean<TFieldValues extends FieldValues> = DeepMap<
  DeepPartial<UnionLike<TFieldValues>>,
  true
>;

export type FormStateProxy<TFieldValues extends FieldValues = FieldValues> = {
  isDirty: boolean;
  isValidating: boolean;
  dirtyFields: FieldNamesMarkedBoolean<TFieldValues>;
  touchedFields: FieldNamesMarkedBoolean<TFieldValues>;
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
  keepDirty: boolean;
  keepValues: boolean;
  keepDefaultValues: boolean;
  keepIsSubmitted: boolean;
  keepTouched: boolean;
  keepIsValid: boolean;
  keepSubmitCount: boolean;
}>;

export type SetFieldValue<TFieldValues> = FieldValue<TFieldValues>;

export type RefCallBack = (instance: any) => void;

export type UseFormRegisterReturn = {
  onChange: ChangeHandler;
  onBlur: ChangeHandler;
  ref: RefCallBack;
  name: InternalFieldName;
};

export type UseFormRegister<TFieldValues extends FieldValues> = <
  TFieldName extends FieldPath<TFieldValues, any> = FieldPath<
    TFieldValues,
    any
  >,
>(
  name: TFieldName,
  options?: RegisterOptions<TFieldValues, TFieldName>,
) => UseFormRegisterReturn;

export type UseFormSetFocus<TFieldValues extends FieldValues> = <
  TFieldName extends FieldPath<TFieldValues, any> = FieldPath<
    TFieldValues,
    any
  >,
>(
  name: TFieldName,
) => void;

export type UseFormGetValues<TFieldValues extends FieldValues> = {
  (): UnpackNestedValue<TFieldValues>;
  <TFieldName extends FieldPath<TFieldValues, any>>(
    name: TFieldName,
  ): FieldPathValue<TFieldValues, TFieldName>;
  <TFieldNames extends FieldPath<TFieldValues, any>[]>(
    names: readonly [...TFieldNames],
  ): [...FieldPathValues<TFieldValues, TFieldNames>];
};

export type UseFormWatch<TFieldValues extends FieldValues> = {
  (): UnpackNestedValue<TFieldValues>;
  <TResult, TFieldName extends FieldPath<TFieldValues, TResult>>(
    name: TFieldName,
    defaultValue?: TResult,
  ): FieldPathValue<TFieldValues, TFieldName>;
  <TResult, TFieldNames extends readonly FieldPath<TFieldValues, TResult>[]>(
    names: readonly [...TFieldNames],
    defaultValue?: TResult,
  ): FieldPathValues<TFieldValues, TFieldNames>;
  <TResult>(
    callback: WatchObserver<TFieldValues, TResult>,
    defaultValues?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): Subscription;
};

export type UseFormTrigger<TFieldValues extends FieldValues> = (
  name?:
    | FieldPath<TFieldValues, any>
    | FieldPath<TFieldValues, any>[]
    | readonly FieldPath<TFieldValues, any>[],
  options?: TriggerConfig,
) => Promise<boolean>;

export type UseFormClearErrors<TFieldValues extends FieldValues> = (
  name?:
    | FieldPath<TFieldValues, any>
    | FieldPath<TFieldValues, any>[]
    | readonly FieldPath<TFieldValues, any>[],
) => void;

export type UseFormSetValue<TFieldValues extends FieldValues> = <
  TResult,
  TFieldName extends FieldPath<TFieldValues, TResult> = FieldPath<
    TFieldValues,
    TResult
  >,
>(
  name: TFieldName,
  value: TResult,
  options?: SetValueConfig,
) => void;

export type UseFormSetError<TFieldValues extends FieldValues> = (
  name: FieldPath<TFieldValues, any>,
  error: ErrorOption,
  options?: {
    shouldFocus: boolean;
  },
) => void;

export type UseFormUnregister<TFieldValues extends FieldValues> = (
  name?:
    | FieldPath<TFieldValues, any>
    | FieldPath<TFieldValues, any>[]
    | readonly FieldPath<TFieldValues, any>[],
  options?: Omit<
    KeepStateOptions,
    | 'keepIsSubmitted'
    | 'keepSubmitCount'
    | 'keepValues'
    | 'keepDefaultValues'
    | 'keepErrors'
  > & { keepValue?: boolean; keepDefaultValue?: boolean; keepError?: boolean },
) => void;

export type UseFormHandleSubmit<TFieldValues extends FieldValues> = <
  TSubmitFieldValues extends FieldValues = TFieldValues,
>(
  onValid: SubmitHandler<TSubmitFieldValues>,
  onInvalid?: SubmitErrorHandler<TFieldValues>,
) => (e?: React.BaseSyntheticEvent) => Promise<void>;

export type UseFormReset<TFieldValues extends FieldValues> = (
  values?: DefaultValues<TFieldValues>,
  keepStateOptions?: KeepStateOptions,
) => void;

export type WatchInternal<TFieldValues, TResult> = (
  fieldNames?:
    | FieldPath<TFieldValues, TResult>
    | ReadonlyArray<FieldPath<TFieldValues, TResult>>
    | WatchObserver<TFieldValues, TResult>,
  defaultValue?: TResult,
  isMounted?: boolean,
  isGlobal?: boolean,
) =>
  | FieldPathValue<FieldValues, InternalFieldName>
  | FieldPathValues<FieldValues, InternalFieldName[]>;

export type GetIsDirty = <TName extends InternalFieldName, TData>(
  name?: TName,
  data?: TData,
) => boolean;

export type FormStateSubjectRef<TFieldValues> = SubjectType<
  Partial<FormState<TFieldValues>> & { name?: InternalFieldName }
>;

export type Subjects<TFieldValues extends FieldValues = FieldValues> = {
  watch: SubjectType<{
    name?: InternalFieldName;
    type?: EventType;
    values?: FieldValues;
  }>;
  control: SubjectType<{
    name?: InternalFieldName;
    values?: FieldValues;
  }>;
  array: SubjectType<{
    name?: InternalFieldName;
    values?: FieldValues;
  }>;
  state: FormStateSubjectRef<TFieldValues>;
};

export type Names = {
  mount: InternalNameSet;
  unMount: InternalNameSet;
  array: InternalNameSet;
  watch: InternalNameSet;
  focus: InternalFieldName;
  watchAll: boolean;
};

export type BatchFieldArrayUpdate = <
  T extends Function,
  TResult = unknown,
  TKeyName extends string = 'id',
>(
  keyName: TKeyName,
  name: InternalFieldName,
  method: T,
  args: {
    argA?: unknown;
    argB?: unknown;
  },
  updatedFieldArrayValues?: Partial<FieldArrayWithId<TResult, TKeyName>>[],
  shouldSetValue?: boolean,
  shouldSetFields?: boolean,
) => void;

export type Control<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object,
> = {
  _shouldUnregister?: boolean;
  _subjects: Subjects<TFieldValues>;
  _removeFields: () => void;
  _names: Names;
  _isMounted: boolean;
  _updateProps: (props: UseFormProps<TFieldValues, TContext>) => void;
  _isInAction: boolean;
  _getIsDirty: GetIsDirty;
  _formState: FormState<TFieldValues>;
  _updateValid: () => void;
  _fields: FieldRefs;
  _formValues: FieldValues;
  _proxyFormState: ReadFormState;
  _defaultValues: Partial<DefaultValues<TFieldValues>>;
  _getWatch: WatchInternal<TFieldValues, any>;
  register: UseFormRegister<TFieldValues>;
  _updateFieldArray: BatchFieldArrayUpdate;
  _getFieldArrayValue: <TFieldArrayValues>(
    name: InternalFieldName,
  ) => Partial<TFieldArrayValues>[];
  unregister: UseFormUnregister<TFieldValues>;
};

export type WatchObserver<TFieldValues, TResult> = (
  value: TResult,
  info: {
    name?: FieldPath<TFieldValues, TResult>;
    type?: EventType;
    value?: unknown;
  },
) => void;

export type UseFormReturn<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object,
> = {
  watch: UseFormWatch<TFieldValues>;
  getValues: UseFormGetValues<TFieldValues>;
  setError: UseFormSetError<TFieldValues>;
  clearErrors: UseFormClearErrors<TFieldValues>;
  setValue: UseFormSetValue<TFieldValues>;
  trigger: UseFormTrigger<TFieldValues>;
  formState: FormState<TFieldValues>;
  reset: UseFormReset<TFieldValues>;
  handleSubmit: UseFormHandleSubmit<TFieldValues>;
  unregister: UseFormUnregister<TFieldValues>;
  control: Control<TFieldValues, TContext>;
  register: UseFormRegister<TFieldValues>;
  setFocus: UseFormSetFocus<TFieldValues>;
};

export type UseFormStateProps<TFieldValues, TResult> = Partial<{
  control?: Control<TFieldValues>;
  disabled?: boolean;
  name?:
    | FieldPath<TFieldValues, TResult>
    | FieldPath<TFieldValues, TResult>[]
    | readonly FieldPath<TFieldValues, TResult>[];
}>;

export type UseFormStateReturn<TFieldValues> = FormState<TFieldValues>;

export type UseWatchProps<
  TFieldValues extends FieldValues = FieldValues,
  TResult = unknown,
> = {
  defaultValue?: unknown;
  disabled?: boolean;
  name?:
    | FieldPath<TFieldValues, TResult>
    | FieldPath<TFieldValues, TResult>[]
    | readonly FieldPath<TFieldValues, TResult>[];
  control?: Control<TFieldValues>;
};

export type FormProviderProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object,
> = {
  children: React.ReactNode;
} & UseFormReturn<TFieldValues, TContext>;
