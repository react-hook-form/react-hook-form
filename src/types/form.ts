import * as React from 'react';

import { SubjectType, Subscription } from '../utils/Subject';

import { ErrorOption, FieldErrors } from './errors';
import { EventType } from './events';
import { FieldArrayDefaultValues } from './fieldArray';
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
} from './utils';
import { RegisterOptions } from './validator';

declare const $NestedValue: unique symbol;

export type NestedValue<
  TValue extends unknown[] | Record<string, unknown> | Map<unknown, unknown> =
    | unknown[]
    | Record<string, unknown>,
> = {
  [$NestedValue]: never;
} & TValue;

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
}>;

export type TriggerConfig = Partial<{
  shouldFocus: boolean;
}>;

export type ChangeHandler = (event: any) => Promise<void | boolean>;

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
  criteriaMode: CriteriaMode;
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
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  name: TFieldName,
  options?: RegisterOptions<TFieldValues, TFieldName>,
) => RegisterOptions<TFieldValues, TFieldName>['shouldListen'] extends undefined
  ? UseFormRegisterReturn
  : any;

export type UseFormSetFocus<TFieldValues extends FieldValues> = <
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  name: TFieldName,
) => void;

export type UseFormGetValues<TFieldValues extends FieldValues> = {
  (): UnpackNestedValue<TFieldValues>;
  <TFieldName extends FieldPath<TFieldValues>>(
    fieldName: TFieldName,
  ): FieldPathValue<TFieldValues, TFieldName>;
  <TFieldNames extends FieldPath<TFieldValues>[]>(
    fieldNames: readonly [...TFieldNames],
  ): [...FieldPathValues<TFieldValues, TFieldNames>];
  <TFieldNames extends readonly FieldPath<TFieldValues>[]>(
    fieldNames: readonly [...TFieldNames],
  ): [...FieldPathValues<TFieldValues, TFieldNames>];
};

