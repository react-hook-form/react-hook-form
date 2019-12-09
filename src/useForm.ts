import * as React from 'react';
import attachEventListeners from './logic/attachEventListeners';
import combineFieldValues from './logic/combineFieldValues';
import findRemovedFieldAndRemoveListener from './logic/findRemovedFieldAndRemoveListener';
import getFieldsValues from './logic/getFieldValues';
import getFieldValue from './logic/getFieldValue';
import shouldUpdateWithError from './logic/shouldUpdateWithError';
import validateField from './logic/validateField';
import validateWithSchema from './logic/validateWithSchema';
import attachNativeValidation from './logic/attachNativeValidation';
import getDefaultValue from './logic/getDefaultValue';
import assignWatchFields from './logic/assignWatchFields';
import omitValidFields from './logic/omitValidFields';
import setNativeValue from './logic/setNativeValue';
import isCheckBoxInput from './utils/isCheckBoxInput';
import isEmptyObject from './utils/isEmptyObject';
import isRadioInput from './utils/isRadioInput';
import isHtmlElement from './utils/isHtmlElement';
import isObject from './utils/isObject';
import isArray from './utils/isArray';
import isString from './utils/isString';
import isSameError from './utils/isSameError';
import isUndefined from './utils/isUndefined';
import onDomRemove from './utils/onDomRemove';
import omitObject from './utils/omitObject';
import isMultipleSelect from './utils/isMultipleSelect';
import modeChecker from './utils/validationModeChecker';
import isNullOrUndefined from './utils/isNullOrUndefined';
import {
  EVENTS,
  UNDEFINED,
  VALIDATION_MODE,
  VALUE_ATTRIBUTE,
} from './constants';
import {
  FieldValues,
  FieldName,
  FieldValue,
  FieldErrors,
  Field,
  FieldRefs,
  UseFormOptions,
  ValidationOptions,
  SubmitPromiseResult,
  OnSubmit,
  ValidationPayload,
  ElementLike,
  NameProp,
  FormStateProxy,
  ReadFormState,
  ManualFieldError,
  MultipleFieldErrors,
  Ref,
  HandleChange,
} from './types';

const { useRef, useState, useCallback, useEffect } = React;

