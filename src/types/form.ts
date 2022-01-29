import React from 'react';

import { Subject, Subscription } from '../utils/createSubject';

import { ErrorOption, FieldError, FieldErrors } from './errors';
import { EventType } from './events';
import { FieldArray } from './fieldArray';
import {
  FieldRefs,
  FieldValue,
  FieldValues,
  InternalFieldName,
} from './fields';
import {
  FieldArrayPath,
  FieldPath,
  FieldPathValue,
  FieldPathValues,
} from './path';
import { Resolver } from './resolvers';
import { DeepMap, DeepPartial, Noop } from './utils';
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
  DeepPartial<TFieldValues>,
  boolean
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
  min?: string | number;
  max?: string | number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  required?: boolean;
  disabled?: boolean;
};

/**
 * Register field into hook form with or without actual DOM ref. You can invoke register
 * before render function or at useEffect as well.
 *
 * [API](https://react-hook-form.com/api/useform/register) • [Demo](https://codesandbox.io/s/react-hook-form-register-ts-ip2j3) • [Video](https://www.youtube.com/watch?v=JFIpCoajYkA)
 *
 * @param name - field name and the path to the form field value, name is required and unique
 * @param options - register options include validation, disabled, unregister, valueAs and deps validation
 * @return onChange, onBlur, name and ref
 *
 * @example
 * ```tsx
 * // Register HTML native input
 * <input {...register("name")} />
 * <input {...register("name1", { required: "This is required.", maxLength: 20 })} />
 * <input type="number" {...register("name2", { valueAsNumber: true })} />
 * <input {...register("name3", { deps: ["name2"] })} />
 *
 * // Register custom field at useEffect
 * useEffect(() => {
 *   register("name4");
 *   register("name5", { value: '"hiddenValue" });
 * }, [register])
 *
 * // Register before render without ref
 * const { onChange, onBlur } = register("name6")
 * <input onChange={onChange} onBlur={onBlur} />
 * ```
 */
export type UseFormRegister<TFieldValues extends FieldValues> = <
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  name: TFieldName,
  options?: RegisterOptions<TFieldValues, TFieldName>,
) => UseFormRegisterReturn;

/**
 * Set focus on a field. You can start invoke this method after fields are mounted to the DOM.
 *
 * [API](https://react-hook-form.com/api/useform/setfocus) • [Demo](https://codesandbox.io/s/setfocus-rolus)
 *
 * @param name - field name and the path to the form field value
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   setFocus("name");
 * }, [setFocus])
 *
 * <button onClick={() => setFocus("name")}>Focus</button>
 * ```
 */
export type UseFormSetFocus<TFieldValues extends FieldValues> = <
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  name: TFieldName,
) => void;

export type UseFormGetValues<TFieldValues extends FieldValues> = {
  /**
   * Get the entire current form values when no argument is supplied to this function.
   *
   * [API](https://react-hook-form.com/api/useform/getvalues) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-getvalues-txsfg)
   *
   * @return the entire form values
   *
   * @example
   * ```tsx
   * <button onClick={() => getValues()}>get all fields</button>
   * ```
   */
  (): UnpackNestedValue<TFieldValues>;
  /**
   * Get a single field value.
   *
   * [API](https://react-hook-form.com/api/useform/getvalues) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-getvalues-txsfg)
   *
   * @param name - field name and the path to the form field value
   *
   * @return the single field value
   *
   * @example
   * ```tsx
   * <button onClick={() => getValues("name")}>get single field</button>
   * ```
   */
  <TFieldName extends FieldPath<TFieldValues>>(
    name: TFieldName,
  ): FieldPathValue<TFieldValues, TFieldName>;
  /**
   * Get an array of field values.
   *
   * [API](https://react-hook-form.com/api/useform/getvalues) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-getvalues-txsfg)
   *
   * @param names - an array of field names
   *
   * @return An array of field values
   *
   * @example
   * ```tsx
   * <button onClick={() => getValues(["name", "name1"])}>get array of fields</button>
   * ```
   */
  <TFieldNames extends FieldPath<TFieldValues>[]>(
    names: readonly [...TFieldNames],
  ): [...FieldPathValues<TFieldValues, TFieldNames>];
};

/**
 * This method will return individual field state. It will be useful when you are try to retrieve nested value field state in a typesafe approach.
 *
 * [API](https://react-hook-form.com/api/useform/getfieldstate) • [Demo](https://codesandbox.io/s/getfieldstate-jvekk)
 *
 * @param name - field name and the path to the form field value
 *
 * @return invalid, isDirty, isTouched and error object
 *
 * @example
 * ```tsx
 * const { formState: { dirtyFields, errors, touchedFields } } = formState();
 * getFieldState('name')
 *
 * // Get field state when form state is not subscribed yet
 * getFieldState('name', formState)
 * ```
 */
export type UseFormGetFieldState<TFieldValues extends FieldValues> = <
  TFieldName extends FieldPath<TFieldValues>,
>(
  name: TFieldName,
  formState?: FormState<TFieldValues>,
) => {
  invalid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  error?: FieldError;
};