export type UseFormWatch<TFieldValues extends FieldValues> = {
  (): UnpackNestedValue<TFieldValues>;
  <TFieldNames extends FieldPath<TFieldValues>[]>(
    fieldNames: readonly [...TFieldNames],
    defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): [...FieldPathValues<TFieldValues, TFieldNames>];
  <TFieldNames extends readonly FieldPath<TFieldValues>[]>(
    fieldNames: readonly [...TFieldNames],
    defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): [...FieldPathValues<TFieldValues, TFieldNames>];
  <
    T1 extends FieldPath<TFieldValues>,
    T2 extends FieldPath<TFieldValues>,
    T3 extends FieldPath<TFieldValues>,
    T4 extends FieldPath<TFieldValues>,
    T5 extends FieldPath<TFieldValues>,
    T6 extends FieldPath<TFieldValues>,
    T7 extends FieldPath<TFieldValues>,
    T8 extends FieldPath<TFieldValues>,
    T9 extends FieldPath<TFieldValues>,
    T10 extends FieldPath<TFieldValues>,
  >(
    fieldNames: readonly [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10],
    defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): [
    FieldPathValue<TFieldValues, T1>,
    FieldPathValue<TFieldValues, T2>,
    FieldPathValue<TFieldValues, T3>,
    FieldPathValue<TFieldValues, T4>,
    FieldPathValue<TFieldValues, T5>,
    FieldPathValue<TFieldValues, T6>,
    FieldPathValue<TFieldValues, T7>,
    FieldPathValue<TFieldValues, T8>,
    FieldPathValue<TFieldValues, T9>,
    FieldPathValue<TFieldValues, T10>,
  ];
  <TFieldName extends FieldPath<TFieldValues>>(
    fieldName: TFieldName,
    defaultValue?: FieldPathValue<TFieldValues, TFieldName>,
  ): FieldPathValue<TFieldValues, TFieldName>;
  <
    T1 extends FieldPath<TFieldValues>,
    T2 extends FieldPath<TFieldValues>,
    T3 extends FieldPath<TFieldValues>,
    T4 extends FieldPath<TFieldValues>,
    T5 extends FieldPath<TFieldValues>,
    T6 extends FieldPath<TFieldValues>,
    T7 extends FieldPath<TFieldValues>,
    T8 extends FieldPath<TFieldValues>,
    T9 extends FieldPath<TFieldValues>,
  >(
    fieldNames: readonly [T1, T2, T3, T4, T5, T6, T7, T8, T9],
    defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): [
    FieldPathValue<TFieldValues, T1>,
    FieldPathValue<TFieldValues, T2>,
    FieldPathValue<TFieldValues, T3>,
    FieldPathValue<TFieldValues, T4>,
    FieldPathValue<TFieldValues, T5>,
    FieldPathValue<TFieldValues, T6>,
    FieldPathValue<TFieldValues, T7>,
    FieldPathValue<TFieldValues, T8>,
    FieldPathValue<TFieldValues, T9>,
  ];
  <TFieldName extends FieldPath<TFieldValues>>(
    fieldName: TFieldName,
    defaultValue?: FieldPathValue<TFieldValues, TFieldName>,
  ): FieldPathValue<TFieldValues, TFieldName>;
  <
    T1 extends FieldPath<TFieldValues>,
    T2 extends FieldPath<TFieldValues>,
    T3 extends FieldPath<TFieldValues>,
    T4 extends FieldPath<TFieldValues>,
    T5 extends FieldPath<TFieldValues>,
    T6 extends FieldPath<TFieldValues>,
    T7 extends FieldPath<TFieldValues>,
    T8 extends FieldPath<TFieldValues>,
  >(
    fieldNames: readonly [T1, T2, T3, T4, T5, T6, T7, T8],
    defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): [
    FieldPathValue<TFieldValues, T1>,
    FieldPathValue<TFieldValues, T2>,
    FieldPathValue<TFieldValues, T3>,
    FieldPathValue<TFieldValues, T4>,
    FieldPathValue<TFieldValues, T5>,
    FieldPathValue<TFieldValues, T6>,
    FieldPathValue<TFieldValues, T7>,
    FieldPathValue<TFieldValues, T8>,
  ];
  <TFieldName extends FieldPath<TFieldValues>>(
    fieldName: TFieldName,
    defaultValue?: FieldPathValue<TFieldValues, TFieldName>,
  ): FieldPathValue<TFieldValues, TFieldName>;
  <
    T1 extends FieldPath<TFieldValues>,
    T2 extends FieldPath<TFieldValues>,
    T3 extends FieldPath<TFieldValues>,
    T4 extends FieldPath<TFieldValues>,
    T5 extends FieldPath<TFieldValues>,
    T6 extends FieldPath<TFieldValues>,
    T7 extends FieldPath<TFieldValues>,
  >(
    fieldNames: readonly [T1, T2, T3, T4, T5, T6, T7],
    defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): [
    FieldPathValue<TFieldValues, T1>,
    FieldPathValue<TFieldValues, T2>,
    FieldPathValue<TFieldValues, T3>,
    FieldPathValue<TFieldValues, T4>,
    FieldPathValue<TFieldValues, T5>,
    FieldPathValue<TFieldValues, T6>,
    FieldPathValue<TFieldValues, T7>,
  ];
  <TFieldName extends FieldPath<TFieldValues>>(
    fieldName: TFieldName,
    defaultValue?: FieldPathValue<TFieldValues, TFieldName>,
  ): FieldPathValue<TFieldValues, TFieldName>;
  <
    T1 extends FieldPath<TFieldValues>,
    T2 extends FieldPath<TFieldValues>,
    T3 extends FieldPath<TFieldValues>,
    T4 extends FieldPath<TFieldValues>,
    T5 extends FieldPath<TFieldValues>,
    T6 extends FieldPath<TFieldValues>,
  >(
    fieldNames: readonly [T1, T2, T3, T4, T5, T6],
    defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): [
    FieldPathValue<TFieldValues, T1>,
    FieldPathValue<TFieldValues, T2>,
    FieldPathValue<TFieldValues, T3>,
    FieldPathValue<TFieldValues, T4>,
    FieldPathValue<TFieldValues, T5>,
    FieldPathValue<TFieldValues, T6>,
  ];
  <TFieldName extends FieldPath<TFieldValues>>(
    fieldName: TFieldName,
    defaultValue?: FieldPathValue<TFieldValues, TFieldName>,
  ): FieldPathValue<TFieldValues, TFieldName>;
  <
    T1 extends FieldPath<TFieldValues>,
    T2 extends FieldPath<TFieldValues>,
    T3 extends FieldPath<TFieldValues>,
    T4 extends FieldPath<TFieldValues>,
    T5 extends FieldPath<TFieldValues>,
  >(
    fieldNames: readonly [T1, T2, T3, T4, T5],
    defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): [
    FieldPathValue<TFieldValues, T1>,
    FieldPathValue<TFieldValues, T2>,
    FieldPathValue<TFieldValues, T3>,
    FieldPathValue<TFieldValues, T4>,
    FieldPathValue<TFieldValues, T5>,
  ];
  <TFieldName extends FieldPath<TFieldValues>>(
    fieldName: TFieldName,
    defaultValue?: FieldPathValue<TFieldValues, TFieldName>,
  ): FieldPathValue<TFieldValues, TFieldName>;
  <
    T1 extends FieldPath<TFieldValues>,
    T2 extends FieldPath<TFieldValues>,
    T3 extends FieldPath<TFieldValues>,
    T4 extends FieldPath<TFieldValues>,
  >(
    fieldNames: readonly [T1, T2, T3, T4],
    defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): [
    FieldPathValue<TFieldValues, T1>,
    FieldPathValue<TFieldValues, T2>,
    FieldPathValue<TFieldValues, T3>,
    FieldPathValue<TFieldValues, T4>,
  ];
  <TFieldName extends FieldPath<TFieldValues>>(
    fieldName: TFieldName,
    defaultValue?: FieldPathValue<TFieldValues, TFieldName>,
  ): FieldPathValue<TFieldValues, TFieldName>;
  <
    T1 extends FieldPath<TFieldValues>,
    T2 extends FieldPath<TFieldValues>,
    T3 extends FieldPath<TFieldValues>,
  >(
    fieldNames: readonly [T1, T2, T3],
    defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): [
    FieldPathValue<TFieldValues, T1>,
    FieldPathValue<TFieldValues, T2>,
    FieldPathValue<TFieldValues, T3>,
  ];
  <TFieldName extends FieldPath<TFieldValues>>(
    fieldName: TFieldName,
    defaultValue?: FieldPathValue<TFieldValues, TFieldName>,
  ): FieldPathValue<TFieldValues, TFieldName>;
  <T1 extends FieldPath<TFieldValues>, T2 extends FieldPath<TFieldValues>>(
    fieldNames: readonly [T1, T2],
    defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): [FieldPathValue<TFieldValues, T1>, FieldPathValue<TFieldValues, T2>];
  <TFieldName extends FieldPath<TFieldValues>>(
    fieldName: TFieldName,
    defaultValue?: FieldPathValue<TFieldValues, TFieldName>,
  ): FieldPathValue<TFieldValues, TFieldName>;
  <
    TFieldNames extends
      | FieldPath<TFieldValues>[]
      | readonly FieldPath<TFieldValues>[],
  >(
    fieldNames: TFieldNames,
    defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): FieldPathValues<TFieldValues, TFieldNames>;
  (
    callback: WatchObserver<TFieldValues>,
    defaultValues?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): Subscription;
};

