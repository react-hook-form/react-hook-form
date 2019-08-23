import React, { useRef, useState, useCallback, useEffect } from 'react';
import attachEventListeners from './logic/attachEventListeners';
import combineFieldValues from './logic/combineFieldValues';
import findRemovedFieldAndRemoveListener from './logic/findRemovedFieldAndRemoveListener';
import getFieldsValues from './logic/getFieldsValues';
import getFieldValue from './logic/getFieldValue';
import shouldUpdateWithError from './logic/shouldUpdateWithError';
import validateField from './logic/validateField';
import validateWithSchema from './logic/validateWithSchema';
import attachNativeValidation from './logic/attachNativeValidation';
import getDefaultValue from './logic/getDefaultValue';
import assignWatchFields from './logic/assignWatchFields';
import omitValidFields from './logic/omitValidFields';
import get from './utils/get';
import isCheckBoxInput from './utils/isCheckBoxInput';
import isEmptyObject from './utils/isEmptyObject';
import isRadioInput from './utils/isRadioInput';
import isObject from './utils/isObject';
import isArray from './utils/isArray';
import isString from './utils/isString';
import isUndefined from './utils/isUndefined';
import onDomRemove from './utils/onDomRemove';
import modeChecker from './utils/validationModeChecker';
import { VALIDATION_MODE } from './constants';
import {
  DataType,
  ErrorMessages,
  Field,
  FieldsObject,
  FieldValue,
  Props,
  Ref,
  RegisterInput,
  SubmitPromiseResult,
  OnSubmit,
  ValidationPayload,
  ElementLike,
} from './types';

export default function useForm<
  Data extends DataType,
  Name extends keyof Data = keyof Data
