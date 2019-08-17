import * as React from 'react';
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
import get from './utils/get';
import isString from './utils/isString';
import isUndefined from './utils/isUndefined';
import omitValidFields from './logic/omitValidFields';
import { VALIDATION_MODE } from './constants';
import {
  TFormValues,
  ErrorMessages,
  Field,
  FieldsObject,
  Options,
  Ref,
  ValidationOptions,
  SubmitPromiseResult,
  ElementLikeObject,
  OnSubmit,
  ValidationPayload,
  FieldErrors,
} from './types';
import isObject from './utils/isObject';

export default function useForm<
  FormValues extends TFormValues = TFormValues,
  FieldName extends keyof FormValues = keyof FormValues,
  FieldValue = FormValues[FieldName]
>({
  mode = VALIDATION_MODE.onSubmit,
  validationSchema,
  defaultValues = {},
  validationFields,
  nativeValidation,
  submitFocusError = true,
}: Options<FormValues> = {}) {
  const fieldsRef = React.useRef<FieldsObject<FormValues>>({});
  const errorsRef = React.useRef<ErrorMessages<FormValues>>({});
  const schemaErrorsRef = React.useRef<FieldErrors>({});
  const submitCountRef = React.useRef(0);
  const touchedFieldsRef = React.useRef(new Set<FieldName>());
  const watchFieldsRef = React.useRef<Partial<Record<FieldName, boolean>>>({});
  const isMounted = React.useRef(false);
  const isWatchAllRef = React.useRef(false);
  const isSubmittingRef = React.useRef(false);
  const isSubmittedRef = React.useRef(false);
  const isDirtyRef = React.useRef(false);
  const isSchemaValidateTriggeredRef = React.useRef(false);
  const fieldsWithValidationRef = React.useRef(new Set());
  const validFieldsRef = React.useRef(new Set());
  const [, reRenderForm] = React.useState({});
  const { isOnChange, isOnBlur, isOnSubmit } = React.useRef(
    modeChecker(mode),
  ).current;

  const combineErrorsRef = (data: ErrorMessages<FormValues>) => ({
    ...errorsRef.current,
    ...data,
  });

  const renderBaseOnError = React.useCallback(
    (
      name: FieldName,
      errorsFromRef: ErrorMessages<FormValues>,
      error: ErrorMessages<FormValues>,
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

  const setFieldValue = (name: FieldName, value?: FieldValue) => {
    const field = fieldsRef.current[name];
    if (!field) return;
    const ref = field.ref;
    const options = field.options;

    if (isRadioInput(ref.type) && options) {
      options.forEach(({ ref: radioRef }) => {
        if (radioRef.value === value) radioRef.checked = true;
      });
    } else {
      ref[isCheckBoxInput(ref.type) ? 'checked' : 'value'] = value;
    }
  };

  const setValueInternal = React.useCallback(
    (name: FieldName, value: FieldValue) => {
      setFieldValue(name, value);
      touchedFieldsRef.current.add(name);
      isDirtyRef.current = true;
      reRenderForm({});
    },
    [],
  );

  const executeValidation = React.useCallback(
    async (
      { name, value }: ValidationPayload<FieldName, FieldValue>,
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

  const executeSchemaValidation = React.useCallback(
    async (
      payload:
        | ValidationPayload<FieldName, FieldValue>
        | ValidationPayload<FieldName, FieldValue>[],
    ): Promise<boolean> => {
      const { fieldErrors } = await validateWithSchema(
        validationSchema!,
        combineFieldValues(getFieldsValues(fieldsRef.current)),
      );
      const names = Array.isArray(payload)
        ? payload.map(({ name }) => name as string)
        : [payload.name as string];
      const validFieldNames = names.filter(name => !fieldErrors[name]);

      schemaErrorsRef.current = fieldErrors;
      errorsRef.current = omitValidFields(
        combineErrorsRef(
          Object.entries(fieldErrors)
            .filter(([key]) => names.includes(key))
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

  const triggerValidation = React.useCallback(
    async (
      payload?:
        | ValidationPayload<FieldName, FieldValue>
        | ValidationPayload<FieldName, FieldValue>[],
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

  const setValue = React.useCallback(
    (name: FieldName, value: FieldValue, shouldValidate: boolean = false) => {
      setValueInternal(name, value);
      if (shouldValidate) triggerValidation({ name });
    },
    [setValueInternal, triggerValidation],
  );

  const validateAndStateUpdate = React.useCallback(
    async ({
      target: { name },
      type,
    }: {
      type: string;
      target: { name: FieldName };
    }): Promise<void> => {
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
        const { fieldErrors } = await validateWithSchema<FormValues>(
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
        const error = await validateField(ref as any, fields, nativeValidation);
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
    },
    [
      isOnBlur,
      isOnChange,
      isOnSubmit,
      nativeValidation,
      renderBaseOnError,
      validationSchema,
      validationFields,
    ],
  );

  const resetFieldRef = (name: FieldName) => {
    delete watchFieldsRef.current[name];
    delete errorsRef.current[name];
    delete fieldsRef.current[name];
    touchedFieldsRef.current.delete(name);
    fieldsWithValidationRef.current.delete(name);
    validFieldsRef.current.delete(name);
  };

  const removeEventListenerAndRef: Function = React.useCallback(
    (field: Field, forceDelete?: boolean) => {
      findRemovedFieldAndRemoveListener(
        fieldsRef.current,
        validateAndStateUpdate,
        field,
        forceDelete,
      );

      if (field.ref) resetFieldRef(field.ref.name);
    },
    [validateAndStateUpdate],
  );

  const clearError = (name?: FieldName | FieldName[]): void => {
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
    name: FieldName,
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

  function watch(
    fieldNames?: FieldName | string | (FieldName | string)[] | undefined,
    defaultValue?: string | Partial<FormValues> | undefined,
  ): FieldValue | string | Partial<FormValues> | void {
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
                  : defaultValues
                  ? defaultValues[name] || get(defaultValues, name as string)
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
    return (
      (isEmptyObject(fieldValues) ? undefined : fieldValues) ||
      defaultValue ||
      defaultValues
    );
  }

  class Register {
    private registerIntoFields<
      Element extends ElementLikeObject = HTMLInputElement,
      ValueType = FieldValue
    >(
      input: Element,
      validationOptions: ValidationOptions<ValueType> = {},
    ): void {
      if (!input.name) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`⚠ Missing field name: ${input}`);
        }
        return;
      }
      const { name, type, value } = input;

      if (!isOnSubmit && !isEmptyObject(validationOptions)) {
        fieldsWithValidationRef.current.add(name);
      }

      const { required = false, validate } = validationOptions;
      const inputData = {
        ...validationOptions,
        ref: input,
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
        fields[name] = { ref: { name }, ...validationOptions };
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
            mutationWatcher: onDomRemove(input, () =>
              removeEventListenerAndRef(inputData),
            ),
          });
        } else {
          fields[name] = {
            ...inputData,
            mutationWatcher: onDomRemove(input, () =>
              removeEventListenerAndRef(inputData),
            ),
          };
        }
      }

      if (defaultValues) {
        const defaultValue = defaultValues[name] || get(defaultValues, name);
        if (defaultValue !== undefined)
          setFieldValue(name as FieldName, defaultValue);
      }

      if (!type) return;

      const fieldData = isRadio
        ? (fields[name]!.options || [])[
            (fields[name]!.options || []).length - 1
          ]
        : fields[name];

      if (!fieldData) return;

      if (nativeValidation && validationOptions) {
        attachNativeValidation(input, validationOptions);
      } else {
        attachEventListeners({
          field: fieldData,
          isRadio,
          validateAndStateUpdate,
        });
      }
    }

    public register<
      Element extends ElementLikeObject = HTMLInputElement,
      ValueType = FieldValue
    >(
      validationOptions?: ValidationOptions<ValueType>,
    ): (input: Element) => void;
    public register<
      Element extends ElementLikeObject = HTMLInputElement,
      ValueType = FieldValue
    >(input: Element, validationOptions?: ValidationOptions<ValueType>): void;
    public register<
      Element extends ElementLikeObject = HTMLInputElement,
      ValueType = FieldValue
    >(
      inputOrValidationOptions?: Element | ValidationOptions<ValueType>,
      validationOptions?: ValidationOptions<ValueType>,
    ): void | ((input: Element) => void) {
      if (typeof window === 'undefined') {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('⚠ Currently, only browser usage is supported.');
        }
        return;
      }

      if (
        isObject(inputOrValidationOptions) &&
        'name' in inputOrValidationOptions
      ) {
        return this.registerIntoFields(
          inputOrValidationOptions,
          validationOptions,
        );
      }

      return (ref: Element) => {
        return this.registerIntoFields(ref, inputOrValidationOptions);
      };
    }
  }

  const unregister = React.useCallback(
    (name: FieldName | string | (FieldName | string)[]): void => {
      if (isEmptyObject(fieldsRef.current)) return;
      (Array.isArray(name) ? name : [name]).forEach(fieldName =>
        removeEventListenerAndRef(fieldsRef.current[fieldName], true),
      );
    },
    [removeEventListenerAndRef],
  );

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
      const { errors, values } = await fieldsToValidate.reduce<
        Promise<SubmitPromiseResult<FormValues>>
      >(
        // @ts-ignore
        async (previous, field: Field<FieldValue> | undefined) => {
          if (!field) return previous;
          const resolvedPrevious = await previous;
          const {
            ref,
            ref: { name },
          } = field;

          const fieldName = name as FieldName;

          if (!fields[fieldName]) return resolvedPrevious;

          const fieldError = await validateField(
            field,
            fields,
            nativeValidation,
          );

          if (fieldError[fieldName]) {
            if (submitFocusError && firstFocusError && ref.focus) {
              ref.focus();
              firstFocusError = false;
            }
            resolvedPrevious.errors = {
              ...resolvedPrevious.errors,
              ...fieldError,
            };
            return resolvedPrevious;
          }

          resolvedPrevious.values[fieldName] = getFieldValue(fields, ref);
          return resolvedPrevious;
        },
        Promise.resolve<SubmitPromiseResult<FormValues>>({
          errors: {} as ErrorMessages<FormValues>,
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
      errorsRef.current = fieldErrors as any;
    }

    if (!isMounted.current) return;

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
    touchedFieldsRef.current = new Set<FieldName>();
    fieldsWithValidationRef.current = new Set();
    validFieldsRef.current = new Set();
    submitCountRef.current = 0;
    isSchemaValidateTriggeredRef.current = false;
  };

  const unSubscribe = React.useCallback(() => {
    fieldsRef.current &&
      Object.values(fieldsRef.current).forEach(
        // @ts-ignore
        (field: Field<FieldValue>) => removeEventListenerAndRef(field, true),
      );
    fieldsRef.current = {};
    resetRefs();
  }, [removeEventListenerAndRef]);

  const reset = React.useCallback((values?: FormValues) => {
    const fieldValues = Object.values(fieldsRef.current);
    for (let field of fieldValues) {
      if (field && field.ref && field.ref.closest) {
        try {
          field.ref.closest('form').reset();
        } catch {}
        break;
      }
    }
    resetRefs();

    if (values) {
      Object.entries(values).forEach(([key, value]) =>
        setFieldValue(key as FieldName, value as FieldValue),
      );
    }
    reRenderForm({});
  }, []);

  const getValues = (payload?: { nest: boolean }): FormValues => {
    const data = getFieldsValues<FormValues>(fieldsRef.current);
    const output = payload && payload.nest ? combineFieldValues(data) : data;
    return isEmptyObject(output) ? defaultValues : output;
  };

  React.useLayoutEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      unSubscribe();
    };
  }, [unSubscribe]);

  return {
    register: React.useMemo(() => new Register().register, [Register]),
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
