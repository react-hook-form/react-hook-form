import React from 'react';
import { Subject, Subscription } from '../utils/createSubject';
import { ErrorOption, FieldError, FieldErrors } from './errors';
import { EventType } from './events';
import { FieldArray } from './fieldArray';
import { FieldRefs, FieldValue, FieldValues, InternalFieldName } from './fields';
import { FieldArrayPath, FieldPath, FieldPathValue, FieldPathValues } from './path';
import { Resolver } from './resolvers';
import { DeepMap, DeepPartial, Noop } from './utils';
import { RegisterOptions } from './validator';
declare const $NestedValue: unique symbol;
export declare type NestedValue<TValue extends object = object> = {
    [$NestedValue]: never;
} & TValue;
export declare type UnpackNestedValue<T> = T extends NestedValue<infer U> ? U : T extends Date | FileList | File | Blob ? T : T extends object ? {
    [K in keyof T]: UnpackNestedValue<T[K]>;
} : T;
export declare type DefaultValues<TFieldValues> = UnpackNestedValue<DeepPartial<TFieldValues>>;
export declare type InternalNameSet = Set<InternalFieldName>;
export declare type ValidationMode = {
    onBlur: 'onBlur';
    onChange: 'onChange';
    onSubmit: 'onSubmit';
    onTouched: 'onTouched';
    all: 'all';
};
export declare type Mode = keyof ValidationMode;
export declare type CriteriaMode = 'firstError' | 'all';
export declare type SubmitHandler<TFieldValues extends FieldValues> = (data: UnpackNestedValue<TFieldValues>, event?: React.BaseSyntheticEvent) => any | Promise<any>;
export declare type SubmitErrorHandler<TFieldValues extends FieldValues> = (errors: FieldErrors<TFieldValues>, event?: React.BaseSyntheticEvent) => any | Promise<any>;
export declare type SetValueConfig = Partial<{
    shouldValidate: boolean;
    shouldDirty: boolean;
    shouldTouch: boolean;
}>;
export declare type TriggerConfig = Partial<{
    shouldFocus: boolean;
}>;
export declare type ChangeHandler = (event: {
    target: any;
    type?: any;
}) => Promise<void | boolean>;
export declare type DelayCallback = (name: InternalFieldName, error: FieldError) => void;
export declare type UseFormProps<TFieldValues extends FieldValues = FieldValues, TContext = any> = Partial<{
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
export declare type FieldNamesMarkedBoolean<TFieldValues extends FieldValues> = DeepMap<DeepPartial<TFieldValues>, boolean>;
export declare type FormStateProxy<TFieldValues extends FieldValues = FieldValues> = {
    isDirty: boolean;
    isValidating: boolean;
    dirtyFields: FieldNamesMarkedBoolean<TFieldValues>;
    touchedFields: FieldNamesMarkedBoolean<TFieldValues>;
    errors: boolean;
    isValid: boolean;
};
export declare type ReadFormState = {
    [K in keyof FormStateProxy]: boolean | 'all';
};
export declare type FormState<TFieldValues> = {
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
export declare type KeepStateOptions = Partial<{
    keepErrors: boolean;
    keepDirty: boolean;
    keepValues: boolean;
    keepDefaultValues: boolean;
    keepIsSubmitted: boolean;
    keepTouched: boolean;
    keepIsValid: boolean;
    keepSubmitCount: boolean;
}>;
export declare type SetFieldValue<TFieldValues> = FieldValue<TFieldValues>;
export declare type RefCallBack = (instance: any) => void;
export declare type UseFormRegisterReturn = {
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
 * Register field into hook form with or without the actual DOM ref. You can invoke register anywhere in the component including at `useEffect`.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/useform/register) • [Demo](https://codesandbox.io/s/react-hook-form-register-ts-ip2j3) • [Video](https://www.youtube.com/watch?v=JFIpCoajYkA)
 *
 * @param name - the path name to the form field value, name is required and unique
 * @param options - register options include validation, disabled, unregister, value as and dependent validation
 *
 * @returns onChange, onBlur, name, ref, and native contribute attribute if browser validation is enabled.
 *
 * @example
 * ```tsx
 * // Register HTML native input
 * <input {...register("input")} />
 * <select {...register("select")} />
 *
 * // Register options
 * <textarea {...register("textarea", { required: "This is required.", maxLength: 20 })} />
 * <input type="number" {...register("name2", { valueAsNumber: true })} />
 * <input {...register("name3", { deps: ["name2"] })} />
 *
 * // Register custom field at useEffect
 * useEffect(() => {
 *   register("name4");
 *   register("name5", { value: '"hiddenValue" });
 * }, [register])
 *
 * // Register without ref
 * const { onChange, onBlur, name } = register("name6")
 * <input onChange={onChange} onBlur={onBlur} name={name} />
 * ```
 */
export declare type UseFormRegister<TFieldValues extends FieldValues> = <TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(name: TFieldName, options?: RegisterOptions<TFieldValues, TFieldName>) => UseFormRegisterReturn;
export declare type SetFocusOptions = Partial<{
    shouldSelect: boolean;
}>;
/**
 * Set focus on a registered field. You can start to invoke this method after all fields are mounted to the DOM.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/useform/setfocus) • [Demo](https://codesandbox.io/s/setfocus-rolus)
 *
 * @param name - the path name to the form field value.
 * @param options - input focus behavior options
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   setFocus("name");
 * }, [setFocus])
 * // shouldSelect allows to select input's content on focus
 * <button onClick={() => setFocus("name", { shouldSelect: true })}>Focus</button>
 * ```
 */
export declare type UseFormSetFocus<TFieldValues extends FieldValues> = <TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(name: TFieldName, options?: SetFocusOptions) => void;
export declare type UseFormGetValues<TFieldValues extends FieldValues> = {
    /**
     * Get the entire form values when no argument is supplied to this function.
     *
     * @remarks
     * [API](https://react-hook-form.com/api/useform/getvalues) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-getvalues-txsfg)
     *
     * @returns form values
     *
     * @example
     * ```tsx
     * <button onClick={() => getValues()}>getValues</button>
     *
     * <input {...register("name", {
     *   validate: () => getValues().otherField === "test";
     * })} />
     * ```
     */
    (): UnpackNestedValue<TFieldValues>;
    /**
     * Get a single field value.
     *
     * @remarks
     * [API](https://react-hook-form.com/api/useform/getvalues) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-getvalues-txsfg)
     *
     * @param name - the path name to the form field value.
     *
     * @returns the single field value
     *
     * @example
     * ```tsx
     * <button onClick={() => getValues("name")}>getValues</button>
     *
     * <input {...register("name", {
     *   validate: () => getValues('otherField') === "test";
     * })} />
     * ```
     */
    <TFieldName extends FieldPath<TFieldValues>>(name: TFieldName): FieldPathValue<TFieldValues, TFieldName>;
    /**
     * Get an array of field values.
     *
     * @remarks
     * [API](https://react-hook-form.com/api/useform/getvalues) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-getvalues-txsfg)
     *
     * @param names - an array of field names
     *
     * @returns An array of field values
     *
     * @example
     * ```tsx
     * <button onClick={() => getValues(["name", "name1"])}>getValues</button>
     *
     * <input {...register("name", {
     *   validate: () => getValues(["fieldA", "fieldB"]).includes("test");
     * })} />
     * ```
     */
    <TFieldNames extends FieldPath<TFieldValues>[]>(names: readonly [...TFieldNames]): [...FieldPathValues<TFieldValues, TFieldNames>];
};
/**
 * This method will return individual field states. It will be useful when you are trying to retrieve the nested value field state in a typesafe approach.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/useform/getfieldstate) • [Demo](https://codesandbox.io/s/getfieldstate-jvekk)
 *
 * @param name - the path name to the form field value.
 *
 * @returns invalid, isDirty, isTouched and error object
 *
 * @example
 * ```tsx
 * // those formState has to be subscribed
 * const { formState: { dirtyFields, errors, touchedFields } } = formState();
 * getFieldState('name')
 * // Get field state when form state is not subscribed yet
 * getFieldState('name', formState)
 *
 * // It's ok to combine with useFormState
 * const formState = useFormState();
 * getFieldState('name')
 * getFieldState('name', formState)
 * ```
 */
export declare type UseFormGetFieldState<TFieldValues extends FieldValues> = <TFieldName extends FieldPath<TFieldValues>>(name: TFieldName, formState?: FormState<TFieldValues>) => {
    invalid: boolean;
    isDirty: boolean;
    isTouched: boolean;
    error?: FieldError;
};
export declare type UseFormWatch<TFieldValues extends FieldValues> = {
    /**
     * Watch and subscribe to the entire form update/change based on onChange and re-render at the useForm.
     *
     * @remarks
     * [API](https://react-hook-form.com/api/useform/watch) • [Demo](https://codesandbox.io/s/react-hook-form-watch-v7-ts-8et1d) • [Video](https://www.youtube.com/watch?v=3qLd69WMqKk)
     *
     * @returns return the entire form values
     *
     * @example
     * ```tsx
     * const formValues = watch();
     * ```
     */
    (): UnpackNestedValue<TFieldValues>;
    /**
     * Watch and subscribe to an array of fields used outside of render.
     *
     * @remarks
     * [API](https://react-hook-form.com/api/useform/watch) • [Demo](https://codesandbox.io/s/react-hook-form-watch-v7-ts-8et1d) • [Video](https://www.youtube.com/watch?v=3qLd69WMqKk)
     *
     * @param names - an array of field names
     * @param defaultValue - defaultValues for the entire form
     *
     * @returns return an array of field values
     *
     * @example
     * ```tsx
     * const [name, name1] = watch(["name", "name1"]);
     * ```
     */
    <TFieldNames extends readonly FieldPath<TFieldValues>[]>(names: readonly [...TFieldNames], defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>): FieldPathValues<TFieldValues, TFieldNames>;
    /**
     * Watch a single field update and used it outside of render.
     *
     * @remarks
     * [API](https://react-hook-form.com/api/useform/watch) • [Demo](https://codesandbox.io/s/react-hook-form-watch-v7-ts-8et1d) • [Video](https://www.youtube.com/watch?v=3qLd69WMqKk)
     *
     * @param name - the path name to the form field value.
     * @param defaultValue - defaultValues for the entire form
     *
     * @returns return the single field value
     *
     * @example
     * ```tsx
     * const name = watch("name");
     * ```
     */
    <TFieldName extends FieldPath<TFieldValues>>(name: TFieldName, defaultValue?: FieldPathValue<TFieldValues, TFieldName>): FieldPathValue<TFieldValues, TFieldName>;
    /**
     * Subscribe to field update/change without trigger re-render
     *
     * @remarks
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
     *   const unsubscribe = watch((value) => {
     *     console.log(value);
     *   });
     *   return () => unsubscribe();
     * }, [watch])
     * ```
     */
    (callback: WatchObserver<TFieldValues>, defaultValues?: UnpackNestedValue<DeepPartial<TFieldValues>>): Subscription;
};
/**
 * Trigger field or form validation
 *
 * @remarks
 * [API](https://react-hook-form.com/api/useform/trigger) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-triggervalidation-forked-xs7hl) • [Video](https://www.youtube.com/watch?v=-bcyJCDjksE)
 *
 * @param name - provide empty argument will trigger the entire form validation, an array of field names will validate an arrange of fields, and a single field name will only trigger that field's validation.
 * @param options - should focus on the error field
 *
 * @returns validation result
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   trigger();
 * }, [trigger])
 *
 * <button onClick={async () => {
 *   const result = await trigger(); // result will be a boolean value
 * }}>
 *  trigger
 *  </button>
 * ```
 */
export declare type UseFormTrigger<TFieldValues extends FieldValues> = (name?: FieldPath<TFieldValues> | FieldPath<TFieldValues>[] | readonly FieldPath<TFieldValues>[], options?: TriggerConfig) => Promise<boolean>;
/**
 * Clear the entire form errors.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/useform/clearerrors) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-clearerrors-w3ymx)
 *
 * @param name - the path name to the form field value.
 *
 * @example
 * Clear all errors
 * ```tsx
 * clearErrors(); // clear the entire form error
 * clearErrors(["name", "name1"]) // clear an array of fields' error
 * clearErrors("name2"); // clear a single field error
 * ```
 */
export declare type UseFormClearErrors<TFieldValues extends FieldValues> = (name?: FieldPath<TFieldValues> | FieldPath<TFieldValues>[] | readonly FieldPath<TFieldValues>[]) => void;
/**
 * Set a single field value, or a group of fields value.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/useform/setvalue) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-setvalue-8z9hx) • [Video](https://www.youtube.com/watch?v=qpv51sCH3fI)
 *
 * @param name - the path name to the form field value.
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
 * ```
 */
export declare type UseFormSetValue<TFieldValues extends FieldValues> = <TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(name: TFieldName, value: UnpackNestedValue<FieldPathValue<TFieldValues, TFieldName>>, options?: SetValueConfig) => void;
/**
 * Set an error for the field. When set an error which is not associated to a field then manual `clearErrors` invoke is required.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/useform/seterror) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-seterror-nfxxu) • [Video](https://www.youtube.com/watch?v=raMqvE0YyIY)
 *
 * @param name - the path name to the form field value.
 * @param error - an error object which contains type and optional message
 * @param options - whether or not to focus on the field
 *
 * @example
 * ```tsx
 * // when the error is not associated with any fields, `clearError` will need to invoke to clear the error
 * const onSubmit = () => setError("serverError", { type: "server", message: "Error occurred"})
 *
 * <button onClick={() => setError("name", { type: "min" })} />
 *
 * // focus on the input after setting the error
 * <button onClick={() => setError("name", { type: "max" }, { shouldFocus: true })} />
 * ```
 */
export declare type UseFormSetError<TFieldValues extends FieldValues> = (name: FieldPath<TFieldValues>, error: ErrorOption, options?: {
    shouldFocus: boolean;
}) => void;
/**
 * Unregister a field reference and remove its value.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/useform/unregister) • [Demo](https://codesandbox.io/s/react-hook-form-unregister-4k2ey) • [Video](https://www.youtube.com/watch?v=TM99g_NW5Gk&feature=emb_imp_woyt)
 *
 * @param name - the path name to the form field value.
 * @param options - keep form state options
 *
 * @example
 * ```tsx
 * register("name", { required: true })
 *
 * <button onClick={() => unregister("name")} />
 * // there are various keep options to retain formState
 * <button onClick={() => unregister("name", { keepErrors: true })} />
 * ```
 */
export declare type UseFormUnregister<TFieldValues extends FieldValues> = (name?: FieldPath<TFieldValues> | FieldPath<TFieldValues>[] | readonly FieldPath<TFieldValues>[], options?: Omit<KeepStateOptions, 'keepIsSubmitted' | 'keepSubmitCount' | 'keepValues' | 'keepDefaultValues' | 'keepErrors'> & {
    keepValue?: boolean;
    keepDefaultValue?: boolean;
    keepError?: boolean;
}) => void;
/**
 * Validate the entire form. Handle submit and error callback.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/useform/handlesubmit) • [Demo](https://codesandbox.io/s/react-hook-form-handlesubmit-ts-v7-lcrtu) • [Video](https://www.youtube.com/watch?v=KzcPKB9SOEk)
 *
 * @param onValid - callback function invoked after form pass validation
 * @param onInvalid - callback function invoked when form failed validation
 *
 * @returns callback - return callback function
 *
 * @example
 * ```tsx
 * const onSubmit = (data) => console.log(data);
 * const onError = (error) => console.log(error);
 *
 * <form onSubmit={handleSubmit(onSubmit, onError)} />
 * ```
 */
export declare type UseFormHandleSubmit<TFieldValues extends FieldValues> = <_>(onValid: SubmitHandler<TFieldValues>, onInvalid?: SubmitErrorHandler<TFieldValues>) => (e?: React.BaseSyntheticEvent) => Promise<void>;
/**
 * Reset a field state and reference.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/useform/resetfield) • [Demo](https://codesandbox.io/s/priceless-firefly-d0kuv) • [Video](https://www.youtube.com/watch?v=IdLFcNaEFEo)
 *
 * @param name - the path name to the form field value.
 * @param options - keep form state options
 *
 * @example
 * ```tsx
 * <input {...register("firstName", { required: true })} />
 * <button type="button" onClick={() => resetField("firstName"))}>Reset</button>
 * ```
 */
export declare type UseFormResetField<TFieldValues extends FieldValues> = <TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(name: TFieldName, options?: Partial<{
    keepDirty: boolean;
    keepTouched: boolean;
    keepError: boolean;
    defaultValue: any;
}>) => void;
/**
 * Reset at the entire form state.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/useform/reset) • [Demo](https://codesandbox.io/s/react-hook-form-reset-v7-ts-pu901) • [Video](https://www.youtube.com/watch?v=qmCLBjyPwVk)
 *
 * @param values - the entire form values to be reset
 * @param keepStateOptions - keep form state options
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   // reset the entire form after component mount or form defaultValues is ready
 *   reset({
 *     fieldA: "test"
 *     fieldB: "test"
 *   });
 * }, [reset])
 *
 * // reset by combine with existing form values
 * reset({
 *   ...getValues(),
 *  fieldB: "test"
 *});
 *
 * // reset and keep form state
 * reset({
 *   ...getValues(),
 *}, {
 *   keepErrors: true,
 *   keepDirty: true
 *});
 * ```
 */
export declare type UseFormReset<TFieldValues extends FieldValues> = (values?: DefaultValues<TFieldValues> | UnpackNestedValue<TFieldValues>, keepStateOptions?: KeepStateOptions) => void;
export declare type WatchInternal<TFieldValues> = (fieldNames?: InternalFieldName | InternalFieldName[], defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>, isMounted?: boolean, isGlobal?: boolean) => FieldPathValue<FieldValues, InternalFieldName> | FieldPathValues<FieldValues, InternalFieldName[]>;
export declare type GetIsDirty = <TName extends InternalFieldName, TData>(name?: TName, data?: TData) => boolean;
export declare type FormStateSubjectRef<TFieldValues> = Subject<Partial<FormState<TFieldValues>> & {
    name?: InternalFieldName;
}>;
export declare type Subjects<TFieldValues extends FieldValues = FieldValues> = {
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
export declare type Names = {
    mount: InternalNameSet;
    unMount: InternalNameSet;
    array: InternalNameSet;
    watch: InternalNameSet;
    focus: InternalFieldName;
    watchAll: boolean;
};
export declare type BatchFieldArrayUpdate = <T extends Function, TFieldValues, TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>>(name: InternalFieldName, updatedFieldArrayValues?: Partial<FieldArray<TFieldValues, TFieldArrayName>>[], method?: T, args?: Partial<{
    argA: unknown;
    argB: unknown;
}>, shouldSetValue?: boolean, shouldUpdateFieldsAndErrors?: boolean) => void;
export declare type Control<TFieldValues extends FieldValues = FieldValues, TContext = any> = {
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
    _getFieldArray: <TFieldArrayValues>(name: InternalFieldName) => Partial<TFieldArrayValues>[];
    _executeSchema: (names: InternalFieldName[]) => Promise<{
        errors: FieldErrors;
    }>;
    register: UseFormRegister<TFieldValues>;
    unregister: UseFormUnregister<TFieldValues>;
    getFieldState: UseFormGetFieldState<TFieldValues>;
};
export declare type WatchObserver<TFieldValues> = (value: UnpackNestedValue<DeepPartial<TFieldValues>>, info: {
    name?: FieldPath<TFieldValues>;
    type?: EventType;
    value?: unknown;
}) => void;
export declare type UseFormReturn<TFieldValues extends FieldValues = FieldValues, TContext = any> = {
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
export declare type UseFormStateProps<TFieldValues> = Partial<{
    control?: Control<TFieldValues>;
    disabled?: boolean;
    name?: FieldPath<TFieldValues> | FieldPath<TFieldValues>[] | readonly FieldPath<TFieldValues>[];
    exact?: boolean;
}>;
export declare type UseFormStateReturn<TFieldValues> = FormState<TFieldValues>;
export declare type UseWatchProps<TFieldValues extends FieldValues = FieldValues> = {
    defaultValue?: unknown;
    disabled?: boolean;
    name?: FieldPath<TFieldValues> | FieldPath<TFieldValues>[] | readonly FieldPath<TFieldValues>[];
    control?: Control<TFieldValues>;
    exact?: boolean;
};
export declare type FormProviderProps<TFieldValues extends FieldValues = FieldValues, TContext = any> = {
    children: React.ReactNode;
} & UseFormReturn<TFieldValues, TContext>;
export {};
//# sourceMappingURL=form.d.ts.map