import { useEffect, useRef, useState, useCallback } from 'react';
import attachEventListeners from './logic/attachEventListeners';
import combineFieldValues from './logic/combineFieldValues';
import findRemovedFieldAndRemoveListener from './logic/findRemovedFieldAndRemoveListener';
import getFieldsValues from './logic/getFieldsValues';
import getFieldValue from './logic/getFieldValue';
import shouldUpdateWithError from './logic/shouldUpdateWithError';
import validateField from './logic/validateField';
import validateWithSchema from './logic/validateWithSchema';
import attachNativeValidation from './logic/attachNativeValidation';
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
} from './types';
import filterUndefinedErrors from './utils/filterUndefinedErrors';
import isCheckBoxInput from './utils/isCheckBoxInput';
import isEmptyObject from './utils/isEmptyObject';
import isRadioInput from './utils/isRadioInput';
import onDomRemove from './utils/onDomRemove';
import modeChecker from './utils/validationModeChecker';
import warnMissingRef from './utils/warnMissingRef';

export default function useForm<Data extends DataType>(
  {
    mode,
    validationSchema,
    defaultValues,
    validationFields,
    nativeValidation,
    submitFocusError,
  }: Props<Data> = {
    mode: 'onSubmit',
    defaultValues: {},
    nativeValidation: false,
    submitFocusError: true,
  },
) {
  const unMount = useRef<boolean>(false);
  const fieldsRef = useRef<FieldsObject<Data>>({});
  const errorsRef = useRef<ErrorMessages<Data>>({});
  const submitCountRef = useRef<number>(0);
  const touchedFieldsRef = useRef(new Set());
  const watchFieldsRef = useRef<{ [key in keyof Data]?: boolean }>({});
  const isWatchAllRef = useRef<boolean>(false);
  const isSubmittingRef = useRef<boolean>(false);
  const isSubmittedRef = useRef<boolean>(false);
  const isDirtyRef = useRef<boolean>(false);
  const reRenderForm = useState({})[1];
  const validateAndStateUpdateRef = useRef<Function>();
  const { isOnChange, isOnBlur, isOnSubmit } = modeChecker(mode);
  const fieldsWithValidation = useRef(new Set());
  const validFields = useRef(new Set());

  const renderBaseOnError = (
    name: keyof Data,
    errors: ErrorMessages<Data>,
    error: ErrorMessages<Data>,
  ): boolean => {
    if (errors[name] && !error[name]) {
      delete errorsRef.current[name];
      validFields.current.add(name);
      reRenderForm({});
      return true;
    } else if (error[name]) {
      validFields.current.delete(name);
      reRenderForm({});
      return true;
    }
    if (!isOnSubmit && !validFields.current.has(name)) {
      validFields.current.add(name);
      reRenderForm({});
    }
    return false;
  };

  const setValue = <Name extends keyof Data>(
    name: Extract<Name, string>,
    value: Data[Name],
    shouldRender: boolean = true,
  ): void => {
    const field = fieldsRef.current[name];
    if (!field) return;
    const ref = field.ref;
    const options = field.options;

    if (shouldRender) {
      touchedFieldsRef.current.add(name);
      isDirtyRef.current = true;
    }

    if (isRadioInput(ref.type) && options) {
      options.forEach(({ ref: radioRef }): void => {
        if (radioRef.value === value) radioRef.checked = true;
      });
      return;
    }

    ref[isCheckBoxInput(ref.type) ? 'checked' : 'value'] = value;
    if (shouldRender) reRenderForm({});
  };

  const isValidateDisabled = <Name extends keyof Data>(): boolean =>
    !isSubmittedRef.current && isOnSubmit;

  const executeValidation = async <Name extends keyof Data>({
    name,
    value,
    forceValidation,
  }: {
    name: Extract<keyof Data, string>;
    value?: Data[Name];
    forceValidation?: boolean;
  }): Promise<boolean> => {
    const field = fieldsRef.current[name]!;
    const errors = errorsRef.current;

    if (!field) return false;
    if (isValidateDisabled() && !forceValidation) return isEmptyObject(errors);
    if (value !== undefined) setValue(name, value);

    const error = await validateField(field, fieldsRef.current);
    errorsRef.current = {
      ...filterUndefinedErrors(errorsRef.current),
      ...error,
    };
    renderBaseOnError(name, errors, error);
    return isEmptyObject(error);
  };

  async function triggerValidation<Name extends keyof Data>(
    payload:
      | {
          name: Extract<keyof Data, string>;
          value?: Data[Name];
          forceValidation?: boolean;
        }
      | {
          name: Extract<keyof Data, string>;
          value?: Data[Name];
          forceValidation?: boolean;
        }[],
  ): Promise<boolean> {
    if (Array.isArray(payload)) {
      return payload.map(async data => triggerValidation(data)).every(d => !!d);
    }
    return executeValidation(payload);
  }

  validateAndStateUpdateRef.current = validateAndStateUpdateRef.current
    ? validateAndStateUpdateRef.current
    : async ({ target: { name }, type }: Ref): Promise<void> => {
        if (Array.isArray(validationFields) && !validationFields.includes(name))
          return;
        const fields = fieldsRef.current;
        const errors = errorsRef.current;
        const ref = fields[name];
        if (!ref) return;
        const isBlurType = type === 'blur';
        const validateDisabled = isValidateDisabled();
        const isWatchAll = isWatchAllRef.current;
        const shouldUpdateWatchMode =
          isWatchAll || watchFieldsRef.current[name];
        const shouldUpdateValidateMode = isOnChange || (isOnBlur && isBlurType);
        let shouldUpdateState = shouldUpdateWatchMode;

        if (!isDirtyRef.current) {
          isDirtyRef.current = true;
          shouldUpdateState = true;
        }

        if (!touchedFieldsRef.current.has(name)) {
          touchedFieldsRef.current.add(name);
          shouldUpdateState = true;
        }

        if (validateDisabled && shouldUpdateWatchMode) return reRenderForm({});

        if (validationSchema) {
          const result = getFieldsValues(fields);
          const schemaValidateErrors =
            (await validateWithSchema(validationSchema, result)) || {};
          const error = schemaValidateErrors[name];
          const shouldUpdate =
            ((!error && errors[name]) || error) && shouldUpdateValidateMode;

          if (shouldUpdate || shouldUpdateWatchMode) {
            errorsRef.current = { ...errors, ...{ [name]: error } };
            if (!error) delete errorsRef.current[name];

            return reRenderForm({});
          }
        } else {
          const error = await validateField<Data>(
            ref,
            fields,
            nativeValidation,
          );
          const shouldUpdate = shouldUpdateWithError({
            errors,
            error,
            validateDisabled,
            isOnBlur,
            isBlurType,
            name,
          });

          if (
            shouldUpdate ||
            shouldUpdateValidateMode ||
            shouldUpdateWatchMode
          ) {
            errorsRef.current = { ...filterUndefinedErrors(errors), ...error };
            if (renderBaseOnError(name, errorsRef.current, error)) return;
          }
        }

        if (shouldUpdateState) reRenderForm({});
      };

  const removeEventListener: Function = findRemovedFieldAndRemoveListener.bind(
    null,
    fieldsRef.current,
    touchedFieldsRef,
    fieldsWithValidation,
    validateAndStateUpdateRef.current,
  );

  const setError = <Name extends keyof Data>(
    name: Extract<Name, string>,
    type?: string,
    message?: string,
    ref?: Ref,
  ): void => {
    const errors = errorsRef.current;
    const error = errors[name];
    const isSameError =
      error && (error.type === type && error.message === message);

    if (!type && error) {
      delete errors[name];
      reRenderForm({});
    } else if (!isSameError) {
      errors[name] = {
        type,
        message,
        ref,
        isManual: true,
      };
      reRenderForm({});
    }
  };

  const clearError = <Name extends keyof Data>(
    name: Extract<Name, string>,
  ): void => {
    setError(name);
  };

  function registerIntoFieldsRef(
    elementRef: Ref,
    data: RegisterInput | undefined,
  ): void {
    if (elementRef && !elementRef.name) return warnMissingRef(elementRef);

    const { name, type, value } = elementRef;

    if (!isOnSubmit && data && !isEmptyObject(data)) {
      fieldsWithValidation.current.add(name);
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

    if (defaultValues && defaultValues[name]) {
      setValue(name, defaultValues[name], false);
    }

    if (!type) {
      return;
    }

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

  function watch(
    fieldNames?: string | string[] | undefined,
    defaultValue?: string | Partial<Data> | undefined,
  ): FieldValue | Partial<Data> | void {
    const watchFields: any = watchFieldsRef.current;

    if (typeof fieldNames === 'string') {
      watchFields[fieldNames] = true;
    } else if (Array.isArray(fieldNames)) {
      fieldNames.forEach((name): void => {
        watchFields[name] = true;
      });
    } else {
      isWatchAllRef.current = true;
      watchFieldsRef.current = {};
    }

    const values = getFieldsValues(fieldsRef.current, fieldNames);
    const result =
      values === undefined || isEmptyObject(values) ? undefined : values;
    return result === undefined ? defaultValue : result;
  }

  const register = useCallback(
    (refOrValidateRule: RegisterInput | Ref, validateRule?: RegisterInput) => {
      if (!refOrValidateRule || typeof window === 'undefined') return;

      if (validateRule && !refOrValidateRule.name) {
        warnMissingRef(refOrValidateRule);
        return;
      }

      if (refOrValidateRule.name) {
        registerIntoFieldsRef(refOrValidateRule, validateRule);
      }

      return (ref: Ref): void =>
        ref && registerIntoFieldsRef(ref, refOrValidateRule);
    },
    [],
  );

  const handleSubmit = (callback: OnSubmit<Data>) => async (
    e: React.SyntheticEvent,
  ): Promise<void> => {
    if (e && !nativeValidation) {
      e.preventDefault();
      e.persist();
    }
    let fieldErrors;
    let fieldValues;
    let firstFocusError = true;
    const fields = fieldsRef.current;
    const currentFieldValues = validationFields
      ? (validationFields.map(name => fieldsRef.current[name]) as [])
      : Object.values(fields);
    isSubmittingRef.current = true;
    reRenderForm({});

    if (validationSchema) {
      fieldValues = getFieldsValues(fields);
      fieldErrors = await validateWithSchema(validationSchema, fieldValues);
    } else {
      const {
        errors,
        values,
      }: SubmitPromiseResult<Data> = await currentFieldValues.reduce(
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
              ...(resolvedPrevious.errors || {}),
              ...fieldError,
            };
            return Promise.resolve(resolvedPrevious);
          }

          resolvedPrevious.values[name] = getFieldValue(fields, ref);
          return Promise.resolve(resolvedPrevious);
        },
        Promise.resolve<SubmitPromiseResult<Data>>({
          errors: {},
          values: {},
        } as any),
      );

      fieldErrors = {
        ...errors,
        ...(nativeValidation ? {} : filterUndefinedErrors(errorsRef.current)),
      };
      fieldValues = values;
    }

    if (isEmptyObject(fieldErrors)) {
      await callback(combineFieldValues(fieldValues), e);
    } else {
      errorsRef.current = fieldErrors as any;
    }
    if (unMount.current) return;
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
    fieldsWithValidation.current = new Set();
    validFields.current = new Set();
    submitCountRef.current = 0;
  };

  const unSubscribe = (): void => {
    fieldsRef.current &&
      Object.values(fieldsRef.current).forEach(
        (field: Field | undefined): void => {
          if (!field) return;
          const { ref, options } = field;
          isRadioInput(ref.type) && Array.isArray(options)
            ? options.forEach((fieldRef): void =>
                removeEventListener(fieldRef, true),
              )
            : removeEventListener(field, true);
        },
      );
    fieldsRef.current = {};
    resetRefs();
  };

  const reset = (): void => {
    try {
      // @ts-ignore
      Object.values(fieldsRef.current)[0]
        .ref.closest('form')
        .reset();
    } catch {
      console.warn(`⚠ Form element not found`);
    }
    resetRefs();
    reRenderForm({});
  };

  const getValues = (): FormData => getFieldsValues(fieldsRef.current);

  useEffect((): VoidFunction => {
    return () => {
      unMount.current = true;
      unSubscribe();
    };
  }, [mode, unMount.current]);

  return {
    register,
    handleSubmit,
    watch,
    unSubscribe,
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
      // @ts-ignore
      touched: [...touchedFieldsRef.current],
      isSubmitting: isSubmittingRef.current,
      ...(isOnSubmit
        ? {
            isValid: isEmptyObject(errorsRef.current),
          }
        : {
            isValid: fieldsWithValidation.current.size
              ? !isEmptyObject(fieldsRef.current) &&
                validFields.current.size >= fieldsWithValidation.current.size
              : !isEmptyObject(fieldsRef.current),
          }),
    },
  };
}
