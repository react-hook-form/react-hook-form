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
import assignWatchFields from './logic/assignWatchFields';
import skipValidation from './logic/skipValidation';
import getFieldArrayParentName from './logic/getFieldArrayParentName';
import getFieldArrayValueByName from './logic/getFieldArrayValueByName';
import getIsFieldsDifferent from './logic/getIsFieldsDifferent';
import isNameInFieldArray from './logic/isNameInFieldArray';
import isCheckBoxInput from './utils/isCheckBoxInput';
import isEmptyObject from './utils/isEmptyObject';
import isRadioInput from './utils/isRadioInput';
import isFileInput from './utils/isFileInput';
import isObject from './utils/isObject';
import isBoolean from './utils/isBoolean';
import isPrimitive from './utils/isPrimitive';
import isFunction from './utils/isFunction';
import isArray from './utils/isArray';
import isString from './utils/isString';
import isSameError from './utils/isSameError';
import isUndefined from './utils/isUndefined';
import isFileListObject from './utils/isFileListObject';
import onDomRemove from './utils/onDomRemove';
import get from './utils/get';
import set from './utils/set';
import unset from './utils/unset';
import isMultipleSelect from './utils/isMultipleSelect';
import modeChecker from './utils/validationModeChecker';
import isNullOrUndefined from './utils/isNullOrUndefined';
import isRadioOrCheckboxFunction from './utils/isRadioOrCheckbox';
import isHTMLElement from './utils/isHTMLElement';
import { EVENTS, UNDEFINED, VALIDATION_MODE } from './constants';
import { FormContextValues } from './contextTypes';
import {
  LiteralToPrimitive,
  DeepPartial,
  FieldValues,
  FieldName,
  FieldValue,
  FieldErrors,
  Field,
  FieldRefs,
  UseFormOptions,
  ValidationOptions,
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
  OmitResetState,
  Message,
} from './types';