export type UseFormTrigger<TFieldValues extends FieldValues> = (
  name?:
    | FieldPath<TFieldValues>
    | FieldPath<TFieldValues>[]
    | readonly FieldPath<TFieldValues>[],
  options?: TriggerConfig,
) => Promise<boolean>;

export type UseFormClearErrors<TFieldValues extends FieldValues> = (
  name?:
    | FieldPath<TFieldValues>
    | FieldPath<TFieldValues>[]
    | readonly FieldPath<TFieldValues>[],
) => void;

export type UseFormSetValue<TFieldValues extends FieldValues> = <
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  name: TFieldName,
  value: UnpackNestedValue<FieldPathValue<TFieldValues, TFieldName>>,
  options?: SetValueConfig,
) => void;

export type UseFormSetError<TFieldValues extends FieldValues> = (
  name: FieldPath<TFieldValues>,
  error: ErrorOption,
  options?: {
    shouldFocus: boolean;
  },
) => void;

export type UseFormUnregister<TFieldValues extends FieldValues> = (
  name?:
    | FieldPath<TFieldValues>
    | FieldPath<TFieldValues>[]
    | readonly FieldPath<TFieldValues>[],
  options?: Omit<
    KeepStateOptions,
    | 'keepIsSubmitted'
    | 'keepSubmitCount'
    | 'keepValues'
    | 'keepDefaultValues'
    | 'keepErrors'
  > & { keepValue?: boolean; keepDefaultValue?: boolean; keepError?: boolean },
) => void;