>({
  mode = VALIDATION_MODE.onSubmit,
  validationSchema,
  defaultValues = {},
  validationFields,
  nativeValidation,
  submitFocusError = true,
}: Props<Data> = {}) {
  const fieldsRef = useRef<FieldsObject<Data>>({});
  const errorsRef = useRef<ErrorMessages<Data>>({});
  const schemaErrorsRef = useRef<DataType>({});
  const submitCountRef = useRef(0);
  const touchedFieldsRef = useRef(new Set<Name>());
  const watchFieldsRef = useRef<Partial<Record<keyof Data, boolean>>>({});
  const dirtyFieldsRef = useRef(new Set<Name>());
  const fieldsWithValidationRef = useRef(new Set());
  const validFieldsRef = useRef(new Set());
  const defaultValuesRef = useRef<Record<Name, FieldValue>>({} as any);
  const isUnMount = useRef(false);
  const isWatchAllRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const isSubmittedRef = useRef(false);
  const isDirtyRef = useRef(false);
  const isSchemaValidateTriggeredRef = useRef(false);
  const validateAndStateUpdateRef = useRef<Function>();
  const [, reRenderForm] = useState({});
  const { isOnChange, isOnBlur, isOnSubmit } = useRef(
    modeChecker(mode),
  ).current;

  const combineErrorsRef = (data: ErrorMessages<Data>) => ({
    ...errorsRef.current,
    ...data,
  });

  const renderBaseOnError = useCallback(
    (
      name: Name,
      errorsFromRef: ErrorMessages<Data>,
      error: ErrorMessages<Data>,
      shouldRender: boolean = true,
    ): boolean => {
      if (errorsFromRef[name] && !error[name]) {
        delete errorsRef.current[name];
        validFieldsRef.current.add(name);
        if (shouldRender) reRenderForm({});
        return true;
      }
      if (error[name]) {
        validFieldsRef.current.delete(name);
        if (shouldRender) reRenderForm({});
        return true;
      }
      if (!isOnSubmit && !validFieldsRef.current.has(name)) {
        validFieldsRef.current.add(name);
        if (shouldRender) reRenderForm({});
        return true;
      }
      return false;
    },
    [isOnSubmit],
  );

  const setFieldValue = (
    name: Name,
    value: Record<string, FieldValue> | undefined,
  ): void => {
    const field = fieldsRef.current[name];
    if (!field) return;
    const ref = field.ref;
    const options = field.options;

    if (isRadioInput(ref.type) && options) {
      options.forEach(({ ref: radioRef }): void => {
        if (radioRef.value === value) radioRef.checked = true;
      });
    } else {
      ref[isCheckBoxInput(ref.type) ? 'checked' : 'value'] = value;
    }
  };

  const setDirty = (name: Name): boolean => {
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
    (name: Name, value: Data[Name]): void => {
      setFieldValue(name, value);
      touchedFieldsRef.current.add(name);
      setDirty(name);
      reRenderForm({});
    },
    [],
  );

  const executeValidation = useCallback(
    async (
      {
        name,
        value,
      }: {
        name: Name;
        value?: Data[Name];
      },
      shouldRender: boolean = true,
    ): Promise<boolean> => {
      const field = fieldsRef.current[name]!;
      const errors = errorsRef.current;

      if (!field) return false;
      if (value !== undefined) setValueInternal(name, value);

      const error = await validateField(field, fieldsRef.current);
      errorsRef.current = combineErrorsRef(error);
      renderBaseOnError(name, errors, error, shouldRender);
      return isEmptyObject(error);
    },
    [renderBaseOnError, setValueInternal],
  );

  const executeSchemaValidation = useCallback(
    async (
      payload:
        | ValidationPayload<Name, Data[Name]>
        | ValidationPayload<Name, Data[Name]>[],
    ): Promise<boolean> => {
      const { fieldErrors } = await validateWithSchema(
        validationSchema,
        combineFieldValues(getFieldsValues(fieldsRef.current)),
      );
      const names = isArray(payload)
        ? payload.map(({ name }) => name as string)
        : [payload.name as string];
      const validFieldNames = names.filter(name => !fieldErrors[name]);
      const skipNamesOmittedInPayload = ([key]: [string, string]) =>
        names.includes(key);

      schemaErrorsRef.current = fieldErrors;
      errorsRef.current = omitValidFields(
        combineErrorsRef(
          Object.entries(fieldErrors)
            .filter(skipNamesOmittedInPayload)
            .reduce(
              (previous, [name, error]) => ({ ...previous, [name]: error }),
              {},
            ),
        ),
        validFieldNames,
      );
      isSchemaValidateTriggeredRef.current = true;

      reRenderForm({});
      return isEmptyObject(errorsRef.current);
    },
    [validationSchema],
  );

  const triggerValidation = useCallback(
    async (
      payload?:
        | ValidationPayload<Name, Data[Name]>
        | ValidationPayload<Name, Data[Name]>[],
    ): Promise<boolean> => {
      let fields: any = payload;

      if (!payload)
        fields = Object.keys(fieldsRef.current).map(name => ({ name }));
      if (validationSchema) return executeSchemaValidation(fields);

      if (isArray(fields)) {
        const result = await Promise.all(
          fields.map(async data => await executeValidation(data, false)),
        );
        reRenderForm({});
        return result.every(Boolean);
      }
      return await executeValidation(fields);
    },
    [executeSchemaValidation, executeValidation, validationSchema],
  );

  const setValue = useCallback(
    (
      name: Name,
      value: Data[Name],
      shouldValidate: boolean = false,
    ): void | Promise<boolean> => {
      setValueInternal(name, value);
      if (shouldValidate) return triggerValidation({ name });
    },
    [setValueInternal, triggerValidation],
  );

  validateAndStateUpdateRef.current = validateAndStateUpdateRef.current
    ? validateAndStateUpdateRef.current
    : async ({ target: { name }, type }: Ref): Promise<void> => {
        if (isArray(validationFields) && !validationFields.includes(name))
          return;
        const fields = fieldsRef.current;
        const errorsFromRef = errorsRef.current;
        const ref = fields[name];
        if (!ref) return;
        const isBlurType = type === 'blur';
        const isValidateDisabled = !isSubmittedRef.current && isOnSubmit;
        const shouldUpdateValidateMode = isOnChange || (isOnBlur && isBlurType);
        let shouldUpdateState =
          isWatchAllRef.current || watchFieldsRef.current[name];

        if (setDirty(name)) {
          shouldUpdateState = true;
        }

        if (!touchedFieldsRef.current.has(name)) {
          touchedFieldsRef.current.add(name);
          shouldUpdateState = true;
        }

        if (isValidateDisabled && shouldUpdateState) return reRenderForm({});

        if (validationSchema) {
          const { fieldErrors } = await validateWithSchema(
            validationSchema,
            combineFieldValues(getFieldsValues(fields)),
          );
          schemaErrorsRef.current = fieldErrors;
          isSchemaValidateTriggeredRef.current = true;
          const error = fieldErrors[name];
          const shouldUpdate =
            ((!error && errorsFromRef[name]) || error) &&
            (shouldUpdateValidateMode || isSubmittedRef.current);

          if (shouldUpdate) {
            errorsRef.current = { ...errorsFromRef, ...{ [name]: error } };
            if (!error) delete errorsRef.current[name];
            return reRenderForm({});
          }
        } else {
          const error = await validateField(ref, fields, nativeValidation);
          const shouldUpdate = shouldUpdateWithError({
            errors: errorsFromRef,
            error,
            isValidateDisabled,
            isOnBlur,
            isBlurType,
            name,
          });

          if (shouldUpdate || shouldUpdateValidateMode) {
            errorsRef.current = combineErrorsRef(error);
            if (renderBaseOnError(name, errorsRef.current, error)) return;
          }
        }

        if (shouldUpdateState) reRenderForm({});
      };

  const resetFieldRef = (name: Name) => {
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
        validateAndStateUpdateRef.current,
        field,
        forceDelete,
      );
      resetFieldRef(field.ref.name);
    },
    [],
  );

  const clearError = (name?: Name | Name[]): void => {
    if (isUndefined(name)) {
      errorsRef.current = {};
    } else if (isString(name)) {
      delete errorsRef.current[name];
    } else if (isArray(name)) {
      name.forEach(item => delete errorsRef.current[item]);
    }
    reRenderForm({});
  };

  const setError = (
    name: Name,
    type: string,
    message?: string,
    ref?: Ref,
  ): void => {
    const errorsFromRef = errorsRef.current;
    const error = errorsFromRef[name];
    const isSameError =
      error &&
      !isString(error) &&
      (error.type === type && error.message === message);

    if (!isSameError) {
      errorsFromRef[name] = {
        type,
        message,
        ref,
        isManual: true,
      };
      reRenderForm({});
    }
  };

  function watch(): Data;
  function watch(
    field: Name | string,
    defaultValue?: string,
  ): FieldValue | void;
  function watch(
    fields: (Name | string)[],
    defaultValues?: Partial<Data>,
  ): Partial<Data>;
  function watch(
    fieldNames?: Name | string | (Name | string)[],
    defaultValue?: string | Partial<Data>,
  ): FieldValue | Partial<Data> | void {
    const fieldValues = getFieldsValues(fieldsRef.current);
    const watchFields: any = watchFieldsRef.current;

    if (isString(fieldNames)) {
      const value = assignWatchFields(fieldValues, fieldNames, watchFields);

      if (!isUndefined(value)) return value;
      return isUndefined(defaultValue)
        ? getDefaultValue(defaultValues, fieldNames)
        : defaultValue;
    }

    if (isArray(fieldNames)) {
      return fieldNames.reduce(
        (previous, name) => ({
          ...previous,
          [name]: isEmptyObject(fieldsRef.current)
            ? get(defaultValues, name as string)
            : assignWatchFields(fieldValues, name as string, watchFields) ||
              getDefaultValue(defaultValues, name as string),
        }),
        {},
      );
    }

    isWatchAllRef.current = true;
    return (
      (isEmptyObject(fieldValues) ? undefined : fieldValues) ||
      defaultValue ||
      defaultValues
    );
  }

  function __registerIntoFieldsRef<Element extends ElementLike>(
    elementRef: Element,
    data: RegisterInput = {},
  ): void {
    if (!elementRef.name) return console.warn('Miss name', elementRef);

    const { name, type, value } = elementRef;

    if (!isOnSubmit && data && !isEmptyObject(data)) {
      fieldsWithValidationRef.current.add(name);
    }

    const { required = false, validate = undefined } = data || {};
    const inputData = {
      ...data,
      ref: elementRef,
    };
    const fields: any = fieldsRef.current;
    const fieldDefaultValues = defaultValuesRef.current;
    const isRadio = isRadioInput(type);
    const field = fields[name];
    const existRadioOptionIndex =
      isRadio && field && isArray(field.options)
        ? field.options.findIndex(
            ({ ref }: { ref: Ref }): boolean => value === ref.value,
          )
        : -1;

    if ((!isRadio && field) || (isRadio && existRadioOptionIndex > -1)) return;

    if (!type) {
      fields[name] = { ref: { name }, ...data };
    } else {
      if (isRadio) {
        if (!field)
          fields[name] = {
            options: [],
            required,
            validate,
            ref: { type: 'radio', name },
          };
        if (validate) fields[name]!.validate = validate;

        (fields[name]!.options || []).push({
          ...inputData,
          mutationWatcher: onDomRemove(elementRef, () =>
            removeEventListenerAndRef(inputData),
          ),
        });
      } else {
        fields[name] = {
          ...inputData,
          mutationWatcher: onDomRemove(elementRef, () =>
            removeEventListenerAndRef(inputData),
          ),
        };
      }
    }

    if (defaultValues) {
      const defaultValue = defaultValues[name] || get(defaultValues, name);
      if (defaultValue !== undefined) setFieldValue(name as Name, defaultValue);
    }

    if (!fieldDefaultValues[name as Name])
      fieldDefaultValues[name as Name] = getFieldValue(
        fields,
        fields[name].ref,
      );

    if (!type) return;

    const fieldData = isRadio
      ? (fields[name]!.options || [])[(fields[name]!.options || []).length - 1]
      : fields[name];

    if (!fieldData) return;

    if (nativeValidation && data) {
      attachNativeValidation(elementRef, data);
    } else {
      attachEventListeners({
        field: fieldData,
        isRadio,
        validateAndStateUpdate: validateAndStateUpdateRef.current,
      });
    }
  }

  function register<Element extends ElementLike = ElementLike>(
    validateRule: RegisterInput,
  ): (ref: Element | null) => void;
  function register<Element extends ElementLike = ElementLike>(
    input: Element,
    validationOptions?: RegisterInput,
  ): undefined;
  function register<Element extends ElementLike = ElementLike>(
    refOrValidateRule: Element | RegisterInput,
    validationOptions?: RegisterInput,
  ): ((ref: Element | null) => void) | undefined {
    if (typeof window === 'undefined' || !refOrValidateRule) return;

    if (
      isObject(refOrValidateRule) &&
      (validationOptions || 'name' in refOrValidateRule)
    ) {
      __registerIntoFieldsRef(refOrValidateRule as Element, validationOptions);
      return;
    }

    return (ref: Element | null) =>
      ref && __registerIntoFieldsRef(ref, refOrValidateRule);
  }

  function unregister(name: Name | string): void;
  function unregister(names: (Name | string)[]): void;
  function unregister(names: Name | string | (Name | string)[]): void {
    if (isEmptyObject(fieldsRef.current)) return;
    (isArray(names) ? names : [names]).forEach(fieldName =>
      removeEventListenerAndRef(fieldsRef.current[fieldName], true),
    );
  }

  const handleSubmit = (callback: OnSubmit<Data>) => async (
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
    const fieldsToValidate = validationFields
      ? validationFields.map(name => fieldsRef.current[name])
      : Object.values(fields);
    isSubmittingRef.current = true;
    reRenderForm({});

    if (validationSchema) {
      fieldValues = getFieldsValues(fields);
      const output = await validateWithSchema(
        validationSchema,
        combineFieldValues(fieldValues),
      );
      schemaErrorsRef.current = output.fieldErrors;
      fieldErrors = output.fieldErrors;
      fieldValues = output.result;
    } else {
      const {
        errors,
        values,
      }: SubmitPromiseResult<Data> = await fieldsToValidate.reduce(
        async (
          previous: Promise<SubmitPromiseResult<Data>>,
          field: Field | undefined,
        ): Promise<SubmitPromiseResult<Data>> => {
          if (!field) return previous;
          const resolvedPrevious: any = await previous;
          const {
            ref,
            ref: { name },
          } = field;

          if (!fields[name]) return Promise.resolve(resolvedPrevious);

          const fieldError = await validateField(
            field,
            fields,
            nativeValidation,
          );

          if (fieldError[name]) {
            if (submitFocusError && firstFocusError && ref.focus) {
              ref.focus();
              firstFocusError = false;
            }
            resolvedPrevious.errors = {
              ...resolvedPrevious.errors,
              ...fieldError,
            };
            return Promise.resolve(resolvedPrevious);
          }

          resolvedPrevious.values[name] = getFieldValue(fields, ref);
          return Promise.resolve(resolvedPrevious);
        },
        Promise.resolve<SubmitPromiseResult<Data>>({
          errors: {} as ErrorMessages<Data>,
          values: {} as Data,
        }),
      );

      fieldErrors = errors;
      fieldValues = values;
    }

    if (isEmptyObject(fieldErrors)) {
      errorsRef.current = {};
      await callback(combineFieldValues(fieldValues), e);
    } else {
      errorsRef.current = fieldErrors as any;
    }

    if (isUnMount.current) return;

    isSubmittedRef.current = true;
    submitCountRef.current += 1;
    isSubmittingRef.current = false;
    reRenderForm({});
  };

  const resetRefs = () => {
    errorsRef.current = {};
    schemaErrorsRef.current = {};
    submitCountRef.current = 0;
    touchedFieldsRef.current = new Set();
    watchFieldsRef.current = {};
    dirtyFieldsRef.current = new Set();
    fieldsWithValidationRef.current = new Set();
    validFieldsRef.current = new Set();
    defaultValuesRef.current = {} as any;
    isWatchAllRef.current = false;
    isSubmittedRef.current = false;
    isDirtyRef.current = false;
    isSchemaValidateTriggeredRef.current = false;
  };

  const reset = useCallback((values?: DataType): void => {
    const fields = fieldsRef.current;
    const fieldsKeyValue = Object.entries(fields);

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
        setFieldValue(key as Name, get(values, key, '')),
      );
    }
    reRenderForm({});
  }, []);

  const getValues = (payload?: { nest: boolean }): Data => {
    const data = getFieldsValues<Data>(fieldsRef.current);
    const output = payload && payload.nest ? combineFieldValues(data) : data;
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
    [],
  );

  return {
    register: useCallback(register, [__registerIntoFieldsRef]),
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
    errors: errorsRef.current,
    formState: {
      dirty: isDirtyRef.current,
      isSubmitted: isSubmittedRef.current,
      submitCount: submitCountRef.current,
      touched: [...touchedFieldsRef.current],
      isSubmitting: isSubmittingRef.current,
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
