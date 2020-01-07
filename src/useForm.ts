import * as React from 'react';
import attachEventListeners from './logic/attachEventListeners';
import transformToNestObject from './logic/transformToNestObject';
import findRemovedFieldAndRemoveListener from './logic/findRemovedFieldAndRemoveListener';
import getFieldsValues from './logic/getFieldValues';
import getFieldValue from './logic/getFieldValue';
import shouldUpdateWithError from './logic/shouldUpdateWithError';
import validateField from './logic/validateField';
import validateWithSchema from './logic/validateWithSchema';
import getDefaultValue from './logic/getDefaultValue';
import assignWatchFields from './logic/assignWatchFields';
import skipValidation from './logic/skipValidation';
import isCheckBoxInput from './utils/isCheckBoxInput';
import isEmptyObject from './utils/isEmptyObject';
import isRadioInput from './utils/isRadioInput';
import isFileInput from './utils/isFileInput';
import isObject from './utils/isObject';
import isArray from './utils/isArray';
import isString from './utils/isString';
import isSameError from './utils/isSameError';
import isUndefined from './utils/isUndefined';
import onDomRemove from './utils/onDomRemove';
import omitObject from './utils/omitObject';
import get from './utils/get';
import set from './utils/set';
import unset from './utils/unset';
import isMultipleSelect from './utils/isMultipleSelect';
import modeChecker from './utils/validationModeChecker';
import isNullOrUndefined from './utils/isNullOrUndefined';
import { EVENTS, UNDEFINED, VALIDATION_MODE } from './constants';
import { FormContextValues } from './contextTypes';
import {
  DeepPartial,
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
  ElementLike,
  FormStateProxy,
  ReadFormState,
  ManualFieldError,
  MultipleFieldErrors,
  Ref,
  HandleChange,
  Touched,
} from './types';

const { useRef, useState, useCallback, useEffect } = React;

