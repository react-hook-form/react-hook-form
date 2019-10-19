import React, { useRef, useState, useCallback, useEffect } from 'react';
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
import isCheckBoxInput from './utils/isCheckBoxInput';
import isEmptyObject from './utils/isEmptyObject';
import isRadioInput from './utils/isRadioInput';
import isObject from './utils/isObject';
import isArray from './utils/isArray';
import isString from './utils/isString';
import isSameError from './utils/isSameError';
import isUndefined from './utils/isUndefined';
import onDomRemove from './utils/onDomRemove';
import isMultipleSelect from './utils/isMultipleSelect';
import modeChecker from './utils/validationModeChecker';
import pickErrors from './logic/pickErrors';
import { EVENTS, RADIO_INPUT, UNDEFINED, VALIDATION_MODE } from './constants';
import isNullOrUndefined from './utils/isNullOrUndefined';
import {
  FieldValues,
  FieldName,
  FieldValue,
  FieldErrors,
  Field,
  FieldsRefs,
  Options,
  Ref,
  ValidationOptions,
  SubmitPromiseResult,
  OnSubmit,
  ValidationPayload,
  ElementLike,
  Inputs,
  NameProp,
} from './types';

export default function useForm<FormValues extends FieldValues = FieldValues>({
  mode = VALIDATION_MODE.onSubmit,
  reValidateMode = VALIDATION_MODE.onChange,
  touchedMode = VALIDATION_MODE.onChange,
  validationSchema,
  defaultValues = {},
  validationFields,
  nativeValidation,
  submitFocusError = true,
  validationSchemaOption = { abortEarly: false },
}: Options<FormValues> = {}) {
  const fieldsRef = useRef<FieldsRefs<FormValues>>({});
  const errorsRef = useRef<FieldErrors<FormValues>>({});
  const schemaErrorsRef = useRef<FieldErrors<FormValues>>({});
  const touchedFieldsRef = useRef(new Set<FieldName<FormValues>>());
  const watchFieldsRef = useRef<Partial<Record<keyof FormValues, boolean>>>({});
  const dirtyFieldsRef = useRef(new Set<FieldName<FormValues>>());
  const fieldsWithValidationRef = useRef(new Set<FieldName<FormValues>>());
  const validFieldsRef = useRef(new Set<FieldName<FormValues>>());
  const defaultValuesRef = useRef<
    Record<FieldName<FormValues>, FieldValue<FormValues>>
  >({} as Record<FieldName<FormValues>, FieldValue<FormValues>>);
  const isUnMount = useRef(false);
  const isWatchAllRef = useRef(false);
  const isSubmittedRef = useRef(false);
  const isDirtyRef = useRef(false);
  const submitCountRef = useRef(0);
  const isSubmittingRef = useRef(false);
  const isSchemaValidateTriggeredRef = useRef(false);
  const validationFieldsRef = useRef(validationFields);
  const validateAndUpdateStateRef = useRef<Function>();
  const [, render] = useState();
  const { isOnBlur, isOnSubmit } = useRef(modeChecker(mode)).current;
  const {
    isOnBlur: isReValidateOnBlur,
    isOnSubmit: isReValidateOnSubmit,
  } = useRef(modeChecker(reValidateMode)).current;
  const {
    isOnBlur: isTouchedOnBlur
  } = useRef(modeChecker(touchedMode)).current;
  const validationSchemaOptionRef = useRef(validationSchemaOption);
  validationFieldsRef.current = validationFields;

  const combineErrorsRef = (data: FieldErrors<FormValues>) => ({
    ...errorsRef.current,
    ...data,
  });

  const renderBaseOnError = useCallback(
    (
      name: FieldName<FormValues>,
      error: FieldErrors<FormValues>,
      shouldRender = true,
    ) => {
      if (isEmptyObject(error)) {
        delete errorsRef.current[name];
        if (fieldsWithValidationRef.current.has(name) || validationSchema) {
          validFieldsRef.current.add(name);
        }
      } else {
        validFieldsRef.current.delete(name);
      }

      if (shouldRender) {
        render({});
      }
    },
    [validationSchema],
  );

  const setFieldValue = (
    name: FieldName<FormValues>,
    rawValue: FieldValue<FormValues> | Partial<FormValues>,
  ): boolean => {
    const field = fieldsRef.current[name];

    if (!field) {
      return false;
    }

    const ref = field.ref;
    const { type } = ref;
    const options = field.options;
    const value =
      typeof document !== UNDEFINED &&
      typeof window !== UNDEFINED &&
      !isUndefined(window.HTMLElement) &&
      ref instanceof window.HTMLElement &&
      isNullOrUndefined(rawValue)
        ? ''
        : rawValue;

    if (isRadioInput(type) && options) {
      options.forEach(
        ({ ref: radioRef }) => (radioRef.checked = radioRef.value === value),
      );
    } else if (isMultipleSelect(type)) {
      [...ref.options].forEach(
        selectRef =>
          (selectRef.selected = (value as any).includes(selectRef.value)),
      );
    } else {
      ref[isCheckBoxInput(type) ? 'checked' : 'value'] = value;
    }

    return type;
  };

  const setDirty = (name: FieldName<FormValues>): boolean => {
    if (!fieldsRef.current[name]) {
      return false;
    }

    const isDirty =
      defaultValuesRef.current[name] !==
      getFieldValue(fieldsRef.current, fieldsRef.current[name]!.ref);
    const isDirtyChanged = dirtyFieldsRef.current.has(name) !== isDirty;

    if (isDirty) {
      dirtyFieldsRef.current.add(name);
    } else {
      dirtyFieldsRef.current.delete(name);
    }

    isDirtyRef.current = !!dirtyFieldsRef.current.size;
    return isDirtyChanged;
  };

  const setValueInternal = useCallback(
    (name: FieldName<FormValues>, value: FieldValue<FormValues>): void => {
      const shouldRender = setFieldValue(name, value);
      if (
        setDirty(name) ||
        shouldRender ||
        !touchedFieldsRef.current.has(name)
      ) {
        touchedFieldsRef.current.add(name);
        render({});
      }
    },
    [],
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
      shouldRender = true,
    ): Promise<boolean> => {
      const field = fieldsRef.current[name]!;

      if (!field) {
        return false;
      }
      if (!isUndefined(value)) {
        setValueInternal(name, value);
      }

      const error = await validateField(field, fieldsRef.current);
      errorsRef.current = combineErrorsRef(error);
      renderBaseOnError(name, error, shouldRender);

      return isEmptyObject(error);
    },
    [renderBaseOnError, setValueInternal],
  );

  const validateWithSchemaCurry = useCallback(
    validateWithSchema.bind(
      null,
      validationSchema,
      validationSchemaOptionRef.current,
    ),
    [validationSchema],
  );

  const executeSchemaValidation = useCallback(
    async (
      payload:
        | ValidationPayload<FieldName<FormValues>, FieldValue<FormValues>>
        | ValidationPayload<FieldName<FormValues>, FieldValue<FormValues>>[],
    ): Promise<boolean> => {
      const { fieldErrors } = await validateWithSchemaCurry(
        combineFieldValues(getFieldsValues(fieldsRef.current)),
      );
      const names = isArray(payload)
        ? payload.map(({ name }) => name)
        : [payload.name];
      const validFieldNames = names.filter(
        name => !(fieldErrors as FieldErrors<FormValues>)[name],
      );
      schemaErrorsRef.current = fieldErrors;
      isSchemaValidateTriggeredRef.current = true;

      errorsRef.current = omitValidFields<FormValues>(
        combineErrorsRef(
          Object.entries(fieldErrors)
            .filter(([key]) => names.includes(key as FieldName<FormValues>))
            .reduce(
              (previous, [name, error]) => ({ ...previous, [name]: error }),
              {},
            ),
        ),
        validFieldNames,
      );

      render({});

      return isEmptyObject(errorsRef.current);
    },
    [validateWithSchemaCurry],
  );

  const triggerValidation = useCallback(
    async (
      payload?:
        | ValidationPayload<FieldName<FormValues>, FieldValue<FormValues>>
        | ValidationPayload<FieldName<FormValues>, FieldValue<FormValues>>[],
      shouldRender?: boolean,
    ): Promise<boolean> => {
      const fields: any =
        payload || Object.keys(fieldsRef.current).map(name => ({ name }));

      if (validationSchema) {
        return executeSchemaValidation(fields);
      }

      if (isArray(fields)) {
        const result = await Promise.all(
          fields.map(async data => await executeValidation(data, false)),
        );
        render({});
        return result.every(Boolean);
      }

      return await executeValidation(fields, shouldRender);
    },
    [executeSchemaValidation, executeValidation, validationSchema],
  );

  const setValue = useCallback<
    <Name extends FieldName<FormValues>>(
      name: Name,
      value: FormValues[Name],
      shouldValidate?: boolean,
    ) => void | Promise<boolean>
  >(
    (name, value, shouldValidate = false) => {
      setValueInternal(name, value);
      const shouldRender =
        isWatchAllRef.current || watchFieldsRef.current[name];
      if (shouldValidate) {
        return triggerValidation({ name }, shouldRender);
      }
      if (shouldRender) {
        render({});
      }
      return;
    },
    [setValueInternal, triggerValidation],
  );

  validateAndUpdateStateRef.current = validateAndUpdateStateRef.current
    ? validateAndUpdateStateRef.current
    : async (event: MouseEvent): Promise<void> => {
        const { type, target } = event;
        const name = target ? (target as Inputs).name : '';
        if (
          isArray(validationFieldsRef.current) &&
          !validationFieldsRef.current.includes(name)
        ) {
          return;
        }

        const fields = fieldsRef.current;
        const errors = errorsRef.current;
        const ref = fields[name];
        let error;

        if (!ref) {
          return;
        }

        const isBlurEvent = type === EVENTS.BLUR;
        const shouldSkipValidation =
          (isOnSubmit && !isSubmittedRef.current) ||
          (isOnBlur && !isBlurEvent && !errors[name]) ||
          (isReValidateOnBlur && !isBlurEvent && errors[name]) ||
          (isReValidateOnSubmit && errors[name]);
        const shouldSkipTouched = (isTouchedOnBlur && !isBlurEvent);
        const shouldUpdateDirty = setDirty(name);
        let shouldUpdateState =
          isWatchAllRef.current ||
          watchFieldsRef.current[name as FieldName<FormValues>] ||
          shouldUpdateDirty;

        if (!shouldSkipTouched && !touchedFieldsRef.current.has(name)) {
          touchedFieldsRef.current.add(name);
          shouldUpdateState = true;
        }

        if (shouldSkipValidation) {
          return shouldUpdateState ? render({}) : undefined;
        }

        if (validationSchema) {
          const { fieldErrors } = await validateWithSchemaCurry(
            combineFieldValues(getFieldsValues(fields)),
          );
          schemaErrorsRef.current = fieldErrors;
          isSchemaValidateTriggeredRef.current = true;
          error = (fieldErrors as FieldErrors<FormValues>)[name]
            ? { [name]: (fieldErrors as FieldErrors<FormValues>)[name] }
            : {};
        } else {
          error = await validateField(ref, fields, nativeValidation);
        }

        const shouldUpdate = shouldUpdateWithError<FormValues>({
          errors,
          error,
          name,
          validFields: validFieldsRef.current,
          fieldsWithValidation: fieldsWithValidationRef.current,
        });

        if (shouldUpdate) {
          errorsRef.current = combineErrorsRef(error as FieldErrors<
            FormValues
          >);
          renderBaseOnError(name, error as FieldErrors<FormValues>);
          return;
        }

        if (shouldUpdateState) {
          render({});
        }
      };

  const resetFieldRef = (name: FieldName<FormValues>) => {
    delete watchFieldsRef.current[name];
    delete errorsRef.current[name];
    delete fieldsRef.current[name];
    delete defaultValuesRef.current[name];
    [
      touchedFieldsRef,
      dirtyFieldsRef,
      fieldsWithValidationRef,
      validFieldsRef,
    ].forEach(data => data.current.delete(name));
  };

  const removeEventListenerAndRef = useCallback(
    (field: Field | undefined, forceDelete?: boolean) => {
      if (!field) {
        return;
      }

      findRemovedFieldAndRemoveListener(
        fieldsRef.current,
        validateAndUpdateStateRef.current,
        field,
        forceDelete,
      );
      resetFieldRef(field.ref.name);
    },
    [],
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
        fieldName => delete errorsRef.current[fieldName],
      );
    }

    render({});
  }

  const setError = (
    name: FieldName<FormValues>,
    type: string,
    message?: string,
    ref?: Ref,
  ): void => {
    const errors = errorsRef.current;

    if (!isSameError(errors[name], type, message)) {
      errors[name] = {
        type,
        message,
        ref,
        isManual: true,
      };
      render({});
    }
  };

  function watch(): FormValues;
  function watch(
    field: FieldName<FormValues>,
    defaultValue?: string,
  ): FieldValue<FormValues>;
  function watch(
    fields: FieldName<FormValues>[],
    defaultValues?: Partial<FormValues>,
  ): Partial<FormValues>;
  function watch(
    fieldNames?: FieldName<FormValues> | FieldName<FormValues>[],
    defaultValue?: string | Partial<FormValues>,
  ): FieldValue<FormValues> | Partial<FormValues> | string | undefined {
    const fieldValues = getFieldsValues<FormValues>(fieldsRef.current);
    const watchFields = watchFieldsRef.current;

    if (isString(fieldNames)) {
      const value = assignWatchFields<FormValues>(
        fieldValues,
        fieldNames,
        watchFields,
      );

      return isUndefined(value)
        ? isUndefined(defaultValue)
          ? getDefaultValue(defaultValues, fieldNames)
          : defaultValue
        : value;
    }

    if (isArray(fieldNames)) {
      return fieldNames.reduce((previous, name) => {
        let value = getDefaultValue(defaultValues, name);

        if (isEmptyObject(fieldsRef.current) && isObject(defaultValue)) {
          value = defaultValue[name];
        } else {
          const tempValue = assignWatchFields<FormValues>(
            fieldValues,
            name,
            watchFields,
          );

          if (!isUndefined(tempValue)) {
            value = tempValue;
          }
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

  function registerIntoFieldsRef<Element extends ElementLike>(
    ref: Element,
    validateOptions: ValidationOptions = {},
  ): void {
    if (!ref.name) {
      return console.warn('Missing name on ref', ref);
    }

    const { name, type, value } = ref;
    const typedName = name as FieldName<FormValues>;
    const fieldAttributes = {
      ref,
      ...validateOptions,
    };
    const fields: FieldsRefs<FormValues> = fieldsRef.current;
    const isRadio = isRadioInput(type);
    let currentField = (fields[typedName] || undefined) as Field;
    const isRegistered = isRadio
      ? currentField &&
        isArray(currentField.options) &&
        currentField.options.find(({ ref }: Field) => value === ref.value)
      : currentField;

    if (isRegistered) {
      return;
    }

    if (!type) {
      currentField = fieldAttributes;
    } else {
      const mutationWatcher = onDomRemove(ref, () =>
        removeEventListenerAndRef(fieldAttributes),
      );

      if (isRadio) {
        currentField = {
          options: [
            ...(currentField && currentField.options
              ? currentField.options
              : []),
            {
              ref,
              mutationWatcher,
            },
          ],
          ref: { type: RADIO_INPUT, name },
          ...validateOptions,
        };
      } else {
        currentField = {
          ...fieldAttributes,
          mutationWatcher,
        };
      }
    }

    fields[typedName] = currentField;

    if (!isEmptyObject(defaultValues)) {
      const defaultValue = getDefaultValue(defaultValues, name);

      if (!isUndefined(defaultValue)) {
        setFieldValue(name, defaultValue);
      }
    }

    if (validateOptions && !isEmptyObject(validateOptions)) {
      if (!validationFields || validationFields.includes(name)) {
        fieldsWithValidationRef.current.add(name);
      }

      if (!isOnSubmit) {
        if (validationSchema) {
          isSchemaValidateTriggeredRef.current = true;
          validateWithSchemaCurry(
            combineFieldValues(getFieldsValues(fields)),
          ).then(({ fieldErrors }) => {
            schemaErrorsRef.current = fieldErrors;
            if (isEmptyObject(schemaErrorsRef.current)) {
              render({});
            }
          });
        } else {
          validateField(currentField, fields).then(error => {
            if (isEmptyObject(error)) {
              validFieldsRef.current.add(name);
            }

            if (
              validFieldsRef.current.size ===
              fieldsWithValidationRef.current.size
            ) {
              render({});
            }
          });
        }
      }
    }

    if (!defaultValuesRef.current[typedName]) {
      defaultValuesRef.current[typedName] = getFieldValue(
        fields,
        currentField.ref,
      );
    }

    if (!type) {
      return;
    }

    const fieldToRegister =
      isRadio && currentField.options
        ? currentField.options[currentField.options.length - 1]
        : currentField;

    if (isOnSubmit && isReValidateOnSubmit) {
      return;
    }

    if (nativeValidation && validateOptions) {
      attachNativeValidation(ref, validateOptions);
    } else {
      attachEventListeners({
        field: fieldToRegister,
        isRadio,
        validateAndStateUpdate: validateAndUpdateStateRef.current,
        isOnBlur,
        isReValidateOnBlur,
      });
    }
  }

  // For JSX registry
  // React-Native (Element has no name prop, so it must be passed in on teh validateRule)
  function register<Element>(
    validateRule: ValidationOptions & NameProp,
  ): (ref: Element | null) => void;

  // Web model (name is on the element prop)
  function register<Element extends ElementLike = ElementLike>(
    validateRule: ValidationOptions,
  ): (ref: Element | null) => void;

  // For non-JSX registry:
  // React-Native (Element has no name prop)
  // - this case also allows a manual web-based register call to override the name prop
  function register<Element>(
    ref: Element | null,
    validateRule: ValidationOptions & NameProp,
  ): void;

  // Web model (name is on the prop for the ref passed in)
  function register<Element extends ElementLike = ElementLike>(
    ref: Element | null,
    validationOptions?: ValidationOptions,
  ): void;

  function register<Element extends ElementLike = ElementLike>(
    refOrValidateRule: ValidationOptions | Element | null,
    validationOptions?: ValidationOptions & Partial<NameProp>,
  ): ((ref: Element | null) => void) | void {
    if (typeof window === UNDEFINED || !refOrValidateRule) {
      return;
    }

    if (validationOptions && typeof validationOptions.name === 'string') {
      registerIntoFieldsRef(
        { name: validationOptions.name },
        validationOptions,
      );
      return;
    }

    if (
      isObject(refOrValidateRule) &&
      (validationOptions || 'name' in refOrValidateRule)
    ) {
      registerIntoFieldsRef(refOrValidateRule as Element, validationOptions);
      return;
    }

    return (ref: Element | null) =>
      ref && registerIntoFieldsRef(ref, refOrValidateRule);
  }

  function unregister(name: FieldName<FormValues>): void;
  function unregister(names: FieldName<FormValues>[]): void;
  function unregister(
    names: FieldName<FormValues> | FieldName<FormValues>[],
  ): void {
    if (isEmptyObject(fieldsRef.current)) {
      return;
    }
    (isArray(names) ? names : [names]).forEach(fieldName =>
      removeEventListenerAndRef(fieldsRef.current[fieldName], true),
    );
  }

  const handleSubmit = (callback: OnSubmit<FormValues>) => async (
    e: React.BaseSyntheticEvent,
  ): Promise<void> => {
    if (e) {
      e.preventDefault();
      e.persist();
    }
    let fieldErrors;
    let fieldValues;
    const fields = fieldsRef.current;
    const fieldsToValidate: (Field | undefined)[] = validationFields
      ? validationFields.map(name => fieldsRef.current[name])
      : Object.values(fields);

    isSubmittingRef.current = true;
    render({});

    if (validationSchema) {
      fieldValues = getFieldsValues(fields);
      const output = await validateWithSchemaCurry(
        combineFieldValues(fieldValues),
      );
      schemaErrorsRef.current = output.fieldErrors;
      fieldErrors = output.fieldErrors;
      fieldValues = output.result;
    } else {
      const {
        errors,
        values,
      }: SubmitPromiseResult<FormValues> = await fieldsToValidate.reduce(
        async (
          previous: Promise<SubmitPromiseResult<FormValues>>,
          field: Field | undefined,
        ): Promise<SubmitPromiseResult<FormValues>> => {
          if (!field) {
            return previous;
          }

          const resolvedPrevious: any = await previous;
          const {
            ref,
            ref: { name },
          } = field;

          if (!fields[name]) {
            return Promise.resolve(resolvedPrevious);
          }

          const fieldError = await validateField(
            field,
            fields,
            nativeValidation,
          );

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
          resolvedPrevious.values[name] = getFieldValue(fields, ref);
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
          if (field && field.ref.focus && previous) {
            field.ref.focus();
            return false;
          }
          return previous;
        }, true);
      }

      errorsRef.current = fieldErrors;
    }

    if (isUnMount.current) {
      return;
    }

    isSubmittedRef.current = true;
    isSubmittingRef.current = false;
    submitCountRef.current = submitCountRef.current + 1;
    render({});
  };

  const resetRefs = () => {
    errorsRef.current = {};
    schemaErrorsRef.current = {};
    touchedFieldsRef.current = new Set();
    watchFieldsRef.current = {};
    dirtyFieldsRef.current = new Set();
    fieldsWithValidationRef.current = new Set();
    validFieldsRef.current = new Set();
    defaultValuesRef.current = {} as Record<
      FieldName<FormValues>,
      FieldValue<FormValues>
    >;
    isWatchAllRef.current = false;
    isSubmittedRef.current = false;
    isDirtyRef.current = false;
    isSchemaValidateTriggeredRef.current = false;
  };

  const reset = useCallback((values?: FormValues): void => {
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
        setFieldValue(
          key as FieldName<FormValues>,
          getDefaultValue(values, key),
        ),
      );
      defaultValuesRef.current = { ...values } as Record<
        FieldName<FormValues>,
        FieldValue<FormValues>
      >;
    }

    submitCountRef.current = 0;
    render({});
  }, []);

  const getValues = (payload?: { nest: boolean }): FormValues => {
    const fieldValues = getFieldsValues(fieldsRef.current);
    const output =
      payload && payload.nest ? combineFieldValues(fieldValues) : fieldValues;

    return isEmptyObject(output) ? defaultValues : output;
  };

  useEffect(
    () => () => {
      isUnMount.current = true;
      fieldsRef.current &&
        Object.values(fieldsRef.current).forEach(
          (field: Field | undefined): void =>
            removeEventListenerAndRef(field, true),
        );
    },
    [removeEventListenerAndRef],
  );

  return {
    register: useCallback(register, [registerIntoFieldsRef]),
    unregister: useCallback(unregister, [
      unregister,
      removeEventListenerAndRef,
    ]),
    handleSubmit,
    watch,
    reset,
    clearError,
    setError,
    setValue,
    triggerValidation,
    getValues,
    errors: validationFields
      ? pickErrors<FormValues>(errorsRef.current, validationFields)
      : errorsRef.current,
    formState: {
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
            isValid: validationSchema
              ? isSchemaValidateTriggeredRef.current &&
                isEmptyObject(schemaErrorsRef.current)
              : fieldsWithValidationRef.current.size
              ? !isEmptyObject(fieldsRef.current) &&
                validFieldsRef.current.size >=
                  fieldsWithValidationRef.current.size
              : !isEmptyObject(fieldsRef.current),
          }),
    },
  };
}