export type UseFormWatch<TFieldValues extends FieldValues> = {
  /**
   * Watch and subscribe then entire form update/change based on onChange and re-render at the useForm.
   *
   * [API](https://react-hook-form.com/api/useform/watch) • [Demo](https://codesandbox.io/s/react-hook-form-watch-v7-ts-8et1d) • [Video](https://www.youtube.com/watch?v=3qLd69WMqKk)
   *
   * @return return the entire form values
   *
   * @example
   * ```tsx
   * const formValues = watch()
   * ```
   */
  (): UnpackNestedValue<TFieldValues>;
  /**
   * Watch and subscribe to an array of fields
   *
   * [API](https://react-hook-form.com/api/useform/watch) • [Demo](https://codesandbox.io/s/react-hook-form-watch-v7-ts-8et1d) • [Video](https://www.youtube.com/watch?v=3qLd69WMqKk)
   *
   * @param names - an array of field names
   * @param defaultValue - defaultValues for the entire form
   *
   * @return return an array of field values
   *
   * @example
   * ```tsx
   * const [name, name1] = watch(['name', 'name1'])
   * ```
   */
  <TFieldNames extends readonly FieldPath<TFieldValues>[]>(
    names: readonly [...TFieldNames],
    defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): FieldPathValues<TFieldValues, TFieldNames>;
  /**
   * Watch a single field update
   *
   * [API](https://react-hook-form.com/api/useform/watch) • [Demo](https://codesandbox.io/s/react-hook-form-watch-v7-ts-8et1d) • [Video](https://www.youtube.com/watch?v=3qLd69WMqKk)
   *
   * @param name - field name
   * @param defaultValue - defaultValues for the entire form
   *
   * @return return the single field value
   *
   * @example
   * ```tsx
   * const name = watch('name')
   * ```
   */
  <TFieldName extends FieldPath<TFieldValues>>(
    name: TFieldName,
    defaultValue?: FieldPathValue<TFieldValues, TFieldName>,
  ): FieldPathValue<TFieldValues, TFieldName>;
  /**
   * Subscribe to field update/change without trigger re-render
   *
   * [API](https://react-hook-form.com/api/useform/watch) • [Demo](https://codesandbox.io/s/react-hook-form-watch-v7-ts-8et1d) • [Video](https://www.youtube.com/watch?v=3qLd69WMqKk)
   *
   * @param callback - call back function to subscribe all fields change and return unsubscribe function
   * @param defaultValues - defaultValues for the entire form
   *
   * @returns unsubscribe function
   *
   * @example
   * ```tsx
   * useEffect(() => {
   *   const unsubscribe = watch(() => {});
   *   return () => unsubscribe();
   * }, [watch])
   * ```
   */
  (
    callback: WatchObserver<TFieldValues>,
    defaultValues?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): Subscription;
};

/**
 * Trigger field validation
 *
 * [API](https://react-hook-form.com/api/useform/trigger) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-triggervalidation-forked-xs7hl) • [Video](https://www.youtube.com/watch?v=-bcyJCDjksE)
 *
 * @param name - provide empty argument will trigger the entire form validation, an array of field names will validate an arrange of fields, and single field name will only trigger that field's validation
 * @param options - should focus on error field
 *
 * @return validation result
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   trigger();
 * }, [trigger])
 *
 * <button onClick={async () => {
 *   const result = await trigger();
 * }}>
 *  trigger
 *  </button>
 * ```
 */
export type UseFormTrigger<TFieldValues extends FieldValues> = (
  name?:
    | FieldPath<TFieldValues>
    | FieldPath<TFieldValues>[]
    | readonly FieldPath<TFieldValues>[],
  options?: TriggerConfig,
) => Promise<boolean>;

/**
 * Clear the entire form errors, this method will only impact errors form state.
 *
 * [API](https://react-hook-form.com/api/useform/clearerrors) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-clearerrors-w3ymx)
 *
 * @param name - provide empty payload will remove all field errors, an array will remove an array of fields errors and single field name will only remove that field's error state.
 *
 * @example
 * Clear all errors
 * ```tsx
 * clearErrors()
 * clearErrors(['name', 'name1'])
 * clearErrors('name2')
 * ```
 */
export type UseFormClearErrors<TFieldValues extends FieldValues> = (
  name?:
    | FieldPath<TFieldValues>
    | FieldPath<TFieldValues>[]
    | readonly FieldPath<TFieldValues>[],
) => void;

/**
 * Set a single field value, or a group of fields value.
 *
 * [API](https://react-hook-form.com/api/useform/setvalue) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-setvalue-8z9hx) • [Video](https://www.youtube.com/watch?v=qpv51sCH3fI)
 *
 * @param name - field name and the path to the form field value
 * @param value - field value
 * @param options - should validate or update form state
 *
 * @example
 * ```tsx
 * // Update a single field
 * setValue('name', 'value', {
 *   shouldValidate: true, // trigger validation
 *   shouldTOuch: true, // update touched fields form state
 *   shouldDirty: true, // update dirty and dirty fields form state
 * });
 *
 * // Update a group fields
 * setValue('root', {
 *   a: 'test', // setValue('root.a', 'data')
 *   b: 'test1', // setValue('root.b', 'data')
 * });
 *
 * // Update a nested object field
 * setValue('select', { label: 'test', value: 'Test' });
 */
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type UseFormHandleSubmit<TFieldValues extends FieldValues> = <_>(
  onValid: SubmitHandler<TFieldValues>,
  onInvalid?: SubmitErrorHandler<TFieldValues>,
) => (e?: React.BaseSyntheticEvent) => Promise<void>;

