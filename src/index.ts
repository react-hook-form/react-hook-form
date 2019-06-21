import { useEffect, useRef, useState, useCallback } from 'react';
import attachEventListeners from './logic/attachEventListeners';
import combineFieldValues from './logic/combineFieldValues';
import findRemovedFieldAndRemoveListener from './logic/findRemovedFieldAndRemoveListener';
import getFieldsValues from './logic/getFieldsValues';
import getFieldValue from './logic/getFieldValue';
import shouldUpdateWithError from './logic/shouldUpdateWithError';
import validateField from './logic/validateField';
import validateWithSchema from './logic/validateWithSchema';
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
  }: Props<Data> = {
    mode: 'onSubmit',
    defaultValues: {},
    nativeValidation: false,
  },
) {
  const unMount = useRef(false);
  const fieldsRef = useRef<FieldsObject<Data>>({});
  const errorsRef = useRef<ErrorMessages<Data>>({});
  const submitCountRef = useRef<number>(0);
  const touchedFieldsRef = useRef<string[]>([]);
  const watchFieldsRef = useRef<{ [key in keyof Data]?: boolean }>({});
  const isWatchAllRef = useRef<boolean>(false);
  const isSubmittingRef = useRef<boolean>(false);
  const isSubmittedRef = useRef<boolean>(false);
  const isDirtyRef = useRef<boolean>(false);
  const reRenderForm = useState({})[1];
  const validateAndStateUpdateRef = useRef<Function>();

  const renderBaseOnError = (
    name: keyof Data,
    errors: ErrorMessages<Data>,
    error: ErrorMessages<Data>,
  ): boolean => {
    if (errors[name] && !error[name]) {
      delete errorsRef.current[name];
      reRenderForm({});
      return true;
    } else if (error[name]) {
      reRenderForm({});
      return true;
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

    if (shouldRender) {
      if (!touchedFieldsRef.current.includes(name)) {
        touchedFieldsRef.current.push(name);
      }
      isDirtyRef.current = true;
    }

    const ref = field.ref;
    const options = field.options;

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
    !isSubmittedRef.current && modeChecker(mode).isOnSubmit;

  const triggerValidation = async <Name extends keyof Data>({
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
        const { isOnChange, isOnBlur } = modeChecker(mode);
        const validateDisabled = isValidateDisabled();
        const isWatchAll = isWatchAllRef.current;
        const shouldUpdateWatchMode =
          isWatchAll || watchFieldsRef.current[name];
        const shouldUpdateValidateMode = isOnChange || (isOnBlur && isBlurType);
        let shouldUpdateState = shouldUpdateWatchMode;

        if (nativeValidation) {
          // @ts-ignore
          ref.checkValidity();
          return;
        }

        if (!isDirtyRef.current) {
          isDirtyRef.current = true;
          shouldUpdateState = true;
        }

        if (!touchedFieldsRef.current.includes(name)) {
          touchedFieldsRef.current.push(name);
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
          const error = await validateField<Data>(ref, fields, nativeValidation);
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
      };
      reRenderForm({});
    }
  };

  function registerIntoFieldsRef(
    elementRef,
    data: RegisterInput | undefined,
  ): void {
    if (elementRef && !elementRef.name) return warnMissingRef(elementRef);

    const { name, type, value } = elementRef;
    const { required = false, validate = undefined } = data || {};
    const inputData = {
      ...data,
      ref: elementRef,
    };
    const fields = fieldsRef.current;
    const isRadio = isRadioInput(type);
    const field = fields[name];
    const existRadioOptionIndex =
      isRadio && field && Array.isArray(field.options)
        ? field.options.findIndex(({ ref }): boolean => value === ref.value)
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

    attachEventListeners({
      field: fieldData,
      isRadio,
      validateAndStateUpdate: validateAndStateUpdateRef.current,
    });

    if (nativeValidation && data) {
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'required') elementRef[key] = true;
        if (
          key === 'max' ||
          key === 'min' ||
          key === 'minLength' ||
          key === 'maxLength'
        )
          elementRef[key] = value;
        if (key === 'pattern') elementRef[key] = value.source;
      });
    }
  }

  function watch(
    fieldNames?: string | string[] | undefined,
    defaultValue?: string | Partial<Data> | undefined,
  ): FieldValue | Partial<Data> | void {
    const watchFields = watchFieldsRef.current;

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
    if (e) {
      e.preventDefault();
      e.persist();
    }
    let fieldErrors;
    let fieldValues;
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
          field: Field,
        ): Promise<SubmitPromiseResult<Data>> => {
          const resolvedPrevious = await previous;
          const {
            ref,
            ref: { name },
          } = field;

          if (!fields[name]) return Promise.resolve(resolvedPrevious);

          const fieldError = await validateField(field, fields, nativeValidation);

          if (fieldError[name]) {
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
        ...filterUndefinedErrors(errorsRef.current),
      };
      fieldValues = values;
    }

    if (isEmptyObject(fieldErrors)) {
      await callback(combineFieldValues(fieldValues), e);
    } else {
      errorsRef.current = fieldErrors;
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
    touchedFieldsRef.current = [];
  };

  const unSubscribe = (): void => {
    fieldsRef.current &&
      Object.values(fieldsRef.current).forEach((field: Field): void => {
        const { ref, options } = field;
        isRadioInput(ref.type) && Array.isArray(options)
          ? options.forEach((fieldRef): void =>
              removeEventListener(fieldRef, true),
            )
          : removeEventListener(field, true);
      });
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
      console.warn(`⚠ No HTML input found, hence <form> look up failed.`);
    }
    resetRefs();
    reRenderForm({});
  };

  const getValues = (): { [key: string]: FieldValue } =>
    getFieldsValues(fieldsRef.current);

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
    setError,
    setValue,
    triggerValidation,
    getValues,
    errors: errorsRef.current,
    formState: {
      dirty: isDirtyRef.current,
      isSubmitted: isSubmittedRef.current,
      submitCount: submitCountRef.current,
      touched: touchedFieldsRef.current,
      isSubmitting: isSubmittingRef.current,
      isValid:
        touchedFieldsRef.current.length &&
        touchedFieldsRef.current.length ===
          Object.keys(fieldsRef.current).length &&
        isEmptyObject(errorsRef.current),
    },
  };
}
