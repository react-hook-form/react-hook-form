import * as React from 'react';
import attachEventListeners from './logic/attachEventListeners';
import transformToNestObject from './logic/transformToNestObject';
import focusErrorField from './logic/focusErrorField';
import findRemovedFieldAndRemoveListener from './logic/findRemovedFieldAndRemoveListener';
import getFieldsValues from './logic/getFieldsValues';
import getFieldValue from './logic/getFieldValue';
import shouldUpdateWithError from './logic/shouldUpdateWithError';
import validateField from './logic/validateField';
import validateWithSchema from './logic/validateWithSchema';
import getDefaultValue from './logic/getDefaultValue';
import assignWatchFields from './logic/assignWatchFields';
import skipValidation from './logic/skipValidation';
import getFieldValueByName from './logic/getFieldValueByName';
import getIsFieldsDifferent from './logic/getIsFieldsDifferent';
import isNameInFieldArray from './logic/isNameInFieldArray';
import isCheckBoxInput from './utils/isCheckBoxInput';
import isEmptyObject from './utils/isEmptyObject';
import isRadioInput from './utils/isRadioInput';
import isFileInput from './utils/isFileInput';
import isObject from './utils/isObject';
import isFunction from './utils/isFunction';
import isArray from './utils/isArray';
import isString from './utils/isString';
import isSameError from './utils/isSameError';
import isUndefined from './utils/isUndefined';
import isFileListObject from './utils/isFileListObject';
import isEmptyString from './utils/isEmptyString';
import onDomRemove from './utils/onDomRemove';
import get from './utils/get';
import set from './utils/set';
import unset from './utils/unset';
import isMultipleSelect from './utils/isMultipleSelect';
import modeChecker from './utils/validationModeChecker';
import isNullOrUndefined from './utils/isNullOrUndefined';
import isHTMLElement from './utils/isHTMLElement';
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
  FieldElement,
  FormStateProxy,
  ReadFormState,
  ManualFieldError,
  MultipleFieldErrors,
  Ref,
  HandleChange,
  Touched,
  FieldError,
  RadioOrCheckboxOption,
} from './types';

const { useRef, useState, useCallback, useEffect } = React;

export function useForm<
  FormValues extends FieldValues = FieldValues,
  ValidationContext = any
>({
  mode = VALIDATION_MODE.onSubmit,
  reValidateMode = VALIDATION_MODE.onChange,
  validationSchema,
  validationResolver,
  validationContext,
  defaultValues = {},
  submitFocusError = true,
  validateCriteriaMode,
}: UseFormOptions<FormValues, ValidationContext> = {}): FormContextValues<
  FormValues