export type UseFormResetField<TFieldValues extends FieldValues> = <
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  name: TFieldName,
  options?: Partial<{
    keepDirty: boolean;
    keepTouched: boolean;
    keepError: boolean;
    defaultValue: any;
  }>,
) => void;

export type UseFormReset<TFieldValues extends FieldValues> = (
  values?: DefaultValues<TFieldValues> | UnpackNestedValue<TFieldValues>,
  keepStateOptions?: KeepStateOptions,
) => void;

export type WatchInternal<TFieldValues> = (
  fieldNames?: InternalFieldName | InternalFieldName[],
  defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  isMounted?: boolean,
  isGlobal?: boolean,
) =>
  | FieldPathValue<FieldValues, InternalFieldName>
  | FieldPathValues<FieldValues, InternalFieldName[]>;

export type GetIsDirty = <TName extends InternalFieldName, TData>(
  name?: TName,
  data?: TData,
) => boolean;

export type FormStateSubjectRef<TFieldValues> = Subject<
  Partial<FormState<TFieldValues>> & { name?: InternalFieldName }
>;

export type Subjects<TFieldValues extends FieldValues = FieldValues> = {
  watch: Subject<{
    name?: InternalFieldName;
    type?: EventType;
    values?: FieldValues;
  }>;
  array: Subject<{
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
  TFieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
>(
  name: InternalFieldName,
  updatedFieldArrayValues?: Partial<
    FieldArray<TFieldValues, TFieldArrayName>
  >[],
  method?: T,
  args?: Partial<{
    argA: unknown;
    argB: unknown;
  }>,
  shouldSetValue?: boolean,
  shouldUpdateFieldsAndErrors?: boolean,
) => void;

export type Control<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object,
> = {
  _subjects: Subjects<TFieldValues>;
  _removeUnmounted: Noop;
  _names: Names;
  _stateFlags: {
    mount: boolean;
    action: boolean;
    watch: boolean;
  };
  _options: UseFormProps<TFieldValues, TContext>;
  _getDirty: GetIsDirty;
  _formState: FormState<TFieldValues>;
  _updateValid: Noop;
  _fields: FieldRefs;
  _formValues: FieldValues;
  _proxyFormState: ReadFormState;
  _defaultValues: Partial<DefaultValues<TFieldValues>>;
  _getWatch: WatchInternal<TFieldValues>;
  _updateFieldArray: BatchFieldArrayUpdate;
  _getFieldArray: <TFieldArrayValues>(
    name: InternalFieldName,
  ) => Partial<TFieldArrayValues>[];
  _executeSchema: (
    names: InternalFieldName[],
  ) => Promise<{ errors: FieldErrors }>;
  register: UseFormRegister<TFieldValues>;
  unregister: UseFormUnregister<TFieldValues>;
  getFieldState: UseFormGetFieldState<TFieldValues>;
};

export type WatchObserver<TFieldValues> = (
  value: UnpackNestedValue<DeepPartial<TFieldValues>>,
  info: {
    name?: FieldPath<TFieldValues>;
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
  getFieldState: UseFormGetFieldState<TFieldValues>;
  setError: UseFormSetError<TFieldValues>;
  clearErrors: UseFormClearErrors<TFieldValues>;
  setValue: UseFormSetValue<TFieldValues>;
  trigger: UseFormTrigger<TFieldValues>;
  formState: FormState<TFieldValues>;
  resetField: UseFormResetField<TFieldValues>;
  reset: UseFormReset<TFieldValues>;
  handleSubmit: UseFormHandleSubmit<TFieldValues>;
  unregister: UseFormUnregister<TFieldValues>;
  control: Control<TFieldValues, TContext>;
  register: UseFormRegister<TFieldValues>;
  setFocus: UseFormSetFocus<TFieldValues>;
};

export type UseFormStateProps<TFieldValues> = Partial<{
  control?: Control<TFieldValues>;
  disabled?: boolean;
  name?:
    | FieldPath<TFieldValues>
    | FieldPath<TFieldValues>[]
    | readonly FieldPath<TFieldValues>[];
  exact?: boolean;
}>;

export type UseFormStateReturn<TFieldValues> = FormState<TFieldValues>;

export type UseWatchProps<TFieldValues extends FieldValues = FieldValues> = {
  defaultValue?: unknown;
  disabled?: boolean;
  name?:
    | FieldPath<TFieldValues>
    | FieldPath<TFieldValues>[]
    | readonly FieldPath<TFieldValues>[];
  control?: Control<TFieldValues>;
  exact?: boolean;
};

export type FormProviderProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object,
> = {
  children: React.ReactNode;
} & UseFormReturn<TFieldValues, TContext>;
