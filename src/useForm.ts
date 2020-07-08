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
import getIsFieldsDifferent from './logic/getIsFieldsDifferent';
import isNameInFieldArray from './logic/isNameInFieldArray';
import isCheckBoxInput from './utils/isCheckBoxInput';
import isEmptyObject from './utils/isEmptyObject';
import isRadioInput from './utils/isRadioInput';
import isSelectInput from './utils/isSelectInput';
import isFileInput from './utils/isFileInput';
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
import isMultipleSelect from './utils/isMultipleSelect';
import unique from './utils/unique';
import isNullOrUndefined from './utils/isNullOrUndefined';
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
  Ref,
  HandleChange,
  Touched,
  FieldError,
  RadioOrCheckboxOption,
  OmitResetState,
  DefaultValuesAtRender,
  FlatFieldErrors,
  NestedValue,
  SetValueConfig,
  ErrorOption,
} from './types/form';
import { LiteralToPrimitive, DeepPartial, NonUndefined } from './types/utils';

const isWindowUndefined = typeof window === UNDEFINED;
const isWeb =
  typeof document !== UNDEFINED &&
  !isWindowUndefined &&
  !isUndefined(window.HTMLElement);
const isProxyEnabled = isWeb ? 'Proxy' in window : typeof Proxy !== UNDEFINED;

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
  const errorsRef = React.useRef<FieldErrors<TFieldValues>>({});
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
  const contextRef = React.useRef(context);
  const resolverRef = React.useRef(resolver);
  const fieldArrayNamesRef = React.useRef<Set<string>>(new Set());
  const [, render] = React.useState();
  const { isOnBlur, isOnSubmit, isOnChange, isOnAll } = React.useRef(
    modeChecker(mode),
  ).current;
  const validateAllFieldCriteria = criteriaMode === VALIDATION_MODE.all;
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
      error: FlatFieldErrors<TFieldValues>,
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
      const previousError = get(errorsRef.current, name);

      if (isEmptyObject(error)) {
        if (fieldsWithValidationRef.current.has(name) || resolverRef.current) {
          validFieldsRef.current.add(name);
          shouldReRender = shouldReRender || previousError;
        }

        errorsRef.current = unset(errorsRef.current, name);
      } else {
        validFieldsRef.current.delete(name);
        shouldReRender =
          shouldReRender ||
          !previousError ||
          !isSameError(previousError, error[name] as FieldError);

        set(errorsRef.current, name, error[name]);
      }

      if (shouldReRender && !isNullOrUndefined(shouldRender)) {
        reRender();
        return true;
      }
    },
    [reRender],
  );

  const setFieldValue = React.useCallback(
    (
      { ref, options }: Field,
      rawValue:
        | FieldValue<TFieldValues>
        | UnpackNestedValue<DeepPartial<TFieldValues>>
        | undefined
        | null
        | boolean,
    ) => {
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
    [],
  );

  const setDirty = React.useCallback(
    (name: InternalFieldName<TFieldValues>): boolean => {
      const { isDirty, dirtyFields } = readFormStateRef.current;

      if (!fieldsRef.current[name] || (!isDirty && !dirtyFields)) {
        return false;
      }

      const isFieldDirty =
        defaultValuesAtRenderRef.current[name] !==
        getFieldValue(fieldsRef, name, unmountFieldsStateRef);
      const isDirtyFieldExist = get(dirtyFieldsRef.current, name);
      const isFieldArray = isNameInFieldArray(fieldArrayNamesRef.current, name);
      const previousIsDirty = isDirtyRef.current;

      if (isFieldDirty) {
        set(dirtyFieldsRef.current, name, true);
      } else {
        unset(dirtyFieldsRef.current, name);
      }

      isDirtyRef.current =
        (isFieldArray &&
          getIsFieldsDifferent(
            get(getValues(), getFieldArrayParentName(name)),
            get(defaultValuesRef.current, getFieldArrayParentName(name)),
          )) ||
        !isEmptyObject(dirtyFieldsRef.current);

      return (
        (isDirty && previousIsDirty !== isDirtyRef.current) ||
        (dirtyFields && isDirtyFieldExist !== get(dirtyFieldsRef.current, name))
      );
    },
    [],
  );

  const executeValidation = React.useCallback(
    async (
      name: InternalFieldName<TFieldValues>,
      skipReRender?: boolean,
    ): Promise<boolean> => {
      if (fieldsRef.current[name]) {
        const error = await validateField<TFieldValues>(
          fieldsRef,
          validateAllFieldCriteria,
          fieldsRef.current[name] as Field,
          unmountFieldsStateRef,
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
      const { errors } = await resolverRef.current!(
        getValues() as TFieldValues,
        contextRef.current,
        validateAllFieldCriteria,
      );
      const previousFormIsValid = isValidRef.current;
      isValidRef.current = isEmptyObject(errors);

      if (isArray(payload)) {
        const isInputsValid = payload
          .map((name) => {
            const error = get(errors, name);

            if (error) {
              set(errorsRef.current, name, error);
            } else {
              unset(errorsRef.current, name);
            }

            return !error;
          })
          .every(Boolean);

        reRender();

        return isInputsValid;
      } else {
        const error = get(errors, payload);

        shouldRenderBaseOnError(
          payload,
          (error ? { [payload]: error } : {}) as FlatFieldErrors<TFieldValues>,
          previousFormIsValid !== isValidRef.current,
        );

        return !error;
      }
    },
    [reRender, shouldRenderBaseOnError, validateAllFieldCriteria],
  );

  const trigger = React.useCallback(
    async (
      name?: FieldName<TFieldValues> | FieldName<TFieldValues>[],
    ): Promise<boolean> => {
      const fields = name || Object.keys(fieldsRef.current);

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
    [executeSchemaOrResolverValidation, executeValidation, reRender],
  );

  const isFieldWatched = (name: string) =>
    isWatchAllRef.current ||
    watchFieldsRef.current.has(name) ||
    watchFieldsRef.current.has((name.match(/\w+/) || [])[0]);

  const renderWatchedInputs = (name: string, found = true): boolean => {
    if (!isEmptyObject(watchFieldsHookRef.current)) {
      for (const key in watchFieldsHookRef.current) {
        if (
          name === '' ||
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

  function setValue<
    TFieldName extends string,
    TFieldValue extends TFieldValues[TFieldName]
  >(
    name: TFieldName,
    value: NonUndefined<TFieldValue> extends NestedValue<infer U>
      ? U
      : UnpackNestedValue<DeepPartial<LiteralToPrimitive<TFieldValue>>>,
    config: SetValueConfig = {},
  ): void {
    let shouldRender = isFieldWatched(name);
    unmountFieldsStateRef.current[name] = value;

    if (fieldsRef.current[name]) {
      setFieldValue(fieldsRef.current[name] as Field, value);
      shouldRender = shouldRender || !!(config.shouldDirty && setDirty(name));
    }

    renderWatchedInputs(name);

    if (shouldRender) {
      reRender();
    }

    if (config.shouldValidate) {
      trigger(name as any);
    }
  }

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
            getValues() as TFieldValues,
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
            unmountFieldsStateRef,
          );
        }

        renderWatchedInputs(name);

        if (!shouldRenderBaseOnError(name, error) && shouldRender) {
          reRender();
        }
      };

  const validateResolver = React.useCallback(
    (values: any = {}) => {
      const fieldValues = isEmptyObject(defaultValuesRef.current)
        ? getFieldsValues(fieldsRef, unmountFieldsStateRef)
        : defaultValuesRef.current;

      resolverRef.current!(
        transformToNestObject({
          ...fieldValues,
          ...values,
        }),
        contextRef.current,
        validateAllFieldCriteria,
      ).then(({ errors }) => {
        const previousFormIsValid = isValidRef.current;
        isValidRef.current = isEmptyObject(errors);

        if (previousFormIsValid !== isValidRef.current) {
          reRender();
        }
      });
    },
    [reRender, validateAllFieldCriteria],
  );

  const removeFieldEventListener = React.useCallback(
    (field: Field, forceDelete?: boolean) => {
      findRemovedFieldAndRemoveListener(
        fieldsRef,
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

        if (shouldUnregister) {
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
            readFormStateRef.current.touched ||
            readFormStateRef.current.isDirty
          ) {
            isDirtyRef.current = !isEmptyObject(dirtyFieldsRef.current);
            reRender();

            if (resolverRef.current) {
              validateResolver();
            }
          }
        }
      }
    },
    [reRender, validateResolver, removeFieldEventListener],
  );

  function clearErrors(
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

  function setError(name: FieldName<TFieldValues>, error: ErrorOption): void {
    isValidRef.current = false;

    set(errorsRef.current, name, {
      ...error,
      ref: (fieldsRef.current[name] || {})!.ref,
    });

    reRender();
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
        fieldsRef,
        unmountFieldsStateRef,
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
      get(unmountFieldsStateRef.current, name),
    );

    if (!isEmptyObject(defaultValuesRef.current) || !isEmptyUnmountFields) {
      defaultValue = get(
        isEmptyUnmountFields
          ? defaultValuesRef.current
          : unmountFieldsStateRef.current,
        name,
      );
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
        validateField(
          fieldsRef,
          validateAllFieldCriteria,
          field,
          unmountFieldsStateRef,
        ).then((error) => {
          const previousFormIsValid = isValidRef.current;

          isEmptyObject(error)
            ? validFieldsRef.current.add(name)
            : (isValidRef.current = false);

          if (previousFormIsValid !== isValidRef.current) {
            reRender();
          }
        });
      }
    }

    if (
      !defaultValuesAtRenderRef.current[name] &&
      !(isFieldArray && isEmptyDefaultValue)
    ) {
      defaultValuesAtRenderRef.current[name] = isEmptyDefaultValue
        ? getFieldValue(fieldsRef, name, unmountFieldsStateRef)
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

  function register<TFieldElement extends FieldElement<TFieldValues>>(
    rules?: ValidationRules,
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
      if (e && e.preventDefault) {
        e.preventDefault();
        e.persist();
      }
      let fieldErrors: FieldErrors<TFieldValues> = {};
      let fieldValues: FieldValues = {
        ...unmountFieldsStateRef.current,
        ...getFieldsValues(fieldsRef, unmountFieldsStateRef),
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
                unmountFieldsStateRef,
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

        if (
          isEmptyObject(fieldErrors) &&
          Object.keys(errorsRef.current).every((name) =>
            Object.keys(fieldsRef.current).includes(name),
          )
        ) {
          errorsRef.current = {};
          reRender();
          await callback(transformToNestObject(fieldValues), e);
        } else {
          errorsRef.current = {
            ...errorsRef.current,
            ...fieldErrors,
          };
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
    [reRender, shouldFocusError, validateAllFieldCriteria],
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
      renderWatchedInputs('');
    }

    unmountFieldsStateRef.current = values || {};

    Object.values(resetFieldArrayFunctionRef.current).forEach(
      (resetFieldArray) => isFunction(resetFieldArray) && resetFieldArray(),
    );

    resetRefs(omitResetState);

    reRender();
  };

  const getValue = <TFieldName extends string, TFieldValue extends unknown>(
    name: TFieldName,
  ): TFieldName extends keyof TFieldValues
    ? UnpackNestedValue<TFieldValues>[TFieldName]
    : TFieldValue => getFieldValue(fieldsRef, name, unmountFieldsStateRef);

  function getValues(): UnpackNestedValue<TFieldValues>;
  function getValues<TFieldName extends string, TFieldValue extends unknown>(
    name: TFieldName,
  ): TFieldName extends keyof TFieldValues
    ? UnpackNestedValue<TFieldValues>[TFieldName]
    : TFieldValue;
  function getValues<TFieldName extends keyof TFieldValues>(
    names: TFieldName[],
  ): UnpackNestedValue<Pick<TFieldValues, TFieldName>>;
  function getValues(payload?: string | string[]): unknown {
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

    return transformToNestObject(
      getFieldsValues(fieldsRef, unmountFieldsStateRef),
    );
  }

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
    setValue: React.useCallback(setValue, [reRender, trigger]),
    getValues: React.useCallback(getValues, []),
    register: React.useCallback(register, [defaultValuesRef.current]),
    unregister: React.useCallback(unregister, []),
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
    clearErrors: React.useCallback(clearErrors, []),
    setError: React.useCallback(setError, []),
    errors: errorsRef.current,
    ...commonProps,
  };
}
