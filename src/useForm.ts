import * as React from 'react';
import attachEventListeners from './logic/attachEventListeners';
import transformToNestObject from './logic/transformToNestObject';
import focusOnErrorField from './logic/focusOnErrorField';
import findRemovedFieldAndRemoveListener from './logic/findRemovedFieldAndRemoveListener';
import getFieldsValues from './logic/getFieldsValues';
import getFieldValue from './logic/getFieldValue';
import validateField from './logic/validateField';
import assignWatchFields from './logic/assignWatchFields';
import skipValidation from './logic/skipValidation';
import getFieldArrayValueByName from './logic/getFieldArrayValueByName';
import isNameInFieldArray from './logic/isNameInFieldArray';
import isEmptyObject from './utils/isEmptyObject';
import isSelectInput from './utils/isSelectInput';
import isObject from './utils/isObject';
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
import unique from './utils/unique';
import isRadioOrCheckboxFunction from './utils/isRadioOrCheckbox';
import isHTMLElement from './utils/isHTMLElement';
import { EVENTS, UNDEFINED, VALIDATION_MODE } from './constants';
import {
  UseFormMethods,
  FieldValues,
  UnpackNestedValue,
  FieldName,
  InternalFieldName,
  FieldValue,
  FieldErrors,
  Field,
  FieldRefs,
  UseFormOptions,
  ValidationRules,
  SubmitHandler,
  FieldElement,
  FormStateProxy,
  ReadFormState,
  ManualFieldError,
  MultipleFieldErrors,
  Ref,
  HandleChange,
  Touched,
  RadioOrCheckboxOption,
  OmitResetState,
  Message,
  DefaultValuesAtRender,
  FlatFieldErrors,
} from './types/form';
import { LiteralToPrimitive, DeepPartial } from './types/utils';
import { useFormValue } from './useFormValue';
import { useFormValidator } from './useFormValidator';
import { useReRender } from './useReRender';