export type UseFormInternalUnregister<TFieldValues extends FieldValues> = (
  name?:
    | FieldPath<TFieldValues>
    | FieldPath<TFieldValues>[]
    | readonly FieldPath<TFieldValues>[],
  options?: Omit<
    KeepStateOptions,
    | 'keepIsSubmitted'
    | 'keepSubmitCount'
    | 'keepValues'
    | 'keepDefaultValues'
    | 'keepErrors'
  > & { keepValue?: boolean; keepDefaultValue?: boolean; keepError?: boolean },
  notify?: boolean,
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

export type WatchInternal<TFieldValues> = (
  fieldNames?: InternalFieldName | InternalFieldName[],
  defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  isGlobal?: boolean,
  formValues?: unknown,
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

export type Subjects<TFieldValues extends FieldValues = FieldValues> =
  React.MutableRefObject<{
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
      isReset?: boolean;
    }>;
    state: FormStateSubjectRef<TFieldValues>;
  }>;

export type Names = {
  mount: InternalNameSet;
  unMount: InternalNameSet;
  array: InternalNameSet;
  watch: InternalNameSet;
  watchAll: boolean;
};

export type Control<TFieldValues extends FieldValues = FieldValues> = {
  shouldUnmount?: boolean;
  subjectsRef: Subjects<TFieldValues>;
  namesRef: React.MutableRefObject<Names>;
  inFieldArrayActionRef: React.MutableRefObject<boolean>;
  getIsDirty: GetIsDirty;
  fieldArrayDefaultValuesRef: FieldArrayDefaultValues;
  formStateRef: React.MutableRefObject<FormState<TFieldValues>>;
  updateIsValid: <T extends FieldValues>(payload?: T) => void;
  fieldsRef: React.MutableRefObject<FieldRefs>;
  readFormStateRef: React.MutableRefObject<ReadFormState>;
  defaultValuesRef: React.MutableRefObject<DefaultValues<TFieldValues>>;
  watchInternal: WatchInternal<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  unregister: UseFormUnregister<TFieldValues>;
};

export type WatchObserver<TFieldValues> = (
  value: UnpackNestedValue<TFieldValues>,
  info: {
    name?: string;
    type?: EventType;
    value?: unknown;
  },
) => void;

export type UseFormReturn<TFieldValues extends FieldValues = FieldValues> = {
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
  control: Control<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  setFocus: UseFormSetFocus<TFieldValues>;
  listen: any;
};

export type UseFormStateProps<TFieldValues> = Partial<{
  control?: Control<TFieldValues>;
  name?:
    | FieldPath<TFieldValues>
    | FieldPath<TFieldValues>[]
    | readonly FieldPath<TFieldValues>[];
}>;

export type UseFormStateReturn<TFieldValues> = FormState<TFieldValues>;

export type UseWatchProps<TFieldValues extends FieldValues = FieldValues> = {
  defaultValue?: unknown;
  name?:
    | FieldPath<TFieldValues>
    | FieldPath<TFieldValues>[]
    | readonly FieldPath<TFieldValues>[];
  control?: Control<TFieldValues>;
};

export type FormProviderProps<TFieldValues extends FieldValues = FieldValues> =
  {
    children: React.ReactNode;
  } & UseFormReturn<TFieldValues>;
