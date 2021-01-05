import * as React from 'react';
import Subject from './utils/Subject';
import focusOnErrorField from './logic/focusOnErrorField';
import setFieldArrayDirtyFields from './logic/setFieldArrayDirtyFields';
import shouldRenderFormState from './logic/shouldRenderFormState';
import getFieldsValues from './logic/getFieldsValues';
import getFieldValue from './logic/getFieldValue';
import isErrorStateChanged from './logic/isErrorStateChanged';
import validateField from './logic/validateField';
import skipValidation from './logic/skipValidation';
import getNodeParentName from './logic/getNodeParentName';
import deepEqual from './utils/deepEqual';
import isNameInFieldArray from './logic/isNameInFieldArray';
import getProxyFormState from './logic/getProxyFormState';
import isProxyEnabled from './utils/isProxyEnabled';
import isCheckBoxInput from './utils/isCheckBoxInput';
import isEmptyObject from './utils/isEmptyObject';
import isRadioInput from './utils/isRadioInput';
import isFileInput from './utils/isFileInput';
import { getPath } from './utils/getPath';
import isPrimitive from './utils/isPrimitive';
import isFunction from './utils/isFunction';
import isString from './utils/isString';
import isUndefined from './utils/isUndefined';
import get from './utils/get';
import set from './utils/set';
import unset from './utils/unset';
import isKey from './utils/isKey';
import modeChecker from './utils/validationModeChecker';
import isMultipleSelect from './utils/isMultipleSelect';
import compact from './utils/compact';
import isNullOrUndefined from './utils/isNullOrUndefined';
import isRadioOrCheckboxFunction from './utils/isRadioOrCheckbox';
import isWeb from './utils/isWeb';
import isHTMLElement from './utils/isHTMLElement';
import { EVENTS, UNDEFINED, VALIDATION_MODE } from './constants';
import { NativeSyntheticEvent } from 'react-native';
import {
  UseFormMethods,
  FieldValues,
  UnpackNestedValue,
  FieldName,
  InternalFieldName,
  FieldErrors,
  Field,
  FieldRefs,
  UseFormProps,
  RegisterOptions,
  SubmitHandler,
  ReadFormState,
  Ref,
  OmitResetState,
  SetValueConfig,
  ErrorOption,
  FormState,
  SubmitErrorHandler,
  FieldNamesMarkedBoolean,
  LiteralToPrimitive,
  DeepPartial,
  InternalNameSet,
  DefaultValues,
  FieldError,
  SetFieldValue,
  FieldArrayDefaultValues,
  ResetFieldArrayFunctionRef,
  RegisterMethods,
  FieldPath,
  ControllerEvent,
  Path,
  WatchCallback,
} from './types';

const isWindowUndefined = typeof window === UNDEFINED;

