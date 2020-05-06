import * as React from 'react';
import attachEventListeners from './logic/attachEventListeners';
import transformToNestObject from './logic/transformToNestObject';
import focusOnErrorField from './logic/focusOnErrorField';
import findRemovedFieldAndRemoveListener from './logic/findRemovedFieldAndRemoveListener';
import getFieldsValues from './logic/getFieldsValues';
import getFieldValue from './logic/getFieldValue';
import shouldRenderBasedOnError from './logic/shouldRenderBasedOnError';
import validateField from './logic/validateField';
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
import onDomRemove from './utils/onDomRemove';
import get from './utils/get';
import set from './utils/set';
import unset from './utils/unset';
import modeChecker from './utils/validationModeChecker';
import isMultipleSelect from './utils/isMultipleSelect';
import isNullOrUndefined from './utils/isNullOrUndefined';
import isRadioOrCheckboxFunction from './utils/isRadioOrCheckbox';
import isHTMLElement from './utils/isHTMLElement';
import { EVENTS, UNDEFINED, VALIDATION_MODE } from './constants';
import { UseFormMethods } from './contextTypes';
import {
  LiteralToPrimitive,
  DeepPartial,
  FieldValues,
  NestedValue,
  UnpackNestedValue,
  FieldName,
  InternalFieldName,
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
  IsAny,
} from './types';