> {
  const fieldsRef = useRef<FieldRefs<FormValues>>({});
  const validateAllFieldCriteria = validateCriteriaMode === 'all';
  const errorsRef = useRef<FieldErrors<FormValues>>({});
  const touchedFieldsRef = useRef<Touched<FormValues>>({});
  const watchFieldArrayRef = useRef<
    Record<FieldName<FormValues>, Record<string, any>>
  >({} as Record<FieldName<FormValues>, Record<string, any>>);
  const watchFieldsRef = useRef(new Set<FieldName<FormValues>>());
  const dirtyFieldsRef = useRef(new Set<FieldName<FormValues>>());
  const fieldsWithValidationRef = useRef(new Set<FieldName<FormValues>>());
  const validFieldsRef = useRef(new Set<FieldName<FormValues>>());
  const isValidRef = useRef(true);
  const defaultRenderValuesRef = useRef<
    DeepPartial<Record<FieldName<FormValues>, FieldValue<FormValues>>>
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
  const resetFieldArrayFunctionRef = useRef({});
  const fieldArrayNamesRef = useRef<Set<string>>(new Set());
  const [, render] = useState();
  const { isOnBlur, isOnSubmit } = useRef(modeChecker(mode)).current;
  const isWindowUndefined = typeof window === UNDEFINED;
  const shouldValidateCallback = !!(validationSchema || validationResolver);
  const isWeb =
    typeof document !== UNDEFINED &&
    !isWindowUndefined &&
    !isUndefined(window.HTMLElement);
  const isProxyEnabled = isWeb && 'Proxy' in window;
  const readFormStateRef = useRef<ReadFormState>({
    dirty: !isProxyEnabled,
    dirtyFields: !isProxyEnabled,
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

  const reRender = useCallback(() => {
    if (!isUnMount.current) {
      render({});
    }
  }, []);

  const shouldRenderBaseOnError = useCallback(
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
        if (
          fieldsWithValidationRef.current.has(name) ||
          shouldValidateCallback
        ) {
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
    [reRender, shouldValidateCallback],
  );

  const setFieldValue = useCallback(
    (
      name: FieldName<FormValues>,
      rawValue:
        | FieldValue<FormValues>
        | DeepPartial<FormValues>
        | undefined
        | null,
    ): boolean => {
      const field = fieldsRef.current[name];

      if (!field) {
        return false;
      }

      const ref = field.ref;
      const options = field.options;
      const { type } = ref;
      const value =
        isWeb && isHTMLElement(ref) && isNullOrUndefined(rawValue)
          ? ''
          : rawValue;

      if (isRadioInput(ref) && options) {
        options.forEach(
          ({ ref: radioRef }) => (radioRef.checked = radioRef.value === value),
        );
      } else if (isFileInput(ref)) {
        if (
          isEmptyString(value as string) ||
          isFileListObject(value as object)
        ) {
          ref.files = value as FileList;
        } else {
          ref.value = value as string;
        }
      } else if (isMultipleSelect(ref)) {
        [...ref.options].forEach(
          selectRef =>
            (selectRef.selected = (value as string).includes(selectRef.value)),
        );
      } else if (isCheckBoxInput(ref) && options) {
        options.length > 1
          ? options.forEach(
              ({ ref: checkboxRef }) =>
                (checkboxRef.checked = (value as string).includes(
                  checkboxRef.value,
                )),
            )
          : (options[0].ref.checked = !!value);
      } else {
        ref.value = value;
      }

      return !!type;
    },
    [isWeb],
  );

  const setDirty = (name: FieldName<FormValues>): boolean => {
    if (
      !fieldsRef.current[name] ||
      (!readFormStateRef.current.dirty && !readFormStateRef.current.dirtyFields)
    ) {
      return false;
    }

    const isFieldArray = isNameInFieldArray(fieldArrayNamesRef.current, name);
    const previousDirtyFieldsLength = dirtyFieldsRef.current.size;
    let isDirty =
      defaultRenderValuesRef.current[name] !==
      getFieldValue(fieldsRef.current, fieldsRef.current[name]!.ref);

    if (isFieldArray) {
      const fieldArrayName = name.substring(0, name.indexOf('['));
      isDirty = getIsFieldsDifferent(
        getFieldValueByName(fieldsRef.current, fieldArrayName),
        get(defaultValuesRef.current, fieldArrayName),
      );
    }

    const isDirtyChanged =
      (isFieldArray ? isDirtyRef.current : dirtyFieldsRef.current.has(name)) !==
      isDirty;

    if (isDirty) {
      dirtyFieldsRef.current.add(name);
    } else {
      dirtyFieldsRef.current.delete(name);
    }

    isDirtyRef.current = isFieldArray ? isDirty : !!dirtyFieldsRef.current.size;
    return readFormStateRef.current.dirty
      ? isDirtyChanged
      : previousDirtyFieldsLength !== dirtyFieldsRef.current.size;
  };

  const setInternalValue = useCallback(
    (
      name: FieldName<FormValues>,
      value: FieldValue<FormValues> | null | undefined,
    ): boolean | void => {
      setFieldValue(name, value);

      if (
        setDirty(name) ||
        (!get(touchedFieldsRef.current, name) &&
          readFormStateRef.current.touched)
      ) {
        return !!set(touchedFieldsRef.current, name, true);
      }
    },
    [setFieldValue],
  );

  const executeValidation = useCallback(
    async (
      name: FieldName<FormValues>,
      skipReRender?: boolean,
    ): Promise<boolean> => {
      const field = fieldsRef.current[name]!;

      if (!field) {
        return false;
      }

      const error = await validateField<FormValues>(
        fieldsRef,
        validateAllFieldCriteria,
        field,
      );

      shouldRenderBaseOnError(name, error, false, skipReRender);

      return isEmptyObject(error);
    },
    [shouldRenderBaseOnError, validateAllFieldCriteria],
  );

  const executeSchemaValidation = useCallback(
    async (
      payload: FieldName<FormValues> | FieldName<FormValues>[],
    ): Promise<boolean> => {
      const { errors } = await validateWithSchema<
        FormValues,
        ValidationContext
      >(
        validationSchema,
        validateAllFieldCriteria,
        getFieldValueByName(fieldsRef.current),
        validationResolver,
        validationContext,
      );
      const previousFormIsValid = isValidRef.current;
      isValidRef.current = isEmptyObject(errors);

      if (isArray(payload)) {
        payload.forEach(name => {
          const error = get(errors, name);

          if (error) {
            set(errorsRef.current, name, error);
          } else {
            unset(errorsRef.current, [name]);
          }
        });
        reRender();
      } else {
        shouldRenderBaseOnError(
          payload,
          (get(errors, payload)
            ? { [payload]: get(errors, payload) }
            : {}) as FieldErrors<FormValues>,
          previousFormIsValid !== isValidRef.current,
        );
      }

      return isEmptyObject(errorsRef.current);
    },
    [
      reRender,
      shouldRenderBaseOnError,
      validateAllFieldCriteria,
      validationContext,
      validationResolver,
      validationSchema,
    ],
  );

  const triggerValidation = useCallback(
    async (
      payload?: FieldName<FormValues> | FieldName<FormValues>[] | string,
    ): Promise<boolean> => {
      const fields = payload || Object.keys(fieldsRef.current);

      if (shouldValidateCallback) {
        return executeSchemaValidation(fields);
      }

      if (isArray(fields)) {
        const result = await Promise.all(
          fields.map(async data => await executeValidation(data, true)),
        );
        reRender();
        return result.every(Boolean);
      }

      return await executeValidation(fields);
    },
    [
      executeSchemaValidation,
      executeValidation,
      reRender,
      shouldValidateCallback,
    ],
  );

  const setValue = useCallback<
    <Name extends FieldName<FormValues>>(
      name: Name,
      value: FormValues[Name] | null | undefined,
      shouldValidate?: boolean,
    ) => void | Promise<boolean>
  >(
    (name, value, shouldValidate) => {
      const shouldRender =
        setInternalValue(name, value) ||
        isWatchAllRef.current ||
        watchFieldsRef.current.has(name);

      if (shouldRender) {
        reRender();
      }

      if (shouldValidate) {
        triggerValidation(name);
      }
      return;
    },
    [reRender, setInternalValue, triggerValidation],
  );

  handleChangeRef.current = handleChangeRef.current
    ? handleChangeRef.current
    : async ({ type, target }: Event): Promise<void | boolean> => {
        const name = target ? (target as Ref).name : '';
        const fields = fieldsRef.current;
        const errors = errorsRef.current;
        const field = fields[name];
        const currentError = get(errors, name);
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
          readFormStateRef.current.touched
        ) {
          set(touchedFieldsRef.current, name, true);
          shouldUpdateState = true;
        }

        if (shouldSkipValidation) {
          return shouldUpdateState && reRender();
        }

        if (shouldValidateCallback) {
          const { errors } = await validateWithSchema<
            FormValues,
            ValidationContext
          >(
            validationSchema,
            validateAllFieldCriteria,
            getFieldValueByName(fields),
            validationResolver,
            validationContext,
          );
          const previousFormIsValid = isValidRef.current;
          isValidRef.current = isEmptyObject(errors);

          error = (get(errors, name)
            ? { [name]: get(errors, name) }
            : {}) as FieldErrors<FormValues>;

          if (previousFormIsValid !== isValidRef.current) {
            shouldUpdateState = true;
          }
        } else {
          error = await validateField<FormValues>(
            fieldsRef,
            validateAllFieldCriteria,
            field,
          );
        }

        if (!shouldRenderBaseOnError(name, error) && shouldUpdateState) {
          reRender();
        }
      };

  const validateSchemaIsValid = useCallback(
    (values: any = {}) => {
      const fieldValues = isEmptyObject(defaultValuesRef.current)
        ? getFieldsValues(fieldsRef.current)
        : defaultValuesRef.current;

      validateWithSchema<FormValues, ValidationContext>(
        validationSchema,
        validateAllFieldCriteria,
        transformToNestObject({
          ...fieldValues,
          ...values,
        }),
        validationResolver,
        validationContext,
      ).then(({ errors }) => {
        const previousFormIsValid = isValidRef.current;
        isValidRef.current = isEmptyObject(errors);

        if (previousFormIsValid !== isValidRef.current) {
          reRender();
        }
      });
    },
    [
      reRender,
      validateAllFieldCriteria,
      validationContext,
      validationResolver,
      validationSchema,
    ],
  );

  const resetFieldRef = useCallback(
    (name: FieldName<FormValues>) => {
      errorsRef.current = unset(errorsRef.current, [name]);
      touchedFieldsRef.current = unset(touchedFieldsRef.current, [name]);
      defaultRenderValuesRef.current = unset(defaultRenderValuesRef.current, [
        name,
      ]);
      [
        dirtyFieldsRef,
        fieldsWithValidationRef,
        validFieldsRef,
        watchFieldsRef,
      ].forEach(data => data.current.delete(name));

      if (
        readFormStateRef.current.isValid ||
        readFormStateRef.current.touched
      ) {
        reRender();

        if (shouldValidateCallback) {
          validateSchemaIsValid();
        }
      }
    },
    [reRender], // eslint-disable-line
  );

  const removeFieldEventListener = (field: Field, forceDelete?: boolean) => {
    if (!isUndefined(handleChangeRef.current) && field) {
      findRemovedFieldAndRemoveListener(
        fieldsRef.current,
        handleChangeRef.current,
        field,
        forceDelete,
      );
    }
  };

  const removeFieldEventListenerAndRef = useCallback(
    (field: Field | undefined, forceDelete?: boolean) => {
      if (
        !field ||
        (field &&
          isNameInFieldArray(fieldArrayNamesRef.current, field.ref.name) &&
          !forceDelete)
      ) {
        return;
      }

      removeFieldEventListener(field, forceDelete);

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
      unset(errorsRef.current, isArray(name) ? name : [name]);
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

    if (
      !isSameError(errorsRef.current[name] as FieldError, {
        type,
        message,
        types,
      })
    ) {
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
    defaultValues?: DeepPartial<FormValues>,
  ): DeepPartial<FormValues>;
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
    const fieldValues = getFieldsValues<FormValues>(
      fieldsRef.current,
      fieldNames,
    );
    const watchFields = watchFieldsRef.current;

    if (isProxyEnabled) {
      readFormStateRef.current.dirty = true;
    }

    if (isString(fieldNames)) {
      return assignWatchFields<FormValues>(
        fieldValues,
        fieldNames,
        watchFields,
        combinedDefaultValues,
        fieldArrayNamesRef.current.has(fieldNames)
          ? watchFieldArrayRef.current[fieldNames]
          : undefined,
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
        removeFieldEventListenerAndRef(fieldsRef.current[fieldName], true),
      );
    }
  }

  function registerFieldsRef<Element extends FieldElement>(
    ref: Element,
    validateOptions: ValidationOptions | null = {},
  ): ((name: FieldName<FormValues>) => void) | void {
    if (!ref.name) {
      // eslint-disable-next-line no-console
      return console.warn('Missing name @', ref);
    }

    const { name, type, value } = ref;
    const fieldAttributes = {
      ref,
      ...validateOptions,
    };
    const fields = fieldsRef.current;
    const isRadioOrCheckbox = isRadioInput(ref) || isCheckBoxInput(ref);
    let currentField = fields[name] as Field;
    let isEmptyDefaultValue = true;
    let isFieldArray = false;
    let defaultValue;

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
        removeFieldEventListenerAndRef(fieldAttributes),
      );

      currentField = isRadioOrCheckbox
        ? {
            options: [
              ...((currentField && currentField.options) || []),
              {
                ref,
                mutationWatcher,
              } as RadioOrCheckboxOption,
            ],
            ref: { type, name },
            ...validateOptions,
          }
        : {
            ...fieldAttributes,
            mutationWatcher,
          };
    } else {
      currentField = fieldAttributes;
    }

    fields[name as FieldName<FormValues>] = currentField;

    if (!isEmptyObject(defaultValuesRef.current)) {
      defaultValue = getDefaultValue<FormValues>(
        defaultValuesRef.current,
        name,
      );
      isEmptyDefaultValue = isUndefined(defaultValue);
      isFieldArray = isNameInFieldArray(fieldArrayNamesRef.current, name);

      if (!isEmptyDefaultValue && !isFieldArray) {
        setFieldValue(name, defaultValue);
      }
    }

    if (
      shouldValidateCallback &&
      !isFieldArray &&
      readFormStateRef.current.isValid
    ) {
      validateSchemaIsValid();
    } else if (!isEmptyObject(validateOptions)) {
      fieldsWithValidationRef.current.add(name);

      if (!isOnSubmit && readFormStateRef.current.isValid) {
        validateField(fieldsRef, validateAllFieldCriteria, currentField).then(
          error => {
            const previousFormIsValid = isValidRef.current;
            if (isEmptyObject(error)) {
              validFieldsRef.current.add(name);
            } else {
              isValidRef.current = false;
            }

            if (previousFormIsValid !== isValidRef.current) {
              reRender();
            }
          },
        );
      }
    }

    if (
      !defaultRenderValuesRef.current[name] &&
      !(isFieldArray && isEmptyDefaultValue)
    ) {
      defaultRenderValuesRef.current[
        name as FieldName<FormValues>
      ] = isEmptyDefaultValue
        ? getFieldValue(fields, currentField.ref)
        : defaultValue;
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

  function register<Element extends FieldElement = FieldElement>(): (
    ref: Element | null,
  ) => void;
  function register<Element extends FieldElement = FieldElement>(
    validationOptions: ValidationOptions,
  ): (ref: Element | null) => void;
  function register<Element extends FieldElement = FieldElement>(
    name: FieldName<FormValues>,
    validationOptions?: ValidationOptions,
  ): void;
  function register<Element extends FieldElement = FieldElement>(
    namesWithValidationOptions: Record<
      FieldName<FormValues>,
      ValidationOptions
    >,
  ): void;
  function register<Element extends FieldElement = FieldElement>(
    ref: Element,
    validationOptions?: ValidationOptions,
  ): void;
  function register<Element extends FieldElement = FieldElement>(
    refOrValidationOptions?: ValidationOptions | Element | null,
    validationOptions?: ValidationOptions,
  ): ((ref: Element | null) => void) | void {
    if (isWindowUndefined) {
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
      e?: React.BaseSyntheticEvent,
    ): Promise<void> => {
      if (e) {
        e.preventDefault();
        e.persist();
      }
      let fieldErrors;
      let fieldValues;
      const fields = fieldsRef.current;

      if (readFormStateRef.current.isSubmitting) {
        isSubmittingRef.current = true;
        reRender();
      }

      try {
        if (shouldValidateCallback) {
          fieldValues = getFieldsValues(fields);
          const { errors, values } = await validateWithSchema(
            validationSchema,
            validateAllFieldCriteria,
            transformToNestObject(fieldValues),
            validationResolver,
            validationContext,
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

              const fieldError = await validateField(
                fieldsRef,
                validateAllFieldCriteria,
                field,
              );

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
          if (submitFocusError && isWeb) {
            focusErrorField(fields, fieldErrors);
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
      isWeb,
      reRender,
      shouldValidateCallback,
      submitFocusError,
      validateAllFieldCriteria,
      validationContext,
      validationResolver,
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
    for (const value of Object.values(fieldsRef.current)) {
      if (value && isHTMLElement(value.ref) && value.ref.closest) {
        try {
          value.ref.closest('form')!.reset();
          break;
        } catch {}
      }
    }

    if (values) {
      defaultValuesRef.current = values;
    }

    Object.values(resetFieldArrayFunctionRef.current).forEach(
      resetFieldArray => isFunction(resetFieldArray) && resetFieldArray(),
    );

    resetRefs();

    reRender();
  };

  const getValues = (payload?: { nest: boolean }): FormValues => {
    const fieldValues = getFieldsValues(fieldsRef.current);

    return payload && payload.nest
      ? transformToNestObject(fieldValues)
      : fieldValues;
  };

  useEffect(
    () => () => {
      isUnMount.current = true;
      fieldsRef.current &&
        Object.values(
          fieldsRef.current,
        ).forEach((field: Field | undefined): void =>
          removeFieldEventListenerAndRef(field, true),
        );
    },
    [removeFieldEventListenerAndRef],
  );

  if (!shouldValidateCallback) {
    isValidRef.current =
      validFieldsRef.current.size >= fieldsWithValidationRef.current.size &&
      isEmptyObject(errorsRef.current);
  }

  const formState = {
    dirty: isDirtyRef.current,
    dirtyFields: dirtyFieldsRef.current,
    isSubmitted: isSubmittedRef.current,
    submitCount: submitCountRef.current,
    touched: touchedFieldsRef.current,
    isSubmitting: isSubmittingRef.current,
    isValid: isOnSubmit
      ? isSubmittedRef.current && isEmptyObject(errorsRef.current)
      : isValidRef.current,
  };

  const control = {
    register,
    unregister,
    removeFieldEventListener,
    getValues,
    setValue,
    triggerValidation,
    ...(shouldValidateCallback ? { validateSchemaIsValid } : {}),
    formState,
    mode: {
      isOnBlur,
      isOnSubmit,
    },
    reValidateMode: {
      isReValidateOnBlur,
      isReValidateOnSubmit,
    },
    errorsRef,
    touchedFieldsRef,
    fieldsRef,
    resetFieldArrayFunctionRef,
    watchFieldArrayRef,
    fieldArrayNamesRef,
    isDirtyRef,
    readFormStateRef,
    defaultValuesRef,
  };

  return {
    watch,
    control,
    handleSubmit,
    setValue,
    triggerValidation,
    getValues: useCallback(getValues, []),
    reset: useCallback(reset, []),
    register: useCallback(register, [
      defaultValuesRef.current,
      defaultRenderValuesRef.current,
    ]),
    unregister: useCallback(unregister, []),
    clearError: useCallback(clearError, []),
    setError: useCallback(setError, []),
    errors: errorsRef.current,
    formState: isProxyEnabled
      ? new Proxy<FormStateProxy<FormValues>>(formState, {
          get: (obj, prop: keyof FormStateProxy) => {
            if (prop in obj) {
              readFormStateRef.current[prop] = true;
              return obj[prop];
            }

            return {};
          },
        })
      : formState,
  };
}
