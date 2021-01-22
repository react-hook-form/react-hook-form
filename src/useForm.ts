import * as React from 'react';
import focusFieldBy from './logic/focusFieldBy';
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
import Subject, { Subscription } from './utils/Subject';
import isProxyEnabled from './utils/isProxyEnabled';
import isCheckBoxInput from './utils/isCheckBoxInput';
import isEmptyObject from './utils/isEmptyObject';
import isRadioInput from './utils/isRadioInput';
import isFileInput from './utils/isFileInput';
import { getPath } from './utils/getPath';
import isFunction from './utils/isFunction';
import isString from './utils/isString';
import isUndefined from './utils/isUndefined';
import get from './utils/get';
import set from './utils/set';
import unset from './utils/unset';
import getValidationModes from './utils/getValidationModes';
import isMultipleSelect from './utils/isMultipleSelect';
import compact from './utils/compact';
import isNullOrUndefined from './utils/isNullOrUndefined';
import isRadioOrCheckboxFunction from './utils/isRadioOrCheckbox';
import isWeb from './utils/isWeb';
import isHTMLElement from './utils/isHTMLElement';
import { EVENTS, UNDEFINED, VALIDATION_MODE } from './constants';
import {
  UseFormMethods,
  FieldValues,
  UnpackNestedValue,
  FieldName,
  InternalFieldName,
  Field,
  FieldRefs,
  UseFormProps,
  RegisterOptions,
  ReadFormState,
  Ref,
  SetValueConfig,
  FormState,
  FieldNamesMarkedBoolean,
  DeepPartial,
  InternalNameSet,
  DefaultValues,
  FieldError,
  SetFieldValue,
  FieldArrayDefaultValues,
  RegisterCallback,
  FieldPath,
  WatchObserver,
  FieldPathValue,
  FieldPathValues,
  KeepStateOptions,
  EventType,
  UseFormTrigger,
  UseFormSetValue,
  UseFormUnregister,
  UseFormClearErrors,
  UseFormSetError,
  UseFormRegister,
  UseFormHandleSubmit,
  UseFormReset,
  WatchInternal,
  GetFormIsDirty,
  HandleChange,
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
  const fieldsNamesRef = React.useRef<
    Partial<Record<InternalFieldName, string>>
  >({});
  const formStateSubjectRef = React.useRef(
    new Subject<Partial<FormState<TFieldValues>>>(),
  );
  const watchSubjectRef = React.useRef(
    new Subject<{
      name?: InternalFieldName;
      type?: EventType;
      value?: unknown;
    }>(),
  );
  const controllerSubjectRef = React.useRef(
    new Subject<DefaultValues<TFieldValues>>(),
  );
  const fieldArraySubjectRef = React.useRef(
    new Subject<{
      name?: InternalFieldName;
      fields: any;
      isReset?: boolean;
    }>(),
  );
  const fieldArrayUpdatedValuesRef = React.useRef<{
    name?: InternalFieldName;
    fields?: DeepPartial<TFieldValues>;
  }>({});
  const fieldArrayDefaultValuesRef = React.useRef<FieldArrayDefaultValues>({});
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
  const contextRef = React.useRef(context);
  const resolverRef = React.useRef(resolver);
  const fieldArrayNamesRef = React.useRef<InternalNameSet>(new Set());
  const validationMode = getValidationModes(mode);
  const isValidateAllFieldCriteria = criteriaMode === VALIDATION_MODE.all;
  const [formState, setFormState] = React.useState<FormState<TFieldValues>>({
    isDirty: false,
    isValidating: false,
    dirtyFields: {},
    isSubmitted: false,
    submitCount: 0,
    touchedFields: {},
    isSubmitting: false,
    isSubmitSuccessful: false,
    isValid: !validationMode.isOnSubmit,
    errors: {},
  });
  const readFormStateRef = React.useRef<ReadFormState>({
    isDirty: !isProxyEnabled,
    dirtyFields: !isProxyEnabled,
    touchedFields: !isProxyEnabled || validationMode.isOnTouch,
    isValidating: !isProxyEnabled,
    isSubmitting: !isProxyEnabled,
    isValid: !isProxyEnabled,
    errors: !isProxyEnabled,
  });
  const formStateRef = React.useRef(formState);

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
      error?: FieldError,
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
      const { __field } = get(fieldsRef.current, name) as Field;

      if (__field) {
        const { ref, refs } = __field;
        const value =
          isWeb && isHTMLElement(ref) && isNullOrUndefined(rawValue)
            ? ''
            : rawValue;
        __field.value = rawValue;

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
      }
    },
    [],
  );

  const getFormIsDirty: GetFormIsDirty = React.useCallback((name, data) => {
    if (readFormStateRef.current.isDirty) {
      const formValues = getValues();

      name && data && set(formValues, name, data);

      return !deepEqual(formValues, defaultValuesRef.current);
    }

    return false;
  }, []);

  const updateAndGetDirtyState = React.useCallback(
    (
      name: InternalFieldName,
      shouldRender = true,
    ): Partial<
      Pick<FormState<TFieldValues>, 'dirtyFields' | 'isDirty' | 'touchedFields'>
    > => {
      if (
        readFormStateRef.current.isDirty ||
        readFormStateRef.current.dirtyFields
      ) {
        const isFieldDirty = !deepEqual(
          get(defaultValuesRef.current, name),
          getFieldValue(get(fieldsRef.current, name) as Field),
        );
        const isDirtyFieldExist = get(formStateRef.current.dirtyFields, name);
        const previousIsDirty = formStateRef.current.isDirty;

        isFieldDirty
          ? set(formStateRef.current.dirtyFields, name, true)
          : unset(formStateRef.current.dirtyFields, name);

        const state = {
          isDirty: getFormIsDirty(),
          dirtyFields: formStateRef.current.dirtyFields,
        };

        const isChanged =
          (readFormStateRef.current.isDirty &&
            previousIsDirty !== state.isDirty) ||
          (readFormStateRef.current.dirtyFields &&
            isDirtyFieldExist !== get(formStateRef.current.dirtyFields, name));

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
        if (!get(fieldsRef.current, name)) {
          console.warn('📋 Field is missing with `name` attribute: ', name);
          return false;
        }
      }

      const error = (
        await validateField(
          get(fieldsRef.current, name) as Field,
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

  const validateForm = async (fieldsRef: FieldRefs) => {
    for (const name in fieldsRef) {
      const field = fieldsRef[name];

      if (field) {
        const { __field, ...current } = field;

        if (__field) {
          const fieldError = await validateField(
            field,
            isValidateAllFieldCriteria,
          );

          if (fieldError[field.__field.name]) {
            set(
              formStateRef.current.errors,
              field.__field.name,
              fieldError[field.__field.name],
            );
            unset(validFieldsRef.current, field.__field.name);
          } else if (get(fieldsWithValidationRef.current, field.__field.name)) {
            unset(formStateRef.current.errors, field.__field.name);
            set(validFieldsRef.current, field.__field.name, true);
          }
        }

        current && (await validateForm(current));
      }
    }
  };

  const trigger: UseFormTrigger<TFieldValues> = React.useCallback(
    async (name) => {
      const fields = isUndefined(name)
        ? Object.keys(fieldsRef.current)
        : Array.isArray(name)
        ? name
        : [name];
      let isValid;

      formStateSubjectRef.current.next({
        isValidating: true,
      });

      if (resolver) {
        isValid = isEmptyObject(
          await executeSchemaOrResolverValidation(fields),
        );
      } else {
        isUndefined(name)
          ? await validateForm(fieldsRef.current)
          : await Promise.all(
              fields.map(async (data) => await executeValidation(data, null)),
            );
      }

      formStateSubjectRef.current.next({
        errors: formStateRef.current.errors,
        isValidating: false,
        isValid: resolver ? isEmptyObject(isValid) : getIsValid(),
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
        if (get(fieldsRef.current, fieldName)) {
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
      options: SetValueConfig,
    ) => {
      const field = get(fieldsRef.current, name);

      if (field && field.__field) {
        setFieldValue(name, value);
        options.shouldDirty && updateAndGetDirtyState(name);
        options.shouldValidate && trigger(name as FieldName<TFieldValues>);
      } else {
        setInternalValues(name, value, options);

        if (fieldArrayNamesRef.current.has(name)) {
          fieldArraySubjectRef.current.next({
            fields: value,
            name,
            isReset: true,
          });

          if (
            (readFormStateRef.current.isDirty ||
              readFormStateRef.current.dirtyFields) &&
            options.shouldDirty
          ) {
            set(
              formStateRef.current.dirtyFields,
              name,
              setFieldArrayDirtyFields(
                value,
                get(defaultValuesRef.current, name, []),
                get(formStateRef.current.dirtyFields, name, []),
              ),
            );

            formStateSubjectRef.current.next({
              dirtyFields: formStateRef.current.dirtyFields,
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

  const setValue: UseFormSetValue<TFieldValues> = (name, value, options) => {
    setInternalValue(name, value, options || {});
    isFieldWatched(name) && formStateSubjectRef.current.next({});
    watchSubjectRef.current.next({ name, value });
  };

  const handleChange: HandleChange = React.useCallback(
    async ({ type, target, target: { value, type: inputType } }) => {
      let name = (target as Ref)!.name;
      let error;
      let isValid;
      const field = get(fieldsRef.current, name) as Field;

      if (field) {
        const inputValue = inputType ? getFieldValue(field) : value;
        const isBlurEvent = type === EVENTS.BLUR;
        const {
          isOnBlur: isReValidateOnBlur,
          isOnChange: isReValidateOnChange,
        } = getValidationModes(reValidateMode);
        const shouldSkipValidation = skipValidation({
          isBlurEvent,
          isTouched: !!get(formStateRef.current.touchedFields, name),
          isSubmitted: formStateRef.current.isSubmitted,
          isReValidateOnBlur,
          isReValidateOnChange,
          ...validationMode,
        });
        const isWatched =
          !isBlurEvent && isFieldWatched(name as FieldName<TFieldValues>);

        if (!isUndefined(inputValue)) {
          field.__field.value = inputValue;
        }

        const state = updateAndGetDirtyState(name, false);

        if (
          isBlurEvent &&
          readFormStateRef.current.touchedFields &&
          !get(formStateRef.current.touchedFields, name)
        ) {
          set(formStateRef.current.touchedFields, name, true);
          state.touchedFields = formStateRef.current.touchedFields;
        }

        let shouldRender = !isEmptyObject(state) || isWatched;

        if (shouldSkipValidation) {
          !isBlurEvent &&
            watchSubjectRef.current.next({
              name,
              type,
              value: inputValue,
            });
          return (
            shouldRender &&
            formStateSubjectRef.current.next(isWatched ? {} : state)
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

          if (isCheckBoxInput(target as Ref) && !error) {
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
            name,
            type,
            value: inputValue,
          });
        shouldRenderBaseOnError(name, error, shouldRender, state, isValid);
      }
    },
    [],
  );

  function getValues(): UnpackNestedValue<TFieldValues>;
  function getValues<TName extends FieldPath<TFieldValues>>(
    fieldName: TName,
  ): FieldPathValue<TFieldValues, TName>;
  function getValues<TName extends FieldPath<TFieldValues>[]>(
    fieldNames: TName,
  ): FieldPathValues<TFieldValues, TName>;
  function getValues(
    fieldNames?: FieldPath<TFieldValues> | FieldPath<TFieldValues>[],
  ): unknown {
    const values = isMountedRef.current
      ? getFieldsValues(fieldsRef)
      : defaultValues;

    if (isUndefined(fieldNames)) {
      return values;
    }

    if (isString(fieldNames)) {
      return get(values, fieldNames as InternalFieldName);
    }

    return fieldNames.map((name) => get(values, name as InternalFieldName));
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

  const clearErrors: UseFormClearErrors<TFieldValues> = (name) => {
    name &&
      (Array.isArray(name) ? name : [name]).forEach((inputName) =>
        unset(formStateRef.current.errors, inputName),
      );

    formStateSubjectRef.current.next({
      errors: name ? formStateRef.current.errors : {},
    });
  };

  const setError: UseFormSetError<TFieldValues> = (name, error) => {
    const ref = ((get(fieldsRef.current, name) as Field) || { __field: {} })
      .__field.ref;

    set(formStateRef.current.errors, name, {
      ...error,
      ref,
    });

    formStateSubjectRef.current.next({
      errors: formStateRef.current.errors,
      isValid: false,
    });

    error.shouldFocus && ref && ref.focus && ref.focus();
  };

  const watchInternal: WatchInternal = React.useCallback(
    (fieldNames, defaultValue, isGlobal) => {
      const { fields, name } = fieldArrayUpdatedValuesRef.current;
      const isArrayNames = Array.isArray(fieldNames);
      let fieldValues = isMountedRef.current
        ? getValues()
        : isUndefined(defaultValue)
        ? defaultValuesRef.current
        : isArrayNames
        ? defaultValue || {}
        : { [fieldNames as string]: defaultValue };

      if (fields) {
        name ? set(fieldValues, name, fields) : (fieldValues = fields);

        fieldArrayUpdatedValuesRef.current = {
          fields: undefined,
          name: undefined,
        };
      }

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
  function watch<TName extends FieldPath<TFieldValues>>(
    fieldName: TName,
    defaultValue?: FieldPathValue<TFieldValues, TName>,
  ): FieldPathValue<TFieldValues, TName>;
  function watch<TName extends FieldPath<TFieldValues>[]>(
    fieldName: TName,
    defaultValue?: FieldPathValues<TFieldValues, TName>,
  ): FieldPathValues<TFieldValues, TName>;
  function watch(
    callback: WatchObserver,
    defaultValues?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): Subscription;
  function watch(
    fieldName?:
      | FieldPath<TFieldValues>
      | FieldPath<TFieldValues>[]
      | WatchObserver,
    defaultValue?: unknown,
  ) {
    if (isFunction(fieldName)) {
      return watchSubjectRef.current.subscribe({
        next: (info) => fieldName(watchInternal(undefined, defaultValue), info),
      });
    } else {
      return watchInternal(fieldName as string | string[], defaultValue, true);
    }
  }

  const unregister: UseFormUnregister<TFieldValues> = (name, options) => {
    for (const inputName of name
      ? Array.isArray(name)
        ? name
        : [name]
      : Object.keys(fieldsNamesRef.current)) {
      const field = get(fieldsRef.current, inputName) as Field;

      if (field) {
        unset(validFieldsRef.current, inputName);
        unset(fieldsWithValidationRef.current, inputName);
        unset(fieldsRef.current, inputName);
        unset(formStateRef.current.errors, inputName);
        unset(
          options && options.keepDirty ? {} : formStateRef.current.dirtyFields,
          inputName,
        );
        unset(
          options && options.keepTouched
            ? {}
            : formStateRef.current.touchedFields,
          inputName,
        );

        watchSubjectRef.current.next({
          name: inputName,
        });
      }
    }

    formStateSubjectRef.current.next({
      ...formStateRef.current,
      isDirty: getFormIsDirty(),
      ...(resolver ? {} : { isValid: getIsValid() }),
    });

    updateIsValid();
  };

  const updateValueAndGetDefault = (name: InternalFieldName) => {
    let defaultValue;
    const isFieldArray = isNameInFieldArray(fieldArrayNamesRef.current, name);
    const field = get(fieldsRef.current, name) as Field;

    if (
      field &&
      (!isEmptyObject(defaultValuesRef.current) ||
        !isUndefined(field.__field.value))
    ) {
      defaultValue = isUndefined(field.__field.value)
        ? get(defaultValuesRef.current, name)
        : field.__field.value;

      if (!isUndefined(defaultValue) && !isFieldArray) {
        setFieldValue(name, defaultValue);
      }
    }

    return defaultValue;
  };

  const registerFieldRef = (
    name: InternalFieldName,
    ref: HTMLInputElement,
    options?: RegisterOptions,
  ): ((name: InternalFieldName) => void) | void => {
    let field = get(fieldsRef.current, name) as Field;

    if (!field) {
      return;
    }

    const isRadioOrCheckbox = isRadioOrCheckboxFunction(ref);

    if (
      (isRadioOrCheckbox
        ? Array.isArray(field.__field.refs) &&
          compact(field.__field.refs).find(
            (option) => ref.value === option.value && option === ref,
          )
        : ref === field.__field.ref) ||
      !field
    ) {
      return;
    }

    field = {
      __field: isRadioOrCheckbox
        ? {
            ...field.__field,
            refs: [
              ...compact(field.__field.refs || []).filter(
                (ref) => isHTMLElement(ref) && document.contains(ref),
              ),
              ref,
            ],
            ref: { type: ref.type, name },
          }
        : {
            ...field.__field,
            ref,
          },
    };

    set(fieldsRef.current, name, field);

    const defaultValue = updateValueAndGetDefault(name);

    if (
      isRadioOrCheckbox && Array.isArray(defaultValue)
        ? !deepEqual(get(fieldsRef.current, name).__field.value, defaultValue)
        : true
    ) {
      get(fieldsRef.current, name).__field.value = getFieldValue(
        get(fieldsRef.current, name),
      );
    }

    if (options) {
      if (
        !validationMode.isOnSubmit &&
        field &&
        readFormStateRef.current.isValid
      ) {
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
  };

  const register: UseFormRegister<TFieldValues> = React.useCallback(
    (name, options) => {
      if (process.env.NODE_ENV !== 'production') {
        if (isUndefined(name)) {
          throw new Error(
            '📋 `name` prop is missing during register: https://react-hook-form.com/api#register',
          );
        }
      }

      set(fieldsRef.current, name, {
        __field: {
          ...(get(fieldsRef.current, name)
            ? {
                ref: get(fieldsRef.current, name).__field.ref,
                ...get(fieldsRef.current, name).__field,
              }
            : { ref: { name } }),
          name,
          ...options,
        },
      });
      options && set(fieldsWithValidationRef.current, name, true);
      fieldsNamesRef.current[name] = '';

      updateValueAndGetDefault(name);

      return !isWindowUndefined
        ? {
            name: name as InternalFieldName,
            onChange: handleChange,
            onBlur: handleChange,
            ref: (ref: HTMLInputElement | null) =>
              ref && registerFieldRef(name, ref, options),
          }
        : ({} as RegisterCallback);
    },
    [defaultValuesRef.current],
  );

  const handleSubmit: UseFormHandleSubmit<TFieldValues> = React.useCallback(
    (onValid, onInvalid) => async (e) => {
      if (e && e.preventDefault) {
        e.preventDefault();
        e.persist();
      }
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
          formStateRef.current.errors = errors;
          fieldValues = values;
        } else {
          await validateForm(fieldsRef.current);
        }

        if (
          isEmptyObject(formStateRef.current.errors) &&
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
          onInvalid && (await onInvalid(formStateRef.current.errors, e));
          shouldFocusError &&
            focusFieldBy(
              fieldsRef.current,
              (key: string) => get(formStateRef.current.errors, key),
              fieldsNamesRef.current,
            );
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

  const resetFromState = ({
    keepErrors,
    keepIsDirty,
    keepIsSubmitted,
    keepTouched,
    keepIsValid,
    keepSubmitCount,
    keepDirty,
  }: KeepStateOptions) => {
    if (!keepIsValid) {
      validFieldsRef.current = {};
      fieldsWithValidationRef.current = {};
    }

    watchFieldsRef.current = new Set();
    isWatchAllRef.current = false;

    formStateSubjectRef.current.next({
      submitCount: keepSubmitCount ? formStateRef.current.submitCount : 0,
      isDirty: keepIsDirty ? formStateRef.current.isDirty : false,
      isSubmitted: keepIsSubmitted ? formStateRef.current.isSubmitted : false,
      isValid: keepIsValid
        ? formStateRef.current.isValid
        : !validationMode.isOnSubmit,
      dirtyFields: keepDirty ? formStateRef.current.dirtyFields : {},
      touchedFields: keepTouched ? formStateRef.current.touchedFields : {},
      errors: keepErrors ? formStateRef.current.errors : {},
      isSubmitting: false,
      isSubmitSuccessful: false,
    });
  };

  const reset: UseFormReset<TFieldValues> = (values, keepStateOptions = {}) => {
    const updatedValues = values || defaultValuesRef.current;

    if (isWeb && !keepStateOptions.keepValues) {
      for (const field of Object.values(fieldsRef.current)) {
        if (field && field.__field) {
          const { ref, refs } = field.__field;
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

    !keepStateOptions.keepDefaultValues &&
      (defaultValuesRef.current = { ...updatedValues });

    if (!keepStateOptions.keepValues) {
      fieldsRef.current = {};

      controllerSubjectRef.current.next({ ...updatedValues });

      watchSubjectRef.current.next({
        value: { ...updatedValues },
      });

      fieldArraySubjectRef.current.next({
        fields: { ...updatedValues },
        isReset: true,
      });
    }

    resetFromState(keepStateOptions);
  };

  React.useEffect(() => {
    resolver && readFormStateRef.current.isValid && updateIsValid();
  }, [defaultValuesRef.current]);

  React.useEffect(() => {
    isMountedRef.current = true;
    const formStateSubscription = formStateSubjectRef.current.subscribe({
      next(formState: Partial<FormState<TFieldValues>> = {}) {
        if (shouldRenderFormState(formState, readFormStateRef.current, true)) {
          formStateRef.current = {
            ...formStateRef.current,
            ...formState,
          };
          setFormState(formStateRef.current);
        }
      },
    });

    const useFieldArraySubscription = fieldArraySubjectRef.current.subscribe({
      next(state) {
        if (state.fields && state.name) {
          fieldArrayUpdatedValuesRef.current = state;

          if (readFormStateRef.current.isValid) {
            const values = getFieldsValues(fieldsRef);
            set(values, state.name, state.fields);
            updateIsValid(values);
          }
        }
      },
    });

    return () => {
      watchSubjectRef.current.unsubscribe();
      formStateSubscription.unsubscribe();
      useFieldArraySubscription.unsubscribe();
    };
  }, []);

  return {
    control: React.useMemo(
      () => ({
        register,
        isWatchAllRef,
        watchFieldsRef,
        getFormIsDirty,
        formStateSubjectRef,
        fieldArraySubjectRef,
        controllerSubjectRef,
        watchSubjectRef,
        watchInternal,
        fieldsRef,
        validFieldsRef,
        fieldsWithValidationRef,
        fieldArrayNamesRef,
        readFormStateRef,
        formStateRef,
        defaultValuesRef,
        fieldArrayDefaultValuesRef,
      }),
      [defaultValuesRef.current, watchInternal],
    ),
    formState: getProxyFormState<TFieldValues>(
      isProxyEnabled,
      formState,
      readFormStateRef,
    ),
    trigger,
    register,
    watch: React.useCallback(watch, []),
    setValue: React.useCallback(setValue, [setInternalValue, trigger]),
    getValues: React.useCallback(getValues, []),
    handleSubmit,
    reset: React.useCallback(reset, []),
    clearErrors: React.useCallback(clearErrors, []),
    unregister: React.useCallback(unregister, []),
    setError: React.useCallback(setError, []),
  };
}