export function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object
>({
  mode = VALIDATION_MODE.onSubmit,
  reValidateMode = VALIDATION_MODE.onChange,
  resolver,
  context,
  defaultValues = {} as UnpackNestedValue<DeepPartial<TFieldValues>>,
  submitFocusError = true,
  validateCriteriaMode,
}: UseFormOptions<TFieldValues, TContext> = {}): UseFormMethods<TFieldValues> {
  const fieldsRef = React.useRef<FieldRefs<TFieldValues>>({});
  const errorsRef = React.useRef<FieldErrors<TFieldValues>>({});
  const touchedFieldsRef = React.useRef<Touched<TFieldValues>>({});
  const fieldArrayDefaultValues = React.useRef<Record<string, unknown[]>>({});
  const watchFieldsRef = React.useRef(
    new Set<InternalFieldName<TFieldValues>>(),
  );
  const dirtyFieldsRef = React.useRef(
    new Set<InternalFieldName<TFieldValues>>(),
  );
  const watchFieldsHookRef = React.useRef<
    Record<string, Set<InternalFieldName<TFieldValues>>>
  >({});
  const watchFieldsHookRenderRef = React.useRef<Record<string, Function>>({});
  const fieldsWithValidationRef = React.useRef(
    new Set<InternalFieldName<TFieldValues>>(),
  );
  const validFieldsRef = React.useRef(
    new Set<InternalFieldName<TFieldValues>>(),
  );
  const isValidRef = React.useRef(true);
  const defaultValuesRef = React.useRef<
    | FieldValue<UnpackNestedValue<TFieldValues>>
    | UnpackNestedValue<DeepPartial<TFieldValues>>
  >(defaultValues);
  const defaultValuesAtRenderRef = React.useRef<
    UnpackNestedValue<
      DeepPartial<
        Record<InternalFieldName<TFieldValues>, FieldValue<TFieldValues>>
      >
    >
  >(
    {} as UnpackNestedValue<
      DeepPartial<
        Record<InternalFieldName<TFieldValues>, FieldValue<TFieldValues>>
      >
    >,
  );
  const isUnMount = React.useRef(false);
  const isWatchAllRef = React.useRef(false);
  const isSubmittedRef = React.useRef(false);
  const isDirtyRef = React.useRef(false);
  const submitCountRef = React.useRef(0);
  const isSubmittingRef = React.useRef(false);
  const handleChangeRef = React.useRef<HandleChange>();
  const resetFieldArrayFunctionRef = React.useRef({});
  const contextRef = React.useRef(context);
  const resolverRef = React.useRef(resolver);
  const fieldArrayNamesRef = React.useRef<Set<string>>(new Set());
  const [, render] = React.useState();
  const { isOnBlur, isOnSubmit, isOnChange, isOnAll } = React.useRef(
    modeChecker(mode),
  ).current;
  const validateAllFieldCriteria = validateCriteriaMode === VALIDATION_MODE.all;
  const isWindowUndefined = typeof window === UNDEFINED;
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
  contextRef.current = context;
  resolverRef.current = resolver;

  const reRender = React.useCallback(() => {
    if (!isUnMount.current) {
      render({});
    }
  }, []);

  const shouldRenderBaseOnError = React.useCallback(
    (
      name: InternalFieldName<TFieldValues>,
      error: FieldErrors<TFieldValues>,
      shouldRender: boolean | null = false,
    ): boolean | void => {
      let shouldReRender =
        shouldRender ||
        shouldRenderBasedOnError<TFieldValues>({
          errors: errorsRef.current,
          error,
          name,
          validFields: validFieldsRef.current,
          fieldsWithValidation: fieldsWithValidationRef.current,
        });

      if (isEmptyObject(error)) {
        if (fieldsWithValidationRef.current.has(name) || resolverRef.current) {
          validFieldsRef.current.add(name);
          shouldReRender = shouldReRender || get(errorsRef.current, name);
        }

        errorsRef.current = unset(errorsRef.current, [name]);
      } else {
        validFieldsRef.current.delete(name);
        shouldReRender = shouldReRender || !get(errorsRef.current, name);

        set(errorsRef.current, name, error[name]);
      }

      if (shouldReRender && !isNullOrUndefined(shouldRender)) {
        reRender();
        return true;
      }
    },
    [reRender, resolverRef],
  );

  const setFieldValue = React.useCallback(
    (
      field: Field,
      rawValue:
        | FieldValue<TFieldValues>
        | UnpackNestedValue<DeepPartial<TFieldValues>>
        | undefined
        | null
        | boolean,
    ) => {
      const { ref, options } = field;
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
        if (isString(value)) {
          ref.value = value;
        } else {
          ref.files = value as FileList;
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
    },
    [isWeb],
  );

  const setDirty = (name: InternalFieldName<TFieldValues>): boolean => {
    if (
      !fieldsRef.current[name] ||
      (!readFormStateRef.current.dirty && !readFormStateRef.current.dirtyFields)
    ) {
      return false;
    }

    let isFieldDirty =
      defaultValuesAtRenderRef.current[name] !==
      getFieldValue(fieldsRef.current, fieldsRef.current[name]!.ref);
    const isFieldArray = isNameInFieldArray(fieldArrayNamesRef.current, name);
    const previousDirtyFieldsLength = dirtyFieldsRef.current.size;

    if (isFieldArray) {
      const fieldArrayName = getFieldArrayParentName(name);
      isFieldDirty = getIsFieldsDifferent(
        getFieldArrayValueByName(fieldsRef.current, fieldArrayName),
        get(defaultValuesRef.current, fieldArrayName),
      );
    }

    const isDirtyChanged =
      (isFieldArray ? isDirtyRef.current : dirtyFieldsRef.current.has(name)) !==
      isFieldDirty;

    if (isFieldDirty) {
      dirtyFieldsRef.current.add(name);
    } else {
      dirtyFieldsRef.current.delete(name);
    }

    isDirtyRef.current = isFieldArray
      ? isFieldDirty
      : !!dirtyFieldsRef.current.size;
    return readFormStateRef.current.dirty
      ? isDirtyChanged
      : previousDirtyFieldsLength !== dirtyFieldsRef.current.size;
  };

  const setDirtyAndTouchedFields = React.useCallback(
    (fieldName: InternalFieldName<TFieldValues>): void | boolean => {
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

  const setInternalValues = React.useCallback(
    (
      name: InternalFieldName<TFieldValues>,
      value: FieldValue<TFieldValues>,
      parentFieldName?: string,
    ) => {
      const isValueArray = isArray(value);

      for (const key in value) {
        const fieldName = `${parentFieldName || name}${
          isValueArray ? `[${key}]` : `.${key}`
        }`;
        const field = fieldsRef.current[fieldName];

        if (isObject(value[key])) {
          setInternalValues(name, value[key], fieldName);
        }

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
      name: InternalFieldName<TFieldValues>,
      value: FieldValue<TFieldValues> | null | undefined | boolean,
    ): boolean | void => {
      const field = fieldsRef.current[name];
      if (field) {
        setFieldValue(field as Field, value);

        const output = setDirtyAndTouchedFields(name);
        if (isBoolean(output)) {
          return output;
        }
      } else if (!isPrimitive(value)) {
        setInternalValues(name, value);
      }
    },
    [setDirtyAndTouchedFields, setFieldValue, setInternalValues],
  );

  const executeValidation = React.useCallback(
    async (
      name: InternalFieldName<TFieldValues>,
      skipReRender?: boolean,
    ): Promise<boolean> => {
      const field = fieldsRef.current[name] as Field;

      if (field) {
        const error = await validateField<TFieldValues>(
          fieldsRef,
          validateAllFieldCriteria,
          field,
        );

        shouldRenderBaseOnError(name, error, skipReRender ? null : false);

        return isEmptyObject(error);
      }

      return false;
    },
    [shouldRenderBaseOnError, validateAllFieldCriteria],
  );

  const executeSchemaOrResolverValidation = React.useCallback(
    async (
      payload:
        | InternalFieldName<TFieldValues>
        | InternalFieldName<TFieldValues>[],
    ) => {
      if (resolverRef.current) {
        const { errors } = await resolverRef.current(
          getFieldArrayValueByName(fieldsRef.current),
          contextRef.current,
          validateAllFieldCriteria,
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
          const error = get(errors, payload);
          shouldRenderBaseOnError(
            payload,
            (error ? { [payload]: error } : {}) as FieldErrors<TFieldValues>,
            previousFormIsValid !== isValidRef.current,
          );
        }

        return isEmptyObject(errorsRef.current);
      }

      return false;
    },
    [reRender, shouldRenderBaseOnError, validateAllFieldCriteria, resolverRef],
  );

  const trigger = React.useCallback(
    async (
      payload?: FieldName<TFieldValues> | FieldName<TFieldValues>[],
    ): Promise<boolean> => {
      const fields = payload || Object.keys(fieldsRef.current);

      if (resolverRef.current) {
        return executeSchemaOrResolverValidation(fields);
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
      executeSchemaOrResolverValidation,
      executeValidation,
      reRender,
      resolverRef,
    ],
  );

  const isFieldWatched = (name: string) =>
    isWatchAllRef.current ||
    watchFieldsRef.current.has(name) ||
    watchFieldsRef.current.has((name.match(/\w+/) || [])[0]);

  function setValue<T extends string, U extends unknown>(
    name: T,
    value: T extends keyof TFieldValues
      ? IsAny<TFieldValues[T]> extends true
        ? any
        : TFieldValues[T] extends NestedValue<infer U>
        ? U
        : UnpackNestedValue<DeepPartial<TFieldValues[T]>>
      : LiteralToPrimitive<U>,
    shouldValidate?: boolean,
  ): void;
  function setValue<T extends keyof TFieldValues>(
    namesWithValue: UnpackNestedValue<DeepPartial<Pick<TFieldValues, T>>>[],
    shouldValidate?: boolean,
  ): void;
  function setValue<T extends keyof TFieldValues>(
    names: string | UnpackNestedValue<DeepPartial<Pick<TFieldValues, T>>>[],
    valueOrShouldValidate?: unknown,
    shouldValidate?: boolean,
  ): void {
    let shouldRender = false;
    const isArrayValue = isArray(names);

    (isArrayValue
      ? (names as UnpackNestedValue<DeepPartial<Pick<TFieldValues, T>>>[])
      : [names]
    ).forEach((name: any) => {
      const isStringFieldName = isString(name);
      shouldRender =
        setInternalValue(
          isStringFieldName ? name : Object.keys(name)[0],
          isStringFieldName
            ? valueOrShouldValidate
            : (Object.values(name)[0] as any),
        ) || isArrayValue
          ? true
          : isFieldWatched(name);
    });

    if (shouldRender || isArrayValue) {
      reRender();
    }

    if (shouldValidate || (isArrayValue && valueOrShouldValidate)) {
      trigger(isArrayValue ? undefined : (names as any));
    }
  }

  const renderWatchedInputs = (name: string, found = true): boolean => {
    const watchFieldsHook = watchFieldsHookRef.current;

    if (!isEmptyObject(watchFieldsHook)) {
      for (const key in watchFieldsHook) {
        if (watchFieldsHook[key].has(name) || !watchFieldsHook[key].size) {
          if (watchFieldsHookRenderRef.current[key]) {
            watchFieldsHookRenderRef.current[key]();
            found = false;
          }
        }
      }
    }

    return found;
  };

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
        const shouldSkipValidation =
          !isOnAll &&
          skipValidation({
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
        let shouldRender = isFieldWatched(name) || shouldUpdateDirty;

        if (
          isBlurEvent &&
          !get(touchedFieldsRef.current, name) &&
          readFormStateRef.current.touched
        ) {
          set(touchedFieldsRef.current, name, true);
          shouldRender = true;
        }

        if (shouldSkipValidation) {
          return renderWatchedInputs(name) && shouldRender && reRender();
        }

        if (resolver) {
          const { errors } = await resolver(
            getFieldArrayValueByName(fields),
            contextRef.current,
            validateAllFieldCriteria,
          );
          const previousFormIsValid = isValidRef.current;
          isValidRef.current = isEmptyObject(errors);

          error = (get(errors, name)
            ? { [name]: get(errors, name) }
            : {}) as FieldErrors<TFieldValues>;

          if (previousFormIsValid !== isValidRef.current) {
            shouldRender = true;
          }
        } else {
          error = await validateField<TFieldValues>(
            fieldsRef,
            validateAllFieldCriteria,
            field,
          );
        }

        if (!shouldRenderBaseOnError(name, error) && shouldRender) {
          reRender();
        } else {
          renderWatchedInputs(name);
        }
      };

  const validateResolver = React.useCallback(
    (values: any = {}) => {
      const fieldValues = isEmptyObject(defaultValuesRef.current)
        ? getFieldsValues(fieldsRef.current)
        : defaultValuesRef.current;

      if (resolverRef.current) {
        resolverRef
          .current(
            transformToNestObject({
              ...fieldValues,
              ...values,
            }),
            contextRef.current,
            validateAllFieldCriteria,
          )
          .then(({ errors }) => {
            const previousFormIsValid = isValidRef.current;
            isValidRef.current = isEmptyObject(errors);

            if (previousFormIsValid !== isValidRef.current) {
              reRender();
            }
          });
      }
    },
    [reRender, validateAllFieldCriteria, resolverRef],
  );

  const removeFieldEventListener = React.useCallback(
    (field: Field, forceDelete?: boolean) => {
      if (handleChangeRef.current && field) {
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
      defaultValuesAtRenderRef.current = unset(
        defaultValuesAtRenderRef.current,
        [name],
      );
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

        if (resolverRef.current) {
          validateResolver();
        }
      }
    },
    [reRender, validateResolver, removeFieldEventListener, resolverRef],
  );

  function clearError(
    name?: FieldName<TFieldValues> | FieldName<TFieldValues>[],
  ): void {
    if (name) {
      unset(errorsRef.current, isArray(name) ? name : [name]);
    } else {
      errorsRef.current = {};
    }

    reRender();
  }

  const setInternalError = ({
    name,
    type,
    types,
    message,
    shouldRender,
  }: {
    name: InternalFieldName<TFieldValues>;
    type: string;
    types?: MultipleFieldErrors;
    message?: Message;
    shouldRender?: boolean;
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

      if (shouldRender) {
        reRender();
      }
    }
  };

  function setError(
    name: FieldName<TFieldValues>,
    type: MultipleFieldErrors,
  ): void;
  function setError(
    name: FieldName<TFieldValues>,
    type: string,
    message?: Message,
  ): void;
  function setError(name: ManualFieldError<TFieldValues>[]): void;
  function setError(
    name: FieldName<TFieldValues> | ManualFieldError<TFieldValues>[],
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
        shouldRender: true,
      });
    } else if (isArray(name)) {
      name.forEach((error) => setInternalError({ ...error }));
      reRender();
    }
  }

  const watchInternal = React.useCallback(
    (
      fieldNames?: string | string[],
      defaultValue?: unknown,
      watchId?: string,
    ) => {
      const watchFields = watchId
        ? watchFieldsHookRef.current[watchId]
        : watchFieldsRef.current;
      const isDefaultValueUndefined = isUndefined(defaultValue);
      const combinedDefaultValues = isDefaultValueUndefined
        ? defaultValuesRef.current
        : defaultValue;
      const fieldValues = getFieldsValues<TFieldValues>(
        fieldsRef.current,
        fieldNames,
      );

      if (isString(fieldNames)) {
        return assignWatchFields<TFieldValues>(
          fieldValues,
          fieldNames,
          watchFields,
          isDefaultValueUndefined
            ? get(combinedDefaultValues, fieldNames)
            : (defaultValue as UnpackNestedValue<DeepPartial<TFieldValues>>),
          true,
        );
      }

      if (isArray(fieldNames)) {
        return fieldNames.reduce(
          (previous, name) => ({
            ...previous,
            [name]: assignWatchFields<TFieldValues>(
              fieldValues,
              name,
              watchFields,
              combinedDefaultValues as UnpackNestedValue<
                DeepPartial<TFieldValues>
              >,
            ),
          }),
          {},
        );
      }

      isWatchAllRef.current = true;

      return transformToNestObject(
        (!isEmptyObject(fieldValues) && fieldValues) ||
          (combinedDefaultValues as FieldValues),
      );
    },
    [],
  );

  function watch(): UnpackNestedValue<TFieldValues>;
  function watch<T extends string, U extends unknown>(
    field: T,
    defaultValue?: T extends keyof TFieldValues
      ? UnpackNestedValue<TFieldValues>[T]
      : LiteralToPrimitive<U>,
  ): T extends keyof TFieldValues
    ? UnpackNestedValue<TFieldValues>[T]
    : LiteralToPrimitive<U>;
  function watch<T extends keyof TFieldValues>(
    fields: T[],
    defaultValues?: UnpackNestedValue<DeepPartial<Pick<TFieldValues, T>>>,
  ): UnpackNestedValue<Pick<TFieldValues, T>>;
  function watch(
    fields: string[],
    defaultValues?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): UnpackNestedValue<DeepPartial<TFieldValues>>;
  function watch(
    fieldNames?: string | string[],
    defaultValue?: unknown,
  ): unknown {
    return watchInternal(fieldNames, defaultValue);
  }

  function unregister(
    name: FieldName<TFieldValues> | FieldName<TFieldValues>[],
  ): void {
    if (fieldsRef.current) {
      (isArray(name) ? name : [name]).forEach((fieldName) =>
        removeFieldEventListenerAndRef(fieldsRef.current[fieldName], true),
      );
    }
  }

  function registerFieldsRef<TFieldElement extends FieldElement<TFieldValues>>(
    ref: TFieldElement,
    validateOptions: ValidationOptions | null = {},
  ): ((name: InternalFieldName<TFieldValues>) => void) | void {
    if (!ref.name) {
      // eslint-disable-next-line no-console
      return console.warn('Missing name @', ref);
    }

    const { name, type, value } = ref;
    const fieldRefAndValidationOptions = {
      ref,
      ...validateOptions,
    };
    const fields = fieldsRef.current;
    const isRadioOrCheckbox = isRadioOrCheckboxFunction(ref);
    let field = fields[name] as Field;
    let isEmptyDefaultValue = true;
    let isFieldArray;
    let defaultValue;

    if (
      isRadioOrCheckbox
        ? field &&
          isArray(field.options) &&
          field.options.filter(Boolean).find((option) => {
            return value === option.ref.value && option.ref === ref;
          })
        : field && ref === field.ref
    ) {
      fields[name] = {
        ...field,
        ...validateOptions,
      };
      return;
    }

    if (type) {
      const mutationWatcher = onDomRemove(ref, () =>
        removeFieldEventListenerAndRef(field),
      );

      field = isRadioOrCheckbox
        ? {
            options: [
              ...((field && field.options) || []),
              {
                ref,
                mutationWatcher,
              } as RadioOrCheckboxOption,
            ],
            ref: { type, name },
            ...validateOptions,
          }
        : {
            ...fieldRefAndValidationOptions,
            mutationWatcher,
          };
    } else {
      field = fieldRefAndValidationOptions;
    }

    fields[name] = field;

    if (!isEmptyObject(defaultValuesRef.current)) {
      defaultValue = get(defaultValuesRef.current, name);
      isEmptyDefaultValue = isUndefined(defaultValue);
      isFieldArray = isNameInFieldArray(fieldArrayNamesRef.current, name);

      if (!isEmptyDefaultValue && !isFieldArray) {
        setFieldValue(field, defaultValue);
      }
    }

    if (resolver && !isFieldArray && readFormStateRef.current.isValid) {
      validateResolver();
    } else if (!isEmptyObject(validateOptions)) {
      fieldsWithValidationRef.current.add(name);

      if (!isOnSubmit && readFormStateRef.current.isValid) {
        validateField(fieldsRef, validateAllFieldCriteria, field).then(
          (error) => {
            const previousFormIsValid = isValidRef.current;

            isEmptyObject(error)
              ? validFieldsRef.current.add(name)
              : (isValidRef.current = false);

            if (previousFormIsValid !== isValidRef.current) {
              reRender();
            }
          },
        );
      }
    }

    if (
      !defaultValuesAtRenderRef.current[name] &&
      !(isFieldArray && isEmptyDefaultValue)
    ) {
      defaultValuesAtRenderRef.current[name] = isEmptyDefaultValue
        ? getFieldValue(fields, field.ref)
        : defaultValue;
    }

    if (type) {
      attachEventListeners({
        field:
          isRadioOrCheckbox && field.options
            ? field.options[field.options.length - 1]
            : field,
        isRadioOrCheckbox,
        handleChange: handleChangeRef.current,
      });
    }
  }

  function register<TFieldElement extends FieldElement<TFieldValues>>(): (
    ref: TFieldElement | null,
  ) => void;
  function register<TFieldElement extends FieldElement<TFieldValues>>(
    validationOptions: ValidationOptions,
  ): (ref: TFieldElement | null) => void;
  function register(
    name: FieldName<TFieldValues>,
    validationOptions?: ValidationOptions,
  ): void;
  function register<TFieldElement extends FieldElement<TFieldValues>>(
    ref: TFieldElement,
    validationOptions?: ValidationOptions,
  ): void;
  function register<TFieldElement extends FieldElement<TFieldValues>>(
    refOrValidationOptions?:
      | FieldName<TFieldValues>
      | ValidationOptions
      | TFieldElement
      | null,
    validationOptions?: ValidationOptions,
  ): ((ref: TFieldElement | null) => void) | void {
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

    return (ref: TFieldElement | null) =>
      ref && registerFieldsRef(ref, refOrValidationOptions);
  }

  const handleSubmit = React.useCallback(
    (callback: OnSubmit<TFieldValues>) => async (
      e?: React.BaseSyntheticEvent,
    ): Promise<void> => {
      if (e) {
        e.preventDefault();
        e.persist();
      }
      let fieldErrors: FieldErrors<TFieldValues> = {};
      const fields = fieldsRef.current;
      let fieldValues: FieldValues = getFieldsValues(fields);

      if (readFormStateRef.current.isSubmitting) {
        isSubmittingRef.current = true;
        reRender();
      }

      try {
        if (resolverRef.current) {
          const { errors, values } = await resolverRef.current(
            transformToNestObject(fieldValues),
            contextRef.current,
            validateAllFieldCriteria,
          );
          errorsRef.current = errors;
          fieldErrors = errors;
          fieldValues = values;
        } else {
          for (const field of Object.values(fields)) {
            if (field) {
              const {
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
              }
            }
          }
        }

        if (isEmptyObject(fieldErrors)) {
          errorsRef.current = {};
          reRender();
          await callback(transformToNestObject(fieldValues), e);
        } else {
          errorsRef.current = fieldErrors;
          if (submitFocusError && isWeb) {
            focusOnErrorField(fields, fieldErrors);
          }
        }
      } finally {
        isSubmittedRef.current = true;
        isSubmittingRef.current = false;
        submitCountRef.current = submitCountRef.current + 1;
        reRender();
      }
    },
    [isWeb, reRender, resolverRef, submitFocusError, validateAllFieldCriteria],
  );

  const resetRefs = ({
    errors,
    dirty,
    isSubmitted,
    touched,
    isValid,
    submitCount,
    dirtyFields,
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
      isDirtyRef.current = false;
    }

    if (!dirtyFields) {
      dirtyFieldsRef.current = new Set();
    }

    if (!isSubmitted) {
      isSubmittedRef.current = false;
    }

    if (!submitCount) {
      submitCountRef.current = 0;
    }

    defaultValuesAtRenderRef.current = {} as UnpackNestedValue<
      DeepPartial<
        Record<InternalFieldName<TFieldValues>, FieldValue<TFieldValues>>
      >
    >;
    fieldArrayDefaultValues.current = {};
    watchFieldsRef.current = new Set();
    isWatchAllRef.current = false;
  };

  const reset = (
    values?: UnpackNestedValue<DeepPartial<TFieldValues>>,
    omitResetState: OmitResetState = {},
  ): void => {
    if (isWeb) {
      for (const field of Object.values(fieldsRef.current)) {
        if (field) {
          const { ref, options } = field;
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

  const getValue = <T extends string, U extends unknown>(
    payload: T,
  ): T extends keyof TFieldValues ? UnpackNestedValue<TFieldValues>[T] : U =>
    fieldsRef.current[payload]
      ? getFieldValue(fieldsRef.current, fieldsRef.current[payload]!.ref)
      : get(defaultValuesRef.current, payload);

  function getValues(): UnpackNestedValue<TFieldValues>;
  function getValues<T extends keyof TFieldValues>(
    payload: T[],
  ): UnpackNestedValue<Pick<TFieldValues, T>>;
  function getValues<T extends string, U extends unknown>(
    payload: T,
  ): T extends keyof TFieldValues ? UnpackNestedValue<TFieldValues>[T] : U;
  function getValues(payload?: string[] | string): unknown {
    const fields = fieldsRef.current;
    if (isString(payload)) {
      return getValue(payload);
    }

    if (isArray(payload)) {
      return payload.reduce(
        (previous, name) => ({
          ...previous,
          [name]: getValue(name),
        }),
        {},
      );
    }

    const fieldValues = getFieldsValues(fields);

    return transformToNestObject(
      isEmptyObject(fieldValues) ? defaultValuesRef.current : fieldValues,
    );
  }

  React.useEffect(
    () => () => {
      isUnMount.current = true;
      fieldsRef.current &&
        process.env.NODE_ENV === 'production' &&
        Object.values(fieldsRef.current).forEach((field) =>
          removeFieldEventListenerAndRef(field, true),
        );
    },
    [removeFieldEventListenerAndRef],
  );

  if (!resolver) {
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
    trigger,
    setValue: React.useCallback(setValue, [
      reRender,
      setInternalValue,
      trigger,
    ]),
    register: React.useCallback(register, [
      defaultValuesRef.current,
      defaultValuesAtRenderRef.current,
    ]),
    unregister: React.useCallback(unregister, []),
    getValues: React.useCallback(getValues, []),
    formState: isProxyEnabled
      ? new Proxy<FormStateProxy<TFieldValues>>(formState, {
          get: (obj, prop: keyof FormStateProxy) => {
            if (prop in obj) {
              readFormStateRef.current[prop] = true;
              return obj[prop];
            }

            return undefined;
          },
        })
      : formState,
  };

  const control = {
    removeFieldEventListener,
    watchInternal,
    reRender,
    ...(resolver ? { validateSchemaIsValid: validateResolver } : {}),
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
    watchFieldsHookRef,
    watchFieldsHookRenderRef,
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
