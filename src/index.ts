import { useRef, useState, useEffect } from 'react';
import getFieldsValues from './logic/getFieldsValues';
import getFieldValue from './logic/getFieldValue';
import validateField from './logic/validateField';
import findRemovedFieldAndRemoveListener from './logic/findRemovedFieldAndRemoveListener';
import attachEventListeners from './logic/attachEventListeners';
import validateWithSchema from './logic/validateWithSchema';
import combineFieldValues from './logic/combineFieldValues';
import shouldUpdateWithError from './logic/shouldUpdateWithError';
import warnMissingRef from './utils/warnMissingRef';
import modeChecker from './utils/validationModeChecker';
import onDomRemove from './utils/onDomRemove';
import isRadioInput from './utils/isRadioInput';
import isEmptyObject from './utils/isEmptyObject';
import filterUndefinedErrors from './utils/filterUndefinedErrors';
import {
  Props,
  Field,
  ErrorMessages,
  Ref,
  SubmitPromiseResult,
  FieldsObject,
  VoidFunction,
  UseFormFunctions,
  FieldValue,
  RegisterInput,
  DataType,
  WatchFunction,
  SetValueFunction,
  SetErrorFunction,
} from './types';
import isCheckBoxInput from './utils/isCheckBoxInput';

export default function useForm<Data extends DataType>(
  { mode, validationSchema, defaultValues }: Props = {
    mode: 'onSubmit',
    defaultValues: {},
  },
): UseFormFunctions<Data> {
  const fieldsRef = useRef<FieldsObject<Data>>({});
  const errorsRef = useRef<ErrorMessages<Data>>({});
  const submitCountRef = useRef<number>(0);
  const touchedFieldsRef = useRef<string[]>([]);
  const watchFieldsRef = useRef<{ [key: string]: boolean }>({});
  const isWatchAllRef = useRef<boolean>(false);
  const isSubmittingRef = useRef<boolean>(false);
  const isSubmittedRef = useRef<boolean>(false);
  const isDirtyRef = useRef<boolean>(false);
  const reRenderForm = useState({})[1];
  const validateAndStateUpdateRef = useRef<Function>();

  validateAndStateUpdateRef.current = validateAndStateUpdateRef.current
    ? validateAndStateUpdateRef.current
    : async ({ target: { name }, type }: Ref): Promise<void> => {
        const fields = fieldsRef.current;
        const errors = errorsRef.current;
        const ref = fields[name];
        if (!ref) return;
        const isBlurType = type === 'blur';
        const { isOnChange, isOnSubmit, isOnBlur } = modeChecker(mode);
        const onSubmitModeNotSubmitted = !isSubmittedRef.current && (isOnSubmit || !mode);
        const isWatchAll = isWatchAllRef.current;
        const shouldUpdateWatchMode = isWatchAll || watchFieldsRef.current[name];
        const shouldUpdateValidateMode = isOnChange || (isOnBlur && isBlurType);
        let shouldUpdateState = isWatchAll;

        if (!isDirtyRef.current) {
          isDirtyRef.current = true;
          shouldUpdateState = true;
        }

        if (!touchedFieldsRef.current.includes(name)) {
          touchedFieldsRef.current.push(name);
          shouldUpdateState = true;
        }

        if (onSubmitModeNotSubmitted && shouldUpdateWatchMode) return reRenderForm({});

        if (validationSchema) {
          const result = getFieldsValues(fields);
          const schemaValidateErrors = (await validateWithSchema(validationSchema, result)) || {};
          const error = schemaValidateErrors[name];
          const shouldUpdate = ((!error && errors[name]) || error) && shouldUpdateValidateMode;

          if (shouldUpdate || shouldUpdateWatchMode) {
            const errorsCopy = { ...errors, ...{ [name]: error } };
            if (!error) delete errorsCopy[name];

            errorsRef.current = errorsCopy;
            return reRenderForm({});
          }
        } else {
          const error = await validateField<Data>(ref, fields);
          const shouldUpdate = shouldUpdateWithError({
            errors,
            error,
            onSubmitModeNotSubmitted,
            isOnBlur,
            isBlurType,
            name,
          });

          if (shouldUpdate || shouldUpdateValidateMode || shouldUpdateWatchMode) {
            const errorsCopy = { ...filterUndefinedErrors(errors), ...error };
            if (!error[name]) delete errorsCopy[name];

            errorsRef.current = errorsCopy;
            return reRenderForm({});
          }
        }

        if (shouldUpdateState) reRenderForm({});
      };

  const removeEventListener: Function = findRemovedFieldAndRemoveListener.bind(
    null,
    fieldsRef.current,
    validateAndStateUpdateRef.current,
  );

  const setValue = <Name extends keyof Data>(name: Extract<keyof Data, string>, value: Data[Name]): void => {
    const field = fieldsRef.current[name];
    if (!field) return;
    if (!touchedFieldsRef.current.includes(name)) {
      touchedFieldsRef.current.push(name);
    }
    const ref = field.ref;
    const options = field.options;

    if (isRadioInput(ref.type) && options) {
      options.forEach(
        ({ ref: radioRef }): void => {
          if (radioRef.value === value) radioRef.checked = true;
        },
      );
      return;
    }

    ref[isCheckBoxInput(ref.type) ? 'checked' : 'value'] = value;
  };

  const setError = <Name extends keyof Data>(
    name: Extract<keyof Data, string>,
    type: string,
    message?: string,
    ref?: Ref,
  ): void => {
    const errors = errorsRef.current;

    if (!type && errors[name]) {
      delete errors[name];
      reRenderForm({});
    } else if (type) {
      // can be improved with performance
      errors[name] = {
        type,
        message,
        ref,
      };
      reRenderForm({});
    }
  };

  function registerIntoFieldsRef(elementRef, data: RegisterInput | undefined): void {
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
      return;
    }

    if (isRadio) {
      if (!field) fields[name] = { options: [], required, validate, ref: { type: 'radio', name } };
      if (validate) fields[name]!.validate = validate;

      (fields[name]!.options || []).push({
        ...inputData,
        mutationWatcher: onDomRemove(elementRef, (): Function => removeEventListener(inputData, true)),
      });
    } else {
      fields[name] = {
        ...inputData,
        mutationWatcher: onDomRemove(elementRef, (): Function => removeEventListener(inputData, true)),
      };
    }

    if (defaultValues && defaultValues[name]) {
      setValue(name, defaultValues[name]);
    }

    const fieldData = isRadio ? (fields[name]!.options || [])[(fields[name]!.options || []).length - 1] : fields[name];

    if (!fieldData) return;

    attachEventListeners({
      field: fieldData,
      isRadio,
      validateAndStateUpdate: validateAndStateUpdateRef.current,
    });
  }

  function watch(
    filedNames?: string | string[] | undefined,
    defaultValue?: string | Partial<Data> | undefined,
  ): FieldValue | Partial<Data> | void {
    const watchFields = watchFieldsRef.current;

    if (typeof filedNames === 'string') {
      watchFields[filedNames] = true;
    } else if (Array.isArray(filedNames)) {
      filedNames.forEach(
        (name): void => {
          watchFields[name] = true;
        },
      );
    } else {
      isWatchAllRef.current = true;
      watchFieldsRef.current = {};
    }

    const values = getFieldsValues(fieldsRef.current, filedNames);
    const result = values === undefined || isEmptyObject(values) ? undefined : values;
    return result === undefined ? defaultValue : result;
  }

  function register(data: Ref | RegisterInput, rules?: RegisterInput): any {
    if (!data || typeof window === 'undefined') return;

    if (rules && !data.name) {
      warnMissingRef(data);
      return;
    }

    if (data.name) {
      registerIntoFieldsRef(data, rules);
    }

    return (ref): void => ref && registerIntoFieldsRef(ref, data);
  }

  const handleSubmit = (callback: (Object, e) => void): Function => async (e): Promise<void> => {
    if (e) {
      e.preventDefault();
      e.persist();
    }
    let fieldErrors;
    let fieldValues;
    const fields = fieldsRef.current;
    const currentFieldValues = Object.values(fields);
    isSubmittingRef.current = true;
    reRenderForm({});

    if (validationSchema) {
      fieldValues = getFieldsValues(fields);
      fieldErrors = await validateWithSchema(validationSchema, fieldValues);
    } else {
      const { errors, values }: SubmitPromiseResult<Data> = await currentFieldValues.reduce(
        async (previous: Promise<SubmitPromiseResult<Data>>, field: Field): Promise<SubmitPromiseResult<Data>> => {
          const resolvedPrevious = await previous;
          const {
            ref,
            ref: { name },
          } = field;

          if (!fields[name]) return Promise.resolve(resolvedPrevious);

          const fieldError = await validateField(field, fields);

          if (fieldError[name]) {
            resolvedPrevious.errors = { ...(resolvedPrevious.errors || {}), ...fieldError };
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

    isSubmittedRef.current = true;
    submitCountRef.current += 1;
    isSubmittingRef.current = false;

    if (isEmptyObject(fieldErrors)) {
      callback(combineFieldValues(fieldValues), e);
    } else {
      errorsRef.current = fieldErrors;
      reRenderForm({});
    }
  };

  const unSubscribe = (): void => {
    fieldsRef.current &&
      Object.values(fieldsRef.current).forEach(
        (field: Field): void => {
          const { ref, options } = field;
          isRadioInput(ref.type) && Array.isArray(options)
            ? options.forEach((fieldRef): void => removeEventListener(fieldRef, true))
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

  const getValues = (): { [key: string]: FieldValue } | {} => getFieldsValues(fieldsRef.current);

  useEffect((): VoidFunction => unSubscribe, [mode]);

  return {
    register,
    handleSubmit,
    watch: watch as WatchFunction<Data>,
    unSubscribe,
    reset,
    setError: setError as SetErrorFunction<Data>,
    setValue: setValue as SetValueFunction<Data>,
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
