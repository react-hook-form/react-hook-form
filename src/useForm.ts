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
import isCheckBoxInput from './utils/isCheckBoxInput';
import isEmptyObject from './utils/isEmptyObject';
import isRadioInput from './utils/isRadioInput';
import onDomRemove from './utils/onDomRemove';
import modeChecker from './utils/validationModeChecker';
import warnMessage from './utils/warnMessage';
import get from './utils/get';
import isString from './utils/isString';
import isUndefined from './utils/isUndefined';
import omitValidFields from './logic/omitValidFields';
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
  VoidFunction,
  OnSubmit,
  ValidationPayload,
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
  const touchedFieldsRef = useRef(new Set());
  const watchFieldsRef = useRef<Partial<Record<keyof Data, boolean>>>({});
  const isUnMount = useRef(false);
  const isWatchAllRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const isSubmittedRef = useRef(false);
  const isDirtyRef = useRef(false);
  const isSchemaValidateTriggeredRef = useRef(false);
  const validateAndStateUpdateRef = useRef<Function>();
  const fieldsWithValidationRef = useRef(new Set());
  const validFieldsRef = useRef(new Set());
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
      name: keyof Data,
      errorsFromRef: ErrorMessages<Data>,
      error: ErrorMessages<Data>,
      shouldRender: boolean = true,
    ): boolean => {
      if (errorsFromRef[name] && !error[name]) {
        delete errorsRef.current[name];
        validFieldsRef.current.add(name);
        if (shouldRender) reRenderForm({});
        return true;
      } else if (error[name]) {
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
    value: Record<string, any> | undefined,
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

  const setValueInternal = useCallback(
    (name: Name, value: Data[Name]): void => {
      setFieldValue(name, value);
      touchedFieldsRef.current.add(name);
      isDirtyRef.current = true;
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
      const fieldErrors = await validateWithSchema(
        validationSchema,
        getFieldsValues(fieldsRef.current),
      );
      const names = Array.isArray(payload)
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

      if (Array.isArray(fields)) {
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
    (name: Name, value: Data[Name], shouldValidate: boolean = false): void => {
      setValueInternal(name, value);
      if (shouldValidate) triggerValidation({ name });
    },
    [setValueInternal, triggerValidation],
  );

  validateAndStateUpdateRef.current = validateAndStateUpdateRef.current
    ? validateAndStateUpdateRef.current
    : async ({ target: { name }, type }: Ref): Promise<void> => {
        if (Array.isArray(validationFields) && !validationFields.includes(name))
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

        if (!isDirtyRef.current) {
          isDirtyRef.current = true;
          shouldUpdateState = true;
        }

        if (!touchedFieldsRef.current.has(name)) {
          touchedFieldsRef.current.add(name);
          shouldUpdateState = true;
        }

        if (isValidateDisabled && shouldUpdateState) return reRenderForm({});

        if (validationSchema) {
          const result = getFieldsValues(fields);
          const fieldsErrors = await validateWithSchema(
            validationSchema,
            result,
          );
          schemaErrorsRef.current = fieldsErrors;
          isSchemaValidateTriggeredRef.current = true;
          const error = fieldsErrors[name];
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

  const removeEventListener: Function = useCallback(
    findRemovedFieldAndRemoveListener.bind(
      null,
      fieldsRef.current,
      touchedFieldsRef,
      fieldsWithValidationRef,
      validateAndStateUpdateRef.current,
    ),
    [],
  );

  const removeInputEventListener: Function = useCallback(
    field => {
      if (!field) return;
      const {
        ref: { type },
        options,
      } = field;
      isRadioInput(type) && Array.isArray(options)
        ? options.forEach((fieldRef): void =>
            removeEventListener(fieldRef, true),
          )
        : removeEventListener(field, true);
    },
    [removeEventListener],
  );

  const clearError = (name?: Name | Name[]): void => {
    if (name === undefined) {
      errorsRef.current = {};
    } else if (isString(name)) {
      delete errorsRef.current[name];
    } else if (Array.isArray(name)) {
      name.forEach(item => {
        delete errorsRef.current[item];
      });
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

  const registerIntoFieldsRef = useCallback(
    (elementRef: Ref, data: RegisterInput | undefined): void => {
      if (elementRef && !elementRef.name)
        return warnMessage(`⚠ Missing field name: ${elementRef}`);
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
      const isRadio = isRadioInput(type);
      const field = fields[name];
      const existRadioOptionIndex =
        isRadio && field && Array.isArray(field.options)
          ? field.options.findIndex(
              ({ ref }: { ref: Ref }): boolean => value === ref.value,
            )
          : -1;

      if ((!isRadio && field) || (isRadio && existRadioOptionIndex > -1))
        return;

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
            mutationWatcher: onDomRemove(
              elementRef,
              (): Function => removeEventListener(inputData, true),
            ),
          });
        } else {
          fields[name] = {
            ...inputData,
            mutationWatcher: onDomRemove(
              elementRef,
              (): Function => removeEventListener(inputData, true),
            ),
          };
        }
      }

      if (defaultValues) {
        const defaultValue = defaultValues[name] || get(defaultValues, name);
        if (defaultValue !== undefined) setFieldValue(name, defaultValue);
      }

      if (!type) return;

      const fieldData = isRadio
        ? (fields[name]!.options || [])[
            (fields[name]!.options || []).length - 1
          ]
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
    },
    [defaultValues, isOnSubmit, nativeValidation, removeEventListener],
  );

  function watch(
    fieldNames?: Name | string | (Name | string)[] | undefined,
    defaultValue?: string | Partial<Data> | undefined,
  ): FieldValue | Partial<Data> | void {
    const fieldValues = getFieldsValues(fieldsRef.current);
    const watchFields: any = watchFieldsRef.current;

    if (isString(fieldNames)) {
      const value = assignWatchFields(fieldValues, fieldNames, watchFields);
      if (!isUndefined(value)) {
        return value;
      } else if (!isUndefined(defaultValue)) {
        return defaultValue;
      }
      return getDefaultValue(defaultValues, fieldNames);
    }

    if (Array.isArray(fieldNames)) {
      return isEmptyObject(fieldsRef.current)
        ? fieldNames.reduce(
            (previous, name) => ({
              ...previous,
              [name]:
                !isUndefined(defaultValue) && !isString(defaultValue)
                  ? defaultValue[name]
                  : undefined,
            }),
            {},
          )
        : fieldNames.reduce(
            (previous, name) => ({
              ...previous,
              [name]:
                assignWatchFields(fieldValues, name as string, watchFields) ||
                getDefaultValue(defaultValues, name as string),
            }),
            {},
          );
    }

    isWatchAllRef.current = true;
    return fieldValues || defaultValue || defaultValues;
  }

  const register = useCallback(
    (refOrValidateRule: RegisterInput | Ref, validateRule?: RegisterInput) => {
      if (!refOrValidateRule || typeof window === 'undefined') return;

      if (validateRule && !refOrValidateRule.name) {
        warnMessage(refOrValidateRule);
        return;
      }

      if (refOrValidateRule.name) {
        registerIntoFieldsRef(refOrValidateRule, validateRule);
      }

      return (ref: Ref): void =>
        ref && registerIntoFieldsRef(ref, refOrValidateRule);
    },
    [registerIntoFieldsRef],
  );

  const resetField = (name: Name | string) => {
    const field = fieldsRef.current[name as string];
    removeInputEventListener(field);
    delete watchFieldsRef.current[name];
    delete errorsRef.current[name];
    delete fieldsRef.current[name];
    touchedFieldsRef.current.delete(name);
    fieldsWithValidationRef.current.delete(name);
    validFieldsRef.current.delete(name);
  };

  const unregister = (name: Name | string | (Name | string)[]): void => {
    Array.isArray(name) ? name.forEach(resetField) : resetField(name);
  };

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
      fieldErrors = await validateWithSchema(validationSchema, fieldValues);
      schemaErrorsRef.current = fieldErrors;
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
    watchFieldsRef.current = {};
    errorsRef.current = {};
    isWatchAllRef.current = false;
    isSubmittedRef.current = false;
    isDirtyRef.current = false;
    touchedFieldsRef.current = new Set();
    fieldsWithValidationRef.current = new Set();
    validFieldsRef.current = new Set();
    submitCountRef.current = 0;
    isSchemaValidateTriggeredRef.current = false;
  };

  const unSubscribe = useCallback((): void => {
    fieldsRef.current &&
      Object.values(fieldsRef.current).forEach(
        (field: Field | undefined): void => removeInputEventListener(field),
      );
    fieldsRef.current = {};
    resetRefs();
  }, [removeInputEventListener]);

  const reset = useCallback((values?: DataType): void => {
    const fieldValues = Object.values(fieldsRef.current);
    for (let field of fieldValues) {
      if (field && field.ref && field.ref.closest) {
        field.ref.closest('form').reset();
        break;
      }
    }
    resetRefs();

    if (values) {
      Object.entries(values).forEach(([key, value]) =>
        setFieldValue(key as Name, value),
      );
    }
    reRenderForm({});
  }, []);

  const getValues = (payload?: { nest: boolean }): Data => {
    const data = getFieldsValues<Data>(fieldsRef.current);
    return payload && payload.nest ? combineFieldValues(data) : data;
  };

  useEffect(
    (): VoidFunction => () => {
      isUnMount.current = true;
      unSubscribe();
    },
    [unSubscribe],
  );

  return {
    register,
    unregister,
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