export function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object
>({
  mode = VALIDATION_MODE.onSubmit,
  reValidateMode = VALIDATION_MODE.onChange,
  resolver,
  context,
  defaultValues = {} as DefaultValues<TFieldValues>,
  shouldFocusError = true,
  criteriaMode,
}: UseFormProps<TFieldValues, TContext> = {}): UseFormMethods<TFieldValues> {
  const fieldsRef = React.useRef<FieldRefs>({});
  const formStateSubjectRef = React.useRef(
    new Subject<Partial<FormState<TFieldValues>>>(),
  );
  const watchSubjectRef = React.useRef(
    new Subject<{
      inputName?: string;
      inputValue?: unknown;
    }>(),
  );
  const controllerSubjectRef = React.useRef(
    new Subject<DefaultValues<TFieldValues>>(),
  );
  const fieldArrayDefaultValuesRef = React.useRef<FieldArrayDefaultValues>({});
  const fieldArrayValuesRef = React.useRef<FieldArrayDefaultValues>({});
  const watchFieldsRef = React.useRef<InternalNameSet>(new Set());
  const isMountedRef = React.useRef(false);
  const fieldsWithValidationRef = React.useRef<
    FieldNamesMarkedBoolean<TFieldValues>
  >({});
  const validFieldsRef = React.useRef<FieldNamesMarkedBoolean<TFieldValues>>(
    {},
  );
  const defaultValuesRef = React.useRef<DefaultValues<TFieldValues>>(
    defaultValues,
  );
  const isWatchAllRef = React.useRef(false);
  const resetFieldArrayFunctionRef = React.useRef<
    ResetFieldArrayFunctionRef<TFieldValues>
  >({});
  const contextRef = React.useRef(context);
  const resolverRef = React.useRef(resolver);
  const fieldArrayNamesRef = React.useRef<InternalNameSet>(new Set());
  const modeRef = React.useRef(modeChecker(mode));
  const { isOnSubmit, isOnTouch } = modeRef.current;
  const isValidateAllFieldCriteria = criteriaMode === VALIDATION_MODE.all;
  const [formState, setFormState] = React.useState<FormState<TFieldValues>>({
    isDirty: false,
    isValidating: false,
    dirty: {},
    isSubmitted: false,
    submitCount: 0,
    touched: {},
    isSubmitting: false,
    isSubmitSuccessful: false,
    isValid: !isOnSubmit,
    errors: {},
  });
  const readFormStateRef = React.useRef<ReadFormState>({
    isDirty: !isProxyEnabled,
    dirty: !isProxyEnabled,
    touched: !isProxyEnabled || isOnTouch,
    isValidating: !isProxyEnabled,
    isSubmitting: !isProxyEnabled,
    isValid: !isProxyEnabled,
    errors: !isProxyEnabled,
  });
  const formStateRef = React.useRef(formState);
  const observerRef = React.useRef<MutationObserver | undefined>();
  const {
    isOnBlur: isReValidateOnBlur,
    isOnChange: isReValidateOnChange,
  } = React.useRef(modeChecker(reValidateMode)).current;

  contextRef.current = context;
  resolverRef.current = resolver;
  formStateRef.current = formState;

  const getIsValid = () =>
    (formStateRef.current.isValid =
      deepEqual(validFieldsRef.current, fieldsWithValidationRef.current) &&
      isEmptyObject(formStateRef.current.errors));

  const shouldRenderBaseOnError = React.useCallback(
    (
      name: InternalFieldName,
      error: FieldError | undefined,
      shouldRender: boolean | null = false,
      state: {
        dirty?: FieldNamesMarkedBoolean<TFieldValues>;
        isDirty?: boolean;
        touched?: FieldNamesMarkedBoolean<TFieldValues>;
      } = {},
      isValid?: boolean,
    ): boolean | void => {
      let shouldReRender =
        shouldRender ||
        isErrorStateChanged<TFieldValues>({
          errors: formStateRef.current.errors,
          error,
          name,
          validFields: validFieldsRef.current,
          fieldsWithValidation: fieldsWithValidationRef.current,
        });
      const previousError = get(formStateRef.current.errors, name);

      if (error) {
        unset(validFieldsRef.current, name);
        shouldReRender =
          shouldReRender ||
          !previousError ||
          !deepEqual(previousError, error, true);
        set(formStateRef.current.errors, name, error);
      } else {
        if (get(fieldsWithValidationRef.current, name) || resolverRef.current) {
          set(validFieldsRef.current, name, true);
          shouldReRender = shouldReRender || previousError;
        }

        unset(formStateRef.current.errors, name);
      }

      if (
        (shouldReRender && !isNullOrUndefined(shouldRender)) ||
        !isEmptyObject(state)
      ) {
        formStateSubjectRef.current.next({
          ...state,
          isValid: resolverRef.current ? isValid : getIsValid(),
          errors: formStateRef.current.errors,
        });
      }

      readFormStateRef.current.isValidating &&
        formStateSubjectRef.current.next({
          isValidating: false,
        });
    },
    [],
  );

  const setFieldValue = React.useCallback(
    (name: InternalFieldName, rawValue: SetFieldValue<TFieldValues>) => {
      const { ref, refs } = fieldsRef.current[name] as Field;
      const value =
        isWeb && isHTMLElement(ref) && isNullOrUndefined(rawValue)
          ? ''
          : rawValue;
      fieldsRef.current[name]!.value = rawValue;

      if (isRadioInput(ref)) {
        (refs || []).forEach(
          (radioRef: HTMLInputElement) =>
            (radioRef.checked = radioRef.value === value),
        );
      } else if (isFileInput(ref) && !isString(value)) {
        ref.files = value as FileList;
      } else if (isMultipleSelect(ref)) {
        [...ref.options].forEach(
          (selectRef) =>
            (selectRef.selected = (value as string[]).includes(
              selectRef.value,
            )),
        );
      } else if (isCheckBoxInput(ref) && refs) {
        refs.length > 1
          ? refs.forEach(
              (checkboxRef) =>
                (checkboxRef.checked = Array.isArray(value)
                  ? !!(value as []).find(
                      (data: string) => data === checkboxRef.value,
                    )
                  : value === checkboxRef.value),
            )
          : (refs[0].checked = !!value);
      } else {
        ref.value = value;
      }
    },
    [],
  );

  const isFormDirty = React.useCallback(
    (name?: string, data?: unknown[]): boolean => {
      if (readFormStateRef.current.isDirty) {
        const formValues = getValues();

        name && data && set(formValues, name, data);

        return !deepEqual(formValues, defaultValuesRef.current);
      }

      return false;
    },
    [],
  );

  const updateAndGetDirtyState = React.useCallback(
    (
      name: InternalFieldName,
      shouldRender = true,
    ): Partial<
      Pick<FormState<TFieldValues>, 'dirty' | 'isDirty' | 'touched'>
    > => {
      if (readFormStateRef.current.isDirty || readFormStateRef.current.dirty) {
        const isFieldDirty = !deepEqual(
          get(defaultValuesRef.current, name),
          getFieldValue(fieldsRef.current[name]),
        );
        const isDirtyFieldExist = get(formStateRef.current.dirty, name);
        const previousIsDirty = formStateRef.current.isDirty;

        isFieldDirty
          ? set(formStateRef.current.dirty, name, true)
          : unset(formStateRef.current.dirty, name);

        const state = {
          isDirty: isFormDirty(),
          dirty: formStateRef.current.dirty,
        };

        const isChanged =
          (readFormStateRef.current.isDirty &&
            previousIsDirty !== state.isDirty) ||
          (readFormStateRef.current.dirty &&
            isDirtyFieldExist !== get(formStateRef.current.dirty, name));

        isChanged && shouldRender && formStateSubjectRef.current.next(state);

        return isChanged ? state : {};
      }

      return {};
    },
    [],
  );

  const executeValidation = React.useCallback(
    async (
      name: InternalFieldName,
      skipReRender?: boolean | null,
    ): Promise<boolean> => {
      if (process.env.NODE_ENV !== 'production') {
        if (!fieldsRef.current[name]) {
          console.warn('📋 Field is missing with `name` attribute: ', name);
          return false;
        }
      }

      const error = (
        await validateField(
          fieldsRef.current[name] as Field,
          isValidateAllFieldCriteria,
        )
      )[name];

      shouldRenderBaseOnError(name, error, skipReRender);

      return isUndefined(error);
    },
    [shouldRenderBaseOnError, isValidateAllFieldCriteria],
  );

  const executeSchemaOrResolverValidation = React.useCallback(
    async (names: InternalFieldName[]) => {
      const { errors } = await resolverRef.current!(
        getValues(),
        contextRef.current,
        isValidateAllFieldCriteria,
      );

      for (const name of names) {
        const error = get(errors, name);
        error
          ? set(formStateRef.current.errors, name, error)
          : unset(formStateRef.current.errors, name);
      }

      return errors;
    },
    [shouldRenderBaseOnError, isValidateAllFieldCriteria],
  );

  const trigger = React.useCallback(
    async (name?: FieldName<TFieldValues> | FieldName<TFieldValues>[]) => {
      const fields = isUndefined(name)
        ? Object.keys(fieldsRef.current)
        : Array.isArray(name)
        ? name
        : [name];
      let schemaValidationResult;

      formStateSubjectRef.current.next({
        isValidating: true,
      });

      if (resolver) {
        schemaValidationResult = await executeSchemaOrResolverValidation(
          fields,
        );
      } else {
        await Promise.all(
          fields.map(async (data) => await executeValidation(data, null)),
        );
      }

      formStateSubjectRef.current.next({
        errors: formStateRef.current.errors,
        isValidating: false,
        isValid: resolver
          ? isEmptyObject(schemaValidationResult)
          : getIsValid(),
      });
    },
    [executeSchemaOrResolverValidation, executeValidation],
  );

  const setInternalValues = React.useCallback(
    (
      name: FieldName<TFieldValues>,
      value: SetFieldValue<TFieldValues>,
      { shouldDirty, shouldValidate }: SetValueConfig,
    ) => {
      const data = {};
      set(data, name, value);

      for (const fieldName of getPath(name, value)) {
        if (fieldsRef.current[fieldName]) {
          setFieldValue(fieldName, get(data, fieldName));
          shouldDirty && updateAndGetDirtyState(fieldName);
          shouldValidate && trigger(fieldName as FieldName<TFieldValues>);
        }
      }
    },
    [trigger, setFieldValue, updateAndGetDirtyState],
  );

  const setInternalValue = React.useCallback(
    (
      name: FieldName<TFieldValues>,
      value: SetFieldValue<TFieldValues>,
      config: SetValueConfig,
    ) => {
      if (fieldsRef.current[name]) {
        setFieldValue(name, value);
        config.shouldDirty && updateAndGetDirtyState(name);
        config.shouldValidate && trigger(name as FieldName<TFieldValues>);
      } else if (!isPrimitive(value)) {
        setInternalValues(name, value, config);

        if (fieldArrayNamesRef.current.has(name)) {
          const parentName = getNodeParentName(name) || name;
          set(fieldArrayDefaultValuesRef.current, name, value);

          resetFieldArrayFunctionRef.current[parentName]({
            [parentName]: get(fieldArrayDefaultValuesRef.current, parentName),
          } as UnpackNestedValue<DeepPartial<TFieldValues>>);

          if (
            (readFormStateRef.current.isDirty ||
              readFormStateRef.current.dirty) &&
            config.shouldDirty
          ) {
            set(
              formStateRef.current.dirty,
              name,
              setFieldArrayDirtyFields(
                value,
                get(defaultValuesRef.current, name, []),
                get(formStateRef.current.dirty, name, []),
              ),
            );

            formStateSubjectRef.current.next({
              dirty: formStateRef.current.dirty,
              isDirty: !deepEqual(
                { ...getValues(), [name]: value },
                defaultValuesRef.current,
              ),
            });
          }
        }
      }
    },
    [updateAndGetDirtyState, setFieldValue, setInternalValues],
  );

  const isFieldWatched = <T extends FieldName<TFieldValues>>(name: T) =>
    isWatchAllRef.current ||
    watchFieldsRef.current.has(name) ||
    watchFieldsRef.current.has((name.match(/\w+/) || [])[0]);

  function setValue(
    name: FieldName<TFieldValues>,
    value: SetFieldValue<TFieldValues>,
    config?: SetValueConfig,
  ): void {
    setInternalValue(name, value, config || {});
    isFieldWatched(name) && formStateSubjectRef.current.next({});
    watchSubjectRef.current.next({ inputName: name, inputValue: value });
  }

  const handleChange = React.useCallback(
    async (
      event: Event | ControllerEvent | NativeSyntheticEvent<any>,
    ): Promise<void | boolean> => {
      const {
        type,
        target,
        // @ts-ignore
        target: { value, type: inputType },
      } = event;
      let name = (target as Ref)!.name;
      const field = fieldsRef.current[name];
      let error;
      let isValid;
      let inputValue;

      if (field) {
        inputValue = inputType ? getFieldValue(fieldsRef.current[name]) : value;
        if (!isUndefined(inputValue)) {
          fieldsRef.current[name]!.value = inputValue;
        }

        const isBlurEvent = type === EVENTS.BLUR;
        const shouldSkipValidation = skipValidation({
          isBlurEvent,
          isReValidateOnChange,
          isReValidateOnBlur,
          isTouched: !!get(formStateRef.current.touched, name),
          isSubmitted: formStateRef.current.isSubmitted,
          ...modeRef.current,
        });
        let state = updateAndGetDirtyState(name, false);
        let shouldRender =
          !isEmptyObject(state) ||
          (!isBlurEvent && isFieldWatched(name as FieldName<TFieldValues>));

        if (
          isBlurEvent &&
          !get(formStateRef.current.touched, name) &&
          readFormStateRef.current.touched
        ) {
          set(formStateRef.current.touched, name, true);
          state = {
            ...state,
            touched: formStateRef.current.touched,
          };
        }

        if (shouldSkipValidation) {
          !isBlurEvent &&
            watchSubjectRef.current.next({
              inputName: name,
              inputValue,
            });
          return (
            (!isEmptyObject(state) || (shouldRender && isEmptyObject(state))) &&
            formStateSubjectRef.current.next(state)
          );
        }

        formStateSubjectRef.current.next({
          isValidating: true,
        });

        if (resolverRef.current) {
          const { errors } = await resolverRef.current(
            getValues(),
            contextRef.current,
            isValidateAllFieldCriteria,
          );
          const previousFormIsValid = formStateRef.current.isValid;
          error = get(errors, name);

          if (isCheckBoxInput(target as Ref) && !error && resolverRef.current) {
            const parentNodeName = getNodeParentName(name);
            const currentError = get(errors, parentNodeName, {});
            currentError.type && currentError.message && (error = currentError);

            if (
              parentNodeName &&
              (currentError || get(formStateRef.current.errors, parentNodeName))
            ) {
              name = parentNodeName;
            }
          }

          isValid = isEmptyObject(errors);

          previousFormIsValid !== isValid && (shouldRender = true);
        } else {
          error = (await validateField(field, isValidateAllFieldCriteria))[
            name
          ];
        }

        !isBlurEvent &&
          watchSubjectRef.current.next({
            inputName: name,
            inputValue,
          });
        shouldRenderBaseOnError(name, error, shouldRender, state, isValid);
      }
    },
    [],
  );

  function getValues(): UnpackNestedValue<TFieldValues>;
  function getValues<TFieldName extends string, TFieldValue extends unknown>(
    name: TFieldName,
  ): TFieldName extends keyof TFieldValues
    ? UnpackNestedValue<TFieldValues>[TFieldName]
    : TFieldValue;
  function getValues<TFieldName extends keyof TFieldValues>(
    names: TFieldName[],
  ): UnpackNestedValue<Pick<TFieldValues, TFieldName>>;
  function getValues(payload?: string | string[]): unknown {
    if (isString(payload)) {
      return getFieldValue(fieldsRef.current[payload]);
    }

    if (Array.isArray(payload)) {
      const data = {};

      for (const name of payload) {
        set(data, name, getFieldValue(fieldsRef.current[name]));
      }

      return data;
    }

    return getFieldsValues(fieldsRef);
  }

  const updateIsValid = React.useCallback(
    async (values = {}) => {
      if (resolver) {
        const { errors } = await resolverRef.current!(
          {
            ...getValues(),
            ...values,
          },
          contextRef.current,
          isValidateAllFieldCriteria,
        );
        const isValid = isEmptyObject(errors);

        formStateRef.current.isValid !== isValid &&
          formStateSubjectRef.current.next({
            isValid,
          });
      } else {
        getIsValid();
      }
    },
    [isValidateAllFieldCriteria],
  );

  function clearErrors(
    name?: FieldName<TFieldValues> | FieldName<TFieldValues>[],
  ): void {
    name &&
      (Array.isArray(name) ? name : [name]).forEach((inputName) =>
        fieldsRef.current[inputName] && isKey(inputName)
          ? delete formStateRef.current.errors[inputName]
          : unset(formStateRef.current.errors, inputName),
      );

    formStateSubjectRef.current.next({
      errors: name ? formStateRef.current.errors : {},
    });
  }

  function setError(name: FieldName<TFieldValues>, error: ErrorOption) {
    const ref = (fieldsRef.current[name] || {})!.ref;

    set(formStateRef.current.errors, name, {
      ...error,
      ref,
    });

    formStateSubjectRef.current.next({
      errors: formStateRef.current.errors,
      isValid: false,
    });

    error.shouldFocus && ref && ref.focus && ref.focus();
  }

  const watchInternal = React.useCallback(
    <T>(
      fieldNames?: string | string[],
      defaultValue?: T,
      isGlobal?: boolean,
    ) => {
      const isArrayNames = Array.isArray(fieldNames);
      const fieldValues = isMountedRef.current
        ? getFieldsValues(fieldsRef, fieldNames)
        : isUndefined(defaultValue)
        ? defaultValuesRef.current
        : isArrayNames
        ? defaultValue || {}
        : { [fieldNames as string]: defaultValue };

      if (isUndefined(fieldNames)) {
        isWatchAllRef.current = true;
        return fieldValues;
      }

      const result = [];

      for (const fieldName of isArrayNames ? fieldNames : [fieldNames]) {
        isGlobal && watchFieldsRef.current.add(fieldName as string);
        result.push(get(fieldValues, fieldName as string));
      }

      return isArrayNames ? result : result[0];
    },
    [],
  );

  function watch(): UnpackNestedValue<TFieldValues>;
  function watch<TFieldName extends Path<TFieldValues>>(
    name: TFieldName,
    defaultValue?: TFieldName extends keyof TFieldValues
      ? UnpackNestedValue<TFieldValues[TFieldName]>
      : UnpackNestedValue<LiteralToPrimitive<TFieldName>>,
  ): TFieldName extends keyof TFieldValues
    ? UnpackNestedValue<TFieldValues[TFieldName]>
    : UnpackNestedValue<LiteralToPrimitive<TFieldName>>;
  function watch(
    names: Path<TFieldValues>[],
    defaultValues?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): UnpackNestedValue<DeepPartial<TFieldValues>>;
  function watch(
    callback: WatchCallback,
    defaultValues?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): void;
  function watch(
    watchField?: Path<TFieldValues> | Path<TFieldValues>[] | WatchCallback,
    defaultValue?: unknown,
  ): unknown | void {
    if (isFunction(watchField)) {
      watchSubjectRef.current.subscribe({
        next: () => watchField(watchInternal(undefined, defaultValue)),
      });
      return;
    } else {
      return watchInternal(watchField as string | string[], defaultValue, true);
    }
  }

  function unregister(
    name: FieldPath<TFieldValues> | FieldPath<TFieldValues>[],
  ): void {
    for (const fieldName of Array.isArray(name) ? name : [name]) {
      const field = fieldsRef.current[fieldName];

      if (field && !compact(field.refs || []).length) {
        unset(validFieldsRef.current, field.ref.name);
        unset(fieldsWithValidationRef.current, field.ref.name);
        unset(formStateRef.current.errors, field.ref.name);
        delete fieldsRef.current[fieldName];

        formStateSubjectRef.current.next({
          ...formStateRef.current,
          isDirty: isFormDirty(),
          isValid: getIsValid(),
        });

        readFormStateRef.current.isValid &&
          resolverRef.current &&
          updateIsValid();

        watchSubjectRef.current.next({
          inputName: field.ref.name,
          inputValue: '',
        });
      }
    }
  }

  function updateValueAndGetDefault(name: InternalFieldName) {
    let defaultValue;
    const isFieldArray = isNameInFieldArray(fieldArrayNamesRef.current, name);
    const field = fieldsRef.current[name];

    if (
      field &&
      (!isEmptyObject(defaultValuesRef.current) || !isUndefined(field.value))
    ) {
      defaultValue = isUndefined(field.value)
        ? get(defaultValuesRef.current, name)
        : field.value;

      if (!isUndefined(defaultValue) && !isFieldArray) {
        setFieldValue(name, defaultValue);
      }
    }

    return defaultValue;
  }

  function registerFieldRef(
    name: InternalFieldName,
    ref: HTMLInputElement,
    options?: RegisterOptions,
  ): ((name: InternalFieldName) => void) | void {
    let field = fieldsRef.current[name];

    if (!field) {
      return;
    }

    const isRadioOrCheckbox = isRadioOrCheckboxFunction(ref);

    if (
      (isRadioOrCheckbox
        ? Array.isArray(field.refs) &&
          compact(field.refs).find((option) => {
            return ref.value === option.value && option === ref;
          })
        : ref === field.ref) ||
      !field
    ) {
      return;
    }

    field = isRadioOrCheckbox
      ? {
          ...field,
          refs: [
            ...compact(field.refs || []).filter(
              (ref) => isHTMLElement(ref) && document.contains(ref),
            ),
            ref,
          ],
          ref: { type: ref.type, name },
        }
      : {
          ...field,
          ref,
        };

    fieldsRef.current[name] = field;

    const defaultValue = updateValueAndGetDefault(name);

    if (
      isRadioOrCheckbox && Array.isArray(defaultValue)
        ? !deepEqual(fieldsRef.current[name]!.value, defaultValue)
        : true
    ) {
      fieldsRef.current[name]!.value = getFieldValue(fieldsRef.current[name]);
    }

    if (options) {
      set(fieldsWithValidationRef.current, name, true);

      if (!isOnSubmit && field && readFormStateRef.current.isValid) {
        validateField(field, isValidateAllFieldCriteria).then((error) => {
          isEmptyObject(error)
            ? set(validFieldsRef.current, name, true)
            : unset(validFieldsRef.current, name);

          formStateRef.current.isValid &&
            !isEmptyObject(error) &&
            setFormState({ ...formStateRef.current, isValid: getIsValid() });
        });
      }
    }
  }

  function register(
    name: FieldPath<TFieldValues>,
    options?: RegisterOptions,
  ): RegisterMethods {
    if (process.env.NODE_ENV !== 'production') {
      if (isUndefined(name)) {
        throw new Error(
          '📋 `name` prop is missing during register: https://react-hook-form.com/api#register',
        );
      }
    }

    fieldsRef.current[name] = {
      ...(fieldsRef.current[name]
        ? {
            ref: fieldsRef.current[name]!.ref,
            ...fieldsRef.current[name],
          }
        : { ref: { name } }),
      name,
      ...options,
    };

    updateValueAndGetDefault(name);

    return !isWindowUndefined
      ? {
          name: name as InternalFieldName,
          onChange: handleChange,
          onBlur: handleChange,
          ref: (ref: HTMLInputElement | null) =>
            ref && registerFieldRef(name, ref, options),
        }
      : ({} as RegisterMethods);
  }

  const handleSubmit = React.useCallback(
    <TSubmitFieldValues extends FieldValues = TFieldValues>(
      onValid: SubmitHandler<TSubmitFieldValues>,
      onInvalid?: SubmitErrorHandler<TFieldValues>,
    ) => async (e?: React.BaseSyntheticEvent): Promise<void> => {
      if (e && e.preventDefault) {
        e.preventDefault();
        e.persist();
      }
      let fieldErrors: FieldErrors<TFieldValues> = {};
      let fieldValues = getFieldsValues(fieldsRef);

      readFormStateRef.current.isSubmitting &&
        formStateSubjectRef.current.next({
          isSubmitting: true,
        });

      try {
        if (resolverRef.current) {
          const { errors, values } = await resolverRef.current(
            fieldValues,
            contextRef.current,
            isValidateAllFieldCriteria,
          );
          formStateRef.current.errors = fieldErrors = errors;
          fieldValues = values;
        } else {
          for (const field of Object.values(fieldsRef.current)) {
            if (field) {
              const fieldError = await validateField(
                field,
                isValidateAllFieldCriteria,
              );

              if (fieldError[field.name]) {
                set(fieldErrors, field.name, fieldError[field.name]);
                unset(validFieldsRef.current, field.name);
              } else if (get(fieldsWithValidationRef.current, field.name)) {
                unset(formStateRef.current.errors, field.name);
                set(validFieldsRef.current, field.name, true);
              }
            }
          }
        }

        if (
          isEmptyObject(fieldErrors) &&
          Object.keys(formStateRef.current.errors).every((name) =>
            get(fieldValues, name),
          )
        ) {
          formStateSubjectRef.current.next({
            errors: {},
            isSubmitting: true,
          });
          await onValid(fieldValues, e);
        } else {
          formStateRef.current.errors = {
            ...formStateRef.current.errors,
            ...fieldErrors,
          };
          onInvalid && (await onInvalid(formStateRef.current.errors, e));
          shouldFocusError &&
            focusOnErrorField(fieldsRef.current, formStateRef.current.errors);
        }
      } finally {
        formStateRef.current.isSubmitting = false;
        formStateSubjectRef.current.next({
          isSubmitted: true,
          isSubmitting: false,
          isSubmitSuccessful: isEmptyObject(formStateRef.current.errors),
          submitCount: formStateRef.current.submitCount + 1,
          errors: formStateRef.current.errors,
        });
      }
    },
    [shouldFocusError, isValidateAllFieldCriteria],
  );

  const resetRefs = ({
    errors,
    isDirty,
    isSubmitted,
    touched,
    isValid,
    submitCount,
    dirty,
  }: OmitResetState) => {
    if (!isValid) {
      validFieldsRef.current = {};
      fieldsWithValidationRef.current = {};
    }

    fieldArrayDefaultValuesRef.current = {};
    watchFieldsRef.current = new Set();
    isWatchAllRef.current = false;

    formStateSubjectRef.current.next({
      submitCount: submitCount ? formStateRef.current.submitCount : 0,
      isDirty: isDirty ? formStateRef.current.isDirty : false,
      isSubmitted: isSubmitted ? formStateRef.current.isSubmitted : false,
      isValid: isValid ? formStateRef.current.isValid : !isOnSubmit,
      dirty: dirty ? formStateRef.current.dirty : {},
      touched: touched ? formStateRef.current.touched : {},
      errors: errors ? formStateRef.current.errors : {},
      isSubmitting: false,
      isSubmitSuccessful: false,
    });
  };

  const reset = (
    values?: DefaultValues<TFieldValues>,
    omitResetState: OmitResetState = {},
  ): void => {
    if (isWeb) {
      for (const field of Object.values(fieldsRef.current)) {
        if (field) {
          const { ref, refs } = field;
          const inputRef =
            isRadioOrCheckboxFunction(ref) && Array.isArray(refs)
              ? refs[0]
              : ref;

          if (isHTMLElement(inputRef)) {
            try {
              inputRef.closest('form')!.reset();
              break;
            } catch {}
          }
        }
      }
    }

    fieldsRef.current = {};
    isMountedRef.current = false;
    defaultValuesRef.current = { ...(values || defaultValuesRef.current) };

    controllerSubjectRef.current.next({
      ...defaultValuesRef.current,
    } as DefaultValues<TFieldValues>);

    watchSubjectRef.current.next({
      inputValue: { ...defaultValuesRef.current },
    });

    Object.values(resetFieldArrayFunctionRef.current).forEach(
      (resetFieldArray) => isFunction(resetFieldArray) && resetFieldArray(),
    );

    resetRefs(omitResetState);
  };

  React.useEffect(() => {
    resolver && readFormStateRef.current.isValid && updateIsValid();
  }, [defaultValuesRef.current]);

  React.useEffect(() => {
    isMountedRef.current = true;
    const tearDown = formStateSubjectRef.current.subscribe({
      next: (formState: Partial<FormState<TFieldValues>> = {}) => {
        if (shouldRenderFormState(formState, readFormStateRef.current, true)) {
          formStateRef.current = {
            ...formStateRef.current,
            ...formState,
          };
          setFormState(formStateRef.current);
        }
      },
    });

    return () => {
      observerRef.current && observerRef.current.disconnect();
      tearDown.unsubscribe();
    };
  }, []);

  const commonProps = {
    getValues: React.useCallback(getValues, []),
    register: React.useCallback(register, [defaultValuesRef.current]),
    unregister: React.useCallback(unregister, []),
  };

  return {
    watch,
    control: React.useMemo(
      () => ({
        isWatchAllRef,
        watchFieldsRef,
        isFormDirty,
        formStateSubjectRef,
        controllerSubjectRef,
        watchSubjectRef,
        watchInternal,
        updateIsValid,
        fieldsRef,
        resetFieldArrayFunctionRef,
        fieldArrayDefaultValuesRef,
        validFieldsRef,
        fieldsWithValidationRef,
        fieldArrayNamesRef,
        readFormStateRef,
        formStateRef,
        defaultValuesRef,
        fieldArrayValuesRef,
        ...commonProps,
      }),
      [defaultValuesRef.current, watchInternal],
    ),
    formState: getProxyFormState<TFieldValues>(
      isProxyEnabled,
      formState,
      readFormStateRef,
    ),
    trigger,
    setValue: React.useCallback(setValue, [setInternalValue, trigger]),
    handleSubmit,
    reset: React.useCallback(reset, []),
    clearErrors: React.useCallback(clearErrors, []),
    setError: React.useCallback(setError, []),
    ...commonProps,
  };
}