export function useForm<
  FormValues extends FieldValues = FieldValues,
  ValidationContext extends object = object
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
  const fieldsRef = React.useRef<FieldRefs<FormValues>>({});
  const validateAllFieldCriteria = validateCriteriaMode === 'all';
  const errorsRef = React.useRef<FieldErrors<FormValues>>({});
  const touchedFieldsRef = React.useRef<Touched<FormValues>>({});
  const fieldArrayDefaultValues = React.useRef<Record<string, unknown[]>>({});
  const watchFieldsRef = React.useRef(new Set<FieldName<FormValues>>());
  const dirtyFieldsRef = React.useRef(new Set<FieldName<FormValues>>());
  const fieldsWithValidationRef = React.useRef(
    new Set<FieldName<FormValues>>(),
  );
  const validFieldsRef = React.useRef(new Set<FieldName<FormValues>>());
  const isValidRef = React.useRef(true);
  const defaultRenderValuesRef = React.useRef<
    DeepPartial<Record<FieldName<FormValues>, FieldValue<FormValues>>>
  >({});
  const defaultValuesRef = React.useRef<
    FieldValue<FormValues> | DeepPartial<FormValues>
  >(defaultValues);
  const isUnMount = React.useRef(false);
  const isWatchAllRef = React.useRef(false);
  const isSubmittedRef = React.useRef(false);
  const isDirtyRef = React.useRef(false);
  const submitCountRef = React.useRef(0);
  const isSubmittingRef = React.useRef(false);
  const handleChangeRef = React.useRef<HandleChange>();
  const resetFieldArrayFunctionRef = React.useRef({});
  const validationContextRef = React.useRef(validationContext);
  const fieldArrayNamesRef = React.useRef<Set<string>>(new Set());
  const [, render] = React.useState();
  const { isOnBlur, isOnSubmit, isOnChange } = React.useRef(
    modeChecker(mode),
  ).current;
  const isWindowUndefined = typeof window === UNDEFINED;
  const shouldValidateCallback = !!(validationSchema || validationResolver);
  const isWeb =
    typeof document !== UNDEFINED &&
    !isWindowUndefined &&
    !isUndefined(window.HTMLElement);
  const isProxyEnabled = isWeb ? 'Proxy' in window : typeof Proxy !== UNDEFINED;
  const readFormStateRef = React.useRef<ReadFormState>({
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
  } = React.useRef(modeChecker(reValidateMode)).current;
  validationContextRef.current = validationContext;

  const reRender = React.useCallback(() => {
    if (!isUnMount.current) {
      render({});
    }
  }, []);

  const shouldRenderBaseOnError = React.useCallback(
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

  const setFieldValue = React.useCallback(
    (
      field: Field,
      rawValue:
        | FieldValue<FormValues>
        | DeepPartial<FormValues>
        | undefined
        | null
        | boolean,
    ): boolean => {
      const ref = field.ref;
      const options = field.options;
      const { type } = ref;
      const value =
        isWeb && isHTMLElement(ref) && isNullOrUndefined(rawValue)
          ? ''
          : rawValue;

      if (isRadioInput(ref) && options) {
        options.forEach(
          ({ ref: radioRef }: { ref: HTMLInputElement }) =>
            (radioRef.checked = radioRef.value === value),
        );
      } else if (isFileInput(ref)) {
        if (isFileListObject(value as object)) {
          ref.files = value as FileList;
        } else {
          ref.value = value as string;
        }
      } else if (isMultipleSelect(ref)) {
        [...ref.options].forEach(
          (selectRef) =>
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
      const fieldArrayName = getFieldArrayParentName(name);
      isDirty = getIsFieldsDifferent(
        getFieldArrayValueByName(fieldsRef.current, fieldArrayName),
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

  const setDirtyAndTouchedFields = React.useCallback(
    (fieldName: FieldName<FormValues>): void | boolean => {
      if (
        setDirty(fieldName) ||
        (!get(touchedFieldsRef.current, fieldName) &&
          readFormStateRef.current.touched)
      ) {
        return !!set(touchedFieldsRef.current, fieldName, true);
      }
    },
    [],
  );

  const setInternalValueBatch = React.useCallback(
    (
      name: FieldName<FormValues>,
      value: FieldValue<FormValues>,
      parentFieldName?: string,
    ) => {
      const isValueArray = isArray(value);

      for (const key in value) {
        const fieldName = `${parentFieldName || name}${
          isValueArray ? `[${key}]` : `.${key}`
        }`;

        if (isObject(value[key])) {
          setInternalValueBatch(name, value[key], fieldName);
        }

        const field = fieldsRef.current[fieldName];

        if (field) {
          setFieldValue(field, value[key]);
          setDirtyAndTouchedFields(fieldName);
        }
      }
    },
    [setFieldValue, setDirtyAndTouchedFields],
  );

  const setInternalValue = React.useCallback(
    (
      name: FieldName<FormValues>,
      value: FieldValue<FormValues> | null | undefined | boolean,
    ): boolean | void => {
      const field = fieldsRef.current[name];
      if (field) {
        setFieldValue(field as Field, value);

        const output = setDirtyAndTouchedFields(name);
        if (isBoolean(output)) {
          return output;
        }
      } else if (!isPrimitive(value)) {
        setInternalValueBatch(name, value);
      }
    },
    [setDirtyAndTouchedFields, setFieldValue, setInternalValueBatch],
  );

  const executeValidation = React.useCallback(
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

  const executeSchemaValidation = React.useCallback(
    async (
      payload: FieldName<FormValues> | FieldName<FormValues>[],
    ): Promise<boolean> => {
      const { errors } = await validateWithSchema<
        FormValues,
        ValidationContext
      >(
        validationSchema,
        validateAllFieldCriteria,
        getFieldArrayValueByName(fieldsRef.current),
        validationResolver,
        validationContextRef.current,
      );
      const previousFormIsValid = isValidRef.current;
      isValidRef.current = isEmptyObject(errors);

      if (isArray(payload)) {
        payload.forEach((name) => {
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
      validationResolver,
      validationSchema,
    ],
  );

  const triggerValidation = React.useCallback(
    async (
      payload?: FieldName<FormValues> | FieldName<FormValues>[] | string,
    ): Promise<boolean> => {
      const fields = payload || Object.keys(fieldsRef.current);

      if (shouldValidateCallback) {
        return executeSchemaValidation(fields);
      }

      if (isArray(fields)) {
        const result = await Promise.all(
          fields.map(async (data) => await executeValidation(data, true)),
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

  const isFieldWatched = (name: string) =>
    isWatchAllRef.current ||
    watchFieldsRef.current.has(name) ||
    watchFieldsRef.current.has((name.match(/\w+/) || [])[0]);

  function setValue<Name extends FieldName<FormValues>>(
    name: Name,
    value?: FormValues[Name],
    shouldValidate?: boolean,
  ): void;
  function setValue<Name extends FieldName<FormValues>>(
    namesWithValue: Record<Name, any>[],
    shouldValidate?: boolean,
  ): void;
  function setValue<Name extends FieldName<FormValues>>(
    names: Name | Record<Name, any>[],
    valueOrShouldValidate?: FormValues[Name] | boolean,
    shouldValidate?: boolean,
  ): void {
    let shouldRender = false;
    const isMultiple = isArray(names);

    (isMultiple
      ? (names as Record<Name, FormValues[Name]>[])
      : [names]
    ).forEach((name: any) => {
      const isStringFieldName = isString(name);
      shouldRender =
        setInternalValue(
          isStringFieldName ? name : Object.keys(name)[0],
          isStringFieldName
            ? valueOrShouldValidate
            : (Object.values(name)[0] as FormValues[Name]),
        ) || isMultiple
          ? true
          : isFieldWatched(name);
    });

    if (shouldRender || isMultiple) {
      reRender();
    }

    if (shouldValidate || (isMultiple && valueOrShouldValidate)) {
      triggerValidation(isMultiple ? undefined : (names as Name));
    }
  }

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
          isOnChange,
          isBlurEvent,
          isOnSubmit,
          isReValidateOnSubmit,
          isOnBlur,
          isReValidateOnBlur,
          isSubmitted: isSubmittedRef.current,
        });
        const shouldUpdateDirty = setDirty(name);
        let shouldUpdateState = isFieldWatched(name) || shouldUpdateDirty;

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
            getFieldArrayValueByName(fields),
            validationResolver,
            validationContextRef.current,
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

  const validateSchemaIsValid = React.useCallback(
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
        validationContextRef.current,
      ).then(({ errors }) => {
        const previousFormIsValid = isValidRef.current;
        isValidRef.current = isEmptyObject(errors);

        if (previousFormIsValid !== isValidRef.current) {
          reRender();
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reRender, validateAllFieldCriteria, validationResolver],
  );

  const removeFieldEventListener = React.useCallback(
    (field: Field, forceDelete?: boolean) => {
      if (!isUndefined(handleChangeRef.current) && field) {
        findRemovedFieldAndRemoveListener(
          fieldsRef.current,
          handleChangeRef.current,
          field,
          forceDelete,
        );
      }
    },
    [],
  );

  const removeFieldEventListenerAndRef = React.useCallback(
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

      const { name } = field.ref;

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
      ].forEach((data) => data.current.delete(name));

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
    [
      reRender,
      shouldValidateCallback,
      validateSchemaIsValid,
      removeFieldEventListener,
    ],
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
    message?: Message;
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
    message?: Message,
  ): void;
  function setError(
    name: FieldName<FormValues> | ManualFieldError<FormValues>[],
    type: string | MultipleFieldErrors = '',
    message?: Message,
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
      name.forEach((error) =>
        setInternalError({ ...error, preventRender: true }),
      );
      reRender();
    }
  }

  function watch(): FormValues;
  function watch(option: { nest: boolean }): FormValues;
  function watch<T extends string, U extends unknown>(
    field: T,
    defaultValue?: T extends keyof FormValues
      ? FormValues[T]
      : LiteralToPrimitive<U>,
  ): T extends keyof FormValues ? FormValues[T] : LiteralToPrimitive<U>;
  function watch<T extends keyof FormValues>(
    fields: T[],
    defaultValues?: DeepPartial<Pick<FormValues, T>>,
  ): Pick<FormValues, T>;
  function watch(
    fields: string[],
    defaultValues?: DeepPartial<FormValues>,
  ): DeepPartial<FormValues>;
  function watch(
    fieldNames?: string | string[] | { nest: boolean },
    defaultValue?: unknown,
  ): unknown {
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

    if (isString(fieldNames)) {
      return assignWatchFields<FormValues>(
        fieldValues,
        fieldNames,
        watchFields,
        combinedDefaultValues as DeepPartial<FormValues>,
      );
    }

    if (isArray(fieldNames)) {
      return fieldNames.reduce(
        (previous, name) => ({
          ...previous,
          [name]: assignWatchFields<FormValues>(
            fieldValues,
            name,
            watchFields,
            combinedDefaultValues as DeepPartial<FormValues>,
          ),
        }),
        {},
      );
    }

    isWatchAllRef.current = true;

    const result =
      (!isEmptyObject(fieldValues) && fieldValues) || combinedDefaultValues;

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
      (isArray(names) ? names : [names]).forEach((fieldName) =>
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
    const isRadioOrCheckbox = isRadioOrCheckboxFunction(ref);
    let currentField = fields[name] as Field;
    let isEmptyDefaultValue = true;
    let isFieldArray = false;
    let defaultValue;

    if (
      isRadioOrCheckbox
        ? currentField &&
          isArray(currentField.options) &&
          currentField.options
            .filter(Boolean)
            .find(({ ref }: Field) => value === ref.value)
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
      defaultValue = get(defaultValuesRef.current, name);
      isEmptyDefaultValue = isUndefined(defaultValue);
      isFieldArray = isNameInFieldArray(fieldArrayNamesRef.current, name);

      if (!isEmptyDefaultValue && !isFieldArray) {
        setFieldValue(currentField, defaultValue);
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
          (error) => {
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

  const handleSubmit = React.useCallback(
    (callback: OnSubmit<FormValues>) => async (
      e?: React.BaseSyntheticEvent,
    ): Promise<void> => {
      if (e) {
        e.preventDefault();
        e.persist();
      }
      let fieldErrors: FieldErrors<FormValues> = {};
      let fieldValues: FieldValues = {};
      const fields = fieldsRef.current;

      if (readFormStateRef.current.isSubmitting) {
        isSubmittingRef.current = true;
        reRender();
      }

      try {
        if (shouldValidateCallback) {
          fieldValues = getFieldsValues(fields);
          const { errors, values } = await validateWithSchema<
            FormValues,
            ValidationContext
          >(
            validationSchema,
            validateAllFieldCriteria,
            transformToNestObject(fieldValues),
            validationResolver,
            validationContextRef.current,
          );
          errorsRef.current = errors;
          fieldErrors = errors;
          fieldValues = values;
        } else {
          for (const field of Object.values(fields)) {
            if (field) {
              const {
                ref,
                ref: { name },
              } = field;

              const fieldError = await validateField(
                fieldsRef,
                validateAllFieldCriteria,
                field,
              );

              if (fieldError[name]) {
                set(fieldErrors, name, fieldError[name]);
                validFieldsRef.current.delete(name);
              } else {
                if (fieldsWithValidationRef.current.has(name)) {
                  validFieldsRef.current.add(name);
                }

                fieldValues[name] = getFieldValue(fields, ref);
              }
            }
          }
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
      validationResolver,
      validationSchema,
    ],
  );

  const resetRefs = ({
    errors,
    dirty,
    isSubmitted,
    touched,
    isValid,
    submitCount,
  }: OmitResetState) => {
    fieldsRef.current = {};
    if (!errors) {
      errorsRef.current = {};
    }

    if (!touched) {
      touchedFieldsRef.current = {};
    }

    if (!isValid) {
      validFieldsRef.current = new Set();
      fieldsWithValidationRef.current = new Set();
      isValidRef.current = true;
    }

    if (!dirty) {
      dirtyFieldsRef.current = new Set();
      isDirtyRef.current = false;
    }

    if (!isSubmitted) {
      isSubmittedRef.current = false;
    }

    if (!submitCount) {
      submitCountRef.current = 0;
    }

    defaultRenderValuesRef.current = {};
    fieldArrayDefaultValues.current = {};
    watchFieldsRef.current = new Set();
    isWatchAllRef.current = false;
  };

  const reset = (
    values?: DeepPartial<FormValues>,
    omitResetState: OmitResetState = {},
  ): void => {
    if (isWeb) {
      for (const value of Object.values(fieldsRef.current)) {
        if (value) {
          const { ref, options } = value;
          const inputRef =
            isRadioOrCheckboxFunction(ref) && isArray(options)
              ? options[0].ref
              : ref;

          if (isHTMLElement(inputRef)) {
            try {
              inputRef.closest('form')!.reset();
              break;
            } catch {}
          }
        }
      }
    }

    if (values) {
      defaultValuesRef.current = values;
    }

    Object.values(resetFieldArrayFunctionRef.current).forEach(
      (resetFieldArray) => isFunction(resetFieldArray) && resetFieldArray(),
    );

    resetRefs(omitResetState);

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

  React.useEffect(
    () => () => {
      isUnMount.current = true;
      fieldsRef.current &&
        process.env.NODE_ENV === 'production' &&
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

  const commonProps = {
    triggerValidation,
    setValue: React.useCallback(setValue, [
      reRender,
      setInternalValue,
      triggerValidation,
    ]),
    register: React.useCallback(register, [
      defaultValuesRef.current,
      defaultRenderValuesRef.current,
    ]),
    unregister: React.useCallback(unregister, []),
    getValues: React.useCallback(getValues, []),
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

  const control = {
    removeFieldEventListener,
    reRender,
    ...(shouldValidateCallback ? { validateSchemaIsValid } : {}),
    mode: {
      isOnBlur,
      isOnSubmit,
      isOnChange,
    },
    reValidateMode: {
      isReValidateOnBlur,
      isReValidateOnSubmit,
    },
    errorsRef,
    touchedFieldsRef,
    fieldsRef,
    isWatchAllRef,
    watchFieldsRef,
    resetFieldArrayFunctionRef,
    fieldArrayDefaultValues,
    validFieldsRef,
    dirtyFieldsRef,
    fieldsWithValidationRef,
    fieldArrayNamesRef,
    isDirtyRef,
    readFormStateRef,
    defaultValuesRef,
    ...commonProps,
  };

  return {
    watch,
    control,
    handleSubmit,
    reset: React.useCallback(reset, []),
    clearError: React.useCallback(clearError, []),
    setError: React.useCallback(setError, []),
    errors: errorsRef.current,
    ...commonProps,
  };
}