export function useForm<FormValues extends FieldValues = FieldValues>({
  mode = VALIDATION_MODE.onSubmit,
  reValidateMode = VALIDATION_MODE.onChange,
  validationSchema,
  defaultValues = {},
  submitFocusError = true,
  validateCriteriaMode,
}: UseFormOptions<FormValues> = {}): FormContextValues<FormValues> {
  const fieldsRef = useRef<FieldRefs<FormValues>>({});
  const validateAllFieldCriteria = validateCriteriaMode === 'all';
  const errorsRef = useRef<FieldErrors<FormValues>>({});
  const touchedFieldsRef = useRef<Touched<FormValues>>({});
  const watchFieldsRef = useRef(new Set<FieldName<FormValues>>());
  const dirtyFieldsRef = useRef(new Set<FieldName<FormValues>>());
  const fieldsWithValidationRef = useRef(new Set<FieldName<FormValues>>());
  const validFieldsRef = useRef(new Set<FieldName<FormValues>>());
  const isValidRef = useRef(true);
  const defaultRenderValuesRef = useRef<
    Partial<Record<FieldName<FormValues>, FieldValue<FormValues>>>
  >({});
  const defaultValuesRef = useRef<
    FieldValue<FormValues> | DeepPartial<FormValues>
  >(defaultValues);
  const isUnMount = useRef(false);
  const isWatchAllRef = useRef(false);
  const isSubmittedRef = useRef(false);
  const isDirtyRef = useRef(false);
  const submitCountRef = useRef(0);
  const isSubmittingRef = useRef(false);
  const handleChangeRef = useRef<HandleChange>();
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
  defaultValuesRef.current = defaultValuesRef.current
    ? defaultValuesRef.current
    : defaultValues;

  const reRender = useCallback(() => {
    if (!isUnMount.current) {
      render({});
    }
  }, []);

  const validateFieldCurry = useCallback(
    validateField.bind(null, fieldsRef, validateAllFieldCriteria),
    [],
  );

  const validateFieldsSchemaCurry = useCallback(
    validateWithSchema.bind(null, validationSchema, validateAllFieldCriteria),
    [validationSchema],
  );

  const renderBaseOnError = useCallback(
    (
      name: FieldName<FormValues>,
      error: FieldErrors<FormValues>,
      shouldRender?,
      skipReRender?,
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
          shouldReRender = shouldReRender || get(errorsRef.current, name);
        }

        errorsRef.current = unset(errorsRef.current, [name]);
      } else {
        validFieldsRef.current.delete(name);
        shouldReRender = shouldReRender || !get(errorsRef.current, name);

        set(errorsRef.current, name, error[name]);
      }

      if (shouldReRender && !skipReRender) {
        reRender();
        return true;
      }
    },
    [reRender, validationSchema],
  );

  const setFieldValue = useCallback(
    (
      name: FieldName<FormValues>,
      rawValue: FieldValue<FormValues> | DeepPartial<FormValues> | undefined,
    ): boolean => {
      const field = fieldsRef.current[name];

      if (!field) {
        return false;
      }

      const ref = field.ref;
      const { type } = ref;
      const options = field.options;
      const value =
        isWeb &&
        ref instanceof window.HTMLElement &&
        isNullOrUndefined(rawValue)
          ? ''
          : rawValue;

      if (isRadioInput(type) && options) {
        options.forEach(
          ({ ref: radioRef }) => (radioRef.checked = radioRef.value === value),
        );
      } else if (isFileInput(type)) {
        ref.files = value;
      } else if (isMultipleSelect(type)) {
        [...ref.options].forEach(
          selectRef =>
            (selectRef.selected = (value as string[]).includes(
              selectRef.value,
            )),
        );
      } else if (isCheckBoxInput(type) && options) {
        options.length > 1
          ? options.forEach(
              ({ ref: checkboxRef }) =>
                (checkboxRef.checked = (value as string[]).includes(
                  checkboxRef.value,
                )),
            )
          : (options[0].ref.checked = !!value);
      } else {
        ref.value = value;
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
        (!get(touchedFieldsRef.current, name) && readFormState.current.touched)
      ) {
        return !!set(touchedFieldsRef.current, name, true);
      }
    },
    [setFieldValue],
  );

  const executeValidation = useCallback(
    async (
      name: FieldName<FormValues>,
      shouldRender,
      skipReRender?,
    ): Promise<boolean> => {
      const field = fieldsRef.current[name]!;

      if (!field) {
        return false;
      }

      if (shouldRender) {
        reRender();
      }

      const error = await validateField<FormValues>(
        fieldsRef,
        validateAllFieldCriteria,
        field,
      );

      renderBaseOnError(name, error, false, skipReRender);

      return isEmptyObject(error);
    },
    [reRender, renderBaseOnError, validateAllFieldCriteria],
  );

  const executeSchemaValidation = useCallback(
    async (
      payload: FieldName<FormValues> | FieldName<FormValues>[],
      shouldRender?: boolean,
    ): Promise<boolean> => {
      const { errors } = await validateWithSchema<FormValues>(
        validationSchema,
        validateAllFieldCriteria,
        transformToNestObject(getFieldsValues(fieldsRef.current)),
      );
      const previousFormIsValid = isValidRef.current;
      isValidRef.current = isEmptyObject(errors);

      if (isArray(payload)) {
        payload.forEach(name => {
          if (errors[name]) {
            set(errorsRef.current, name, errors[name]);
          } else {
            unset(errorsRef.current, [name]);
          }
        });
        reRender();
      } else {
        const fieldName = payload;
        const error = (get(errors, fieldName)
          ? { [fieldName]: get(errors, fieldName) }
          : {}) as FieldErrors<FormValues>;

        renderBaseOnError(
          fieldName,
          error,
          shouldRender || previousFormIsValid !== isValidRef.current,
        );
      }

      return isEmptyObject(errorsRef.current);
    },
    [reRender, renderBaseOnError, validateAllFieldCriteria, validationSchema],
  );

  const triggerValidation = useCallback(
    async (
      payload?: FieldName<FormValues> | FieldName<FormValues>[] | string,
      shouldRender?: boolean,
    ): Promise<boolean> => {
      const fields = payload || Object.keys(fieldsRef.current);

      if (validationSchema) {
        return executeSchemaValidation(fields, shouldRender);
      }

      if (isArray(fields)) {
        const result = await Promise.all(
          (fields as []).map(
            async data => await executeValidation(data, false, true),
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
        return triggerValidation(name, shouldRender);
      }

      if (shouldRender) {
        reRender();
      }
      return;
    },
    [reRender, setInternalValue, triggerValidation],
  );

  handleChangeRef.current = handleChangeRef.current
    ? handleChangeRef.current
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
        const shouldSkipValidation = skipValidation({
          hasError: !!currentError,
          isBlurEvent,
          isOnSubmit,
          isReValidateOnSubmit,
          isOnBlur,
          isReValidateOnBlur,
          isSubmitted: isSubmittedRef.current,
        });
        const shouldUpdateDirty = setDirty(name);
        let shouldUpdateState =
          isWatchAllRef.current ||
          watchFieldsRef.current.has(name) ||
          shouldUpdateDirty;

        if (
          isBlurEvent &&
          !get(touchedFieldsRef.current, name) &&
          readFormState.current.touched
        ) {
          set(touchedFieldsRef.current, name, true);
          shouldUpdateState = true;
        }

        if (shouldSkipValidation) {
          return shouldUpdateState && reRender();
        }

        if (validationSchema) {
          const { errors } = await validateWithSchema<FormValues>(
            validationSchema,
            validateAllFieldCriteria,
            transformToNestObject(getFieldsValues(fields)),
          );
          const validForm = isEmptyObject(errors);
          error = (get(errors, name)
            ? { [name]: get(errors, name) }
            : {}) as FieldErrors<FormValues>;

          if (isValidRef.current !== validForm) {
            shouldUpdateState = true;
          }

          isValidRef.current = validForm;
        } else {
          error = await validateField<FormValues>(
            fieldsRef,
            validateAllFieldCriteria,
            field,
          );
        }

        if (!renderBaseOnError(name, error) && shouldUpdateState) {
          reRender();
        }
      };

  const validateSchemaIsValid = useCallback(() => {
    const fieldValues = isEmptyObject(defaultValuesRef.current)
      ? getFieldsValues(fieldsRef.current)
      : defaultValuesRef.current;

    validateFieldsSchemaCurry(transformToNestObject(fieldValues)).then(
      ({ errors }) => {
        const previousFormIsValid = isValidRef.current;
        isValidRef.current = isEmptyObject(errors);

        if (previousFormIsValid && previousFormIsValid !== isValidRef.current) {
          reRender();
        }
      },
    );
  }, [reRender, validateFieldsSchemaCurry]);

  const resetFieldRef = useCallback(
    (name: FieldName<FormValues>) => {
      errorsRef.current = unset(errorsRef.current, [name]);
      touchedFieldsRef.current = unset(touchedFieldsRef.current, [name]);
      fieldsRef.current = omitObject(fieldsRef.current, name);
      defaultRenderValuesRef.current = omitObject(
        defaultRenderValuesRef.current,
        name,
      );
      [
        dirtyFieldsRef,
        fieldsWithValidationRef,
        validFieldsRef,
        watchFieldsRef,
      ].forEach(data => data.current.delete(name));

      if (readFormState.current.isValid || readFormState.current.touched) {
        reRender();
      }

      if (validationSchema) {
        validateSchemaIsValid();
      }
    },
    [reRender], // eslint-disable-line
  );

  const removeEventListenerAndRef = useCallback(
    (field: Field | undefined, forceDelete?: boolean) => {
      if (!field) {
        return;
      }

      if (!isUndefined(handleChangeRef.current)) {
        findRemovedFieldAndRemoveListener(
          fieldsRef.current,
          handleChangeRef.current,
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
    const field = fieldsRef.current[name];

    if (!isSameError(errorsRef.current[name] as any, type, message)) {
      set(errorsRef.current, name, {
        type,
        types,
        message,
        ref: field ? field.ref : {},
        isManual: true,
      });

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
  function watch(option: { nest: boolean }): FormValues;
  function watch<T extends FieldName<FormValues>>(
    field: T & string,
    defaultValue?: string,
  ): FormValues[T];
  function watch(
    fields: FieldName<FormValues>[] | string[],
    defaultValues?: Partial<FormValues>,
  ): Partial<FormValues>;
  function watch(
    fieldNames?:
      | FieldName<FormValues>
      | FieldName<FormValues>[]
      | { nest: boolean },
    defaultValue?: string | DeepPartial<FormValues>,
  ): FieldValue<FormValues> | DeepPartial<FormValues> | string | undefined {
    const combinedDefaultValues = isUndefined(defaultValue)
      ? isUndefined(defaultValuesRef.current)
        ? {}
        : defaultValuesRef.current
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
        let value;

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

    const result =
      (!isEmptyObject(fieldValues) && fieldValues) ||
      defaultValue ||
      defaultValuesRef.current;

    return fieldNames && fieldNames.nest
      ? transformToNestObject(result as FieldValues)
      : result;
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
    if (!ref.name && process.env.NODE_ENV !== 'production') {
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

    if (!isEmptyObject(defaultValuesRef.current)) {
      const defaultValue = getDefaultValue<FormValues>(
        defaultValuesRef.current,
        name,
      );

      if (!isUndefined(defaultValue)) {
        setFieldValue(name, defaultValue);
      }
    }

    if (validationSchema && readFormState.current.isValid) {
      validateSchemaIsValid();
    } else if (!isEmptyObject(validateOptions)) {
      fieldsWithValidationRef.current.add(name);

      if (!isOnSubmit && readFormState.current.isValid) {
        validateFieldCurry(currentField).then(error => {
          const previousFormIsValid = isValidRef.current;
          if (isEmptyObject(error)) {
            validFieldsRef.current.add(name);
          } else {
            isValidRef.current = false;
          }

          if (previousFormIsValid !== isValidRef.current) {
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

    attachEventListeners({
      field: fieldToAttachListener,
      isRadioOrCheckbox,
      handleChange: handleChangeRef.current,
    });
  }

  function register<Element extends ElementLike = ElementLike>(
    validationOptions: ValidationOptions,
  ): (ref: Element | null) => void;
  function register<Element extends ElementLike = ElementLike>(
    name: FieldName<FormValues>,
    validationOptions?: ValidationOptions,
  ): void;
  function register<Element extends ElementLike = ElementLike>(
    namesWithValidationOptions: Record<
      FieldName<FormValues>,
      ValidationOptions
    >,
  ): void;
  function register<Element extends ElementLike = ElementLike>(
    ref: Element,
    validationOptions?: ValidationOptions,
  ): void;
  function register<Element extends ElementLike = ElementLike>(
    refOrValidationOptions: ValidationOptions | Element | null,
    validationOptions?: ValidationOptions,
  ): ((ref: Element | null) => void) | void {
    if (isWindowUndefined || !refOrValidationOptions) {
      return;
    }

    if (isString(refOrValidationOptions)) {
      registerFieldsRef({ name: refOrValidationOptions }, validationOptions);
      return;
    }

    if (isObject(refOrValidationOptions) && 'name' in refOrValidationOptions) {
      registerFieldsRef(refOrValidationOptions, validationOptions);
      return;
    }

    return (ref: Element | null) =>
      ref && registerFieldsRef(ref, refOrValidationOptions);
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
          const { errors, values } = await validateFieldsSchemaCurry(
            transformToNestObject(fieldValues),
          );
          errorsRef.current = errors;
          fieldErrors = errors;
          fieldValues = values;
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
                set(resolvedPrevious.errors, name, fieldError[name]);

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
          await callback(transformToNestObject(fieldValues), e);
        } else {
          if (submitFocusError) {
            for (const key in fieldsRef.current) {
              if (get(fieldErrors, key)) {
                const field = fieldsRef.current[key];
                if (field) {
                  if (field.ref.focus) {
                    field.ref.focus();
                    break;
                  } else if (field.options) {
                    field.options[0].ref.focus();
                    break;
                  }
                }
              }
            }
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
    fieldsRef.current = {};
    touchedFieldsRef.current = {};
    validFieldsRef.current = new Set();
    fieldsWithValidationRef.current = new Set();
    defaultRenderValuesRef.current = {};
    watchFieldsRef.current = new Set();
    dirtyFieldsRef.current = new Set();
    isWatchAllRef.current = false;
    isSubmittedRef.current = false;
    isDirtyRef.current = false;
    isValidRef.current = true;
    submitCountRef.current = 0;
  };

  const reset = (values?: DeepPartial<FormValues>): void => {
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
      defaultValuesRef.current = values;
    }

    reRender();
  };

  const getValues = (payload?: { nest: boolean }): FormValues => {
    const fieldValues = getFieldsValues(fieldsRef.current);
    const outputValues = isEmptyObject(fieldValues)
      ? defaultValuesRef.current
      : fieldValues;
    return payload && payload.nest
      ? transformToNestObject(outputValues)
      : outputValues;
  };

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

  if (!validationSchema) {
    isValidRef.current =
      validFieldsRef.current.size >= fieldsWithValidationRef.current.size &&
      isEmptyObject(errorsRef.current);
  }

  const formState = {
    dirty: isDirtyRef.current,
    isSubmitted: isSubmittedRef.current,
    submitCount: submitCountRef.current,
    touched: touchedFieldsRef.current,
    isSubmitting: isSubmittingRef.current,
    isValid: isOnSubmit
      ? isSubmittedRef.current && isEmptyObject(errorsRef.current)
      : isEmptyObject(fieldsRef.current) || isValidRef.current,
  };

  const control = {
    register,
    unregister,
    setValue,
    formState,
    mode: {
      isOnBlur,
      isOnSubmit,
    },
    reValidateMode: {
      isReValidateOnBlur,
      isReValidateOnSubmit,
    },
    errors: errorsRef.current,
    defaultValues: defaultValuesRef.current,
    fields: fieldsRef.current,
  };

  return {
    watch,
    control,
    handleSubmit,
    setValue,
    triggerValidation,
    getValues: useCallback(getValues, []),
    reset: useCallback(reset, [reRender]),
    register: useCallback(register, [
      defaultRenderValuesRef.current,
      defaultValuesRef.current,
    ]),
    unregister: useCallback(unregister, [removeEventListenerAndRef]),
    clearError: useCallback(clearError, []),
    setError: useCallback(setError, []),
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
