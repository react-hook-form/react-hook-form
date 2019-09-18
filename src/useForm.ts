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
import { INPUT_TYPES, RADIO_INPUT, VALIDATION_MODE } from './constants';
import {
  FieldValues,
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
  DefaultFieldValues,
} from './types';
import isNullOrUndefined from './utils/isNullOrUndefined';

export default function useForm<
  FormValues extends FieldValues = DefaultFieldValues,
  FieldName extends keyof FormValues = keyof FormValues,
  FieldValue = FormValues[FieldName]
>({
  mode = VALIDATION_MODE.onSubmit,
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
  const touchedFieldsRef = useRef(new Set<FieldName>());
  const watchFieldsRef = useRef<Partial<Record<keyof FormValues, boolean>>>({});
  const dirtyFieldsRef = useRef(new Set<FieldName>());
  const fieldsWithValidationRef = useRef(new Set<FieldName>());
  const validFieldsRef = useRef(new Set<FieldName>());
  const defaultValuesRef = useRef<Record<FieldName, FieldValue>>({} as Record<
    FieldName,
    FieldValue
  >);
  const isUnMount = useRef(false);
  const isWatchAllRef = useRef(false);
  const isSubmittedRef = useRef(false);
  const isDirtyRef = useRef(false);
  const isSchemaValidateTriggeredRef = useRef(false);
  const validationFieldsRef = useRef(validationFields);
  const validateAndUpdateStateRef = useRef<Function>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [, render] = useState();
  const { isOnBlur, isOnSubmit } = useRef(modeChecker(mode)).current;
  const validationSchemaOptionRef = useRef(validationSchemaOption);
  validationFieldsRef.current = validationFields;

  const combineErrorsRef = (data: FieldErrors<FormValues>) => ({
    ...errorsRef.current,
    ...data,
  });

  const renderBaseOnError = useCallback(
    (
      name: FieldName,
      error: FieldErrors<FormValues>,
      shouldRender: boolean = true,
    ) => {
      if (isEmptyObject(error)) {
        delete errorsRef.current[name];
        if (fieldsWithValidationRef.current.has(name) || validationSchema)
          validFieldsRef.current.add(name);
      } else {
        validFieldsRef.current.delete(name);
      }

      if (shouldRender) render({});
    },
    [validationSchema],
  );

  const setFieldValue = (name: FieldName, value: FieldValue): boolean => {
    const field = fieldsRef.current[name];

    if (!field) return false;

    const ref = field.ref;
    const { type } = ref;
    const options = field.options;

    if (isRadioInput(type) && options) {
      options.forEach(
        ({ ref: radioRef }) => (radioRef.checked = radioRef.value === value),
      );
    } else if (isMultipleSelect(type)) {
      [...ref.options].forEach(
        selectRef =>
          (selectRef.selected = (value as any).includes(selectRef.value)),
      );
    } else if (isCheckBoxInput(type)) {
      ref.checked = value;
    } else {
      ref.value =
        INPUT_TYPES.includes(type) && isNullOrUndefined(value) ? '' : value;
    }

    return type;
  };

  const setDirty = (name: FieldName): boolean => {
    if (!fieldsRef.current[name]) return false;

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
    (name: FieldName, value: FieldValue): void => {
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
        name: FieldName;
        value?: FormValues[FieldName];
      },
      shouldRender: boolean = true,
    ): Promise<boolean> => {
      const field = fieldsRef.current[name]!;

      if (!field) return false;
      if (!isUndefined(value)) setValueInternal(name, value);

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
        | ValidationPayload<FieldName, FieldValue>
        | ValidationPayload<FieldName, FieldValue>[],
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

      errorsRef.current = omitValidFields<FieldValues, FieldName>(
        combineErrorsRef(
          Object.entries(fieldErrors)
            .filter(([key]) => names.includes(key as FieldName))
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
        | ValidationPayload<FieldName, FieldValue>
        | ValidationPayload<FieldName, FieldValue>[],
    ): Promise<boolean> => {
      const fields: any =
        payload || Object.keys(fieldsRef.current).map(name => ({ name }));

      if (validationSchema) return executeSchemaValidation(fields);

      if (isArray(fields)) {
        const result = await Promise.all(
          fields.map(async data => await executeValidation(data, false)),
        );
        render({});
        return result.every(Boolean);
      }

      return await executeValidation(fields);
    },
    [executeSchemaValidation, executeValidation, validationSchema],
  );

  const setValue = useCallback(
    (
      name: FieldName,
      value: FieldValue,
      shouldValidate: boolean = false,
    ): void | Promise<boolean> => {
      setValueInternal(name, value);
      if (shouldValidate) return triggerValidation({ name });
    },
    [setValueInternal, triggerValidation],
  );

  validateAndUpdateStateRef.current = validateAndUpdateStateRef.current
    ? validateAndUpdateStateRef.current
    : async ({ target: { name }, type }: Ref): Promise<void> => {
        if (
          isArray(validationFieldsRef.current) &&
          !validationFieldsRef.current.includes(name)
        )
          return;

        const fields = fieldsRef.current;
        const errors = errorsRef.current;
        const ref = fields[name];
        let error;

        if (!ref) return;

        const isBlurEvent = type === 'blur';
        const isValidateDisabled =
          (isOnSubmit && !isSubmittedRef.current) ||
          (isOnBlur && !isBlurEvent && !errors[name]);
        let shouldUpdateState =
          isWatchAllRef.current ||
          watchFieldsRef.current[name as FieldName] ||
          setDirty(name);

        if (!touchedFieldsRef.current.has(name)) {
          touchedFieldsRef.current.add(name);
          shouldUpdateState = true;
        }

        if (isValidateDisabled)
          return shouldUpdateState ? render({}) : undefined;

        if (validationSchema) {
          const { fieldErrors } = await validateWithSchemaCurry(
            combineFieldValues(getFieldsValues(fields)),
          );
          schemaErrorsRef.current = fieldErrors;
          isSchemaValidateTriggeredRef.current = true;
          error = (fieldErrors as FieldErrors<FieldValues>)[name]
            ? { [name]: (fieldErrors as FieldErrors<FieldValues>)[name] }
            : {};
        } else {
          error = await validateField(ref, fields, nativeValidation);
        }

        const shouldUpdate = shouldUpdateWithError<FieldName>({
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

        if (shouldUpdateState) render({});
      };

  const resetFieldRef = (name: FieldName) => {
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
      if (!field) return;

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
  function clearError(name: FieldName): void;
  function clearError(names: FieldName[]): void;
  function clearError(name?: FieldName | FieldName[]): void {
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
    name: FieldName,
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
  function watch(field: FieldName | string, defaultValue?: string): FieldValue;
  function watch(
    fields: (FieldName | string)[],
    defaultValues?: Partial<FormValues>,
  ): Partial<FormValues>;
  function watch(
    fieldNames?: FieldName | string | (FieldName | string)[],
    defaultValue?: string | Partial<FormValues>,
  ): FieldValue | Partial<FormValues> {
    const fieldValues = getFieldsValues(fieldsRef.current);
    const watchFields = watchFieldsRef.current;

    if (isString(fieldNames)) {
      const value = assignWatchFields<FieldName, FormValues>(
        fieldValues as FormValues,
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
          const tempValue = assignWatchFields<FieldName, FormValues>(
            fieldValues as FormValues,
            name,
            watchFields,
          );

          if (!isUndefined(tempValue)) value = tempValue;
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
    if (!ref.name) return console.warn('Miss ref', ref);

    const { name, type, value } = ref;
    const fieldAttributes = {
      ref,
      ...validateOptions,
    };
    const fields: FieldValues = fieldsRef.current;
    const isRadio = isRadioInput(type);
    const currentField = fields[name];
    const isRegistered = isRadio
      ? currentField &&
        isArray(currentField.options) &&
        currentField.options.find(({ ref }: Field) => value === ref.value)
      : currentField;

    if (isRegistered) return;

    if (!type) {
      fields[name] = fieldAttributes;
    } else {
      const mutationWatcher = onDomRemove(ref, () =>
        removeEventListenerAndRef(fieldAttributes),
      );

      if (isRadio) {
        if (!currentField)
          fields[name] = {
            options: [],
            ref: { type: RADIO_INPUT, name },
          };

        fields[name] = {
          ...fields[name],
          ...validateOptions,
        };

        fields[name].options.push({
          ref,
          mutationWatcher,
        });
      } else {
        fields[name] = {
          ...fieldAttributes,
          mutationWatcher,
        };
      }
    }

    if (!isEmptyObject(defaultValues)) {
      const defaultValue = getDefaultValue(defaultValues, name);

      if (!isUndefined(defaultValue))
        setFieldValue(name as FieldName, defaultValue as FieldValue);
    }

    if (validateOptions && !isEmptyObject(validateOptions)) {
      fieldsWithValidationRef.current.add(name as FieldName);

      if (!isOnSubmit) {
        if (validationSchema) {
          isSchemaValidateTriggeredRef.current = true;
          validateWithSchemaCurry(
            combineFieldValues(getFieldsValues(fields)),
          ).then(({ fieldErrors }) => {
            schemaErrorsRef.current = fieldErrors;
            if (isEmptyObject(schemaErrorsRef.current)) render({});
          });
        } else {
          validateField(fields[name], fields).then(error => {
            if (isEmptyObject(error))
              validFieldsRef.current.add(name as FieldName);

            if (
              validFieldsRef.current.size ===
              fieldsWithValidationRef.current.size
            )
              render({});
          });
        }
      }
    }

    if (!defaultValuesRef.current[name as FieldName])
      defaultValuesRef.current[name as FieldName] = getFieldValue(
        fields,
        fields[name].ref,
      );

    if (!type) return;

    const field = isRadio
      ? fields[name].options[fields[name].options.length - 1]
      : fields[name];

    if (nativeValidation && validateOptions) {
      attachNativeValidation(ref, validateOptions);
    } else {
      attachEventListeners({
        field,
        isRadio,
        validateAndStateUpdate: validateAndUpdateStateRef.current,
        isOnBlur,
      });
    }
  }

  function register<Element extends ElementLike = ElementLike>(
    validateRule: ValidationOptions,
  ): (ref: Element | null) => void;
  function register<Element extends ElementLike = ElementLike>(
    ref: Element | null,
    validationOptions?: ValidationOptions,
  ): void;
  function register<Element extends ElementLike = ElementLike>(
    refOrValidateRule: ValidationOptions | Element | null,
    validationOptions?: ValidationOptions,
  ): ((ref: Element | null) => void) | void {
    if (typeof window === 'undefined' || !refOrValidateRule) return;

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

  function unregister(name: FieldName | string): void;
  function unregister(names: (FieldName | string)[]): void;
  function unregister(
    names: FieldName | string | (FieldName | string)[],
  ): void {
    if (isEmptyObject(fieldsRef.current)) return;
    (isArray(names) ? names : [names]).forEach(fieldName =>
      removeEventListenerAndRef(fieldsRef.current[fieldName], true),
    );
  }

  const handleSubmit = (callback: OnSubmit<FormValues>) => async (
    e: React.SyntheticEvent,
  ): Promise<void> => {
    if (e) {
      e.preventDefault();
      e.persist();
    }
    let fieldErrors;
    let fieldValues;
    let firstFocusError = true;
    const fields = fieldsRef.current;
    const fieldsToValidate: (Field | undefined)[] = validationFields
      ? validationFields.map(name => fieldsRef.current[name])
      : Object.values(fields);

    setIsSubmitting(true);

    if (validationSchema) {
      fieldValues = getFieldsValues(fields);
      const output = await validateWithSchema<FormValues>(
        validationSchema,
        validationSchemaOption,
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
          if (!field) return previous;

          const resolvedPrevious: any = await previous;
          const {
            ref,
            ref: { name, focus },
          } = field;

          if (!fields[name]) return Promise.resolve(resolvedPrevious);

          const fieldError = await validateField(
            field,
            fields,
            nativeValidation,
          );

          if (fieldError[name]) {
            if (submitFocusError && firstFocusError && focus) {
              ref.focus();
              firstFocusError = false;
            }

            resolvedPrevious.errors = {
              ...resolvedPrevious.errors,
              ...fieldError,
            };

            validFieldsRef.current.delete(name);

            return Promise.resolve(resolvedPrevious);
          }

          if (fieldsWithValidationRef.current.has(name))
            validFieldsRef.current.add(name);
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
      errorsRef.current = fieldErrors;
    }

    if (isUnMount.current) return;

    isSubmittedRef.current = true;
    setIsSubmitting(false);
    setSubmitCount(submitCount + 1);
  };

  const resetRefs = () => {
    errorsRef.current = {};
    schemaErrorsRef.current = {};
    touchedFieldsRef.current = new Set();
    watchFieldsRef.current = {};
    dirtyFieldsRef.current = new Set();
    fieldsWithValidationRef.current = new Set();
    validFieldsRef.current = new Set();
    defaultValuesRef.current = {} as Record<FieldName, FieldValue>;
    isWatchAllRef.current = false;
    isSubmittedRef.current = false;
    isDirtyRef.current = false;
    isSchemaValidateTriggeredRef.current = false;
  };

  const reset = useCallback((values?: FieldValues): void => {
    const fieldsKeyValue = Object.entries(fieldsRef.current);

    for (let [, value] of fieldsKeyValue) {
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
        setFieldValue(key as FieldName, getDefaultValue(values, key, '')),
      );
      defaultValuesRef.current = values as Record<FieldName, FieldValue>;
    }

    setSubmitCount(0);
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
      submitCount,
      touched: [...touchedFieldsRef.current],
      isSubmitting,
      ...(isOnSubmit
        ? {
            isValid: isEmptyObject(errorsRef.current),
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