export function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object
>({
  mode = VALIDATION_MODE.onSubmit,
  reValidateMode = VALIDATION_MODE.onChange,
  resolver,
  context,
  defaultValues = {} as UnpackNestedValue<DeepPartial<TFieldValues>>,
  shouldFocusError = true,
  shouldUnregister = true,
  criteriaMode,
}: UseFormOptions<TFieldValues, TContext> = {}): UseFormMethods<TFieldValues> {
  const fieldsRef = React.useRef<FieldRefs<TFieldValues>>({});
  const touchedFieldsRef = React.useRef<Touched<TFieldValues>>({});
  const fieldArrayDefaultValues = React.useRef<Record<string, unknown[]>>({});
  const watchFieldsRef = React.useRef(
    new Set<InternalFieldName<TFieldValues>>(),
  );
  const dirtyFieldsRef = React.useRef<Touched<TFieldValues>>({});
  const watchFieldsHookRef = React.useRef<
    Record<string, Set<InternalFieldName<TFieldValues>>>
  >({});
  const watchFieldsHookRenderRef = React.useRef<Record<string, Function>>({});
  const defaultValuesRef = React.useRef<
    | FieldValue<UnpackNestedValue<TFieldValues>>
    | UnpackNestedValue<DeepPartial<TFieldValues>>
  >(defaultValues);
  const defaultValuesAtRenderRef = React.useRef(
    {} as DefaultValuesAtRender<TFieldValues>,
  );
  const isUnMount = React.useRef(false);
  const isWatchAllRef = React.useRef(false);
  const isSubmittedRef = React.useRef(false);
  const isDirtyRef = React.useRef(false);
  const submitCountRef = React.useRef(0);
  const isSubmittingRef = React.useRef(false);
  const handleChangeRef = React.useRef<HandleChange>();
  const unmountFieldsStateRef = React.useRef<Record<string, any>>({});
  const resetFieldArrayFunctionRef = React.useRef({});
  const fieldArrayNamesRef = React.useRef<Set<string>>(new Set());
  const { isOnBlur, isOnSubmit, isOnChange, isOnAll } = React.useRef(
    modeChecker(mode),
  ).current;
  const validateAllFieldCriteria = criteriaMode === VALIDATION_MODE.all;
  const isWindowUndefined = typeof window === UNDEFINED;
  const isWeb =
    typeof document !== UNDEFINED &&
    !isWindowUndefined &&
    !isUndefined(window.HTMLElement);
  const isProxyEnabled = isWeb ? 'Proxy' in window : typeof Proxy !== UNDEFINED;
  const readFormStateRef = React.useRef<ReadFormState>({
    isDirty: !isProxyEnabled,
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
  const reRender = useReRender(isUnMount);

  const {
    shouldRenderBaseOnError,
    trigger,
    validateResolver,
    errorsRef,
    validFieldsRef,
    resolverRef,
    contextRef,
    isValidRef,
    fieldsWithValidationRef,
  } = useFormValidator({
    resolver,
    context,
    fieldsRef,
    validateAllFieldCriteria,
    defaultValuesRef,
    reRender,
  });

  const isFieldWatched = (name: string) =>
    isWatchAllRef.current ||
    watchFieldsRef.current.has(name) ||
    watchFieldsRef.current.has((name.match(/\w+/) || [])[0]);

  const renderWatchedInputs = (name: string, found = true): boolean => {
    if (!isEmptyObject(watchFieldsHookRef.current)) {
      for (const key in watchFieldsHookRef.current) {
        if (
          watchFieldsHookRef.current[key].has(name) ||
          !watchFieldsHookRef.current[key].size ||
          isNameInFieldArray(fieldArrayNamesRef.current, name)
        ) {
          watchFieldsHookRenderRef.current[key]();
          found = false;
        }
      }
    }

    return found;
  };

  const {
    setFieldValue,
    setDirty,
    setInternalValue,
    setValue,
    getValues,
  } = useFormValue({
    isWeb,
    fieldsRef,
    readFormStateRef,
    defaultValuesAtRenderRef,
    dirtyFieldsRef,
    fieldArrayNamesRef,
    isDirtyRef,
    defaultValuesRef,
    isFieldWatched,
    renderWatchedInputs,
    reRender,
    trigger,
  });

  handleChangeRef.current = handleChangeRef.current
    ? handleChangeRef.current
    : async ({ type, target }: Event): Promise<void | boolean> => {
        const name = target ? (target as Ref).name : '';
        const field = fieldsRef.current[name];
        let error: FlatFieldErrors<TFieldValues>;

        if (!field) {
          return;
        }

        const isBlurEvent = type === EVENTS.BLUR;
        const shouldSkipValidation =
          !isOnAll &&
          skipValidation({
            hasError: !!get(errorsRef.current, name),
            isOnChange,
            isBlurEvent,
            isOnSubmit,
            isReValidateOnSubmit,
            isOnBlur,
            isReValidateOnBlur,
            isSubmitted: isSubmittedRef.current,
          });
        let shouldRender = setDirty(name) || isFieldWatched(name);

        if (
          isBlurEvent &&
          !get(touchedFieldsRef.current, name) &&
          readFormStateRef.current.touched
        ) {
          set(touchedFieldsRef.current, name, true);
          shouldRender = true;
        }

        if (shouldSkipValidation) {
          renderWatchedInputs(name);
          return shouldRender && reRender();
        }

        if (resolver) {
          const { errors } = await resolver(
            getFieldArrayValueByName(fieldsRef.current),
            contextRef.current,
            validateAllFieldCriteria,
          );
          const previousFormIsValid = isValidRef.current;
          isValidRef.current = isEmptyObject(errors);

          error = (get(errors, name)
            ? { [name]: get(errors, name) }
            : {}) as FlatFieldErrors<TFieldValues>;

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

        renderWatchedInputs(name);

        if (!shouldRenderBaseOnError(name, error) && shouldRender) {
          reRender();
        }
      };

  const removeFieldEventListener = React.useCallback(
    (field: Field, forceDelete?: boolean) => {
      findRemovedFieldAndRemoveListener(
        fieldsRef.current,
        handleChangeRef.current!,
        field,
        unmountFieldsStateRef,
        shouldUnregister,
        forceDelete,
      );
    },
    [shouldUnregister],
  );

  const removeFieldEventListenerAndRef = React.useCallback(
    (field: Field | undefined, forceDelete?: boolean) => {
      if (
        field &&
        (!isNameInFieldArray(fieldArrayNamesRef.current, field.ref.name) ||
          forceDelete)
      ) {
        removeFieldEventListener(field, forceDelete);

        [
          errorsRef,
          touchedFieldsRef,
          dirtyFieldsRef,
          defaultValuesAtRenderRef,
        ].forEach((data) => unset(data.current, field.ref.name));
        [
          fieldsWithValidationRef,
          validFieldsRef,
          watchFieldsRef,
        ].forEach((data) => data.current.delete(field.ref.name));

        if (
          readFormStateRef.current.isValid ||
          readFormStateRef.current.touched
        ) {
          reRender();

          if (resolverRef.current) {
            validateResolver();
          }
        }
      }
    },
    [
      reRender,
      validateResolver,
      removeFieldEventListener,
      resolverRef,
      errorsRef,
      validFieldsRef,
      fieldsWithValidationRef,
    ],
  );

  function clearError(
    name?: FieldName<TFieldValues> | FieldName<TFieldValues>[],
  ): void {
    if (name) {
      (isArray(name) ? name : [name]).forEach((inputName) =>
        unset(errorsRef.current, inputName),
      );
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
    if (
      !isSameError(get(errorsRef.current, name), {
        type,
        message,
        types,
      })
    ) {
      set(errorsRef.current, name, {
        type,
        types,
        message,
        ref: fieldsRef.current[name] ? fieldsRef.current[name]!.ref : {},
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
    isValidRef.current = false;

    if (isArray(name)) {
      name.forEach((error) => setInternalError({ ...error }));
      reRender();
    } else {
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
      const combinedDefaultValues = isUndefined(defaultValue)
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
          isUndefined(defaultValue)
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

      if (isUndefined(watchId)) {
        isWatchAllRef.current = true;
      }

      return transformToNestObject(
        (!isEmptyObject(fieldValues) && fieldValues) ||
          (combinedDefaultValues as FieldValues),
      );
    },
    [],
  );

  function watch(): UnpackNestedValue<TFieldValues>;
  function watch<
    TFieldName extends string,
    TFieldValue extends TFieldValues[TFieldName]
  >(
    name: TFieldName,
    defaultValue?: UnpackNestedValue<LiteralToPrimitive<TFieldValue>>,
  ): UnpackNestedValue<LiteralToPrimitive<TFieldValue>>;
  function watch<TFieldName extends keyof TFieldValues>(
    names: TFieldName[],
    defaultValues?: UnpackNestedValue<
      DeepPartial<Pick<TFieldValues, TFieldName>>
    >,
  ): UnpackNestedValue<Pick<TFieldValues, TFieldName>>;
  function watch(
    names: string[],
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
    (isArray(name) ? name : [name]).forEach((fieldName) =>
      removeFieldEventListenerAndRef(fieldsRef.current[fieldName], true),
    );
  }

  function registerFieldsRef<TFieldElement extends FieldElement<TFieldValues>>(
    ref: TFieldElement & Ref,
    validateOptions: ValidationRules | null = {},
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
      field &&
      (isRadioOrCheckbox
        ? isArray(field.options) &&
          unique(field.options).find((option) => {
            return value === option.ref.value && option.ref === ref;
          })
        : ref === field.ref)
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
              ...unique((field && field.options) || []),
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

    const isEmptyUnmountFields = isUndefined(
      unmountFieldsStateRef.current[name],
    );

    if (!isEmptyObject(defaultValuesRef.current) || !isEmptyUnmountFields) {
      defaultValue = isEmptyUnmountFields
        ? get(defaultValuesRef.current, name)
        : unmountFieldsStateRef.current[name];
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
        isRadioOrCheckbox:
          isRadioOrCheckbox || isSelectInput(ref as FieldElement),
        handleChange: handleChangeRef.current,
      });
    }
  }

  function register<TFieldElement extends FieldElement<TFieldValues>>(): (
    ref: (TFieldElement & Ref) | null,
  ) => void;
  function register<TFieldElement extends FieldElement<TFieldValues>>(
    rules: ValidationRules,
  ): (ref: (TFieldElement & Ref) | null) => void;
  function register(
    name: FieldName<TFieldValues>,
    rules?: ValidationRules,
  ): void;
  function register<TFieldElement extends FieldElement<TFieldValues>>(
    ref: (TFieldElement & Ref) | null,
    rules?: ValidationRules,
  ): void;
  function register<TFieldElement extends FieldElement<TFieldValues>>(
    refOrValidationOptions?:
      | FieldName<TFieldValues>
      | ValidationRules
      | (TFieldElement & Ref)
      | null,
    rules?: ValidationRules,
  ): ((ref: (TFieldElement & Ref) | null) => void) | void {
    if (!isWindowUndefined) {
      if (isString(refOrValidationOptions)) {
        registerFieldsRef({ name: refOrValidationOptions }, rules);
      } else if (
        isObject(refOrValidationOptions) &&
        'name' in refOrValidationOptions
      ) {
        registerFieldsRef(refOrValidationOptions, rules);
      } else {
        return (ref: (TFieldElement & Ref) | null) =>
          ref && registerFieldsRef(ref, refOrValidationOptions);
      }
    }
  }

  const handleSubmit = React.useCallback(
    <TSubmitFieldValues extends FieldValues = TFieldValues>(
      callback: SubmitHandler<TSubmitFieldValues>,
    ) => async (e?: React.BaseSyntheticEvent): Promise<void> => {
      if (e) {
        e.preventDefault();
        e.persist();
      }
      let fieldErrors: FieldErrors<TFieldValues> = {};
      let fieldValues: FieldValues = {
        ...unmountFieldsStateRef.current,
        ...getFieldsValues(fieldsRef.current),
      };

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
          for (const field of Object.values(fieldsRef.current)) {
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
              } else if (fieldsWithValidationRef.current.has(name)) {
                validFieldsRef.current.add(name);
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
          if (shouldFocusError && isWeb) {
            focusOnErrorField(fieldsRef.current, fieldErrors);
          }
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
      resolverRef,
      shouldFocusError,
      validateAllFieldCriteria,
      errorsRef,
      validFieldsRef,
      fieldsWithValidationRef,
      contextRef,
    ],
  );

  const resetRefs = ({
    errors,
    isDirty,
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

    if (!isDirty) {
      isDirtyRef.current = false;
    }

    if (!dirtyFields) {
      dirtyFieldsRef.current = {};
    }

    if (!isSubmitted) {
      isSubmittedRef.current = false;
    }

    if (!submitCount) {
      submitCountRef.current = 0;
    }

    defaultValuesAtRenderRef.current = {} as DefaultValuesAtRender<
      TFieldValues
    >;
    fieldArrayDefaultValues.current = {};
    unmountFieldsStateRef.current = {};
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

  React.useEffect(() => {
    isUnMount.current = false;

    return () => {
      isUnMount.current = true;
      fieldsRef.current &&
        process.env.NODE_ENV === 'production' &&
        Object.values(fieldsRef.current).forEach((field) =>
          removeFieldEventListenerAndRef(field, true),
        );
    };
  }, [removeFieldEventListenerAndRef]);

  if (!resolver) {
    isValidRef.current =
      validFieldsRef.current.size >= fieldsWithValidationRef.current.size &&
      isEmptyObject(errorsRef.current);
  }

  const formState = {
    dirtyFields: dirtyFieldsRef.current,
    isSubmitted: isSubmittedRef.current,
    submitCount: submitCountRef.current,
    touched: touchedFieldsRef.current,
    isDirty: isDirtyRef.current,
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
    renderWatchedInputs,
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
    isSubmittedRef,
    readFormStateRef,
    defaultValuesRef,
    unmountFieldsStateRef,
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
