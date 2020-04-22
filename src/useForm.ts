import * as React from 'react';
import attachEventListeners from './logic/attachEventListeners';
import transformToNestObject from './logic/transformToNestObject';
import focusOnErrorField from './logic/focusOnErrorField';
import findRemovedFieldAndRemoveListener from './logic/findRemovedFieldAndRemoveListener';
import getFieldsValues from './logic/getFieldsValues';
import getFieldValue from './logic/getFieldValue';
import shouldRenderBasedOnError from './logic/shouldRenderBasedOnError';
import validateField from './logic/validateField';
import validateWithSchema from './logic/validateWithSchema';
import assignWatchFields from './logic/assignWatchFields';
import skipValidation from './logic/skipValidation';
import getFieldArrayParentName from './logic/getFieldArrayParentName';
import getFieldArrayValueByName from './logic/getFieldArrayValueByName';
import getIsFieldsDifferent from './logic/getIsFieldsDifferent';
import isNameInFieldArray from './logic/isNameInFieldArray';
import isCheckBoxInput from './utils/isCheckBoxInput';
import isEmptyObject from './utils/isEmptyObject';
import isRadioInput from './utils/isRadioInput';
import isFileInput from './utils/isFileInput';
import isObject from './utils/isObject';
import isBoolean from './utils/isBoolean';
import isPrimitive from './utils/isPrimitive';
import isFunction from './utils/isFunction';
import isArray from './utils/isArray';
import isString from './utils/isString';
import isSameError from './utils/isSameError';
import isUndefined from './utils/isUndefined';
import onDomRemove from './utils/onDomRemove';
import get from './utils/get';
import set from './utils/set';
import unset from './utils/unset';
import modeChecker from './utils/validationModeChecker';
import isMultipleSelect from './utils/isMultipleSelect';
import isNullOrUndefined from './utils/isNullOrUndefined';
import isRadioOrCheckboxFunction from './utils/isRadioOrCheckbox';
import isHTMLElement from './utils/isHTMLElement';
import { EVENTS, UNDEFINED, VALIDATION_MODE } from './constants';
import { FormContextValues } from './contextTypes';
import {
  LiteralToPrimitive,
  DeepPartial,
  FieldValues,
  FieldName,
  FieldValue,
  FieldErrors,
  Field,
  FieldRefs,
  UseFormOptions,
  ValidationOptions,
  OnSubmit,
  FieldElement,
  FormStateProxy,
  ReadFormState,
  ManualFieldError,
  MultipleFieldErrors,
  Ref,
  HandleChange,
  Touched,
  FieldError,
  RadioOrCheckboxOption,
  OmitResetState,
  Message,
  IsFlatObject,
  IsAny,
} from './types';

export function useForm<
  FormValues extends FieldValues = FieldValues,
  ValidationContext extends object = object
>({
  mode = VALIDATION_MODE.onSubmit,
  reValidateMode = VALIDATION_MODE.onChange,
  validationSchema,
  validationResolver,
  validationContext,
  defaultValues = {},
  submitFocusError = true,
  validateCriteriaMode,
}: UseFormOptions<FormValues, ValidationContext> = {}): FormContextValues<
  FormValues