export default function useForm<FormValues extends FieldValues = FieldValues>({
  mode = VALIDATION_MODE.onSubmit,
  reValidateMode = VALIDATION_MODE.onChange,
  validationSchema,
  defaultValues = {},
  nativeValidation = false,
  submitFocusError = true,
  validationSchemaOption = { abortEarly: false },
  validateCriteriaMode,
}: UseFormOptions<FormValues> = {}) {
  const fieldsRef = useRef<FieldRefs<FormValues>>({});
  const validateAllFieldCriteria = validateCriteriaMode === 'all';
  const errorsRef = useRef<FieldErrors<FormValues>>({});
  const touchedFieldsRef = useRef(new Set<FieldName<FormValues>>());
  const watchFieldsRef = useRef(new Set<FieldName<FormValues>>());
  const dirtyFieldsRef = useRef(new Set<FieldName<FormValues>>());
  const fieldsWithValidationRef = useRef(new Set<FieldName<FormValues>>());
  const validFieldsRef = useRef(new Set<FieldName<FormValues>>());
  const isFormValid = useRef(true);
  const defaultRenderValuesRef = useRef<
    Partial<Record<FieldName<FormValues>, FieldValue<FormValues>>>
  >({} as Record<FieldName<FormValues>, FieldValue<FormValues>>);
  const defaultValuesRef = useRef<FieldValue<FormValues> | Partial<FormValues>>(
    defaultValues,
  );
  const isUnMount = useRef(false);
  const isWatchAllRef = useRef(false);
  const isSubmittedRef = useRef(false);
  const isDirtyRef = useRef(false);
  const submitCountRef = useRef(0);
  const isSubmittingRef = useRef(false);
  const handleChange = useRef<HandleChange>();
  const [, render] = useState();
  const { isOnBlur, isOnSubmit } = useRef(modeChecker(mode)).current;
  const isWindowUndefined = typeof window === UNDEFINED;
  const isWeb =
    typeof document !== UNDEFINED &&
    !isWindowUndefined &&
    !isUndefined(window.HTMLElement);
  const isProxyEnabled = !isWindowUndefined && 'Proxy' in window;
  const readFormState = useRef<ReadFormState>({
    dirty: !isProxyEnabled,
    isSubmitted: isOnSubmit,
    submitCount: !isProxyEnabled,
    touched: !isProxyEnabled,
    isSubmitting: !isProxyEnabled,
    isValid: !isProxyEnabled,
  });
  const {
    isOnBlur: isReValidateOnBlur,
    isOnSubmit: isReValidateOnSubmit,
  } = useRef(modeChecker(reValidateMode)).current;
  const validationSchemaOptionRef = useRef(validationSchemaOption);
  const shouldReRenderIsValidRef = useRef(true);
  defaultValuesRef.current = defaultValues;

  const combineErrorsRef = (data: FieldErrors<FormValues>) => ({
    ...errorsRef.current,
    ...data,
  });

  const reRender = useCallback(() => {
    if (!isUnMount.current) {
      render({});
    }
  }, []);

  const validateFieldCurry = useCallback(
    validateField.bind(
      null,
      fieldsRef,
      nativeValidation,
      validateAllFieldCriteria,
    ),
    [],
  );

  const validateFieldsSchemaCurry = useCallback(
    validateWithSchema.bind(
      null,
      validationSchema,
      validationSchemaOptionRef.current,
      validateAllFieldCriteria,
    ),
    [validationSchema],
  );

  const renderBaseOnError = useCallback(
    (
      name: FieldName<FormValues>,
      error: FieldErrors<FormValues>,
      shouldRender?,
    ): boolean | void => {
      let shouldReRender =
        shouldRender ||
        shouldUpdateWithError<FormValues>({
          errors: errorsRef.current,
          error,
          name,
          validFields: validFieldsRef.current,
          fieldsWithValidation: fieldsWithValidationRef.current,
        });

      if (isEmptyObject(error)) {
        if (fieldsWithValidationRef.current.has(name) || validationSchema) {
          validFieldsRef.current.add(name);
          shouldReRender = shouldReRender || errorsRef.current[name];
        }

        errorsRef.current = omitObject(errorsRef.current, name);
      } else {
        validFieldsRef.current.delete(name);
        shouldReRender = shouldReRender || !errorsRef.current[name];
      }

      errorsRef.current = combineErrorsRef(error);

      if (shouldReRender) {
        reRender();
        return true;
      }
    },
    [reRender, validationSchema],
  );

  const setFieldValue = useCallback(
    (
      name: FieldName<FormValues>,
      rawValue: FieldValue<FormValues> | Partial<FormValues> | undefined,
    ): boolean => {
      const field = fieldsRef.current[name];

      if (!field) {
        return false;
      }

      const ref = field.ref;
      const { type } = ref;
      const options = field.options;
      const isWebElement = isWeb && isHtmlElement(ref);
      const value = isWebElement && isNullOrUndefined(rawValue) ? '' : rawValue;

      if (isRadioInput(type) && options) {
        options.forEach(({ ref: radioRef }) => {
          setNativeValue(radioRef, radioRef.value, VALUE_ATTRIBUTE.checked);
        });
      } else if (isMultipleSelect(type)) {
        [...ref.options].forEach(selectRef => {
          setNativeValue(
            selectRef,
            (value as string[]).includes(selectRef.value),
            VALUE_ATTRIBUTE.selected,
          );
        });
      } else if (isCheckBoxInput(type) && options) {
        if (options.length > 1) {
          options.forEach(({ ref: checkboxRef }) => {
            setNativeValue(
              checkboxRef,
              (value as string[]).includes(checkboxRef.value),
              'checked',
            );
          });
        } else {
          setNativeValue(options[0].ref, !!value, VALUE_ATTRIBUTE.checked);
        }
      } else {
        if (isWebElement) {
          setNativeValue(ref, value);
        } else {
          ref.value = value;
        }
      }

      if (isWeb && !isHtmlElement(ref) && ref.dispatchEvent) {
        ref.dispatchEvent(new Event(EVENTS.INPUT, { bubbles: true }));
      }

      return type;
    },
    [isWeb],
  );

  const setDirty = (name: FieldName<FormValues>): boolean => {
    if (!fieldsRef.current[name]) {
      return false;
    }

    const isDirty =
      defaultRenderValuesRef.current[name] !==
      getFieldValue(fieldsRef.current, fieldsRef.current[name]!.ref);
    const isDirtyChanged = dirtyFieldsRef.current.has(name) !== isDirty;

    if (isDirty) {
      dirtyFieldsRef.current.add(name);
    } else {
      dirtyFieldsRef.current.delete(name);
    }

    isDirtyRef.current = !!dirtyFieldsRef.current.size;
    return isDirtyChanged && readFormState.current.dirty;
  };

  const setInternalValue = useCallback(
    (
      name: FieldName<FormValues>,
      value: FieldValue<FormValues>,
    ): boolean | void => {
      setFieldValue(name, value);

      if (
        setDirty(name) ||
        (!touchedFieldsRef.current.has(name) && readFormState.current.touched)
      ) {
        return !!touchedFieldsRef.current.add(name);
      }
    },
    [setFieldValue],
  );

  const executeValidation = useCallback(
    async (
      {
        name,
        value,
      }: {
        name: FieldName<FormValues>;
        value?: FormValues[FieldName<FormValues>];
      },
      shouldRender,
    ): Promise<boolean> => {
      const field = fieldsRef.current[name]!;

      if (!field) {
        return false;
      }

      if (!isUndefined(value)) {
        setInternalValue(name, value);
      }

      if (shouldRender) {
        reRender();
      }

      const error = await validateField<FormValues>(
        fieldsRef,
        nativeValidation,
        validateAllFieldCriteria,
        field,
      );
      renderBaseOnError(name, error);

      return isEmptyObject(error);
    },
    [
      nativeValidation,
      reRender,
      renderBaseOnError,
      setInternalValue,
      validateAllFieldCriteria,
    ],
  );

  const executeSchemaValidation = useCallback(
    async (
      payload:
        | ValidationPayload<FieldName<FormValues>, FieldValue<FormValues>>
        | ValidationPayload<FieldName<FormValues>, FieldValue<FormValues>>[],
      shouldRender?: boolean,
    ): Promise<boolean> => {
      const { errors } = await validateWithSchema<FormValues>(
        validationSchema,
        validationSchemaOptionRef.current,
        validateAllFieldCriteria,
        combineFieldValues(getFieldsValues(fieldsRef.current)),
      );
      const isMultipleFields = isArray(payload);
      const names = isArray(payload)
        ? payload.map(({ name }) => name)
        : [payload.name];
      const validFieldNames = names.filter(
        name => !(errors as FieldErrors<FormValues>)[name],
      );
      const previousFormIsValid = isFormValid.current;
      isFormValid.current = isEmptyObject(errors);

      if (isMultipleFields) {
        errorsRef.current = omitValidFields<FormValues>(
          combineErrorsRef(
            Object.entries(errors)
              .filter(([key]) => names.includes(key))
              .reduce(
                (previous, [name, error]) => ({ ...previous, [name]: error }),
                {},
              ),
          ),
          validFieldNames,
        );
        reRender();
      } else {
        const fieldName = names[0];
        renderBaseOnError(
          fieldName,
          errors[fieldName]
            ? ({ [fieldName]: errors[fieldName] } as FieldErrors<FormValues>)
            : {},
          shouldRender || previousFormIsValid !== isFormValid.current,
        );
      }

      return isEmptyObject(errorsRef.current);
    },
    [reRender, renderBaseOnError, validateAllFieldCriteria, validationSchema],
  );

  const triggerValidation = useCallback(
    async (
      payload?:
        | ValidationPayload<FieldName<FormValues>, FieldValue<FormValues>>
        | ValidationPayload<FieldName<FormValues>, FieldValue<FormValues>>[],
      shouldRender?: boolean,
    ): Promise<boolean> => {
      const fields =
        payload || Object.keys(fieldsRef.current).map(name => ({ name }));

      if (validationSchema) {
        return executeSchemaValidation(fields, shouldRender);
      }

      if (isArray(fields)) {
        const result = await Promise.all(
          (fields as []).map(
            async data => await executeValidation(data, false),
          ),
        );
        reRender();
        return result.every(Boolean);
      }

      return await executeValidation(fields, shouldRender);
    },
    [executeSchemaValidation, executeValidation, reRender, validationSchema],
  );

  const setValue = useCallback<
    <Name extends FieldName<FormValues>>(
      name: Name,
      value: FormValues[Name],
      shouldValidate?: boolean,
    ) => void | Promise<boolean>
  >(
    (name, value, shouldValidate) => {
      const shouldRender =
        setInternalValue(name, value) ||
        isWatchAllRef.current ||
        watchFieldsRef.current.has(name);

      if (shouldValidate) {
        return triggerValidation({ name }, shouldRender);
      }

      if (shouldRender) {
        reRender();
      }
      return;
    },
    [reRender, setInternalValue, triggerValidation],
  );

  handleChange.current = handleChange.current
    ? handleChange.current
    : async ({ type, target }: MouseEvent): Promise<void | boolean> => {
        const name = target ? (target as Ref).name : '';
        const fields = fieldsRef.current;
        const errors = errorsRef.current;
        const field = fields[name];
        const currentError = errors[name];
        let error;

        if (!field) {
          return;
        }

        const isBlurEvent = type === EVENTS.BLUR;
        const shouldSkipValidation =
          (isOnSubmit && isReValidateOnSubmit) ||
          (isOnSubmit && !isSubmittedRef.current) ||
          (isOnBlur && !isBlurEvent && !currentError) ||
          (isReValidateOnBlur && !isBlurEvent && currentError) ||
          (isReValidateOnSubmit && currentError);
        const shouldUpdateDirty = setDirty(name);
        let shouldUpdateState =
          isWatchAllRef.current ||
          watchFieldsRef.current.has(name) ||
          shouldUpdateDirty;

        if (
          isBlurEvent &&
          !touchedFieldsRef.current.has(name) &&
          readFormState.current.touched
        ) {
          touchedFieldsRef.current.add(name);
          shouldUpdateState = true;
        }

        if (shouldSkipValidation) {
          return shouldUpdateState && reRender();
        }

        if (validationSchema) {
          const { errors } = await validateWithSchema<FormValues>(
            validationSchema,
            validationSchemaOptionRef.current,
            validateAllFieldCriteria,
            combineFieldValues(getFieldsValues(fields)),
          );
          const validForm = isEmptyObject(errors);
          error = (errors[name] ? { [name]: errors[name] } : {}) as FieldErrors<
            FormValues
          >;

          if (isFormValid.current !== validForm) {
            shouldUpdateState = true;
          }

          isFormValid.current = validForm;
        } else {
          error = await validateField<FormValues>(
            fieldsRef,
            nativeValidation,
            validateAllFieldCriteria,
            field,
          );
        }

        if (!renderBaseOnError(name, error) && shouldUpdateState) {
          reRender();
        }
      };

  const resetFieldRef = useCallback(
    (name: FieldName<FormValues>) => {
      errorsRef.current = omitObject(errorsRef.current, name);
      fieldsRef.current = omitObject(fieldsRef.current, name);
      shouldReRenderIsValidRef.current = true;
      defaultRenderValuesRef.current = omitObject(
        defaultRenderValuesRef.current,
        name,
      );
      [
        touchedFieldsRef,
        dirtyFieldsRef,
        fieldsWithValidationRef,
        validFieldsRef,
        watchFieldsRef,
      ].forEach(data => data.current.delete(name));

      if (readFormState.current.isValid || readFormState.current.touched) {
        reRender();
      }
    },
    [reRender],
  );

  const removeEventListenerAndRef = useCallback(
    (field: Field | undefined, forceDelete?: boolean) => {
      if (!field) {
        return;
      }

      if (!isUndefined(handleChange.current)) {
        findRemovedFieldAndRemoveListener(
          fieldsRef.current,
          handleChange.current,
          field,
          forceDelete,
        );
      }
      resetFieldRef(field.ref.name);
    },
    [resetFieldRef],
  );

  function clearError(): void;
  function clearError(name: FieldName<FormValues>): void;
  function clearError(names: FieldName<FormValues>[]): void;
  function clearError(
    name?: FieldName<FormValues> | FieldName<FormValues>[],
  ): void {
    if (isUndefined(name)) {
      errorsRef.current = {};
    } else {
      (isArray(name) ? name : [name]).forEach(
        fieldName =>
          (errorsRef.current = omitObject(errorsRef.current, fieldName)),
      );
    }

    reRender();
  }

  const setInternalError = ({
    name,
    type,
    types,
    message,
    preventRender,
  }: {
    name: FieldName<FormValues>;
    type: string;
    types?: MultipleFieldErrors;
    message?: string;
    preventRender?: boolean;
  }) => {
    const errors = errorsRef.current;
    const field = fieldsRef.current[name];

    if (!isSameError(errors[name], type, message)) {
      errors[name] = {
        type,
        types,
        message,
        ref: field ? field.ref : {},
        isManual: true,
      };
      if (!preventRender) {
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
    message?: string,
  ): void;
  function setError(
    name: FieldName<FormValues> | ManualFieldError<FormValues>[],
    type: string | MultipleFieldErrors = '',
    message?: string,
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
      });
    } else if (isArray(name)) {
      name.forEach(error =>
        setInternalError({ ...error, preventRender: true }),
      );
      reRender();
    }
  }

  function watch(): FormValues;
  function watch<T extends FieldName<FormValues>>(
    field: T & string,
    defaultValue?: string,
  ): FormValues[T];
  function watch(
    fields: FieldName<FormValues>[] | string[],
    defaultValues?: Partial<FormValues>,
  ): Partial<FormValues>;
  function watch(
    fieldNames?: FieldName<FormValues> | FieldName<FormValues>[],
    defaultValue?: string | Partial<FormValues>,
  ): FieldValue<FormValues> | Partial<FormValues> | string | undefined {
    const combinedDefaultValues = isUndefined(defaultValue)
      ? isUndefined(defaultValues)
        ? {}
        : defaultValues
      : defaultValue;
    const fieldValues = getFieldsValues<FormValues>(fieldsRef.current);
    const watchFields = watchFieldsRef.current;

    if (isProxyEnabled) {
      readFormState.current.dirty = true;
    }

    if (isString(fieldNames)) {
      return assignWatchFields<FormValues>(
        fieldValues,
        fieldNames,
        watchFields,
        combinedDefaultValues,
      );
    }

    if (isArray(fieldNames)) {
      return fieldNames.reduce((previous, name) => {
        let value = null;

        if (
          isEmptyObject(fieldsRef.current) &&
          isObject(combinedDefaultValues)
        ) {
          value = getDefaultValue<FormValues>(combinedDefaultValues, name);
        } else {
          value = assignWatchFields<FormValues>(
            fieldValues,
            name,
            watchFields,
            combinedDefaultValues,
          );
        }

        return {
          ...previous,
          [name]: value,
        };
      }, {});
    }

    isWatchAllRef.current = true;

    return (
      (!isEmptyObject(fieldValues) && fieldValues) ||
      defaultValue ||
      defaultValues
    );
  }

  function unregister(name: FieldName<FormValues>): void;
  function unregister(names: FieldName<FormValues>[]): void;
  function unregister(
    names: FieldName<FormValues> | FieldName<FormValues>[],
  ): void {
    if (!isEmptyObject(fieldsRef.current)) {
      (isArray(names) ? names : [names]).forEach(fieldName =>
        removeEventListenerAndRef(fieldsRef.current[fieldName], true),
      );
    }
  }

  function registerFieldsRef<Element extends ElementLike>(
    ref: Element,
    validateOptions: ValidationOptions = {},
  ): ((name: FieldName<FormValues>) => void) | void {
    if (!ref.name) {
      return console.warn('Missing name @', ref);
    }

    const { name, type, value } = ref;
    const fieldAttributes = {
      ref,
      ...validateOptions,
    };
    const fields = fieldsRef.current;
    const isRadioOrCheckbox = isRadioInput(type) || isCheckBoxInput(type);
    let currentField = fields[name] as Field;

    if (
      isRadioOrCheckbox
        ? currentField &&
          isArray(currentField.options) &&
          currentField.options.find(({ ref }: Field) => value === ref.value)
        : currentField
    ) {
      fields[name as FieldName<FormValues>] = {
        ...currentField,
        ...validateOptions,
      };
      return;
    }

    if (type) {
      const mutationWatcher = onDomRemove(ref, () =>
        removeEventListenerAndRef(fieldAttributes),
      );

      if (isRadioOrCheckbox) {
        currentField = {
          options: [
            ...((currentField && currentField.options) || []),
            {
              ref,
              mutationWatcher,
            },
          ],
          ref: { type, name },
          ...validateOptions,
        };
      } else {
        currentField = {
          ...fieldAttributes,
          mutationWatcher,
        };
      }
    } else {
      currentField = fieldAttributes;
    }

    fields[name as FieldName<FormValues>] = currentField;
    const isEmptyDefaultValues = isEmptyObject(defaultValuesRef.current);

    if (!isEmptyDefaultValues) {
      const defaultValue = getDefaultValue<FormValues>(
        defaultValuesRef.current,
        name,
      );

      if (!isUndefined(defaultValue)) {
        setFieldValue(name, defaultValue);
      }
    }

    if (validationSchema) {
      const fieldValues = isEmptyDefaultValues
        ? getFieldsValues(fields)
        : defaultValuesRef.current;

      validateFieldsSchemaCurry(combineFieldValues(fieldValues)).then(
        ({ errors }) => {
          if (!isEmptyObject(errors) && shouldReRenderIsValidRef.current) {
            isFormValid.current = false;
            shouldReRenderIsValidRef.current = false;
            reRender();
          }
        },
      );
    } else if (!isEmptyObject(validateOptions)) {
      fieldsWithValidationRef.current.add(name);

      if (!isOnSubmit && readFormState.current.isValid) {
        validateFieldCurry(currentField).then(error => {
          if (isEmptyObject(error)) {
            validFieldsRef.current.add(name);
          } else if (shouldReRenderIsValidRef.current) {
            shouldReRenderIsValidRef.current = false;
            reRender();
          }
        });
      }
    }

    if (!defaultRenderValuesRef.current[name]) {
      defaultRenderValuesRef.current[
        name as FieldName<FormValues>
      ] = getFieldValue(fields, currentField.ref);
    }

    if (!type) {
      return;
    }

    const fieldToAttachListener =
      isRadioOrCheckbox && currentField.options
        ? currentField.options[currentField.options.length - 1]
        : currentField;

    if (nativeValidation && validateOptions) {
      attachNativeValidation(ref, validateOptions);
    } else {
      attachEventListeners({
        field: fieldToAttachListener,
        isRadioOrCheckbox,
        handleChange: handleChange.current,
      });
    }
  }

  function register<Element>(
    validateRule: ValidationOptions & NameProp,
  ): (ref: Element | null) => void;
  function register<Element extends ElementLike = ElementLike>(
    validateRule: ValidationOptions,
  ): (ref: Element | null) => void;
  function register<Element>(
    ref: Element | null,
    validateRule: ValidationOptions & NameProp,
  ): void;
  function register<Element extends ElementLike = ElementLike>(
    ref: Element | null,
    validationOptions?: ValidationOptions,
  ): void;
  function register<Element extends ElementLike = ElementLike>(
    refOrValidateRule: ValidationOptions | Element | null,
    validationOptions?: ValidationOptions & Partial<NameProp>,
  ): ((ref: Element | null) => void) | void {
    if (isWindowUndefined || !refOrValidateRule) {
      return;
    }

    if (validationOptions && isString(validationOptions.name)) {
      registerFieldsRef({ name: validationOptions.name }, validationOptions);
      return;
    }

    if (isObject(refOrValidateRule) && 'name' in refOrValidateRule) {
      registerFieldsRef(refOrValidateRule, validationOptions);
      return;
    }

    return (ref: Element | null) =>
      ref && registerFieldsRef(ref, refOrValidateRule);
  }

  const handleSubmit = useCallback(
    (callback: OnSubmit<FormValues>) => async (
      e: React.BaseSyntheticEvent,
    ): Promise<void> => {
      if (e) {
        e.preventDefault();
        e.persist();
      }
      let fieldErrors;
      let fieldValues;
      const fields = fieldsRef.current;

      if (readFormState.current.isSubmitting) {
        isSubmittingRef.current = true;
        reRender();
      }

      try {
        if (validationSchema) {
          fieldValues = getFieldsValues(fields);
          const output = await validateFieldsSchemaCurry(
            combineFieldValues(fieldValues),
          );
          errorsRef.current = output.errors;
          fieldErrors = output.errors;
          fieldValues = output.values;
        } else {
          const {
            errors,
            values,
          }: SubmitPromiseResult<FormValues> = await Object.values(
            fields,
          ).reduce(
            async (
              previous: Promise<SubmitPromiseResult<FormValues>>,
              field: Field | undefined,
            ): Promise<SubmitPromiseResult<FormValues>> => {
              if (!field) {
                return previous;
              }

              const resolvedPrevious = await previous;
              const {
                ref,
                ref: { name },
              } = field;

              if (!fields[name]) {
                return Promise.resolve(resolvedPrevious);
              }

              const fieldError = await validateFieldCurry(field);

              if (fieldError[name]) {
                resolvedPrevious.errors = {
                  ...resolvedPrevious.errors,
                  ...fieldError,
                };

                validFieldsRef.current.delete(name);

                return Promise.resolve(resolvedPrevious);
              }

              if (fieldsWithValidationRef.current.has(name)) {
                validFieldsRef.current.add(name);
              }
              resolvedPrevious.values[
                name as FieldName<FormValues>
              ] = getFieldValue(fields, ref);
              return Promise.resolve(resolvedPrevious);
            },
            Promise.resolve<SubmitPromiseResult<FormValues>>({
              errors: {},
              values: {} as FormValues,
            }),
          );

          fieldErrors = errors;
          fieldValues = values;
        }

        if (isEmptyObject(fieldErrors)) {
          errorsRef.current = {};
          await callback(combineFieldValues(fieldValues), e);
        } else {
          if (submitFocusError) {
            Object.keys(fieldErrors).reduce((previous, current) => {
              const field = fields[current];
              if (field && previous) {
                if (field.ref.focus) {
                  field.ref.focus();
                  return false;
                } else if (field.options) {
                  field.options[0].ref.focus();
                  return false;
                }
              }
              return previous;
            }, true);
          }

          errorsRef.current = fieldErrors;
        }
      } finally {
        isSubmittedRef.current = true;
        isSubmittingRef.current = false;
        submitCountRef.current = submitCountRef.current + 1;
        reRender();
      }
    },
    [
      reRender,
      submitFocusError,
      validateFieldCurry,
      validateFieldsSchemaCurry,
      validationSchema,
    ],
  );

  const resetRefs = () => {
    errorsRef.current = {};
    defaultRenderValuesRef.current = {};
    touchedFieldsRef.current = new Set();
    watchFieldsRef.current = new Set();
    dirtyFieldsRef.current = new Set();
    validFieldsRef.current = new Set();
    isWatchAllRef.current = false;
    isSubmittedRef.current = false;
    isDirtyRef.current = false;
    submitCountRef.current = 0;
  };

  const reset = useCallback(
    (values?: Partial<FormValues>): void => {
      const fieldsKeyValue = Object.entries(fieldsRef.current);

      for (const [, value] of fieldsKeyValue) {
        if (value && value.ref && value.ref.closest) {
          try {
            value.ref.closest('form').reset();
            break;
          } catch {}
        }
      }

      resetRefs();

      if (values) {
        fieldsKeyValue.forEach(([key]) =>
          setFieldValue(key, getDefaultValue<FormValues>(values, key)),
        );
        defaultRenderValuesRef.current = { ...values };
      }

      reRender();
    },
    [reRender, setFieldValue],
  );

  const getValues = useCallback(
    (payload?: { nest: boolean }): FormValues => {
      const fieldValues = getFieldsValues(fieldsRef.current);
      const outputValues = isEmptyObject(fieldValues)
        ? defaultValues
        : fieldValues;
      return payload && payload.nest
        ? combineFieldValues(outputValues)
        : outputValues;
    },
    [defaultValues],
  );

  useEffect(
    () => () => {
      isUnMount.current = true;
      fieldsRef.current &&
        Object.values(
          fieldsRef.current,
        ).forEach((field: Field | undefined): void =>
          removeEventListenerAndRef(field, true),
        );
    },
    [removeEventListenerAndRef],
  );

  const formState = {
    dirty: isDirtyRef.current,
    isSubmitted: isSubmittedRef.current,
    submitCount: submitCountRef.current,
    touched: [...touchedFieldsRef.current],
    isSubmitting: isSubmittingRef.current,
    ...(isOnSubmit
      ? {
          isValid: isSubmittedRef.current && isEmptyObject(errorsRef.current),
        }
      : {
          isValid:
            isEmptyObject(fieldsRef.current) ||
            (validationSchema
              ? isFormValid.current
              : validFieldsRef.current.size >=
                  fieldsWithValidationRef.current.size &&
                isEmptyObject(errorsRef.current)),
        }),
  };

  return {
    register: useCallback(register, []),
    unregister: useCallback(unregister, [removeEventListenerAndRef]),
    clearError: useCallback(clearError, []),
    setError: useCallback(setError, []),
    handleSubmit,
    watch,
    reset,
    setValue,
    triggerValidation,
    getValues,
    errors: errorsRef.current,
    formState: isProxyEnabled
      ? new Proxy<FormStateProxy<FormValues>>(formState, {
          get: (obj, prop: keyof FormStateProxy) => {
            if (prop in obj) {
              readFormState.current[prop] = true;
              return obj[prop];
            }

            return {};
          },
        })
      : formState,
  };
}
