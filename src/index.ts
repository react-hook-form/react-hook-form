import { useEffect, useRef, useState } from 'react';
import findRemovedFieldAndRemoveListener from './logic/findRemovedFieldAndRemoveListener';
import getFieldsValues from './logic/getFieldsValues';
import shouldUpdateWithError from './logic/shouldUpdateWithError';
import validateField from './logic/validateField';
import validateWithSchema from './logic/validateWithSchema';
import {
  DataType,
  ErrorMessages,
  Field,
  FieldsObject,
  FieldValue,
  OnSubmit,
  Props,
  Ref,
  RegisterInput,
  VoidFunction,
} from './types';
import filterUndefinedErrors from './utils/filterUndefinedErrors';
import isEmptyObject from './utils/isEmptyObject';
import isRadioInput from './utils/isRadioInput';
import modeChecker from './utils/validationModeChecker';
import handleSubmitFunc from './handleSubmit';
import setValueFunc from './setValue';
import registerFunc from './register';

export default function useForm<Data extends DataType>(
  { mode, validationSchema, defaultValues, validationFields }: Props<Data> = {
    mode: 'onSubmit',
    defaultValues: {},
  },
) {
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
    if (value !== undefined) {
      setValueFunc(name, value, false, {
        touchedFieldsRef,
        fieldsRef,
        isDirtyRef,
        reRenderForm,
      });
    }

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
          const error = await validateField<Data>(ref, fields);
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
    validateAndStateUpdateRef.current,
  );

  const setError = <Name extends keyof Data>(
    name: Extract<Name, string>,
    type: string,
    message?: string,
    ref?: Ref,
  ): void => {
    const errors = errorsRef.current;
    const error = errors[name];

    if (!type && error) {
      delete errors[name];
      reRenderForm({});
    } else if (
      type &&
      error &&
      (error.type !== type || error.message !== message)
    ) {
      errors[name] = {
        type,
        message,
        ref,
      };
      reRenderForm({});
    }
  };

  function watch(
    fieldNames?: string | string[] | undefined,
    defaultValue?: string | Partial<Data> | undefined,
  ): FieldValue | Partial<Data> | void {
    const watchFields = watchFieldsRef.current;

    if (typeof fieldNames === 'string') {
      watchFields[fieldNames] = true;
    } else if (Array.isArray(fieldNames)) {
      fieldNames.forEach(
        (name): void => {
          watchFields[name] = true;
        },
      );
    } else {
      isWatchAllRef.current = true;
      watchFieldsRef.current = {};
    }

    const values = getFieldsValues(fieldsRef.current, fieldNames);
    const result =
      values === undefined || isEmptyObject(values) ? undefined : values;
    return result === undefined ? defaultValue : result;
  }

  const unSubscribe = (): void => {
    fieldsRef.current &&
      Object.values(fieldsRef.current).forEach(
        (field: Field): void => {
          const { ref, options } = field;
          isRadioInput(ref.type) && Array.isArray(options)
            ? options.forEach(
                (fieldRef): void => removeEventListener(fieldRef, true),
              )
            : removeEventListener(field, true);
        },
      );
    fieldsRef.current = {};
    watchFieldsRef.current = {};
    errorsRef.current = {};
    isWatchAllRef.current = false;
    isSubmittedRef.current = false;
    isDirtyRef.current = false;
    touchedFieldsRef.current = [];
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
    unSubscribe();
    reRenderForm({});
  };

  const getValues = (): { [key: string]: FieldValue } =>
    getFieldsValues(fieldsRef.current);

  useEffect((): VoidFunction => unSubscribe, [mode]);

  return {
    register: (elementRef, data: RegisterInput | undefined) =>
      registerFunc(elementRef, data, {
        fieldsRef,
        defaultValues,
        touchedFieldsRef,
        isDirtyRef,
        reRenderForm,
        validateAndStateUpdateRef,
      }),
    setValue: <Name extends keyof Data>(
      name: Extract<Name, string>,
      value: Data[Name],
      shouldRender: boolean = true,
    ) =>
      setValueFunc(name, value, shouldRender, {
        touchedFieldsRef,
        fieldsRef,
        isDirtyRef,
        reRenderForm,
      }),
    handleSubmit: (callback: OnSubmit<Data>) =>
      handleSubmitFunc<Data>(callback, {
        fieldsRef,
        validationFields,
        isSubmittingRef,
        reRenderForm,
        validationSchema,
        errorsRef,
        isSubmittedRef,
        submitCountRef,
      }),
    watch,
    unSubscribe,
    reset,
    setError,
    triggerValidation,
    getValues,
    errors: errorsRef.current,
    formState: {
      dirty: isDirtyRef.current,
      isSubmitted: isSubmittedRef.current,
      submitCount: submitCountRef.current,
      touched: touchedFieldsRef.current,
      isSubmitting: isSubmittingRef.current,
    },
  };
}