> {
  const fieldsRef = React.useRef<FieldRefs<FormValues>>({});
  const errorsRef = React.useRef<FieldErrors<FormValues>>({});
  const touchedFieldsRef = React.useRef<Touched<FormValues>>({});
  const fieldArrayDefaultValues = React.useRef<Record<string, unknown[]>>({});
  const watchFieldsRef = React.useRef(new Set<FieldName<FormValues>>());
  const dirtyFieldsRef = React.useRef(new Set<FieldName<FormValues>>());
  const fieldsWithValidationRef = React.useRef(
    new Set<FieldName<FormValues>>(),
  );
  const validFieldsRef = React.useRef(new Set<FieldName<FormValues>>());
  const isValidRef = React.useRef(true);
  const defaultValuesRef = React.useRef<
    FieldValue<FormValues> | DeepPartial<FormValues>
  >(defaultValues);
  const defaultValuesAtRenderRef = React.useRef<
    DeepPartial<Record<FieldName<FormValues>, FieldValue<FormValues>>>
  >({});
  const isUnMount = React.useRef(false);
  const isWatchAllRef = React.useRef(false);
  const isSubmittedRef = React.useRef(false);
  const isDirtyRef = React.useRef(false);
  const submitCountRef = React.useRef(0);
  const isSubmittingRef = React.useRef(false);
  const handleChangeRef = React.useRef<HandleChange>();
  const resetFieldArrayFunctionRef = React.useRef({});
  const validationContextRef = React.useRef(validationContext);
  const fieldArrayNamesRef = React.useRef<Set<string>>(new Set());
  const [, render] = React.useState();
  const { isOnBlur, isOnSubmit, isOnChange } = React.useRef(
    modeChecker(mode),
  ).current;
  const validateAllFieldCriteria = validateCriteriaMode === 'all';
  const isWindowUndefined = typeof window === UNDEFINED;
  const shouldValidateSchemaOrResolver = !!(
    validationSchema || validationResolver
  );
  const isWeb =
    typeof document !== UNDEFINED &&
    !isWindowUndefined &&
    !isUndefined(window.HTMLElement);
  const isProxyEnabled = isWeb ? 'Proxy' in window : typeof Proxy !== UNDEFINED;
  const formStateProxyRef = React.useRef<FormStateProxy<FormValues>>();
  const readFormStateRef = React.useRef<ReadFormState>({
    dirty: !isProxyEnabled,
    dirtyFields: !isProxyEnabled,
    isSubmitted: isOnSubmit,
    submitCount: !isProxyEnabled,
    touched: !isProxyEnabled,
    isSubmitting: !isProxyEnabled,
    isValid: !isProxyEnabled,
  });
  const {
    isOnBlur: isReValidateOnBlur,
    isOnSubmit: isReValidateOnSubmit,
  } = React.useRef(modeChecker(reValidateMode)).current;
  validationContextRef.current = validationContext;

  const reRender = React.useCallback(() => {
    if (!isUnMount.current) {
      render({});
    }
  }, []);

  const shouldRenderBaseOnError = React.useCallback(
    (
      name: FieldName<FormValues>,
      error: FieldErrors<FormValues>,
      shouldRender: boolean | null = false,
    ): boolean | void => {
      let shouldReRender =
        shouldRender ||
        shouldRenderBasedOnError<FormValues>({
          errors: errorsRef.current,
          error,
          name,
          validFields: validFieldsRef.current,
          fieldsWithValidation: fieldsWithValidationRef.current,
        });

      if (isEmptyObject(error)) {
        if (
          fieldsWithValidationRef.current.has(name) ||
          shouldValidateSchemaOrResolver
        ) {
          validFieldsRef.current.add(name);
          shouldReRender = shouldReRender || get(errorsRef.current, name);
        }

        errorsRef.current = unset(errorsRef.current, [name]);
      } else {
        validFieldsRef.current.delete(name);
        shouldReRender = shouldReRender || !get(errorsRef.current, name);

        set(errorsRef.current, name, error[name]);
      }

      if (shouldReRender && !isNullOrUndefined(shouldRender)) {
        reRender();
        return true;
      }
    },
    [reRender, shouldValidateSchemaOrResolver],
  );

  const setFieldValue = React.useCallback(
    (
      field: Field,
      rawValue:
        | FieldValue<FormValues>
        | DeepPartial<FormValues>
        | undefined
        | null
        | boolean,
    ) => {
      const { ref, options } = field;
      const value =
        isWeb && isHTMLElement(ref) && isNullOrUndefined(rawValue)
          ? ''
          : rawValue;

      if (isRadioInput(ref) && options) {
        options.forEach(
          ({ ref: radioRef }: { ref: HTMLInputElement }) =>
            (radioRef.checked = radioRef.value === value),
        );
      } else if (isFileInput(ref)) {
        if (isString(value)) {
          ref.value = value;
        } else {
          ref.files = value as FileList;
        }
      } else if (isMultipleSelect(ref)) {
        [...ref.options].forEach(
          (selectRef) =>
            (selectRef.selected = (value as string).includes(selectRef.value)),
        );
      } else if (isCheckBoxInput(ref) && options) {
        options.length > 1
          ? options.forEach(
              ({ ref: checkboxRef }) =>
                (checkboxRef.checked = (value as string).includes(
                  checkboxRef.value,
                )),
            )
          : (options[0].ref.checked = !!value);
      } else {
        ref.value = value;
      }
    },
    [isWeb],
  );

  const setDirty = (name: FieldName<FormValues>): boolean => {
    if (
      !fieldsRef.current[name] ||
      (!readFormStateRef.current.dirty && !readFormStateRef.current.dirtyFields)
    ) {
      return false;
    }

    let isFieldDirty =
      defaultValuesAtRenderRef.current[name] !==
      getFieldValue(fieldsRef.current, fieldsRef.current[name]!.ref);
    const isFieldArray = isNameInFieldArray(fieldArrayNamesRef.current, name);
    const previousDirtyFieldsLength = dirtyFieldsRef.current.size;

    if (isFieldArray) {
      const fieldArrayName = getFieldArrayParentName(name);
      isFieldDirty = getIsFieldsDifferent(
        getFieldArrayValueByName(fieldsRef.current, fieldArrayName),
        get(defaultValuesRef.current, fieldArrayName),
      );
    }

    const isDirtyChanged =
      (isFieldArray ? isDirtyRef.current : dirtyFieldsRef.current.has(name)) !==
      isFieldDirty;

    if (isFieldDirty) {
      dirtyFieldsRef.current.add(name);
    } else {
      dirtyFieldsRef.current.delete(name);
    }

    isDirtyRef.current = isFieldArray
      ? isFieldDirty
      : !!dirtyFieldsRef.current.size;
    return readFormStateRef.current.dirty
      ? isDirtyChanged
      : previousDirtyFieldsLength !== dirtyFieldsRef.current.size;
  };

  const setDirtyAndTouchedFields = React.useCallback(
    (fieldName: FieldName<FormValues>): void | boolean => {
      if (
        setDirty(fieldName) ||
        (!get(touchedFieldsRef.current, fieldName) &&
          readFormStateRef.current.touched)
      ) {
        return !!set(touchedFieldsRef.current, fieldName, true);
      }
    },
    [],
  );

  const setInternalValues = React.useCallback(
    (
      name: FieldName<FormValues>,
      value: FieldValue<FormValues>,
      parentFieldName?: string,
    ) => {
      const isValueArray = isArray(value);

      for (const key in value) {
        const fieldName = `${parentFieldName || name}${
          isValueArray ? `[${key}]` : `.${key}`
        }`;
        const field = fieldsRef.current[fieldName];

        if (isObject(value[key])) {
          setInternalValues(name, value[key], fieldName);
        }

        if (field) {
          setFieldValue(field, value[key]);
          setDirtyAndTouchedFields(fieldName);
        }
      }
    },
    [setFieldValue, setDirtyAndTouchedFields],
  );

  const setInternalValue = React.useCallback(
    (
      name: FieldName<FormValues>,
      value: FieldValue<FormValues> | null | undefined | boolean,
    ): boolean | void => {
      const field = fieldsRef.current[name];
      if (field) {
        setFieldValue(field as Field, value);

        const output = setDirtyAndTouchedFields(name);
        if (isBoolean(output)) {
          return output;
        }
      } else if (!isPrimitive(value)) {
        setInternalValues(name, value);
      }
    },
    [setDirtyAndTouchedFields, setFieldValue, setInternalValues],
  );

  const executeValidation = React.useCallback(
    async (
      name: FieldName<FormValues>,
      skipReRender?: boolean,
    ): Promise<boolean> => {
      const field = fieldsRef.current[name] as Field;

      if (field) {
        const error = await validateField<FormValues>(
          fieldsRef,
          validateAllFieldCriteria,
          field,
        );

        shouldRenderBaseOnError(name, error, skipReRender ? null : false);

        return isEmptyObject(error);
      }

      return false;
    },
    [shouldRenderBaseOnError, validateAllFieldCriteria],
  );

  const executeSchemaOrResolverValidation = React.useCallback(
    async (
      payload: FieldName<FormValues> | FieldName<FormValues>[],
    ): Promise<boolean> => {
      const { errors } = await validateWithSchema<
        FormValues,
        ValidationContext
      >(
        validationSchema,
        validateAllFieldCriteria,
        getFieldArrayValueByName(fieldsRef.current),
        validationResolver,
        validationContextRef.current,
      );
      const previousFormIsValid = isValidRef.current;
      isValidRef.current = isEmptyObject(errors);

      if (isArray(payload)) {
        payload.forEach((name) => {
          const error = get(errors, name);

          if (error) {
            set(errorsRef.current, name, error);
          } else {
            unset(errorsRef.current, [name]);
          }
        });
        reRender();
      } else {
        const error = get(errors, payload);
        shouldRenderBaseOnError(
          payload,
          (error ? { [payload]: error } : {}) as FieldErrors<FormValues>,
          previousFormIsValid !== isValidRef.current,
        );
      }

      return isEmptyObject(errorsRef.current);
    },
    [
      reRender,
      shouldRenderBaseOnError,
      validateAllFieldCriteria,
      validationResolver,
      validationSchema,
    ],
  );

  const triggerValidation = React.useCallback(
    async (
      payload?: FieldName<FormValues> | FieldName<FormValues>[] | string,
    ): Promise<boolean> => {
      const fields = payload || Object.keys(fieldsRef.current);

      if (shouldValidateSchemaOrResolver) {
        return executeSchemaOrResolverValidation(fields);
      }

      if (isArray(fields)) {
        const result = await Promise.all(
          fields.map(async (data) => await executeValidation(data, true)),
        );
        reRender();
        return result.every(Boolean);
      }

      return await executeValidation(fields);
    },
    [
      executeSchemaOrResolverValidation,
      executeValidation,
      reRender,
      shouldValidateSchemaOrResolver,
    ],
  );

  const isFieldWatched = (name: string) =>
    isWatchAllRef.current ||
    watchFieldsRef.current.has(name) ||
    watchFieldsRef.current.has((name.match(/\w+/) || [])[0]);

  function setValue<T extends string, U extends unknown>(
    name: T,
    value: T extends keyof FormValues
      ? IsAny<FormValues[T]> extends true
        ? any
        : DeepPartial<FormValues[T]>
      : LiteralToPrimitive<U>,
    shouldValidate?: boolean,
  ): void;
  function setValue<T extends keyof FormValues>(
    namesWithValue: DeepPartial<Pick<FormValues, T>>[],
    shouldValidate?: boolean,
  ): void;
  function setValue<T extends keyof FormValues>(
    names: string | DeepPartial<Pick<FormValues, T>>[],
    valueOrShouldValidate?: unknown,
    shouldValidate?: boolean,
  ): void {
    let shouldRender = false;
    const isArrayValue = isArray(names);

    (isArrayValue
      ? (names as DeepPartial<Pick<FormValues, T>>[])
      : [names]
    ).forEach((name: any) => {
      const isStringFieldName = isString(name);
      shouldRender =
        setInternalValue(
          isStringFieldName ? name : Object.keys(name)[0],
          isStringFieldName
            ? valueOrShouldValidate
            : (Object.values(name)[0] as any),
        ) || isArrayValue
          ? true
          : isFieldWatched(name);
    });

    if (shouldRender || isArrayValue) {
      reRender();
    }

    if (shouldValidate || (isArrayValue && valueOrShouldValidate)) {
      triggerValidation(isArrayValue ? undefined : (names as any));
    }
  }

  handleChangeRef.current = handleChangeRef.current
    ? handleChangeRef.current
    : async ({ type, target }: Event): Promise<void | boolean> => {
        const name = target ? (target as Ref).name : '';
        const fields = fieldsRef.current;
        const errors = errorsRef.current;
        const field = fields[name];
        const currentError = get(errors, name);
        let error;

        if (!field) {
          return;
        }

        const isBlurEvent = type === EVENTS.BLUR;
        const shouldSkipValidation = skipValidation({
          hasError: !!currentError,
          isOnChange,
          isBlurEvent,
          isOnSubmit,
          isReValidateOnSubmit,
          isOnBlur,
          isReValidateOnBlur,
          isSubmitted: isSubmittedRef.current,
        });
        const shouldUpdateDirty = setDirty(name);
        let shouldRender = isFieldWatched(name) || shouldUpdateDirty;

        if (
          isBlurEvent &&
          !get(touchedFieldsRef.current, name) &&
          readFormStateRef.current.touched
        ) {
          set(touchedFieldsRef.current, name, true);
          shouldRender = true;
        }

        if (shouldSkipValidation) {
          return shouldRender && reRender();
        }

        if (shouldValidateSchemaOrResolver) {
          const { errors } = await validateWithSchema<
            FormValues,
            ValidationContext
          >(
            validationSchema,
            validateAllFieldCriteria,
            getFieldArrayValueByName(fields),
            validationResolver,
            validationContextRef.current,
          );
          const previousFormIsValid = isValidRef.current;
          isValidRef.current = isEmptyObject(errors);

          error = (get(errors, name)
            ? { [name]: get(errors, name) }
            : {}) as FieldErrors<FormValues>;

          if (previousFormIsValid !== isValidRef.current) {
            shouldRender = true;
          }
        } else {
          error = await validateField<FormValues>(
            fieldsRef,
            validateAllFieldCriteria,
            field,
          );
        }

        if (!shouldRenderBaseOnError(name, error) && shouldRender) {
          reRender();
        }
      };

  const validateSchemaOrResolver = React.useCallback(
    (values: any = {}) => {
      const fieldValues = isEmptyObject(defaultValuesRef.current)
        ? getFieldsValues(fieldsRef.current)
        : defaultValuesRef.current;

      validateWithSchema<FormValues, ValidationContext>(
        validationSchema,
        validateAllFieldCriteria,
        transformToNestObject({
          ...fieldValues,
          ...values,
        }),
        validationResolver,
        validationContextRef.current,
      ).then(({ errors }) => {
        const previousFormIsValid = isValidRef.current;
        isValidRef.current = isEmptyObject(errors);

        if (previousFormIsValid !== isValidRef.current) {
          reRender();
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reRender, validateAllFieldCriteria, validationResolver],
  );

  const removeFieldEventListener = React.useCallback(
    (field: Field, forceDelete?: boolean) => {
      if (handleChangeRef.current && field) {
        findRemovedFieldAndRemoveListener(
          fieldsRef.current,
          handleChangeRef.current,
          field,
          forceDelete,
        );
      }
    },
    [],
  );

  const removeFieldEventListenerAndRef = React.useCallback(
    (field: Field | undefined, forceDelete?: boolean) => {
      if (
        !field ||
        (field &&
          isNameInFieldArray(fieldArrayNamesRef.current, field.ref.name) &&
          !forceDelete)
      ) {
        return;
      }

      removeFieldEventListener(field, forceDelete);

      const { name } = field.ref;

      errorsRef.current = unset(errorsRef.current, [name]);
      touchedFieldsRef.current = unset(touchedFieldsRef.current, [name]);
      defaultValuesAtRenderRef.current = unset(
        defaultValuesAtRenderRef.current,
        [name],
      );
      [
        dirtyFieldsRef,
        fieldsWithValidationRef,
        validFieldsRef,
        watchFieldsRef,
      ].forEach((data) => data.current.delete(name));

      if (
        readFormStateRef.current.isValid ||
        readFormStateRef.current.touched
      ) {
        reRender();

        if (shouldValidateSchemaOrResolver) {
          validateSchemaOrResolver();
        }
      }
    },
    [
      reRender,
      shouldValidateSchemaOrResolver,
      validateSchemaOrResolver,
      removeFieldEventListener,
    ],
  );

  function clearError(): void;
  function clearError(name: FieldName<FormValues>): void;
  function clearError(names: FieldName<FormValues>[]): void;
  function clearError(
    name?: FieldName<FormValues> | FieldName<FormValues>[],
  ): void {
    if (name) {
      unset(errorsRef.current, isArray(name) ? name : [name]);
    } else {
      errorsRef.current = {};
    }

    reRender();
  }

  const setInternalError = ({
    name,
    type,
    types,
    message,
    shouldRender,
  }: {
    name: FieldName<FormValues>;
    type: string;
    types?: MultipleFieldErrors;
    message?: Message;
    shouldRender?: boolean;
  }) => {
    const field = fieldsRef.current[name];

    if (
      !isSameError(errorsRef.current[name] as FieldError, {
        type,
        message,
        types,
      })
    ) {
      set(errorsRef.current, name, {
        type,
        types,
        message,
        ref: field ? field.ref : {},
        isManual: true,
      });

      if (shouldRender) {
        reRender();
      }
    }
  };

  function setError(name: ManualFieldError<FormValues>[]): void;
  function setError(
    name: FieldName<FormValues>,
    type: MultipleFieldErrors,
  ): void;
  function setError(
    name: FieldName<FormValues>,
    type: string,
    message?: Message,
  ): void;
  function setError(
    name: FieldName<FormValues> | ManualFieldError<FormValues>[],
    type: string | MultipleFieldErrors = '',
    message?: Message,
  ): void {
    if (isString(name)) {
      setInternalError({
        name,
        ...(isObject(type)
          ? {
              types: type,
              type: '',
            }
          : {
              type,
              message,
            }),
        shouldRender: true,
      });
    } else if (isArray(name)) {
      name.forEach((error) => setInternalError({ ...error }));
      reRender();
    }
  }

  function watch(): FormValues;
  function watch(option: { nest: boolean }): FormValues;
  function watch<T extends string, U extends unknown>(
    field: T,
    defaultValue?: T extends keyof FormValues
      ? FormValues[T]
      : LiteralToPrimitive<U>,
  ): T extends keyof FormValues ? FormValues[T] : LiteralToPrimitive<U>;
  function watch<T extends keyof FormValues>(
    fields: T[],
    defaultValues?: DeepPartial<Pick<FormValues, T>>,
  ): Pick<FormValues, T>;
  function watch(
    fields: string[],
    defaultValues?: DeepPartial<FormValues>,
  ): DeepPartial<FormValues>;
  function watch(
    fieldNames?: string | string[] | { nest: boolean },
    defaultValue?: unknown,
  ): unknown {
    const watchFields = watchFieldsRef.current;
    const combinedDefaultValues = isUndefined(defaultValue)
      ? isUndefined(defaultValuesRef.current)
        ? {}
        : defaultValuesRef.current
      : defaultValue;
    const fieldValues = getFieldsValues<FormValues>(
      fieldsRef.current,
      fieldNames,
    );

    if (isString(fieldNames)) {
      return assignWatchFields<FormValues>(
        fieldValues,
        fieldNames,
        watchFields,
        combinedDefaultValues as DeepPartial<FormValues>,
      );
    }

    if (isArray(fieldNames)) {
      return fieldNames.reduce(
        (previous, name) => ({
          ...previous,
          [name]: assignWatchFields<FormValues>(
            fieldValues,
            name,
            watchFields,
            combinedDefaultValues as DeepPartial<FormValues>,
          ),
        }),
        {},
      );
    }

    isWatchAllRef.current = true;

    const result =
      (!isEmptyObject(fieldValues) && fieldValues) || combinedDefaultValues;

    return fieldNames && fieldNames.nest
      ? transformToNestObject(result as FieldValues)
      : result;
  }

  function unregister(name: FieldName<FormValues>): void;
  function unregister(names: FieldName<FormValues>[]): void;
  function unregister(
    names: FieldName<FormValues> | FieldName<FormValues>[],
  ): void {
    if (fieldsRef.current) {
      (isArray(names) ? names : [names]).forEach((fieldName) =>
        removeFieldEventListenerAndRef(fieldsRef.current[fieldName], true),
      );
    }
  }

  function registerFieldsRef<Element extends FieldElement>(
    ref: Element,
    validateOptions: ValidationOptions | null = {},
  ): ((name: FieldName<FormValues>) => void) | void {
    if (!ref.name) {
      // eslint-disable-next-line no-console
      return console.warn('Missing name @', ref);
    }

    const { name, type, value } = ref;
    const fieldRefAndValidationOptions = {
      ref,
      ...validateOptions,
    };
    const fields = fieldsRef.current;
    const isRadioOrCheckbox = isRadioOrCheckboxFunction(ref);
    let field = fields[name] as Field;
    let isEmptyDefaultValue = true;
    let isFieldArray;
    let defaultValue;

    if (
      isRadioOrCheckbox
        ? field &&
          isArray(field.options) &&
          field.options.filter(Boolean).find((option) => {
            return value === option.ref.value && option.ref === ref;
          })
        : field && ref === field.ref
    ) {
      fields[name as FieldName<FormValues>] = {
        ...field,
        ...validateOptions,
      };
      return;
    }

    if (type) {
      const mutationWatcher = onDomRemove(ref, () =>
        removeFieldEventListenerAndRef(field),
      );

      field = isRadioOrCheckbox
        ? {
            options: [
              ...((field && field.options) || []),
              {
                ref,
                mutationWatcher,
              } as RadioOrCheckboxOption,
            ],
            ref: { type, name },
            ...validateOptions,
          }
        : {
            ...fieldRefAndValidationOptions,
            mutationWatcher,
          };
    } else {
      field = fieldRefAndValidationOptions;
    }

    fields[name as FieldName<FormValues>] = field;

    if (!isEmptyObject(defaultValuesRef.current)) {
      defaultValue = get(defaultValuesRef.current, name);
      isEmptyDefaultValue = isUndefined(defaultValue);
      isFieldArray = isNameInFieldArray(fieldArrayNamesRef.current, name);

      if (!isEmptyDefaultValue && !isFieldArray) {
        setFieldValue(field, defaultValue);
      }
    }

    if (
      shouldValidateSchemaOrResolver &&
      !isFieldArray &&
      readFormStateRef.current.isValid
    ) {
      validateSchemaOrResolver();
    } else if (!isEmptyObject(validateOptions)) {
      fieldsWithValidationRef.current.add(name);

      if (!isOnSubmit && readFormStateRef.current.isValid) {
        validateField(fieldsRef, validateAllFieldCriteria, field).then(
          (error) => {
            const previousFormIsValid = isValidRef.current;

            isEmptyObject(error)
              ? validFieldsRef.current.add(name)
              : (isValidRef.current = false);

            if (previousFormIsValid !== isValidRef.current) {
              reRender();
            }
          },
        );
      }
    }

    if (
      !defaultValuesAtRenderRef.current[name] &&
      !(isFieldArray && isEmptyDefaultValue)
    ) {
      defaultValuesAtRenderRef.current[
        name as FieldName<FormValues>
      ] = isEmptyDefaultValue ? getFieldValue(fields, field.ref) : defaultValue;
    }

    if (type) {
      attachEventListeners({
        field:
          isRadioOrCheckbox && field.options
            ? field.options[field.options.length - 1]
            : field,
        isRadioOrCheckbox,
        handleChange: handleChangeRef.current,
      });
    }
  }

  function register<Element extends FieldElement = FieldElement>(): (
    ref: Element | null,
  ) => void;
  function register<Element extends FieldElement = FieldElement>(
    validationOptions: ValidationOptions,
  ): (ref: Element | null) => void;
  function register<Element extends FieldElement = FieldElement>(
    name: FieldName<FormValues>,
    validationOptions?: ValidationOptions,
  ): void;
  function register<Element extends FieldElement = FieldElement>(
    namesWithValidationOptions: Record<
      FieldName<FormValues>,
      ValidationOptions
    >,
  ): void;
  function register<Element extends FieldElement = FieldElement>(
    ref: Element,
    validationOptions?: ValidationOptions,
  ): void;
  function register<Element extends FieldElement = FieldElement>(
    refOrValidationOptions?: ValidationOptions | Element | null,
    validationOptions?: ValidationOptions,
  ): ((ref: Element | null) => void) | void {
    if (isWindowUndefined) {
      return;
    }

    if (isString(refOrValidationOptions)) {
      registerFieldsRef({ name: refOrValidationOptions }, validationOptions);
      return;
    }

    if (isObject(refOrValidationOptions) && 'name' in refOrValidationOptions) {
      registerFieldsRef(refOrValidationOptions, validationOptions);
      return;
    }

    return (ref: Element | null) =>
      ref && registerFieldsRef(ref, refOrValidationOptions);
  }

  const handleSubmit = React.useCallback(
    (callback: OnSubmit<FormValues>) => async (
      e?: React.BaseSyntheticEvent,
    ): Promise<void> => {
      if (e) {
        e.preventDefault();
        e.persist();
      }
      let fieldErrors: FieldErrors<FormValues> = {};
      const fields = fieldsRef.current;
      let fieldValues: FieldValues = getFieldsValues(fields);

      if (readFormStateRef.current.isSubmitting) {
        isSubmittingRef.current = true;
        reRender();
      }

      try {
        if (shouldValidateSchemaOrResolver) {
          const { errors, values } = await validateWithSchema<
            FormValues,
            ValidationContext
          >(
            validationSchema,
            validateAllFieldCriteria,
            transformToNestObject(fieldValues),
            validationResolver,
            validationContextRef.current,
          );
          errorsRef.current = errors;
          fieldErrors = errors;
          fieldValues = values;
        } else {
          for (const field of Object.values(fields)) {
            if (field) {
              const {
                ref: { name },
              } = field;

              const fieldError = await validateField(
                fieldsRef,
                validateAllFieldCriteria,
                field,
              );

              if (fieldError[name]) {
                set(fieldErrors, name, fieldError[name]);
                validFieldsRef.current.delete(name);
              } else {
                if (fieldsWithValidationRef.current.has(name)) {
                  validFieldsRef.current.add(name);
                }
              }
            }
          }
        }

        if (isEmptyObject(fieldErrors)) {
          errorsRef.current = {};
          await callback(transformToNestObject(fieldValues), e);
        } else {
          errorsRef.current = fieldErrors;
          if (submitFocusError && isWeb) {
            focusOnErrorField(fields, fieldErrors);
          }
        }
      } finally {
        isSubmittedRef.current = true;
        isSubmittingRef.current = false;
        submitCountRef.current = submitCountRef.current + 1;
        reRender();
      }
    },
    [
      isWeb,
      reRender,
      shouldValidateSchemaOrResolver,
      submitFocusError,
      validateAllFieldCriteria,
      validationResolver,
      validationSchema,
    ],
  );

  const resetRefs = ({
    errors,
    dirty,
    isSubmitted,
    touched,
    isValid,
    submitCount,
    dirtyFields,
  }: OmitResetState) => {
    fieldsRef.current = {};
    if (!errors) {
      errorsRef.current = {};
    }

    if (!touched) {
      touchedFieldsRef.current = {};
    }

    if (!isValid) {
      validFieldsRef.current = new Set();
      fieldsWithValidationRef.current = new Set();
      isValidRef.current = true;
    }

    if (!dirty) {
      isDirtyRef.current = false;
    }

    if (!dirtyFields) {
      dirtyFieldsRef.current = new Set();
    }

    if (!isSubmitted) {
      isSubmittedRef.current = false;
    }

    if (!submitCount) {
      submitCountRef.current = 0;
    }

    defaultValuesAtRenderRef.current = {};
    fieldArrayDefaultValues.current = {};
    watchFieldsRef.current = new Set();
    isWatchAllRef.current = false;
  };

  const reset = (
    values?: DeepPartial<FormValues>,
    omitResetState: OmitResetState = {},
  ): void => {
    if (isWeb) {
      for (const field of Object.values(fieldsRef.current)) {
        if (field) {
          const { ref, options } = field;
          const inputRef =
            isRadioOrCheckboxFunction(ref) && isArray(options)
              ? options[0].ref
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

    if (values) {
      defaultValuesRef.current = values;
    }

    Object.values(resetFieldArrayFunctionRef.current).forEach(
      (resetFieldArray) => isFunction(resetFieldArray) && resetFieldArray(),
    );

    resetRefs(omitResetState);

    reRender();
  };

  function getValues(): IsFlatObject<FormValues> extends false
    ? Record<string, unknown>
    : FormValues;
  function getValues<T extends boolean>(payload: {
    nest: T;
  }): T extends true
    ? FormValues
    : IsFlatObject<FormValues> extends true
    ? FormValues
    : Record<string, unknown>;
  function getValues<T extends string, U extends unknown>(
    payload: T,
  ): T extends keyof FormValues ? FormValues[T] : U;
  function getValues(payload?: { nest: boolean } | string): unknown {
    if (isString(payload)) {
      return fieldsRef.current[payload]
        ? getFieldValue(fieldsRef.current, fieldsRef.current[payload]!.ref)
        : undefined;
    }

    const fieldValues = getFieldsValues(fieldsRef.current);
    const outputValues = isEmptyObject(fieldValues)
      ? defaultValuesRef.current
      : fieldValues;

    return payload && payload.nest
      ? transformToNestObject(outputValues)
      : outputValues;
  }

  React.useEffect(
    () => () => {
      isUnMount.current = true;
      fieldsRef.current &&
        process.env.NODE_ENV === 'production' &&
        Object.values(fieldsRef.current).forEach((field) =>
          removeFieldEventListenerAndRef(field, true),
        );
    },
    [removeFieldEventListenerAndRef],
  );

  if (!shouldValidateSchemaOrResolver) {
    isValidRef.current =
      validFieldsRef.current.size >= fieldsWithValidationRef.current.size &&
      isEmptyObject(errorsRef.current);
  }

  const formState = {
    dirty: isDirtyRef.current,
    dirtyFields: dirtyFieldsRef.current,
    isSubmitted: isSubmittedRef.current,
    submitCount: submitCountRef.current,
    touched: touchedFieldsRef.current,
    isSubmitting: isSubmittingRef.current,
    isValid: isOnSubmit
      ? isSubmittedRef.current && isEmptyObject(errorsRef.current)
      : isValidRef.current,
  };

  formStateProxyRef.current = new Proxy<FormStateProxy<FormValues>>(formState, {
    get: (obj, prop: keyof FormStateProxy) => {
      if (prop in obj) {
        readFormStateRef.current[prop] = true;
        return obj[prop];
      }

      return {};
    },
  });

  const commonProps = {
    triggerValidation,
    setValue: React.useCallback(setValue, [
      reRender,
      setInternalValue,
      triggerValidation,
    ]),
    register: React.useCallback(register, [
      defaultValuesRef.current,
      defaultValuesAtRenderRef.current,
    ]),
    unregister: React.useCallback(unregister, []),
    getValues: React.useCallback(getValues, []),
    formState: isProxyEnabled ? formStateProxyRef.current : formState,
  };

  const control = {
    removeFieldEventListener,
    reRender,
    ...(shouldValidateSchemaOrResolver
      ? { validateSchemaIsValid: validateSchemaOrResolver }
      : {}),
    mode: {
      isOnBlur,
      isOnSubmit,
      isOnChange,
    },
    reValidateMode: {
      isReValidateOnBlur,
      isReValidateOnSubmit,
    },
    errorsRef,
    touchedFieldsRef,
    fieldsRef,
    isWatchAllRef,
    watchFieldsRef,
    resetFieldArrayFunctionRef,
    fieldArrayDefaultValues,
    validFieldsRef,
    dirtyFieldsRef,
    fieldsWithValidationRef,
    fieldArrayNamesRef,
    isDirtyRef,
    readFormStateRef,
    defaultValuesRef,
    ...commonProps,
  };

  return {
    watch,
    control,
    handleSubmit,
    reset: React.useCallback(reset, []),
    clearError: React.useCallback(clearError, []),
    setError: React.useCallback(setError, []),
    errors: errorsRef.current,
    ...commonProps,
  };
}
